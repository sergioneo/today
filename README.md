# Today - Family Activity Planner PWA

Never wonder what to do today - get personalized activity plans for your family in seconds.

## Features

- **Personalized Profiles**: Store your family's interests, ages, and preferences
- **AI-Powered Plans**: Uses Claude AI to generate custom activity recommendations
- **Real Place Data**: Integrates with Google Places for photos, ratings, and locations
- **Smart Recommendations**: Get restaurant dish suggestions, ticket links, and more
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Progressive Web App**: Install on any device, works offline
- **Privacy-First**: All data stored locally on your device

## Screenshots

The app features:
- Clean, modern dark theme with gradient accents
- Profile setup for you and family members
- One-click plan generation
- Beautiful activity cards with photos and details
- Direct links to maps and ticket purchasing

## Setup Instructions

### 1. Get Your API Keys

#### Claude API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

#### Google Places API Key
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Places API
   - Maps JavaScript API
4. Go to Credentials and create an API key
5. Copy the key

### 2. Run the App

You have several options:

#### Option A: Simple HTTP Server (Python)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open `http://localhost:8000` in your browser.

#### Option B: Node.js HTTP Server
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000
```

#### Option C: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

### 3. Configure API Keys

1. Open the app in your browser
2. Click the settings icon (⚙️) in the top right
3. Enter your Claude API key
4. Enter your Google Places API key
5. Click OK to save

The keys are stored locally in your browser and never sent anywhere except to the respective APIs.

### 4. Create Your Profile

1. Click "Create Your Profile"
2. Fill in your information:
   - Your name and interests
   - Location (city or ZIP code)
   - Budget preference
   - Add family members with their ages and interests
   - Any special considerations (dietary restrictions, accessibility needs, etc.)
3. Click "Save Profile"

### 5. Generate Your Plan

1. Click "Generate Today's Plan"
2. Wait a few seconds while the AI crafts your personalized plan
3. Browse your activities with photos and details
4. Click "View Location" to see on maps
5. Click "Get Tickets" for events and attractions

## How It Works

1. **Profile Storage**: Your profile is stored locally using browser localStorage
2. **AI Generation**: When you request a plan, the app sends your profile to Claude AI
3. **Smart Matching**: Claude considers your location, interests, budget, family composition, and the current date/time
4. **Place Enrichment**: For each suggested activity, the app queries Google Places API for photos, ratings, and exact locations
5. **Beautiful Display**: Activities are presented in cards with all the information you need

## Features in Detail

### Activity Types
- **Restaurants**: Get specific dish recommendations based on the menu
- **Activities**: Outdoor adventures, sports, workshops, etc.
- **Events**: Concerts, shows, festivals happening today
- **Attractions**: Museums, parks, landmarks, etc.

### Smart Recommendations
The AI considers:
- Current date and time
- Weather and season
- Age-appropriate options for your family
- Budget constraints
- Mix of activity types
- Local events and seasonal activities
- Travel time and logistics

### Privacy & Security
- All personal data stored locally in your browser
- API keys stored in localStorage
- No data sent to third-party servers except:
  - Claude API (for plan generation)
  - Google Places API (for location data)
- You can clear your data anytime by clearing browser storage

## Customization

### Changing the Look
Edit `/css/styles.css` to customize:
- Color scheme (CSS variables at the top)
- Fonts
- Spacing and sizing
- Animations

### Modifying the AI Prompt
Edit `/js/api.js` and modify the `generatePlan` method to change how Claude generates plans.

### Adding New Features
The codebase is modular:
- `/js/app.js` - UI and app logic
- `/js/api.js` - API integrations
- `/index.html` - Structure
- `/css/styles.css` - Styling

## Progressive Web App

### Installing on Mobile
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" prompt
3. Or use browser menu → "Install App"
4. App will appear on your home screen

### Installing on Desktop
1. Look for install icon in browser address bar
2. Click to install
3. App will open in its own window

### Offline Support
The service worker caches the app shell, so basic functionality works offline. However, generating new plans requires internet connection for API calls.

## Troubleshooting

### "Failed to generate plan"
- Check your Claude API key is correct
- Ensure you have API credits in your Anthropic account
- Check browser console for detailed error messages

### Photos not loading
- Check your Google Places API key
- Ensure Places API is enabled in Google Cloud Console
- Some places may not have photos - fallback images will be used

### App not installing
- Ensure you're using HTTPS (or localhost)
- Try a different browser (Chrome, Edge, Safari recommended)
- Clear browser cache and reload

### Location not found
- Be more specific with location (include city and state/country)
- Try using a ZIP code instead
- Use common place names

## API Costs

### Claude API
- Pay-per-use pricing
- Each plan generation uses ~2000 tokens
- Approximately $0.01-0.02 per plan
- Check [Anthropic Pricing](https://www.anthropic.com/pricing)

### Google Places API
- Free tier: $200 credit per month
- Text Search: $0.032 per request
- Place Details: $0.017 per request
- Photos: Free
- Typical plan uses 2-4 requests (~$0.10)
- Check [Google Places Pricing](https://developers.google.com/maps/billing/gmp-billing)

## Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile browsers (iOS Safari, Chrome Android)

## Technologies Used

- Vanilla JavaScript (no frameworks)
- CSS3 with custom properties
- Claude API (Anthropic)
- Google Places API
- Service Workers
- LocalStorage
- Fetch API

## Future Enhancements

Potential features to add:
- Weather integration
- Save favorite plans
- Share plans with family
- Calendar integration
- Push notifications for events
- Multi-day trip planning
- Budget tracking
- Photo uploads from visits
- Plan history and ratings

## License

MIT License - feel free to modify and use as you wish!

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation:
   - [Claude API Docs](https://docs.anthropic.com/)
   - [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service)
3. Check browser console for error messages

## Credits

Built with:
- [Claude AI](https://www.anthropic.com/) for intelligent plan generation
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service) for location data
- [Unsplash](https://unsplash.com/) for fallback images
- [Inter Font](https://fonts.google.com/specimen/Inter) by Rasmus Andersson

---

**Made with ❤️ for families who want to make the most of their time together**
