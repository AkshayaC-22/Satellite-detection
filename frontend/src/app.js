import apiClient from './api.js';
import authManager from './auth.js';

class SatelliteApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        // Load the initial page
        this.loadPage(this.currentPage);

        // Set up navigation
        this.setupNavigation();

        // Set up event listeners for forms
        this.setupEventListeners();

        // Initialize real-time updates
        this.initRealTimeUpdates();
    }

    setupNavigation() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.loadPage(page);
            }

            if (e.target.matches('#register-link')) {
                e.preventDefault();
                this.loadPage('register');
            }

            if (e.target.matches('#login-link')) {
                e.preventDefault();
                this.loadPage('login');
            }
        });
    }

    setupEventListeners() {
        // Login form
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#login-form')) {
                e.preventDefault();
                this.handleLogin(e.target);
            }

            if (e.target.matches('#register-form')) {
                e.preventDefault();
                this.handleRegister(e.target);
            }

            if (e.target.matches('#upload-form')) {
                e.preventDefault();
                this.handleImageUpload(e.target);
            }
        });

        // Analyze button
        document.addEventListener('click', (e) => {
            if (e.target.matches('#analyze-btn')) {
                e.preventDefault();
                if (authManager.isAuthenticated) {
                    this.loadPage('upload');
                } else {
                    this.loadPage('login');
                }
            }
        });
    }

    async loadPage(page) {
        this.currentPage = page;

        // Handle logout
        if (page === 'logout') {
            authManager.logout();
            return;
        }

        // Check authentication for protected pages
        if (['upload', 'profile', 'my-analyses'].includes(page) && !authManager.isAuthenticated) {
            page = 'login';
            this.currentPage = page;
        }

        // Get the template
        const template = document.getElementById(`${page}-template`);
        if (!template) {
            console.error(`Template not found for page: ${page}`);
            return;
        }

        // Update main content
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = template.innerHTML;

        // Update active navigation
        this.updateActiveNav(page);

        // Initialize page-specific functionality
        this.initPage(page);
    }

    updateActiveNav(page) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.dataset.page === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    initPage(page) {
        switch (page) {
            case 'dashboard':
                this.initDashboard();
                break;
            case 'analytics':
                this.initAnalytics();
                break;
            case 'upload':
                this.initUpload();
                break;
            case 'login':
            case 'register':
                // Forms are already set up via event delegation
                break;
        }
    }

    async initDashboard() {
        try {
            // Load recent analyses
            const response = await apiClient.getAnalyses(1, 5);
            this.displayRecentAnalyses(response.analyses);

            // Update stats
            this.updateStats();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    displayRecentAnalyses(analyses) {
        const timelineTrack = document.querySelector('.timeline-track');
        if (!timelineTrack || !analyses) return;

        timelineTrack.innerHTML = '';

        analyses.forEach(analysis => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="date">${new Date(analysis.createdAt).toLocaleDateString()}</div>
                <p>${analysis.title}</p>
            `;
            timelineTrack.appendChild(item);
        });
    }

    updateStats() {
        // Simulate live data updates
        setInterval(() => {
            const changesCount = document.getElementById('changes-count');
            if (changesCount) {
                let currentCount = parseInt(changesCount.textContent.replace(/,/g, ''));
                changesCount.textContent = (currentCount + Math.floor(Math.random() * 5)).toLocaleString();
            }
        }, 5000);
    }

    initAnalytics() {
        // TODO: Implement analytics page initialization
        console.log('Initializing analytics page');
    }

    initUpload() {
        // TODO: Implement upload page initialization
        console.log('Initializing upload page');
    }

    async handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            await authManager.login(email, password);
            this.loadPage('dashboard');
            this.showNotification('Login successful!', 'success');
        } catch (error) {
            this.showNotification(error.message || 'Login failed', 'error');
        }
    }

    async handleRegister(form) {
        const formData = new FormData(form);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        try {
            await authManager.register(username, email, password);
            this.loadPage('dashboard');
            this.showNotification('Registration successful!', 'success');
        } catch (error) {
            this.showNotification(error.message || 'Registration failed', 'error');
        }
    }

    async handleImageUpload(form) {
        const formData = new FormData(form);
        
        try {
            const response = await apiClient.uploadImage(formData);
            this.showNotification('Image uploaded successfully!', 'success');
            form.reset();
        } catch (error) {
            this.showNotification(error.message || 'Upload failed', 'error');
        }
    }

    initRealTimeUpdates() {
        // Connect to Socket.io for real-time updates
        const socket = io('http://localhost:5000');
        
        socket.on('new-analysis', (analysis) => {
            this.showNotification(`New analysis created: ${analysis.title}`, 'info');
            
            // If we're on the dashboard, refresh the recent analyses
            if (this.currentPage === 'dashboard') {
                this.initDashboard();
            }
        });
        
        socket.on('connect', () => {
            console.log('Connected to server for real-time updates');
        });
        
        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add styles if not already added
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 5px;
                    color: white;
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                }
                .notification.success { background: #4CAF50; }
                .notification.error { background: #F44336; }
                .notification.info { background: #2196F3; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SatelliteApp();
    window.loadPage = (page) => window.app.loadPage(page);
});