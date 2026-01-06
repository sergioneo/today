// API Configuration
const API_CONFIG = {
    claude: {
        apiKey: localStorage.getItem('claudeApiKey') || '',
        endpoint: 'https://api.anthropic.com/v1/messages',
        model: 'claude-sonnet-4-20250514'
    },
    googlePlaces: {
        apiKey: localStorage.getItem('googlePlacesApiKey') || '',
        endpoint: 'https://maps.googleapis.com/maps/api/place'
    }
};

// API Manager
class APIManager {
    // Configure API keys
    static setApiKeys(claudeKey, googlePlacesKey) {
        API_CONFIG.claude.apiKey = claudeKey;
        API_CONFIG.googlePlaces.apiKey = googlePlacesKey;
        localStorage.setItem('claudeApiKey', claudeKey);
        localStorage.setItem('googlePlacesApiKey', googlePlacesKey);
    }

    // Check if APIs are configured
    static areApisConfigured() {
        return API_CONFIG.claude.apiKey && API_CONFIG.googlePlaces.apiKey;
    }

    // Generate plan using Claude API
    static async generatePlan(profile) {
        if (!API_CONFIG.claude.apiKey) {
            throw new Error('Claude API key not configured');
        }

        const familyInfo = profile.familyMembers.map(m =>
            `${m.name} (age ${m.age}, interests: ${m.interests})`
        ).join(', ');

        const drivingText = profile.drivingDistance ? `within ${profile.drivingDistance} miles` : 'nearby';

        const prompt = `You are a personalized activity planner. Generate a fun, practical plan for today based on this profile:

**User:** ${profile.name}
**Interests:** ${profile.interests}
**Location:** ${profile.location}
**Budget:** ${profile.budget}
**Driving Distance:** ${drivingText}
**Family Members:** ${familyInfo}
**Special Considerations:** ${profile.specialNeeds || 'None'}
**Date:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

IMPORTANT: All activities must be ${drivingText} of ${profile.location}. Do not suggest anything farther away.

CRITICAL - GEOGRAPHIC COHERENCE: All suggested activities must be in the SAME GENERAL AREA or along a logical route. DO NOT suggest activities that require backtracking or driving in opposite directions. For example, if suggesting 2 stops, they should be:
- In the same neighborhood/district, OR
- Along a natural route (e.g., both north, both along the coast, both in downtown)
- Total driving between ALL stops should be reasonable (under 30 minutes total if possible)
- NEVER suggest going 20 miles south then 20 miles north - keep it geographically sensible

${preferencesText ? '\nIMPORTANT: Pay close attention to past preferences. Suggest MORE activities similar to what they loved and liked. AVOID activities similar to what they disliked.' : ''}

Generate a plan with 1-2 stops for today. For each activity, provide:

1. **Type** (restaurant, activity, event, or attraction)
2. **Name** of the place/activity
3. **Description** (2-3 sentences about what makes it special)
4. **Why it fits** their interests and family
5. **Duration** (estimated time to spend)
6. **Price Range** ($, $$, $$$, or $$$$)
7. **Best for** (which family members will love it most)
8. **Search Query** (specific search term to find this place on Google Places, e.g., "Central Park New York" or "Blue Hill Restaurant NYC")

For restaurants, also include:
9. **Dish Recommendation** (a specific menu item they should try)

Format your response as a JSON array with this structure:
[
  {
    "type": "restaurant|activity|event|attraction",
    "name": "Name of Place",
    "description": "Why this is great...",
    "whyItFits": "Perfect for your family because...",
    "duration": "2 hours",
    "priceRange": "$$",
    "bestFor": "Adults and teens",
    "searchQuery": "Exact place name and location",
    "dishRecommendation": "Try the signature dish (only for restaurants)"
  }
]

Consider:
- Time of day and weather
- Mix of activities (don't suggest only restaurants or only activities)
- Age-appropriate options
- Budget constraints
- Local events happening today
- Variety of experiences

Return ONLY the JSON array, no other text.`;

        try {
            const response = await fetch(API_CONFIG.claude.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_CONFIG.claude.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: API_CONFIG.claude.model,
                    max_tokens: 2048,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Failed to generate plan');
            }

            const data = await response.json();
            const content = data.content[0].text;

            // Extract JSON from response
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('Invalid response format from Claude API');
            }

            const activities = JSON.parse(jsonMatch[0]);
            return activities;

        } catch (error) {
            console.error('Claude API Error:', error);
            throw error;
        }
    }

    // Get place details from Google Places API
    static async getPlaceDetails(searchQuery) {
        if (!API_CONFIG.googlePlaces.apiKey) {
            console.warn('Google Places API key not configured, using fallback');
            return null;
        }

        try {
            // First, search for the place
            const searchUrl = `${API_CONFIG.googlePlaces.endpoint}/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${API_CONFIG.googlePlaces.apiKey}`;

            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            if (searchData.status !== 'OK' || !searchData.results.length) {
                console.warn('Place not found:', searchQuery);
                return null;
            }

            const place = searchData.results[0];

            // Get photo URL if available
            let photoUrl = null;
            if (place.photos && place.photos.length > 0) {
                const photoReference = place.photos[0].photo_reference;
                photoUrl = `${API_CONFIG.googlePlaces.endpoint}/photo?maxwidth=800&photoreference=${photoReference}&key=${API_CONFIG.googlePlaces.apiKey}`;
            }

            // Get detailed info
            const detailsUrl = `${API_CONFIG.googlePlaces.endpoint}/details/json?place_id=${place.place_id}&fields=name,rating,formatted_address,formatted_phone_number,website,url,opening_hours,price_level&key=${API_CONFIG.googlePlaces.apiKey}`;

            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();

            const details = detailsData.result || {};

            return {
                placeId: place.place_id,
                name: details.name || place.name,
                rating: details.rating,
                address: details.formatted_address,
                phone: details.formatted_phone_number,
                website: details.website,
                mapsUrl: details.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`,
                photoUrl: photoUrl,
                isOpen: details.opening_hours?.open_now,
                priceLevel: details.price_level
            };

        } catch (error) {
            console.error('Google Places API Error:', error);
            return null;
        }
    }

    // Generate fallback photo URL using Unsplash
    static getFallbackPhoto(type) {
        // Use different seed numbers for different types to get varied images
        const seeds = {
            restaurant: 1,
            activity: 2,
            event: 3,
            attraction: 4
        };
        const seed = seeds[type] || Math.floor(Math.random() * 100);
        return `https://picsum.photos/seed/${seed}/800/600`;
    }

    // Get ticket search URL
    static getTicketUrl(activityName, location) {
        const query = encodeURIComponent(`${activityName} ${location} tickets`);
        return `https://www.google.com/search?q=${query}`;
    }
}

// Export for use in app.js
window.APIManager = APIManager;
