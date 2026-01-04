// Netlify serverless function to keep API keys secure
// This runs on Netlify's servers, not in the browser

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get API key from environment variable (set in Netlify dashboard)
  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

  if (!CLAUDE_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  try {
    const profile = JSON.parse(event.body);

    // Build the prompt for Claude
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

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error Response:', errorText);
      let errorMessage = 'Failed to generate plan';
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.error?.message || error.message || errorText;
      } catch (e) {
        errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Claude API');
    }

    const activities = JSON.parse(jsonMatch[0]);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(activities)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Failed to generate plan'
      })
    };
  }
};
