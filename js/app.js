// App State
const AppState = {
    profile: null,
    currentPlan: null,
    currentScreen: 'welcome'
};

// Storage Manager
class StorageManager {
    static PROFILE_KEY = 'today_profile';
    static API_KEYS = 'today_api_keys';

    static saveProfile(profile) {
        localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
        AppState.profile = profile;
    }

    static loadProfile() {
        const data = localStorage.getItem(this.PROFILE_KEY);
        if (data) {
            AppState.profile = JSON.parse(data);
            return AppState.profile;
        }
        return null;
    }

    static clearProfile() {
        localStorage.removeItem(this.PROFILE_KEY);
        AppState.profile = null;
    }

    static getApiKeys() {
        const data = localStorage.getItem(this.API_KEYS);
        return data ? JSON.parse(data) : { claude: '', googlePlaces: '' };
    }

    static saveApiKeys(keys) {
        localStorage.setItem(this.API_KEYS, JSON.stringify(keys));
    }
}

// Screen Manager
class ScreenManager {
    static show(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            AppState.currentScreen = screenId;
        }
    }
}

// UI Manager
class UIManager {
    static showWelcome() {
        ScreenManager.show('welcomeScreen');
    }

    static showProfile(editing = false) {
        ScreenManager.show('profileScreen');
        if (editing && AppState.profile) {
            this.populateProfileForm(AppState.profile);
        }
    }

    static showHome() {
        ScreenManager.show('homeScreen');
        this.updateHomeScreen();
    }

    static showPlan(plan) {
        ScreenManager.show('planScreen');
        this.displayPlan(plan);
    }

    static updateHomeScreen() {
        const profile = AppState.profile;
        if (!profile) return;

        // Update greeting
        const hour = new Date().getHours();
        let greeting = 'Good evening';
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 18) greeting = 'Good afternoon';

        document.getElementById('greeting').textContent = `${greeting}, ${profile.name}!`;

        // Update stats
        const familyCount = 1 + (profile.familyMembers?.length || 0);
        document.getElementById('familyCount').textContent = familyCount;
        document.getElementById('locationDisplay').textContent = profile.location;

