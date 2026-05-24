// Lấy URL của API từ biến môi trường (Vite), nếu không có thì mặc định là localhost:8000/api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Đối tượng apiClient dùng để thực hiện các yêu cầu HTTP (fetch) tới server.
 * Tự động xử lý token xác thực và định dạng dữ liệu JSON.
 */
export const apiClient = {
    /**
     * Phương thức gửi yêu cầu chung cho các kiểu Content-Type: application/json
     * @param {string} endpoint - Đường dẫn API (ví dụ: '/movies')
     * @param {object} options - Các tùy chọn thêm cho fetch (method, headers, body...)
     */
    async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;

        // Thiết lập các header mặc định
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include',
            });

            // Nếu gặp lỗi 401 và chưa thử lại, tiến hành silent refresh
            if (response.status === 401 && !options._retry && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
                options._retry = true;
                const refreshSuccess = await this.refreshToken();
                if (refreshSuccess) {
                    return this.request(endpoint, options);
                } else {
                    this.handleSessionExpired();
                    throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
                }
            }

            const data = await response.json();

            // Nếu response không thành công (status không nằm trong khoảng 200-299)
            if (!response.ok) {
                throw new Error(data.message || `API Error: ${response.status}`);
            }

            return { success: true, data };
        } catch (error) {
            // Trả về đối tượng lỗi để phía component dễ xử lý
            return { success: false, error: error.message };
        }
    },

    /**
     * Phương thức gửi yêu cầu dành cho dữ liệu đa phần (Multipart) - dùng khi upload file (ảnh, video)
     * Không tự set 'Content-Type' vì trình duyệt sẽ tự tạo ranh giới (boundary) cho FormData.
     */
    async requestMultipart(endpoint, formData, options = {}) {
        const url = `${API_URL}${endpoint}`;

        const headers = {
            'Accept': 'application/json',
            ...options.headers,
        };

        try {
            const response = await fetch(url, {
                ...options,
                method: options.method || 'POST',
                headers,
                body: formData,
                credentials: 'include',
            });

            // Nếu gặp lỗi 401 và chưa thử lại, tiến hành silent refresh
            if (response.status === 401 && !options._retry && endpoint !== '/auth/refresh') {
                options._retry = true;
                const refreshSuccess = await this.refreshToken();
                if (refreshSuccess) {
                    return this.requestMultipart(endpoint, formData, options);
                } else {
                    this.handleSessionExpired();
                    throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
                }
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `API Error: ${response.status}`);
            }

            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Hàm gọi API /auth/refresh để lấy token mới lưu trong HttpOnly cookie
     */
    async refreshToken() {
        try {
            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    },

    /**
     * Phát sự kiện báo phiên làm việc đã hết hạn
     */
    handleSessionExpired() {
        window.dispatchEvent(new CustomEvent('auth:expired'));
    },

    // Các hàm wrapper tiện ích cho các phương thức HTTP thông dụng
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

    // Wrapper cho việc upload file qua POST và PUT
    postMultipart(endpoint, formData, options) {
        return this.requestMultipart(endpoint, formData, {
            ...options,
            method: 'POST',
        });
    },

    putMultipart(endpoint, formData, options) {
        return this.requestMultipart(endpoint, formData, {
            ...options,
            method: 'PUT',
        });
    },
};

/**
 * Đối tượng authApi chứa các hàm liên quan đến xác thực người dùng.
 */
export const authApi = {
    // Đăng nhập người dùng
    login(email, password) {
        return apiClient.post('/auth/login', { email, password });
    },

    // Đăng ký tài khoản mới
    register(name, email, password, password_confirmation) {
        return apiClient.post('/auth/register', {
            name,
            email,
            password,
            password_confirmation,
        });
    },

    // Đăng xuất và xóa session trên server
    logout() {
        return apiClient.post('/auth/logout', {});
    },

    // Lấy thông tin người dùng hiện tại từ token
    me() {
        return apiClient.get('/auth/me');
    },

    // Làm mới (refresh) token để duy trì phiên đăng nhập
    refresh() {
        return apiClient.post('/auth/refresh', {});
    },
};

