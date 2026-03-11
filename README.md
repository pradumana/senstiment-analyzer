# Sentiment Analysis Chatbot

A simple NLP-based sentiment analysis system for chatbots using transformers.

## Setup

```bash
pip install -r requirements.txt
```

## Usage

### Run Demo
```bash
python demo.py
```

### Run Flask API
```bash
python app.py
```

### API Endpoints

**POST /chat**
```json
{
  "message": "I love this product!"
}
```

**GET /sentiment** - Get conversation summary

## Features

- Real-time sentiment analysis using DistilBERT
- Chatbot with sentiment-aware responses
- Conversation sentiment tracking
- REST API for integration
