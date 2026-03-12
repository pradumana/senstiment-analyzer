from flask import Flask, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

# File to store training data (in production, use a database)
TRAINING_DATA_FILE = '/tmp/training_data.json'
MODEL_WEIGHTS_FILE = '/tmp/model_weights.json'

def load_training_data():
    """Load existing training data"""
    if os.path.exists(TRAINING_DATA_FILE):
        with open(TRAINING_DATA_FILE, 'r') as f:
            return json.load(f)
    return []

def save_training_data(data):
    """Save training data"""
    with open(TRAINING_DATA_FILE, 'w') as f:
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

def update_model(message, sentiment, confidence):
    """Update model based on new interaction"""
    weights = load_model_weights()
    
    # Extract words from message
    words = message.lower().split()
    
    # Update word weights based on sentiment
    sentiment_key = f"{sentiment.lower()}_words"
    
    for word in words:
        if len(word) > 2:  # Ignore very short words
            if word not in weights[sentiment_key]:
                weights[sentiment_key][word] = 0
            
            # Increase weight based on confidence
            weights[sentiment_key][word] += confidence
    
    save_model_weights(weights)
    return weights

@app.route('/api/train', methods=['POST'])
def train():
    """Store interaction and update model"""
    data = request.json
    
    message = data.get('message', '')
    sentiment = data.get('sentiment', '')
    confidence = data.get('confidence', 0)
    feedback = data.get('feedback', None)  # Optional user feedback
    
    if not message or not sentiment:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Load existing training data
    training_data = load_training_data()
    
    # Add new interaction
    training_data.append({
        'message': message,
        'sentiment': sentiment,
        'confidence': confidence,
        'feedback': feedback,
        'timestamp': datetime.now().isoformat()
    })
    
    # Keep only last 1000 interactions
    if len(training_data) > 1000:
        training_data = training_data[-1000:]
    
    save_training_data(training_data)
    
    # Update model weights
    weights = update_model(message, sentiment, confidence)
    
    return jsonify({
        'success': True,
        'total_interactions': len(training_data),
        'model_updated': True,
        'learned_words': {
            'positive': len(weights['positive_words']),
            'negative': len(weights['negative_words']),
            'neutral': len(weights['neutral_words'])
        }
    })

@app.route('/api/model-stats', methods=['GET'])
def model_stats():
    """Get model statistics"""
    training_data = load_training_data()
    weights = load_model_weights()
    
    # Load feedback data
    feedback_file = '/tmp/feedback_data.json'
    feedback_data = []
    if os.path.exists(feedback_file):
        with open(feedback_file, 'r') as f:
            feedback_data = json.load(f)
    
    # Calculate statistics
    total = len(training_data)
    positive = sum(1 for d in training_data if d['sentiment'] == 'POSITIVE')
    negative = sum(1 for d in training_data if d['sentiment'] == 'NEGATIVE')
    neutral = sum(1 for d in training_data if d['sentiment'] == 'NEUTRAL')
    
    # Calculate accuracy from feedback
    total_feedback = len(feedback_data)
    correct_predictions = sum(1 for f in feedback_data if f['is_correct'])
    accuracy = correct_predictions / total_feedback if total_feedback > 0 else None
    
    return jsonify({
        'total_interactions': total,
        'sentiment_distribution': {
            'positive': positive,
            'negative': negative,
            'neutral': neutral
        },
        'learned_vocabulary': {
            'positive_words': len(weights['positive_words']),
            'negative_words': len(weights['negative_words']),
            'neutral_words': len(weights['neutral_words'])
        },
        'feedback_count': total_feedback,
        'accuracy': accuracy,
        'top_positive_words': sorted(
            weights['positive_words'].items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10],
        'top_negative_words': sorted(
            weights['negative_words'].items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10]
    })

# Vercel serverless function handler
def handler(request):
    with app.request_context(request.environ):
        return app.full_dispatch_request()
