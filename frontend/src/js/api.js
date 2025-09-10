const API_BASE_URL = 'http://localhost:5000/api';

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(username, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    // Image endpoints
    async uploadImage(formData) {
        const url = `${API_BASE_URL}/images/upload`;
        const headers = {};

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error('Image upload failed:', error);
            throw error;
        }
    }

    async getImages(page = 1, limit = 10) {
        return this.request(`/images?page=${page}&limit=${limit}`);
    }

    async getImageById(id) {
        return this.request(`/images/${id}`);
    }

    // Analysis endpoints
    async createAnalysis(title, description, beforeImageId, afterImageId) {
        return this.request('/analysis', {
            method: 'POST',
            body: JSON.stringify({ title, description, beforeImageId, afterImageId }),
        });
    }

    async getAnalyses(page = 1, limit = 10) {
        return this.request(`/analysis?page=${page}&limit=${limit}`);
    }

    async getAnalysisById(id) {
        return this.request(`/analysis/${id}`);
    }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;