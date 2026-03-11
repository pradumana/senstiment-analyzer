from flask import Flask, request, jsonify
from chatbot import SentimentChatbot

app = Flask(__name__)
chatbot = SentimentChatbot()

@app.route('/chat', methods=['POST'])
def chat():
    """Endpoint for chatbot interaction"""
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    response = chatbot.process_message(user_message)
    return jsonify(response)

@app.route('/sentiment', methods=['GET'])
def get_sentiment():
    """Get overall conversation sentiment"""
    sentiment = chatbot.get_conversation_sentiment()
    return jsonify(sentiment)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
