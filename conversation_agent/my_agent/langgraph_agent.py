"""
LangGraph-based Recruitment Agent for Prometheus
Replaces Google ADK with a stateful graph-based agent.
"""

from typing import TypedDict, Annotated, List, Dict, Any, Optional
import os
import json

# LangGraph imports
try:
    from langgraph.graph import StateGraph, START, END
    from langgraph.graph.message import add_messages
    from langgraph.prebuilt import ToolNode
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False
    print("⚠️ LangGraph not installed. Run: pip install langgraph")

# LangChain imports
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
    from langchain_core.tools import tool
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    print("⚠️ LangChain not installed. Run: pip install langchain-google-genai")

# Local imports
from .progressive_filter import ProgressiveFilter
from .semantic_engine import get_semantic_engine


# ========== STATE DEFINITION ==========

class RecruitmentState(TypedDict):
    """State for the recruitment agent graph."""
    messages: Annotated[list, add_messages]
    current_candidates: List[Dict[str, Any]]
    combined_filters: Dict[str, Any]
    conversation_turn: int
    company_profile: Optional[Dict[str, Any]]
    last_query: str


# ========== GLOBAL INSTANCES ==========

_progressive_filter: Optional[ProgressiveFilter] = None
_company_profile: Optional[Dict[str, Any]] = None


def get_progressive_filter() -> ProgressiveFilter:
    """Get or create the progressive filter singleton."""
    global _progressive_filter
    if _progressive_filter is None:
        _progressive_filter = ProgressiveFilter()
        # Load candidates (will be done from Firebase in agent.py)
    return _progressive_filter


def set_company_profile(profile: Dict[str, Any]):
    """Set the current company profile for matching."""
    global _company_profile
    _company_profile = profile


def get_company_profile() -> Optional[Dict[str, Any]]:
    """Get the current company profile."""
    return _company_profile


# ========== TOOL DEFINITIONS ==========

@tool
def progressive_search(query: str, reset_conversation: bool = False) -> dict:
    """
    Search and filter candidates progressively through conversation.
    
    Each query builds on previous ones, automatically narrowing results.
    Use reset_conversation=True only when starting a completely new search.
    
    Args:
        query: Natural language search (e.g., "React developers", "senior only")
        reset_conversation: Set True to clear previous filters and start fresh
        
    Returns:
        Matching candidates with scores and context
    """
    pf = get_progressive_filter()
    semantic = get_semantic_engine()
    company = get_company_profile()
    
    if reset_conversation:
        pf.reset()
    
    # Extract requirements semantically
    requirements = semantic.extract_requirements_semantic(query)
    
    # Filter candidates
    result = pf.filter_candidates(query)
    
    # If company profile exists, enhance with culture fit
    if company and result.get('matches'):
        for match in result['matches']:
            # Get candidate from pool
            candidate = next(
                (c for c in pf.all_candidates if c['id'] == match['candidate_id']),
                None
            )
            if candidate:
                fit = semantic.calculate_mutual_fit(
                    candidate, 
                    company,
                    requirements.get('skills', [])
                )
                match['culture_fit'] = fit['culture_fit']
                match['mission_alignment'] = fit['mission_alignment']
                match['overall_fit'] = fit['overall_fit']
        
        # Re-sort by overall fit
        result['matches'].sort(key=lambda x: x.get('overall_fit', x['score']), reverse=True)
    
    # Format response for chat UI
    result['main_response'] = _format_search_response(result)
    result['profiles'] = result['matches'][:3]  # Top 3 for display
    
    return result


@tool
def analyze_candidate_tenure(candidate_id: str) -> dict:
    """
    Analyze a specific candidate's job tenure and stability.
    
    Returns tenure score, average duration, and any red flags
    about job-hopping patterns.
    
    Args:
        candidate_id: The candidate's unique ID
        
    Returns:
        Tenure analysis with score and flags
    """
    pf = get_progressive_filter()
    
    candidate = next(
        (c for c in pf.all_candidates if c['id'] == candidate_id),
        None
    )
    
    if not candidate:
        return {'error': f'Candidate {candidate_id} not found'}
    
    # Get tenure data (would come from profile in production)
    tenure_data = candidate.get('tenure_analysis', {
        'tenure_score': 75,
        'avg_tenure_months': 24,
        'stability_level': 'moderate',
        'red_flags': []
    })
    
    return {
        'candidate_id': candidate_id,
        'candidate_name': candidate.get('name', 'Unknown'),
        **tenure_data
    }


@tool  
def reset_search() -> dict:
    """
    Reset the search to start fresh.
    
    Clears all previous filters and conversation context.
    Use when the recruiter wants to start a completely new search.
    
    Returns:
        Confirmation message
    """
    pf = get_progressive_filter()
    pf.reset()
    
    return {
        'status': 'success',
        'message': 'Search reset. Ready for a new search.',
        'candidates_available': len(pf.all_candidates)
    }


@tool
def get_candidate_details(candidate_id: str) -> dict:
    """
    Get full details for a specific candidate.
    
    Args:
        candidate_id: The candidate's unique ID
        
    Returns:
        Complete candidate profile
    """
    pf = get_progressive_filter()
    
    candidate = next(
        (c for c in pf.all_candidates if c['id'] == candidate_id),
        None
    )
    
    if not candidate:
        return {'error': f'Candidate {candidate_id} not found'}
    
    return candidate


# ========== HELPER FUNCTIONS ==========

