// API Manager for backend deployment (Netlify/Vercel)
// Use this version when deploying with serverless functions

class APIManager {
    // No need to configure API keys - they're in the backend!
    static setApiKeys() {
        console.log('API keys managed by backend');
    }

    static areApisConfigured() {
        return true; // Always true when using backend
    }

    // Generate plan using backend function
    static async generatePlan(profile) {
        try {
            const response = await fetch('/.netlify/functions/generate-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profile)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate plan');
            }

            const activities = await response.json();
            return activities;

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Get place details using backend function
    static async getPlaceDetails(searchQuery) {
        try {
            const response = await fetch('/.netlify/functions/get-place-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ searchQuery })
            });

            if (!response.ok) {
                return null;
            }

            return await response.json();

        } catch (error) {
            console.error('Places API Error:', error);
            return null;
        }
    }

    // Generate fallback photo using picsum.photos (reliable, no CORS issues)
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
