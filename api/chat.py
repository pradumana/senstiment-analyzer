from flask import Flask, request, jsonify
import json
import os
import re

app = Flask(__name__)

MODEL_WEIGHTS_FILE = '/tmp/model_weights.json'
CONTEXT_FILE = '/tmp/conversation_context.json'

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

def load_context():
    """Load conversation context"""
    if os.path.exists(CONTEXT_FILE):
        with open(CONTEXT_FILE, 'r') as f:
            return json.load(f)
    return []

def save_context(context):
    """Save conversation context"""
    with open(CONTEXT_FILE, 'w') as f:
        json.dump(context[-10:], f)  # Keep last 10 messages

def analyze_emojis(text):
    """Analyze emojis for sentiment"""
    positive_emojis = ['😊', '😃', '😄', '😁', '🙂', '😍', '🥰', '😘', '🤗', '👍', '❤️', '💕', '✨', '🎉', '🎊', '👏', '🌟']
    negative_emojis = ['😢', '😭', '😞', '😔', '😟', '😕', '☹️', '🙁', '😠', '😡', '😤', '😣', '😖', '💔', '👎', '😰', '😨']
    
    positive_count = sum(1 for emoji in positive_emojis if emoji in text)
    negative_count = sum(1 for emoji in negative_emojis if emoji in text)
    
    return positive_count, negative_count

