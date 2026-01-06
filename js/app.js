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

// Rating Manager
class RatingManager {
    static RATINGS_KEY = 'today_ratings';

    static saveRating(type, name, rating) {
        const ratings = this.getAllRatings();

        if (!ratings[type]) {
            ratings[type] = {};
        }

        ratings[type][name] = {
            rating: rating,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem(this.RATINGS_KEY, JSON.stringify(ratings));
    }

    static getAllRatings() {
        const data = localStorage.getItem(this.RATINGS_KEY);
        return data ? JSON.parse(data) : { plans: {}, activities: {} };
    }

    static getPreferencesSummary() {
        const ratings = this.getAllRatings();
        const summary = {
            likedActivities: [],
            lovedActivities: [],
            dislikedActivities: [],
            likedPlans: 0,
            dislikedPlans: 0
        };

        // Analyze activity ratings
        if (ratings.activities) {
            Object.entries(ratings.activities).forEach(([name, data]) => {
                if (data.rating === 'love') {
                    summary.lovedActivities.push(name);
                } else if (data.rating === 'like') {
                    summary.likedActivities.push(name);
                } else if (data.rating === 'dislike') {
                    summary.dislikedActivities.push(name);
                }
            });
        }

        // Count plan ratings
        if (ratings.plans) {
            Object.values(ratings.plans).forEach(data => {
                if (data.rating === 'like') summary.likedPlans++;
                else if (data.rating === 'dislike') summary.dislikedPlans++;
            });
        }

        return summary;
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

        // Update driving distance
        const drivingDistance = profile.drivingDistance || '15';
        const drivingLabels = {
            '5': '5 mi',
            '15': '15 mi',
            '30': '30 mi',
            '60': '60 mi',
            '100': '100+ mi'
        };
        document.getElementById('drivingDisplay').textContent = drivingLabels[drivingDistance] || '15 mi';
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

        // Setup plan rating listeners
        this.setupPlanRatingListeners();

        for (const activity of activities) {
            await this.createActivityCard(activity, container);
        }
    }

    static setupPlanRatingListeners() {
        const planRatingButtons = document.querySelectorAll('.plan-rating .rating-btn');
        planRatingButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const rating = btn.dataset.rating;
                const planId = new Date().toISOString().split('T')[0]; // Use date as plan ID

                // Update UI
                planRatingButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Save rating
                RatingManager.saveRating('plans', planId, rating);
            });
        });
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

        // Always set a fallback first
        photo.src = APIManager.getFallbackPhoto(activity.type);

        // Try to load Google Places photo if available
        if (placeDetails?.photoUrl) {
            const img = new Image();
            img.onload = () => {
                photo.src = placeDetails.photoUrl;
            };
            img.onerror = () => {
                console.log('Google photo failed to load, using fallback');
                // Fallback already set above
            };
            img.src = placeDetails.photoUrl;
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

        // Activity rating listeners
        const activityRatingButtons = clone.querySelectorAll('.activity-user-rating .rating-btn');
        activityRatingButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const rating = btn.dataset.rating;

                // Update UI
                activityRatingButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Save rating
                RatingManager.saveRating('activities', activity.name, rating);
            });
        });

        container.appendChild(clone);
    }

    static showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const generateBtn = document.getElementById('generatePlanBtn');

        if (show) {
            loadingState.classList.remove('hidden');
            generateBtn.classList.add('hidden');

            // Reset all steps
            const steps = loadingState.querySelectorAll('.loading-step');
            steps.forEach(step => {
                step.classList.remove('active', 'completed');
            });

            // Animate through steps
            let currentStep = 0;
            const animateStep = () => {
                if (currentStep > 0) {
                    steps[currentStep - 1].classList.remove('active');
                    steps[currentStep - 1].classList.add('completed');
                }

                if (currentStep < steps.length) {
                    steps[currentStep].classList.add('active');
                    currentStep++;
                    setTimeout(animateStep, 600);
                }
            };

            animateStep();
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

        // Edit profile button
        document.getElementById('editProfileBtn')?.addEventListener('click', () => {
            UIManager.showProfile(true);
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
        UIManager.showLoading(true);

        try {
            // Include preferences in profile
            const profileWithPreferences = {
                ...AppState.profile,
                preferences: RatingManager.getPreferencesSummary()
            };

            const activities = await APIManager.generatePlan(profileWithPreferences);
            AppState.currentPlan = activities;
            UIManager.showLoading(false);
            UIManager.showPlan(activities);
        } catch (error) {
            UIManager.showLoading(false);
            UIManager.showError(`Failed to generate plan: ${error.message}`);
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
