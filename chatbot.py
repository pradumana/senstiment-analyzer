from sentiment_analyzer import SentimentAnalyzer

class SentimentChatbot:
    def __init__(self):
        self.analyzer = SentimentAnalyzer()
        self.conversation_history = []
    
    def process_message(self, user_message):
        """Process user message and generate response based on sentiment"""
        sentiment_result = self.analyzer.analyze(user_message)
        
        # Store in history
        self.conversation_history.append({
            'message': user_message,
            'sentiment': sentiment_result
        })
        
        # Generate response based on sentiment
        response = self._generate_response(sentiment_result)
        
        return {
            'user_message': user_message,
            'sentiment': sentiment_result['sentiment'],
            'confidence': sentiment_result['confidence'],
            'bot_response': response
        }
    
    def _generate_response(self, sentiment_result):
        """Generate appropriate response based on sentiment"""
        if sentiment_result['sentiment'] == 'POSITIVE':
            if sentiment_result['confidence'] > 0.9:
                return "I'm so glad to hear that! How can I help you further?"
            else:
                return "That sounds good! What else can I do for you?"
        else:  # NEGATIVE
            if sentiment_result['confidence'] > 0.9:
                return "I'm sorry to hear that. Let me help you resolve this issue."
            else:
                return "I understand your concern. How can I assist you better?"
    
    def get_conversation_sentiment(self):
        """Get overall sentiment of the conversation"""
        if not self.conversation_history:
            return None
        
        positive_count = sum(1 for msg in self.conversation_history 
                           if msg['sentiment']['sentiment'] == 'POSITIVE')
        
        return {
            'total_messages': len(self.conversation_history),
            'positive_messages': positive_count,
            'negative_messages': len(self.conversation_history) - positive_count,
            'overall_tone': 'POSITIVE' if positive_count > len(self.conversation_history) / 2 else 'NEGATIVE'
        }
