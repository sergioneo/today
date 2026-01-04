# Family Setup Guide 👨‍👩‍👧‍👦

The easiest ways to set up "Today" so your whole family can use it!

## ⭐ Recommended: Deploy to Netlify (5 minutes)

**One person sets it up, whole family gets a URL to access from anywhere!**

### Step 1: Get Your API Keys (2 minutes)

1. **Claude API**: https://console.anthropic.com/
   - Sign up (free credits included!)
   - Get your API key (starts with `sk-ant-`)

2. **Google Places API**: https://console.cloud.google.com/
   - Create project
   - Enable "Places API" and "Maps JavaScript API"
   - Create API key

### Step 2: Deploy to Netlify (3 minutes)

1. **Fork/Clone this repo to your GitHub**

2. **Go to Netlify**: https://app.netlify.com/
   - Sign up (free)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select your `today` repo

3. **Add Environment Variables**:
   - In Netlify: Site settings → Environment variables
   - Add these:
     - `CLAUDE_API_KEY` = your Claude key
     - `GOOGLE_PLACES_API_KEY` = your Google key

4. **Deploy!**
   - Netlify will give you a URL like: `your-app-name.netlify.app`
   - Share this URL with your family!

5. **Switch to backend mode**:
   - In `index.html`, change line 253 from:
   ```html
   <script src="/js/api.js"></script>
   ```
   to:
   ```html
   <script src="/js/api-backend.js"></script>
   ```
   - Commit and push - Netlify auto-deploys!

### Step 3: Family Uses It!
- Everyone opens `your-app-name.netlify.app`
- Create one family profile (or each person can make their own)
- Generate plans whenever you're bored!
- Works on phones, tablets, computers

**No API keys needed for family members!** You pay for usage (very cheap - ~$0.02 per plan).

---

## Alternative: Local Network Setup

**Works when everyone is home on the same WiFi**

### On Your Computer (Mac/Linux):
```bash
cd today
python -m http.server 8000 --bind 0.0.0.0

# Find your IP address:
ifconfig | grep "inet " | grep -v 127.0.0.1
# Look for something like: inet 192.168.1.XXX
```

### On Your Computer (Windows):
```bash
cd today
python -m http.server 8000 --bind 0.0.0.0

# Find your IP:
ipconfig
# Look for IPv4 Address under your WiFi adapter
```

### Family Connects:
- On their phones/tablets, go to:
- `http://YOUR_IP_ADDRESS:8000`
- Example: `http://192.168.1.100:8000`

**Pro tip**: Keep your computer running, or use a Raspberry Pi!

---

## Alternative: Shared Device

**One device everyone uses**

1. Start server on family iPad/tablet:
   ```bash
   python -m http.server 8000
   ```

2. Open `http://localhost:8000`

3. Click settings (⚙️), enter YOUR API keys once

4. Create family profile

5. Leave it running - everyone uses this device

**Great for**: Kitchen tablet, family room iPad

---

## Cost Estimate

### Your API Usage (approximate):
- Claude: ~$0.01-0.02 per plan
- Google Places: ~$0.05-0.10 per plan
- **Total: ~$0.10 per plan**

### Monthly estimate:
- 1 plan/day = ~$3/month
- 3 plans/week = ~$1.20/month
- Very affordable! 💰

### Free Tier:
- Claude: $5 free credits to start
- Google Places: $200/month free credits
- You can generate 50-100+ plans before paying anything!

---

## Security Notes

✅ **Netlify deployment**:
- API keys stored securely in Netlify (not in code)
- Keys never exposed to browsers
- Safe to make repo public

✅ **Local network**:
- Only accessible on your home WiFi
- API keys in browser localStorage
- Not exposed to internet

❌ **Don't do this**:
- Never commit API keys to GitHub
- Never share your Netlify environment variables
- Don't deploy with `api.js` in a public site (use `api-backend.js`)

---

## Troubleshooting

**"Can't access from phone"**
- Make sure phone is on same WiFi
- Check firewall isn't blocking port 8000
- Try `python -m http.server 8000 --bind 0.0.0.0`

**"Netlify function errors"**
- Check environment variables are set correctly
- Make sure you switched to `api-backend.js`
- Check Netlify function logs

**"Plans cost too much"**
- You can set budget limits in Anthropic/Google Cloud consoles
- Monitor usage in their dashboards

---

## Recommended: Netlify Deployment

For the best family experience:
1. ✅ Works from anywhere (not just home)
2. ✅ Works on all devices
3. ✅ No computer needs to stay running
4. ✅ Easy to share (just send the URL)
5. ✅ Free hosting
6. ✅ Secure (keys hidden in backend)

**This is what I recommend for families!** 🎉
