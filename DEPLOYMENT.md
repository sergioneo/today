# Deployment Guide

## Current Setup: Personal Use ✅

The app stores API keys in browser localStorage. Perfect for:
- Personal/family use
- Running locally
- Each user has their own API keys

## For Public Deployment: Add a Backend 🔒

If you want to deploy this for others to use WITHOUT them needing API keys, you need a backend.

### Option 1: Netlify Functions (Easiest)

1. Create `netlify/functions/generate-plan.js`:
```javascript
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // API keys in Netlify environment variables
  const CLAUDE_KEY = process.env.CLAUDE_API_KEY;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: event.body
  });

  return {
    statusCode: 200,
    body: JSON.stringify(await response.json())
  };
};
```

2. Update `js/api.js` to call your function instead:
```javascript
// Instead of calling Claude directly:
const response = await fetch('/.netlify/functions/generate-plan', {
  method: 'POST',
  body: JSON.stringify(profile)
});
```

3. Set environment variables in Netlify dashboard
4. Deploy!

### Option 2: Vercel Edge Functions

Similar to Netlify, but uses Vercel's edge runtime.

Create `api/generate-plan.js`:
```javascript
export default async function handler(req, res) {
  const CLAUDE_KEY = process.env.CLAUDE_API_KEY;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(req.body)
  });

  res.json(await response.json());
}
```

### Option 3: Your Own Backend

Any backend works:
- Node.js + Express
- Python + Flask
- Go + Gin
- etc.

## Environment Variables (Never Committed)

### For Netlify/Vercel
Set in their dashboard:
- `CLAUDE_API_KEY`
- `GOOGLE_PLACES_API_KEY`

### For Local Development with Backend
Create `.env` file (already in `.gitignore`):
```bash
CLAUDE_API_KEY=sk-ant-your-key-here
GOOGLE_PLACES_API_KEY=your-google-key-here
```

## Cost Considerations

### Personal Use (Current)
- You pay for your own API usage
- ~$0.01-0.02 per plan generation
- Very affordable for family use

### Public Deployment
- YOU pay for ALL users' API calls
- Could get expensive quickly
- Consider:
  - User authentication
  - Rate limiting
  - Usage quotas
  - Charging users

## Recommendation

**For your family:** Current setup is perfect! Just don't commit keys.

**For public use:** Add a backend with your keys in environment variables.

**For a product:** Add authentication, rate limiting, and consider monetization.

## Quick Deploy for Personal Use

### GitHub Pages (No API keys needed if users provide their own)
```bash
git checkout -b gh-pages
git push -u origin gh-pages
```
Enable in Settings → Pages

Each user enters their own API keys (current behavior).

### Netlify Drop (Same as above)
1. Go to https://app.netlify.com/drop
2. Drag the folder
3. Users enter their own keys

Both work great for sharing with family/friends who are willing to get their own API keys!
