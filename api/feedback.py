from flask import Flask, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

FEEDBACK_FILE = '/tmp/feedback_data.json'
MODEL_WEIGHTS_FILE = '/tmp/model_weights.json'

def load_feedback_data():
    """Load feedback data"""
    if os.path.exists(FEEDBACK_FILE):
        with open(FEEDBACK_FILE, 'r') as f:
            return json.load(f)
    return []

def save_feedback_data(data):
    """Save feedback data"""
    with open(FEEDBACK_FILE, 'w') as f:
        json.dump(data, f)

def load_model_weights():
    """Load learned word weights"""
    if os.path.exists(MODEL_WEIGHTS_FILE):
        with open(MODEL_WEIGHTS_FILE, 'r') as f:
            return json.load(f)
    return {
        'positive_words': {},
        'negative_words': {},
        'neutral_words': {}
    }

def save_model_weights(weights):
    """Save model weights"""
    with open(MODEL_WEIGHTS_FILE, 'w') as f:
        json.dump(weights, f)

def update_model_with_feedback(message, correct_sentiment, weight_multiplier=2.0):
    """Update model with higher weight for user-corrected data"""
    weights = load_model_weights()
    
    words = message.lower().split()
    sentiment_key = f"{correct_sentiment.lower()}_words"
    
    for word in words:
        if len(word) > 2:
            if word not in weights[sentiment_key]:
                weights[sentiment_key][word] = 0
            
            # Give feedback data higher weight
            weights[sentiment_key][word] += weight_multiplier
    
    save_model_weights(weights)
    return weights

@app.route('/api/feedback', methods=['POST'])
def feedback():
    """Record user feedback and update model"""
    data = request.json
    
    message = data.get('message', '')
    predicted_sentiment = data.get('predicted_sentiment', '')
    correct_sentiment = data.get('correct_sentiment', '')
    is_correct = data.get('is_correct', False)
    
    if not message or not predicted_sentiment or not correct_sentiment:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Load existing feedback
    feedback_data = load_feedback_data()
    
    # Add new feedback
    feedback_data.append({
        'message': message,
        'predicted_sentiment': predicted_sentiment,
        'correct_sentiment': correct_sentiment,
        'is_correct': is_correct,
        'timestamp': datetime.now().isoformat()
    })
    
    # Keep only last 500 feedback entries
    if len(feedback_data) > 500:
        feedback_data = feedback_data[-500:]
    
    save_feedback_data(feedback_data)
    
    # Update model with corrected sentiment (higher weight)
    weights = update_model_with_feedback(message, correct_sentiment, weight_multiplier=3.0 if not is_correct else 1.5)
    
    # Calculate accuracy
    total_feedback = len(feedback_data)
    correct_predictions = sum(1 for f in feedback_data if f['is_correct'])
    accuracy = correct_predictions / total_feedback if total_feedback > 0 else 0
    
    return jsonify({
        'success': True,
        'feedback_recorded': True,
        'model_updated': True,
        'total_feedback': total_feedback,
        'accuracy': round(accuracy, 4),
        'learned_words': {
            'positive': len(weights['positive_words']),
            'negative': len(weights['negative_words']),
            'neutral': len(weights['neutral_words'])
        }
    })

# Vercel serverless function handler
def handler(request):
    with app.request_context(request.environ):
        return app.full_dispatch_request()
