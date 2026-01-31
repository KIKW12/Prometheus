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

# Supabase imports
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("⚠️ Supabase not installed. Run: pip install supabase")

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
_supabase_client: Optional["Client"] = None  # Forward ref to avoid NameError if supabase not installed


def get_supabase() -> Optional["Client"]:
    """Get Supabase client."""
    if not SUPABASE_AVAILABLE:
        return None
        
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("⚠️ Supabase credentials missing (SUPABASE_URL, SUPABASE_KEY)")
        return None
        
    return create_client(url, key)


def load_candidates_from_supabase() -> List[Dict[str, Any]]:
    """Fetch and transform candidates from Supabase."""
    supabase = get_supabase()
    if not supabase:
        print("⚠️ Cannot load candidates: Supabase client unavailable")
        return []
        
    try:
        response = supabase.table('user_profiles').select("*").execute()
        raw_profiles = response.data
        
        candidates = []
        for p in raw_profiles:
            profile_data = p.get('profile_data', {})
            if not profile_data:
                continue
                
            # Flatten structure
            personal = profile_data.get('personal_info', {})
            job_exp = profile_data.get('job_experience', [])
            education = profile_data.get('education', [])
            skills_raw = profile_data.get('skills', "")
            
            # Parse skills string if needed
            if isinstance(skills_raw, str):
                skills = [s.strip() for s in skills_raw.split(',') if s.strip()]
            else:
                skills = skills_raw if isinstance(skills_raw, list) else []
                
            # Calculate total years and infer level
            total_months = 0
            from datetime import datetime
            today = datetime.now()
            
            for job in job_exp:
                try:
                    start_str = job.get('start_date') or job.get('startDate')
                    if not start_str: continue
                    
                    # Parse start date
                    start_date = None
                    for fmt in ['%B %Y', '%Y-%m-%d', '%Y-%m', '%m/%Y', '%Y']:
                        try:
                            start_date = datetime.strptime(start_str, fmt)
                            break
                        except: continue
                        
                    if not start_date: continue
                    
                    # Parse end date
                    end_str = job.get('end_date') or job.get('endDate') or 'Present'
                    if end_str.lower() in ['present', 'current', 'now']:
                        end_date = today
                    else:
                        end_date = None
                        for fmt in ['%B %Y', '%Y-%m-%d', '%Y-%m', '%m/%Y', '%Y']:
                            try:
                                end_date = datetime.strptime(end_str, fmt)
                                break
                            except: continue
                        if not end_date: end_date = today # Fallback
                        
                    # Calculate duration
                    months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
                    if months > 0:
                        total_months += months
                except:
                    continue
            
            total_years = round(total_months / 12, 1)
            
            # Infer experience level
            if total_years >= 5:
                experience_level = "senior"
            elif total_years >= 2:
                experience_level = "mid"
            else:
                experience_level = "junior"
            
            candidate = {
                "id": p.get('user_id'),
                "name": personal.get('name', 'Unknown'),
                "email": p.get('email', personal.get('email', "")),
                "phone": p.get('phone', personal.get('phone', "")),
                "skills": skills,
                "total_years": total_years,
                "experience_level": experience_level,
                "availability": "full-time", # Default
                "location": personal.get('location', ""),
                "bio": personal.get('about', ""),
                "profileImage": personal.get('image', ""),
                "job_experience": job_exp,
                "education": education,
                "profileQuestionnaire": profile_data.get('profile_questionnaire', {}),
                # Keep raw data too
                "profile_data": profile_data
            }
            
            # Recalculate years from ProgressiveFilter logic logic later or here
            # For now, let's just make sure we capture the data
            
            candidates.append(candidate)
            
        print(f"✅ Loaded {len(candidates)} candidates from Supabase")
        return candidates
        
    except Exception as e:
        print(f"❌ Error loading candidates: {e}")
        return []


def get_progressive_filter() -> ProgressiveFilter:
    """Get or create the progressive filter singleton."""
    global _progressive_filter
    if _progressive_filter is None:
        print("🔄 Initializing ProgressiveFilter and loading candidates...")
        candidates = load_candidates_from_supabase()
        _progressive_filter = ProgressiveFilter(candidates)
        
        # If we loaded candidates, we should also pre-calculate their embeddings
        if candidates:
            semantic = get_semantic_engine()
            print("🧠 Generating embeddings for candidates...")
            for c in candidates:
                semantic.embed_candidate_profile(c)
            print("✅ Embeddings generated")
            
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
