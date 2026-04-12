const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = {
    async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;
        const token = localStorage.getItem('auth_token');

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `API Error: ${response.status}`);
            }

            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    get(endpoint, options) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    post(endpoint, body, options) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    put(endpoint, body, options) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    patch(endpoint, body, options) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    },

    delete(endpoint, options) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    },
};

// Auth API
export const authApi = {
    login(email, password) {
        return apiClient.post('/auth/login', { email, password });
    },

    register(name, email, password, password_confirmation) {
        return apiClient.post('/auth/register', {
            name,
            email,
            password,
            password_confirmation,
        });
    },

    logout() {
        return apiClient.post('/auth/logout', {});
    },

    me() {
        return apiClient.get('/auth/me');
    },

    refresh() {
        return apiClient.post('/auth/refresh', {});
    },
};

