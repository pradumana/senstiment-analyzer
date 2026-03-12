# Vercel KV Setup for Persistent Storage

## Why Vercel KV?

Currently, the app uses `/tmp` storage which is ephemeral (resets on function restart). Vercel KV provides persistent Redis storage so your model's learning is permanent.

## Setup Steps

### 1. Create Vercel KV Database

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Storage" tab
4. Click "Create Database"
5. Select "KV" (Redis)
6. Name it (e.g., "chatbot-storage")
7. Click "Create"

### 2. Install Vercel KV Package

Add to `requirements-vercel.txt`:
```
flask==3.0.0
vercel-kv==0.1.0
```

### 3. Update API Files

Replace file operations with KV operations:

```python
from vercel_kv import kv

# Instead of:
# with open(TRAINING_DATA_FILE, 'r') as f:
#     return json.load(f)

# Use:
data = kv.get('training_data')
return json.loads(data) if data else []

# Instead of:
# with open(TRAINING_DATA_FILE, 'w') as f:
#     json.dump(data, f)

# Use:
kv.set('training_data', json.dumps(data))
```

### 4. Environment Variables

Vercel automatically adds these when you create KV:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

No manual configuration needed!

## Benefits

✅ Persistent storage across deployments
✅ Fast Redis-based access
✅ Automatic scaling
✅ No data loss on function restart
✅ Free tier: 256MB storage, 100K requests/month

## Alternative: Use Database

If you prefer a traditional database:

1. **MongoDB Atlas** (Free tier available)
2. **PostgreSQL** (Vercel Postgres)
3. **Supabase** (Free tier with PostgreSQL)

## Current Status

The app works without KV but loses training data on restart. For production use, implement KV or database storage.
