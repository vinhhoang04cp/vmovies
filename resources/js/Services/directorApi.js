import { apiClient } from './apiClient';

/**
 * directorApi - Quản lý danh mục đạo diễn (Director).
 */
export const directorApi = {
    // Lấy danh sách đạo diễn
    list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/directors' + (query ? `?${query}` : ''));
    },

    // Lấy danh sách đạo diễn đã xóa
    trashed(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/directors/trashed' + (query ? `?${query}` : ''));
    },

    // Lấy thông tin một đạo diễn
    get(id) {
        return apiClient.get(`/admin/directors/${id}`);
    },

    // Thêm mới đạo diễn
    create(data) {
        return apiClient.post('/admin/directors', data);
    },

    // Chỉnh sửa thông tin đạo diễn
    update(id, data) {
        return apiClient.put(`/admin/directors/${id}`, data);
    },

    // Xóa đạo diễn
    destroy(id) {
        return apiClient.delete(`/admin/directors/${id}`);
    },

    // Khôi phục đạo diễn
    restore(id) {
        return apiClient.post(`/admin/directors/${id}/restore`, {});
    },
};

