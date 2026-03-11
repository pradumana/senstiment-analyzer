from transformers import pipeline
import numpy as np

class SentimentAnalyzer:
    def __init__(self):
        # Load pre-trained sentiment analysis model
        self.classifier = pipeline("sentiment-analysis", 
                                   model="distilbert-base-uncased-finetuned-sst-2-english")
    
    def analyze(self, text):
        """
        Analyze sentiment of input text
        Returns: dict with label (POSITIVE/NEGATIVE) and confidence score
        """
        result = self.classifier(text)[0]
        return {
            'sentiment': result['label'],
            'confidence': round(result['score'], 4)
        }
    
    def analyze_batch(self, texts):
        """Analyze multiple texts at once"""
        results = self.classifier(texts)
        return [{'sentiment': r['label'], 'confidence': round(r['score'], 4)} 
                for r in results]