def _format_search_response(result: dict) -> str:
    """Format search results into natural language response."""
    matches = result.get('matches', [])
    total = result.get('matches_found', 0)
    
    if total == 0:
        return "I couldn't find any candidates matching those criteria. Try being less specific or reset the search to start fresh."
    
    response_parts = [f"I found {total} candidate{'s' if total != 1 else ''} matching your criteria."]
    
    # Describe top matches
    if matches:
        response_parts.append("\n\n**Top matches:**")
        for i, match in enumerate(matches[:3], 1):
            name = match.get('name', 'Unknown')
            score = match.get('overall_fit', match.get('score', 0))
            skills = match.get('matched_skills', [])[:3]
            
            skill_str = ', '.join(skills) if skills else 'various skills'
            response_parts.append(f"\n{i}. **{name}** - {score:.0f}% match ({skill_str})")
    
    # Add refinement suggestion
    if suggestion := result.get('refinement_suggestion'):
        response_parts.append(f"\n\n{suggestion}")
    
    return ''.join(response_parts)


# ========== AGENT GRAPH ==========

def create_recruitment_agent():
    """
    Create the LangGraph-based recruitment agent.
    
    Returns:
        Compiled graph ready for invocation
    """
    if not LANGGRAPH_AVAILABLE or not LANGCHAIN_AVAILABLE:
        raise RuntimeError("LangGraph and LangChain are required. Install them first.")
    
    # Initialize LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.3,
        google_api_key=os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    )
    
    # Bind tools
    tools = [progressive_search, analyze_candidate_tenure, reset_search, get_candidate_details]
    llm_with_tools = llm.bind_tools(tools)
    
    # System prompt
    system_prompt = """You are Prometheus, an intelligent recruitment assistant.

CORE BEHAVIOR:
- Help recruiters find candidates through natural conversation
- Each query automatically refines previous results (progressive filtering)
- Results are ranked by: skills match + culture fit + tenure stability

WHEN TO USE TOOLS:
- progressive_search: For ANY search request or refinement
- analyze_candidate_tenure: When asked about candidate stability/history  
- reset_search: Only when explicitly asked to "start over" or "new search"
- get_candidate_details: When asked for full details on a specific candidate

CONVERSATION STYLE:
- Be friendly and professional
- Understand context naturally ("only senior ones" means "from current results")
- Proactively suggest refinements when there are many matches
- Celebrate when you find great matches!

REMEMBER:
- The progressive_search tool handles context automatically
- You don't need to repeat previous requirements
- Focus on helping the recruiter express what they want naturally"""
    
    # Define nodes
    def agent_node(state: RecruitmentState) -> dict:
        """Main agent node - processes messages and decides actions."""
        messages = [SystemMessage(content=system_prompt)] + state["messages"]
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}
    
    # Tool node
    tool_node = ToolNode(tools)
    
    # Routing function
    def should_continue(state: RecruitmentState) -> str:
        """Determine if we should call tools or end."""
        last_message = state["messages"][-1]
        
        if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
            return "tools"
        return END
    
    # Build graph
    graph = StateGraph(RecruitmentState)
    
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)
    
    graph.add_edge(START, "agent")
    graph.add_conditional_edges("agent", should_continue, ["tools", END])
    graph.add_edge("tools", "agent")  # Loop back after tool execution
    
    # Compile
    return graph.compile()


# ========== PUBLIC API ==========

_agent = None


def get_agent():
    """Get or create the recruitment agent."""
    global _agent
    if _agent is None:
        _agent = create_recruitment_agent()
    return _agent


def run_search(
    query: str, 
    reset_conversation: bool = False,
    company_profile: Dict[str, Any] = None
) -> dict:
    """
    Run a search query through the agent.
    
    This is the main entry point for the server API.
    
    Args:
        query: Natural language search query
        reset_conversation: Whether to start fresh
        company_profile: Optional company profile for culture matching
        
    Returns:
        Search results formatted for the frontend
    """
    if company_profile:
        set_company_profile(company_profile)
    
    # For simple queries, we can call the tool directly without full agent loop
    # This is more efficient for straightforward searches
    result = progressive_search.invoke({
        'query': query,
        'reset_conversation': reset_conversation
    })
    
    return result


def run_agent_conversation(
    messages: List[Dict[str, str]],
    company_profile: Dict[str, Any] = None
) -> dict:
    """
    Run a full agent conversation.
    
    Use this for complex multi-turn conversations where
    the agent needs to decide which tools to use.
    
    Args:
        messages: List of {"role": "user"|"assistant", "content": "..."}
        company_profile: Company profile for matching
        
    Returns:
        Agent response
    """
    if company_profile:
        set_company_profile(company_profile)
    
    agent = get_agent()
    
    # Convert to LangChain message format
    lc_messages = []
    for msg in messages:
        if msg["role"] == "user":
            lc_messages.append(HumanMessage(content=msg["content"]))
        else:
            lc_messages.append(AIMessage(content=msg["content"]))
    
    # Run agent
    result = agent.invoke({
        "messages": lc_messages,
        "current_candidates": [],
        "combined_filters": {},
        "conversation_turn": len(messages),
        "company_profile": company_profile,
        "last_query": messages[-1]["content"] if messages else ""
    })
    
    # Extract final response
    final_message = result["messages"][-1]
    
    return {
        "response": final_message.content,
        "messages": result["messages"]
    }
