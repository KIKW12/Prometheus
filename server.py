from flask import Flask, request, jsonify
from flask_cors import CORS

import os
import sys
from dotenv import load_dotenv

# Add conversation_agent to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'conversation_agent'))

# Load env from conversation_agent/.env
load_dotenv(os.path.join(os.path.dirname(__file__), 'conversation_agent', '.env'))

# Try new LangGraph agent first, fall back to legacy
try:
    from my_agent.langgraph_agent import run_search, set_company_profile
    USE_LANGGRAPH = True
    print("✅ Using LangGraph agent")
except ImportError as e:
    from my_agent.agent import progressive_search
    USE_LANGGRAPH = False
    print(f"⚠️ Falling back to legacy agent: {e}")

app = Flask(__name__)
CORS(app)


@app.route('/api/agent/search', methods=['POST'])
def search():
    data = request.get_json()
    query = data.get('query')
    reset_conversation = data.get('reset_conversation', False)
    company_profile = data.get('company_profile', None)
    
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    if USE_LANGGRAPH:
        result = run_search(
            query=query, 
            reset_conversation=reset_conversation,
            company_profile=company_profile
        )
    else:
        result = progressive_search(query=query, reset_conversation=reset_conversation)
    
    return jsonify(result)


@app.route('/api/company/profile', methods=['POST'])
def set_company():
    """Set the company profile for culture matching."""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Company profile is required'}), 400
    
    if USE_LANGGRAPH:
        set_company_profile(data)
        return jsonify({'status': 'success', 'message': 'Company profile set'})
    else:
        return jsonify({'error': 'Company profiles require LangGraph agent'}), 501


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'agent': 'langgraph' if USE_LANGGRAPH else 'legacy'
    })


if __name__ == '__main__':
    # Bind to 0.0.0.0 to allow external access (required for Render)
    # Default to 8080 to match Digital Ocean, but respect PORT env var if set
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
