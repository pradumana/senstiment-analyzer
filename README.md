# Sentiment Analysis Chatbot - Vercel Deployment

A smart chatbot with sentiment analysis that learns from user interactions.

## Features

✨ Real-time sentiment analysis (Positive/Negative/Neutral)
🧠 Auto-training from every conversation
👍👎 User feedback system to improve accuracy
📊 Analytics dashboard with statistics
🎨 Modern, responsive UI
⚡ Serverless deployment on Vercel

## Quick Deploy

```bash
npm install -g vercel
vercel login
vercel
```

## How It Works

1. **User sends message** → Sentiment is analyzed
2. **User provides feedback** → Model learns with higher weight
3. **Model improves** → Better predictions over time
4. **Analytics track progress** → View accuracy and learned words

## User Feedback System

- Click 👍 if sentiment is correct (reinforces learning)
- Click 👎 if wrong (corrects and retrains with 3x weight)
- Feedback improves model accuracy significantly

## Analytics Dashboard

Click "📊 Analytics" to view:
- Total conversations
- Words learned
- User corrections
- Model accuracy
- Sentiment distribution
- Top positive/negative words

## Persistent Storage

Current: Uses `/tmp` (resets on restart)
Recommended: Vercel KV for permanent storage

See `VERCEL_KV_SETUP.md` for setup instructions.

## Local Development

```bash
pip install -r requirements-vercel.txt
python -m flask --app api/chat run
```

Open `public/index.html` in browser.

## API Endpoints

- `POST /api/chat` - Send message, get sentiment
- `POST /api/train` - Auto-train from interaction
- `POST /api/feedback` - Submit user correction
- `GET /api/model-stats` - Get analytics data

## Tech Stack

- Frontend: Vanilla JS, CSS3
- Backend: Python Flask (Serverless)
- Deployment: Vercel
- Storage: File-based (upgradeable to Vercel KV)

## Future Enhancements

- Vercel KV for persistent storage
- Multi-language support
- Emotion detection (beyond sentiment)
- Voice input
- Export conversations
- Dark mode
