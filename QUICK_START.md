# Quick Start Guide

Get "Today" running in 5 minutes!

## Step 1: Get API Keys (5 minutes)

### Claude API Key
1. Go to https://console.anthropic.com/
2. Sign up (you'll get free credits)
3. Click "API Keys"
4. Create a new key
5. Copy it (starts with `sk-ant-`)

### Google Places API Key
1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Click "Enable APIs" and enable:
   - Places API
   - Maps JavaScript API
4. Go to "Credentials"
5. Click "Create Credentials" → "API Key"
6. Copy the key

## Step 2: Run the App (1 minute)

Choose one:

### Option A: Python (easiest)
```bash
python -m http.server 8000
```

### Option B: Node.js
```bash
npx http-server -p 8000
```

### Option C: PHP
```bash
php -S localhost:8000
```

Then open: http://localhost:8000

## Step 3: Setup Profile (2 minutes)

1. Click the settings icon (⚙️)
2. Paste your Claude API key
3. Paste your Google Places API key
4. Click "Create Your Profile"
5. Fill in your info and family members
6. Save!

## Step 4: Generate Your First Plan! (30 seconds)

1. Click "Generate Today's Plan"
2. Wait a few seconds
3. Explore your personalized activities!

## Tips

- Be specific with location (e.g., "Brooklyn, NY" not just "New York")
- Add family members' interests for better recommendations
- Try different budget levels to see varied suggestions
- Click "New Plan" to get different recommendations

## Troubleshooting

**"Failed to generate plan"**
- Double-check your Claude API key
- Make sure you have credits in your Anthropic account

**No photos showing**
- Verify your Google Places API key
- Check that Places API is enabled in Google Cloud

**App looks broken**
- Try a different browser (Chrome/Safari/Edge recommended)
- Make sure JavaScript is enabled

## What's Next?

- Install the app on your phone (look for "Add to Home Screen")
- Try generating plans for different days of the week
- Experiment with different family interests
- Use it when you're out and don't know where to eat!

Enjoy! 🎉
