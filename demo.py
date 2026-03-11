from chatbot import SentimentChatbot

def main():
    print("=== Sentiment Analysis Chatbot Demo ===\n")
    
    chatbot = SentimentChatbot()
    
    # Test messages
    test_messages = [
        "I love this product! It's amazing!",
        "This is terrible, I'm very disappointed.",
        "The service was okay, nothing special.",
        "Thank you so much for your help!",
        "I'm frustrated with the long wait time."
    ]
    
    print("Processing test messages:\n")
    for message in test_messages:
        result = chatbot.process_message(message)
        print(f"User: {result['user_message']}")
        print(f"Sentiment: {result['sentiment']} (confidence: {result['confidence']})")
        print(f"Bot: {result['bot_response']}\n")
    
    # Show conversation summary
    summary = chatbot.get_conversation_sentiment()
    print("=== Conversation Summary ===")
    print(f"Total messages: {summary['total_messages']}")
    print(f"Positive: {summary['positive_messages']}")
    print(f"Negative: {summary['negative_messages']}")
    print(f"Overall tone: {summary['overall_tone']}")

if __name__ == '__main__':
    main()