        const budgetLabels = {
            low: '$',
            medium: '$$',
            high: '$$$',
            luxury: '$$$$'
        };
        document.getElementById('budgetDisplay').textContent = budgetLabels[profile.budget] || '$$';
    }

    static populateProfileForm(profile) {
        document.getElementById('userName').value = profile.name || '';
        document.getElementById('userInterests').value = profile.interests || '';
        document.getElementById('location').value = profile.location || '';
        document.getElementById('budget').value = profile.budget || 'medium';
        document.getElementById('drivingDistance').value = profile.drivingDistance || '15';
        document.getElementById('specialNeeds').value = profile.specialNeeds || '';

        // Clear existing family members
        const familyContainer = document.getElementById('familyMembers');
        familyContainer.innerHTML = '';

        // Add family members
        if (profile.familyMembers && profile.familyMembers.length > 0) {
            profile.familyMembers.forEach(member => {
                this.addFamilyMemberToForm(member);
            });
        }
    }

    static addFamilyMemberToForm(member = null) {
        const template = document.getElementById('familyMemberTemplate');
        const clone = template.content.cloneNode(true);
        const container = document.getElementById('familyMembers');

        if (member) {
            clone.querySelector('.member-name').value = member.name;
            clone.querySelector('.member-age').value = member.age;
            clone.querySelector('.member-interests').value = member.interests;
        }

        // Add remove functionality
        const removeBtn = clone.querySelector('.remove-member-btn');
        removeBtn.addEventListener('click', (e) => {
            e.target.closest('.family-member-card').remove();
        });

        container.appendChild(clone);
    }

    static async displayPlan(activities) {
        const container = document.getElementById('planActivities');
        container.innerHTML = '';

        document.getElementById('planTitle').textContent = 'Your Plan for Today';
        document.getElementById('planSummary').textContent =
            `We've crafted ${activities.length} special ${activities.length === 1 ? 'stop' : 'stops'} for your day`;

        for (const activity of activities) {
            await this.createActivityCard(activity, container);
        }
    }

    static async createActivityCard(activity, container) {
        const template = document.getElementById('activityCardTemplate');
        const clone = template.content.cloneNode(true);

        // Get place details from Google Places
        let placeDetails = null;
        if (activity.searchQuery) {
            try {
                placeDetails = await APIManager.getPlaceDetails(activity.searchQuery);
            } catch (error) {
                console.error('Failed to get place details:', error);
            }
        }

        // Set photo
        const photo = clone.querySelector('.activity-photo');
        if (placeDetails?.photoUrl) {
            photo.src = placeDetails.photoUrl;
        } else {
            photo.src = APIManager.getFallbackPhoto(activity.type);
        }
        photo.alt = activity.name;

        // Set badge
        const badge = clone.querySelector('.activity-badge');
        const badgeLabels = {
            restaurant: '🍽️ Restaurant',
            activity: '🎯 Activity',
            event: '🎉 Event',
            attraction: '🏛️ Attraction'
        };
        badge.textContent = badgeLabels[activity.type] || '✨ Experience';

        // Set title and rating
        clone.querySelector('.activity-title').textContent = placeDetails?.name || activity.name;

        const ratingContainer = clone.querySelector('.activity-rating');
        if (placeDetails?.rating) {
            clone.querySelector('.rating-value').textContent = placeDetails.rating;
        } else {
            ratingContainer.style.display = 'none';
        }

        // Set description
        const description = clone.querySelector('.activity-description');
        description.textContent = `${activity.description} ${activity.whyItFits}`;

        // Set details
        const detailItems = clone.querySelectorAll('.detail-item .detail-text');
        detailItems[0].textContent = activity.priceRange;
        detailItems[1].textContent = activity.duration;

        // Set recommendation for restaurants
        if (activity.type === 'restaurant' && activity.dishRecommendation) {
            const recommendation = clone.querySelector('.activity-recommendation');
            recommendation.classList.remove('hidden');
            recommendation.querySelector('.recommendation-text').textContent = activity.dishRecommendation;
        }

        // Set up buttons
        const viewLocationBtn = clone.querySelector('.view-location-btn');
        const mapsUrl = placeDetails?.mapsUrl ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.searchQuery || activity.name)}`;
        viewLocationBtn.addEventListener('click', () => {
            window.open(mapsUrl, '_blank');
        });

        // Ticket button (show for events and attractions)
        const ticketsBtn = clone.querySelector('.get-tickets-btn');
        if (activity.type === 'event' || activity.type === 'attraction') {
            ticketsBtn.classList.remove('hidden');
            const ticketUrl = placeDetails?.website ||
                APIManager.getTicketUrl(activity.name, AppState.profile.location);
            ticketsBtn.addEventListener('click', () => {
                window.open(ticketUrl, '_blank');
            });
        }

        container.appendChild(clone);
    }

    static showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const generateBtn = document.getElementById('generatePlanBtn');

        if (show) {
            loadingState.classList.remove('hidden');
            generateBtn.classList.add('hidden');
        } else {
            loadingState.classList.add('hidden');
            generateBtn.classList.remove('hidden');
        }
    }

    static showError(message) {
        alert(message); // Simple for now, could be improved with a toast notification
    }
}

// Event Handlers
class EventHandlers {
    static init() {
        // Welcome screen
        document.getElementById('createProfileBtn')?.addEventListener('click', () => {
            UIManager.showProfile();
        });

        // Settings button
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.showSettings();
        });

        // Profile form
        document.getElementById('addFamilyMemberBtn')?.addEventListener('click', () => {
            UIManager.addFamilyMemberToForm();
        });

        document.getElementById('profileForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProfileSubmit();
        });

        document.getElementById('cancelProfileBtn')?.addEventListener('click', () => {
            if (AppState.profile) {
                UIManager.showHome();
            } else {
                UIManager.showWelcome();
            }
        });

        // Generate plan
        document.getElementById('generatePlanBtn')?.addEventListener('click', () => {
            this.handleGeneratePlan();
        });

        // Plan screen
        document.getElementById('backToHomeBtn')?.addEventListener('click', () => {
            UIManager.showHome();
        });

        document.getElementById('regeneratePlanBtn')?.addEventListener('click', () => {
            this.handleGeneratePlan();
        });
    }

    static handleProfileSubmit() {
        const profile = {
            name: document.getElementById('userName').value.trim(),
            interests: document.getElementById('userInterests').value.trim(),
            location: document.getElementById('location').value.trim(),
            budget: document.getElementById('budget').value,
            drivingDistance: document.getElementById('drivingDistance').value,
            specialNeeds: document.getElementById('specialNeeds').value.trim(),
            familyMembers: []
        };

        // Collect family members
        const memberCards = document.querySelectorAll('.family-member-card');
        memberCards.forEach(card => {
            const name = card.querySelector('.member-name').value.trim();
            if (name) {
                profile.familyMembers.push({
                    name: name,
                    age: parseInt(card.querySelector('.member-age').value) || 0,
                    interests: card.querySelector('.member-interests').value.trim()
                });
            }
        });

        StorageManager.saveProfile(profile);
        UIManager.showHome();
    }

    static async handleGeneratePlan() {
        if (!APIManager.areApisConfigured()) {
            this.showSettings();
            return;
        }

        UIManager.showLoading(true);

        try {
            const activities = await APIManager.generatePlan(AppState.profile);
            AppState.currentPlan = activities;
            UIManager.showLoading(false);
            UIManager.showPlan(activities);
        } catch (error) {
            UIManager.showLoading(false);
            UIManager.showError(`Failed to generate plan: ${error.message}`);
        }
    }

    static showSettings() {
        const keys = StorageManager.getApiKeys();
        const claudeKey = prompt(
            'Enter your Claude API key:\n\n' +
            'Get your API key from: https://console.anthropic.com/',
            keys.claude
        );

        if (claudeKey === null) return; // User cancelled

        const googleKey = prompt(
            'Enter your Google Places API key:\n\n' +
            'Get your API key from: https://console.cloud.google.com/',
            keys.googlePlaces
        );

        if (googleKey === null) return; // User cancelled

        if (claudeKey && googleKey) {
            StorageManager.saveApiKeys({ claude: claudeKey, googlePlaces: googleKey });
            APIManager.setApiKeys(claudeKey, googleKey);
            alert('API keys saved successfully!');

            // If on home screen and keys were just configured, show home again
            if (AppState.currentScreen === 'homeScreen') {
                UIManager.showHome();
            }
        } else {
            alert('Both API keys are required to use the app.');
        }
    }
}

// PWA Installation
class PWAManager {
    static deferredPrompt = null;

    static init() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker registered', reg))
                .catch(err => console.error('Service Worker registration failed', err));
        }

        // Handle install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // Install button
        document.getElementById('installBtn')?.addEventListener('click', () => {
            this.installApp();
        });

        document.getElementById('dismissInstallBtn')?.addEventListener('click', () => {
            this.hideInstallPrompt();
        });
    }

    static showInstallPrompt() {
        const prompt = document.getElementById('installPrompt');
        if (prompt) {
            prompt.classList.remove('hidden');
        }
    }

    static hideInstallPrompt() {
        const prompt = document.getElementById('installPrompt');
        if (prompt) {
            prompt.classList.add('hidden');
        }
    }

    static async installApp() {
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('App installed');
        }

        this.deferredPrompt = null;
        this.hideInstallPrompt();
    }
}

// App Initialization
function initApp() {
    // Load saved API keys
    const keys = StorageManager.getApiKeys();
    if (keys.claude && keys.googlePlaces) {
        APIManager.setApiKeys(keys.claude, keys.googlePlaces);
    }

    // Load profile and show appropriate screen
    const profile = StorageManager.loadProfile();

    if (profile) {
        UIManager.showHome();
    } else {
        UIManager.showWelcome();
    }

    // Initialize event handlers
    EventHandlers.init();

    // Initialize PWA
    PWAManager.init();
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
