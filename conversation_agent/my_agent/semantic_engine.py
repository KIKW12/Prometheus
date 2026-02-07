"""
Bidirectional Semantic Engine for Prometheus
Handles embedding generation and matching for both candidates and companies.
"""

from typing import List, Dict, Any, Optional
import numpy as np
import os
from functools import lru_cache

try:
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    GOOGLE_EMBEDDINGS_AVAILABLE = True
except ImportError:
    GOOGLE_EMBEDDINGS_AVAILABLE = False
    print("⚠️ langchain_google_genai not installed. Using fallback matching.")

class SemanticEngine:
    """
    Bidirectional semantic matching engine.
    
    Creates embeddings using Google Cloud's lightweight API 
    instead of heavy local models.
    """
    
    def __init__(self, model_name: str = 'models/gemini-embedding-001'):
        """
        Initialize the semantic engine with Google Cloud Embeddings.
        """
        self.model = None
        self.model_name = model_name
        self._skill_embeddings_cache: Dict[str, np.ndarray] = {}
        
        if GOOGLE_EMBEDDINGS_AVAILABLE:
            api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
            if api_key:
                try:
                    self.model = GoogleGenerativeAIEmbeddings(
                        model=model_name,
                        google_api_key=api_key
                    )
                    print(f"✅ Loaded Google Cloud Embeddings: {model_name}")
                except Exception as e:
                    print(f"⚠️ Failed to init Google Embeddings: {e}")
            else:
                print("⚠️ No Google API Key found for embeddings.")
    
    # ========== CANDIDATE EMBEDDING ==========
    
    def embed_candidate_profile(self, profile: Dict[str, Any]) -> np.ndarray:
        """
        Create embedding from candidate's full profile.
        
        Combines:
        - Technical skills
        - Questionnaire answers (career goals, values, preferences)
        - Work experience summary
        
        Args:
            profile: Candidate profile dict with skills and questionnaire
            
        Returns:
            384-dimensional embedding vector
        """
        # Build text representation of candidate
        parts = []
        
        # Skills
        skills = profile.get('skills', [])
        if skills:
            parts.append(f"Skills: {', '.join(skills)}")
        
        # Questionnaire answers
        questionnaire = profile.get('profileQuestionnaire', {})
        
        if questionnaire.get('career_goals_2_3_years'):
            parts.append(f"Career goals: {questionnaire['career_goals_2_3_years']}")
        
        if questionnaire.get('preferred_environment'):
            parts.append(f"Work environment: {questionnaire['preferred_environment']}")
        
        if questionnaire.get('work_style'):
            parts.append(f"Work style: {questionnaire['work_style']}")
        
        if questionnaire.get('workplace_values'):
            values = questionnaire['workplace_values']
            if isinstance(values, list):
                parts.append(f"Values: {', '.join(values)}")
            else:
                parts.append(f"Values: {values}")
        
        if questionnaire.get('ideal_manager'):
            parts.append(f"Ideal manager: {questionnaire['ideal_manager']}")
        
        if questionnaire.get('problem_domain'):
            parts.append(f"Problem interest: {questionnaire['problem_domain']}")
        
        # Experience summary
        if profile.get('total_years'):
            parts.append(f"Experience: {profile['total_years']} years")
        
        if profile.get('experience_level'):
            parts.append(f"Level: {profile['experience_level']}")
        
        text = " | ".join(parts) if parts else "No profile data"
        
        return self._encode(text)
    
    # ========== COMPANY EMBEDDING ==========
    
    def embed_company_profile(self, company: Dict[str, Any]) -> np.ndarray:
        """
        Create embedding from company's culture questionnaire.
        
        Combines:
        - Company stage and structure
        - Culture attributes (work-life, failure handling, etc.)
        - Mission and values
        
        Args:
            company: Company profile dict with questionnaire answers
            
        Returns:
            384-dimensional embedding vector
        """
        parts = []
        
        questionnaire = company.get('questionnaire', company)
        
        if questionnaire.get('company_stage'):
            parts.append(f"Stage: {questionnaire['company_stage']}")
        
        if questionnaire.get('decision_making'):
            parts.append(f"Decision making: {questionnaire['decision_making']}")
        
        if questionnaire.get('work_life_balance'):
            parts.append(f"Work-life: {questionnaire['work_life_balance']}")
        
        if questionnaire.get('failure_handling'):
            parts.append(f"Failure approach: {questionnaire['failure_handling']}")
        
        if questionnaire.get('success_definition'):
            parts.append(f"Success means: {questionnaire['success_definition']}")
        
        if questionnaire.get('leadership_transparency'):
            parts.append(f"Leadership: {questionnaire['leadership_transparency']}")
        
        if questionnaire.get('team_dynamic'):
            parts.append(f"Team: {questionnaire['team_dynamic']}")
        
        if questionnaire.get('why_people_stay'):
            parts.append(f"People stay because: {questionnaire['why_people_stay']}")
        
        if questionnaire.get('company_problem'):
            parts.append(f"Solving: {questionnaire['company_problem']}")
        
        if questionnaire.get('deal_breaker_values'):
            parts.append(f"Won't hire if: {questionnaire['deal_breaker_values']}")
        
        text = " | ".join(parts) if parts else "No company data"
        
        return self._encode(text)
    
    # ========== QUERY EMBEDDING ==========
    
    def embed_query(self, query: str) -> np.ndarray:
        """
        Create embedding from recruiter's search query.
        
        Args:
            query: Natural language search query
            
        Returns:
            384-dimensional embedding vector
        """
        return self._encode(query)
    
    # ========== SKILL MATCHING ==========
    
    def semantic_skill_match(
        self, 
        required_skills: List[str], 
        candidate_skills: List[str],
        threshold: float = 0.65
    ) -> Dict[str, Any]:
        """
        Match skills semantically using embeddings.
        
        Better than keyword matching:
        - "React" matches "React.js", "Next.js"
        - "Python backend" matches "Django", "FastAPI"
        
        Args:
            required_skills: Skills from job/query
            candidate_skills: Candidate's skills
            threshold: Minimum similarity for a match (0-1)
            
        Returns:
            - direct_matches: Exact matches
            - semantic_matches: Similar skills above threshold
            - skill_score: Overall match percentage
        """
        if not required_skills:
            return {
                'direct_matches': [],
                'semantic_matches': [],
                'missing_skills': [],
                'skill_score': 100.0
            }
        
        required_lower = [s.lower() for s in required_skills]
        candidate_lower = [s.lower() for s in candidate_skills]
        
        # Direct matches
        direct_matches = [s for s in required_lower if s in candidate_lower]
        
        # Semantic matches for non-direct ones
        semantic_matches = []
        missing_skills = []
        
        for req_skill in required_lower:
            if req_skill in direct_matches:
                continue
            
            # Find best semantic match
            best_match = None
            best_score = 0.0
            
            req_embedding = self._get_skill_embedding(req_skill)
            
            for cand_skill in candidate_lower:
                if cand_skill in [m['has'] for m in semantic_matches]:
                    continue
                    
                cand_embedding = self._get_skill_embedding(cand_skill)
                similarity = self._cosine_similarity(req_embedding, cand_embedding)
                
                if similarity > best_score and similarity >= threshold:
                    best_score = similarity
                    best_match = cand_skill
            
            if best_match:
                semantic_matches.append({
                    'required': req_skill,
                    'has': best_match,
                    'similarity': round(best_score, 2)
                })
            else:
                missing_skills.append(req_skill)
        
        # Calculate score
        total_required = len(required_lower)
        matched = len(direct_matches) + len(semantic_matches) * 0.8  # Semantic worth 80%
        skill_score = (matched / total_required) * 100 if total_required > 0 else 100
        
        return {
            'direct_matches': direct_matches,
            'semantic_matches': semantic_matches,
            'missing_skills': missing_skills,
            'skill_score': round(min(skill_score, 100), 1)
        }
    
    # ========== BIDIRECTIONAL MATCHING ==========
    
    def calculate_mutual_fit(
        self, 
        candidate: Dict[str, Any], 
        company: Dict[str, Any],
        query_skills: List[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate fit from BOTH perspectives.
        
        1. Does candidate fit what company needs? (skills + culture)
        2. Does company fit what candidate wants? (values + environment)
        
        Args:
            candidate: Full candidate profile
            company: Full company profile
            query_skills: Optional skills from current search query
            
        Returns:
            - overall_fit: Combined score (0-100)
            - skill_match: Technical skill alignment
            - culture_fit: Culture/values alignment
            - mission_alignment: Problem domain match
        """
        # Skill matching (if query provided)
        skill_result = {'skill_score': 100.0}
        if query_skills:
            skill_result = self.semantic_skill_match(
                query_skills, 
                candidate.get('skills', [])
            )
        
        # Culture fit via embeddings
        candidate_embedding = self.embed_candidate_profile(candidate)
        company_embedding = self.embed_company_profile(company)
        culture_similarity = self._cosine_similarity(candidate_embedding, company_embedding)
        culture_fit = culture_similarity * 100
        
        # Mission alignment
        mission_score = self._calculate_mission_alignment(candidate, company)
        
        # Weighted overall score
        overall_fit = (
            skill_result['skill_score'] * 0.45 +  # Skills: 45%
            culture_fit * 0.35 +                   # Culture: 35%
            mission_score * 0.20                   # Mission: 20%
        )
        
        return {
            'overall_fit': round(overall_fit, 1),
            'skill_match': skill_result,
            'culture_fit': round(culture_fit, 1),
            'mission_alignment': round(mission_score, 1),
            'breakdown': {
                'skills_weight': '45%',
                'culture_weight': '35%',
                'mission_weight': '20%'
            }
        }
    
    def _calculate_mission_alignment(
        self, 
        candidate: Dict[str, Any], 
        company: Dict[str, Any]
    ) -> float:
        """Calculate mission/problem domain alignment."""
        candidate_domain = (
            candidate.get('profileQuestionnaire', {})
            .get('problem_domain', '')
            .lower()
        )
        
        company_problem = (
            company.get('questionnaire', company)
            .get('company_problem', '')
            .lower()
        )
        
        if not candidate_domain or not company_domain:
            return 70.0  # Neutral if data missing
        
        # Semantic similarity between problem interests
        cand_embedding = self._encode(candidate_domain)
        comp_embedding = self._encode(company_problem)
        
        similarity = self._cosine_similarity(cand_embedding, comp_embedding)
        return similarity * 100
    
    # ========== QUERY UNDERSTANDING ==========
    
    def extract_requirements_semantic(self, query: str) -> Dict[str, Any]:
        """
        Extract job requirements using semantic understanding.
        
        Better than keyword matching:
        - "backend developer" → infers Python, Node.js, databases
        - "ML engineer" → infers TensorFlow, PyTorch, pandas
        
        Args:
            query: Natural language search query
            
        Returns:
            - skills: Detected/inferred skills
            - experience_level: junior/mid/senior/any
            - availability: full-time/contract/freelance/any
            - role_type: Inferred role category
        """
        query_lower = query.lower()
        
        # Extract experience level
        experience_level = "any"
        if any(w in query_lower for w in ["senior", "sr", "lead", "principal", "staff"]):
            experience_level = "senior"
        elif any(w in query_lower for w in ["junior", "jr", "entry", "graduate"]):
            experience_level = "junior"
        elif any(w in query_lower for w in ["mid", "intermediate", "mid-level"]):
            experience_level = "mid"
        
        # Extract availability
        availability = "any"
        if any(w in query_lower for w in ["full-time", "full time", "permanent"]):
            availability = "full-time"
        elif any(w in query_lower for w in ["contract", "contractor"]):
            availability = "contract"
        elif any(w in query_lower for w in ["freelance", "freelancer"]):
            availability = "freelance"
        elif any(w in query_lower for w in ["part-time", "part time"]):
            availability = "part-time"
        
        # Semantic skill inference
        skills = self._infer_skills_from_query(query_lower)
        
        # Role type detection
        role_type = self._detect_role_type(query_lower)
        
        return {
            'skills': skills,
            'experience_level': experience_level,
            'availability': availability,
            'role_type': role_type,
            'raw_query': query
        }
    
    def _infer_skills_from_query(self, query: str) -> List[str]:
        """Infer skills from query using semantic patterns."""
        skills = []
        
        # Role-based skill inference
        role_skill_map = {
            'frontend': ['javascript', 'html', 'css', 'react'],
            'backend': ['python', 'node.js', 'sql', 'api'],
            'fullstack': ['javascript', 'react', 'node.js', 'sql'],
            'devops': ['docker', 'kubernetes', 'aws', 'ci/cd'],
            'data scientist': ['python', 'machine learning', 'pandas', 'sql'],
            'data engineer': ['python', 'sql', 'spark', 'etl'],
            'ml engineer': ['python', 'tensorflow', 'pytorch', 'mlops'],
            'mobile': ['react native', 'swift', 'kotlin', 'flutter'],
            'ios': ['swift', 'xcode', 'ios'],
            'android': ['kotlin', 'java', 'android'],
        }
        
        for role, role_skills in role_skill_map.items():
            if role in query:
                skills.extend(role_skills)
        
        # Direct skill detection
        direct_skills = [
            'react', 'vue', 'angular', 'next.js', 'typescript', 'javascript',
            'python', 'django', 'fastapi', 'flask', 'node.js', 'express',
            'java', 'spring', 'kotlin', 'swift', 'go', 'rust', 'c++',
            'aws', 'gcp', 'azure', 'docker', 'kubernetes',
            'postgresql', 'mongodb', 'redis', 'graphql', 'rest',
            'tensorflow', 'pytorch', 'pandas', 'machine learning',
            'git', 'linux', 'agile', 'scrum'
        ]
        
        for skill in direct_skills:
            if skill in query and skill not in skills:
                skills.append(skill)
        
        return list(set(skills))
    
    def _detect_role_type(self, query: str) -> str:
        """Detect the type of role from query."""
        role_patterns = {
            'frontend': ['frontend', 'front-end', 'front end', 'ui developer'],
            'backend': ['backend', 'back-end', 'back end', 'server side'],
            'fullstack': ['fullstack', 'full-stack', 'full stack'],
            'devops': ['devops', 'sre', 'platform engineer', 'infrastructure'],
            'data': ['data scientist', 'data analyst', 'data engineer'],
            'ml': ['machine learning', 'ml engineer', 'ai engineer'],
            'mobile': ['mobile', 'ios', 'android', 'react native'],
            'design': ['ui/ux', 'designer', 'ux engineer'],
        }
        
        for role_type, patterns in role_patterns.items():
            if any(p in query for p in patterns):
                return role_type
        
        return 'general'
    
    # ========== INTERNAL METHODS ==========
    
    def _encode(self, text: str) -> np.ndarray:
        """Encode text to embedding vector."""
        if self.model is not None:
            try:
                # Google Embeddings returns a list, convert to numpy
                embedding = self.model.embed_query(text)
                return np.array(embedding, dtype=np.float32)
            except Exception as e:
                print(f"⚠️ Embedding error: {e}")
                return self._fallback_encode(text)
        else:
            return self._fallback_encode(text)

    
    def _fallback_encode(self, text: str) -> np.ndarray:
        """Fallback encoding when model not available."""
        # Create deterministic pseudo-embedding from text hash
        np.random.seed(hash(text.lower()) % (2**32))
        return np.random.randn(384).astype(np.float32)
    
    @lru_cache(maxsize=1000)
    def _get_skill_embedding(self, skill: str) -> np.ndarray:
        """Get cached embedding for a skill."""
        return self._encode(skill)
    
    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors."""
        if a is None or b is None:
            return 0.0
        
        dot_product = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        return float(dot_product / (norm_a * norm_b))


# Singleton instance
_semantic_engine: Optional[SemanticEngine] = None


def get_semantic_engine() -> SemanticEngine:
    """Get or create the semantic engine singleton."""
    global _semantic_engine
    if _semantic_engine is None:
        _semantic_engine = SemanticEngine()
    return _semantic_engine
