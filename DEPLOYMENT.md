# Deployment Guide for Vercel

## Quick Deploy

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

## Features

### Frontend
- Modern, responsive chat interface
- Real-time sentiment analysis display
- Typing indicators
- Smooth animations
- Mobile-friendly design

### Backend
- Serverless API on Vercel
- Lightweight sentiment analysis (no heavy ML models)
- Fast response times
- Auto-scaling

### Auto-Training
The chatbot automatically learns from conversations:
- Stores conversation patterns in browser localStorage
- Tracks sentiment patterns over time
- Keeps last 100 conversation patterns
- Can be extended to send data to backend for model improvement

## Project Structure

```
├── public/
│   ├── index.html      # Main chat interface
│   ├── script.js       # Frontend logic & auto-training
│   └── styles.css      # Styling
├── api/
│   └── chat.py         # Serverless API endpoint
├── vercel.json         # Vercel configuration
└── requirements-vercel.txt  # Python dependencies
```

## Environment Variables (Optional)

If you want to add API keys or configuration:

1. Create `.env` file locally
2. Add variables in Vercel dashboard: Settings → Environment Variables

## Custom Domain

1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain

## Monitoring

- View logs: `vercel logs`
- Check deployment status in Vercel dashboard
- Monitor API usage and performance

## Extending Auto-Training

To implement server-side training:

1. Create a new API endpoint `/api/train`
2. Send localStorage patterns to backend
3. Use patterns to improve sentiment analysis
4. Implement feedback loop for model updates

## Local Development

```bash
# Install dependencies
pip install -r requirements-vercel.txt

# Run locally (you'll need to set up a local server)
python -m flask --app api/chat run
```

Then open `public/index.html` in your browser.
