from flask import Flask, request, jsonify
from flask_cors import CORS

# Try new LangGraph agent first, fall back to legacy
try:
    from conversation_agent.my_agent.langgraph_agent import run_search, set_company_profile
    USE_LANGGRAPH = True
    print("✅ Using LangGraph agent")
except ImportError as e:
    from conversation_agent.my_agent.agent import progressive_search
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
    app.run(debug=True, port=5001)

