import apiClient from './api.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        const token = localStorage.getItem('authToken');
        if (token) {
            apiClient.setToken(token);
            this.isAuthenticated = true;
            this.loadUserProfile();
        }
        this.updateAuthUI();
    }

    async login(email, password) {
        try {
            const response = await apiClient.login(email, password);
            apiClient.setToken(response.token);
            this.currentUser = response.user;
            this.isAuthenticated = true;
            
            // Update UI
            this.updateAuthUI();
            
            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    async register(username, email, password) {
        try {
            const response = await apiClient.register(username, email, password);
            apiClient.setToken(response.token);
            this.currentUser = response.user;
            this.isAuthenticated = true;
            
            // Update UI
            this.updateAuthUI();
            
            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    async loadUserProfile() {
        try {
            if (!this.isAuthenticated) return;
            
            const user = await apiClient.getProfile();
            this.currentUser = user;
            return user;
        } catch (error) {
            console.error('Failed to load user profile:', error);
            this.logout();
        }
    }

    logout() {
        apiClient.setToken(null);
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('authToken');
        
        // Update UI
        this.updateAuthUI();
        
        // Redirect to dashboard
        if (window.app) {
            window.app.loadPage('dashboard');
        }
    }

    updateAuthUI() {
        const authLink = document.getElementById('auth-link');
        if (!authLink) return;

        if (this.isAuthenticated) {
            authLink.textContent = 'Logout';
            authLink.dataset.page = 'logout';
            
            // Add user menu or other authenticated UI elements
            this.addUserMenu();
        } else {
            authLink.textContent = 'Login';
            authLink.dataset.page = 'login';
            
            // Remove user menu if it exists
            this.removeUserMenu();
        }
    }

    addUserMenu() {
        // Check if user menu already exists
        if (document.getElementById('user-menu')) return;

        const nav = document.querySelector('nav ul');
        if (!nav) return;

        const userMenu = document.createElement('li');
        userMenu.id = 'user-menu';
        userMenu.innerHTML = `
            <div class="user-menu">
                <span>Welcome, ${this.currentUser?.username || 'User'}</span>
                <div class="user-dropdown">
                    <a href="#" data-page="profile">Profile</a>
                    <a href="#" data-page="my-analyses">My Analyses</a>
                    <a href="#" id="logout-btn">Logout</a>
                </div>
            </div>
        `;
        
        // Insert before the auth link
        const authListItem = authLink.parentElement;
        nav.insertBefore(userMenu, authListItem);

        // Add logout handler
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    removeUserMenu() {
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            userMenu.remove();
        }
    }
}

// Create and export a singleton instance
const authManager = new AuthManager();
export default authManager;