def detect_intent(text):
    """Detect user intent"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['?', 'how', 'what', 'when', 'where', 'why', 'who']):
        return 'question'
    elif any(word in text_lower for word in ['problem', 'issue', 'error', 'broken', 'not working']):
        return 'complaint'
    elif any(word in text_lower for word in ['thank', 'thanks', 'appreciate', 'grateful']):
        return 'praise'
    elif any(word in text_lower for word in ['please', 'can you', 'could you', 'would you', 'help']):
        return 'request'
    else:
        return 'statement'

def detect_emotion(sentiment, confidence, text):
    """Detect specific emotions beyond sentiment"""
    text_lower = text.lower()
    
    if sentiment == 'POSITIVE':
        if any(word in text_lower for word in ['excited', 'amazing', 'awesome', 'fantastic']):
            return 'excited'
        elif any(word in text_lower for word in ['love', 'adore', 'wonderful']):
            return 'joyful'
        else:
            return 'happy'
    elif sentiment == 'NEGATIVE':
        if any(word in text_lower for word in ['angry', 'furious', 'mad']):
            return 'angry'
        elif any(word in text_lower for word in ['sad', 'depressed', 'unhappy']):
            return 'sad'
        elif any(word in text_lower for word in ['confused', 'unclear', 'don\'t understand']):
            return 'confused'
        elif any(word in text_lower for word in ['frustrated', 'annoyed']):
            return 'frustrated'
        else:
            return 'disappointed'
    else:
        return 'neutral'

# Enhanced sentiment analysis with emojis and context
def analyze_sentiment(text, context=[]):
    """Sentiment analysis with emoji detection and context awareness"""
    # Base keywords
    positive_words = ['love', 'great', 'amazing', 'excellent', 'wonderful', 'fantastic', 
                      'good', 'happy', 'thank', 'thanks', 'awesome', 'perfect', 'best']
    negative_words = ['hate', 'terrible', 'awful', 'bad', 'worst', 'disappointed', 
                      'frustrated', 'angry', 'sad', 'poor', 'horrible', 'useless']
    
    # Analyze emojis
    emoji_positive, emoji_negative = analyze_emojis(text)
    
    # Load learned weights
    weights = load_model_weights()
    
    text_lower = text.lower()
    words = text_lower.split()
    
    # Calculate scores using base keywords
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    # Add emoji scores
    positive_count += emoji_positive * 2
    negative_count += emoji_negative * 2
    
    # Add learned weights
    positive_score = positive_count
    negative_score = negative_count
    neutral_score = 0
    
    for word in words:
        if word in weights['positive_words']:
            positive_score += weights['positive_words'][word] * 0.1
        if word in weights['negative_words']:
            negative_score += weights['negative_words'][word] * 0.1
        if word in weights['neutral_words']:
            neutral_score += weights['neutral_words'][word] * 0.1
    
    # Context awareness - if previous messages were negative, adjust threshold
    if context:
        recent_sentiments = [msg.get('sentiment') for msg in context[-3:]]
        negative_context = recent_sentiments.count('NEGATIVE')
        if negative_context >= 2:
            negative_score += 0.5  # Slight boost if conversation is negative
    
    # Determine sentiment
    if positive_score > negative_score and positive_score > neutral_score:
        confidence = min(0.6 + (positive_score * 0.1), 0.95)
        return {'sentiment': 'POSITIVE', 'confidence': round(confidence, 4)}
    elif negative_score > positive_score and negative_score > neutral_score:
        confidence = min(0.6 + (negative_score * 0.1), 0.95)
        return {'sentiment': 'NEGATIVE', 'confidence': round(confidence, 4)}
    else:
        return {'sentiment': 'NEUTRAL', 'confidence': 0.5}

def generate_response(sentiment_result, intent, emotion, context=[]):
    """Generate contextual response based on sentiment, intent, emotion, and conversation history"""
    sentiment = sentiment_result['sentiment']
    confidence = sentiment_result['confidence']
    
    # Check context for patterns
    is_follow_up = len(context) > 0
    
    # Intent-based responses
    if intent == 'question':
        if sentiment == 'POSITIVE':
            return "Great question! I'd be happy to help you with that. What specifically would you like to know?"
        elif sentiment == 'NEGATIVE':
            return "I understand you're looking for answers. Let me help clarify things for you."
        else:
            return "That's an interesting question. Let me help you find the answer."
    
    elif intent == 'complaint':
        if emotion == 'angry':
            return "I sincerely apologize for the frustration. Let me help resolve this issue immediately."
        elif emotion == 'frustrated':
            return "I understand how frustrating this must be. Let's work together to fix this."
        else:
            return "I'm sorry to hear about this issue. I'm here to help make things right."
    
    elif intent == 'praise':
        return "Thank you so much! Your kind words mean a lot. How else can I assist you today?"
    
    elif intent == 'request':
        if is_follow_up:
            return "Of course! I'm here to help. Let me assist you with that right away."
        else:
            return "I'd be happy to help you with that! What would you like me to do?"
    
    # Emotion-based responses
    if emotion == 'excited':
        return "I love your enthusiasm! That's wonderful! What else can I help you with?"
    elif emotion == 'joyful':
        return "I'm so glad to hear that! Your happiness is contagious! 😊"
    elif emotion == 'sad':
        return "I'm here for you. Sometimes things are tough, but I'm here to help however I can."
    elif emotion == 'confused':
        return "Let me help clear things up for you. What part would you like me to explain better?"
    
    # Default sentiment-based responses with context
    if sentiment == 'POSITIVE':
        if confidence > 0.8:
            if is_follow_up:
                return "I'm thrilled you're having a great experience! What else can I do for you?"
            else:
                return "I'm so glad to hear that! How can I help you further?"
        else:
            return "That sounds good! What else can I do for you?"
    elif sentiment == 'NEGATIVE':
        if confidence > 0.8:
            if is_follow_up:
                return "I'm truly sorry this continues to be an issue. Let me help you resolve this once and for all."
            else:
                return "I'm sorry to hear that. Let me help you resolve this issue."
        else:
            return "I understand your concern. How can I assist you better?"
    else:
        if is_follow_up:
            return "I see. Is there anything specific I can help you with?"
        else:
            return "I understand. How can I help you today?"

@app.route('/api/chat', methods=['POST'])
def chat():
    """Endpoint for chatbot interaction with context awareness"""
    data = request.json
    user_message = data.get('message', '')
    session_id = data.get('session_id', 'default')
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    # Load conversation context
    context = load_context()
    
    # Analyze sentiment with context
    sentiment_result = analyze_sentiment(user_message, context)
    
    # Detect intent and emotion
    intent = detect_intent(user_message)
    emotion = detect_emotion(sentiment_result['sentiment'], sentiment_result['confidence'], user_message)
    
    # Generate contextual response
    response = generate_response(sentiment_result, intent, emotion, context)
    
    # Update context
    context.append({
        'message': user_message,
        'sentiment': sentiment_result['sentiment'],
        'intent': intent,
        'emotion': emotion
    })
    save_context(context)
    
    return jsonify({
        'user_message': user_message,
        'sentiment': sentiment_result['sentiment'],
        'confidence': sentiment_result['confidence'],
        'intent': intent,
        'emotion': emotion,
        'bot_response': response
    })

# Vercel serverless function handler
def handler(request):
    with app.request_context(request.environ):
        return app.full_dispatch_request()
