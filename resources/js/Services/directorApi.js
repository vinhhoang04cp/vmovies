import { apiClient } from './apiClient';

export const directorApi = {
    // Danh sách đạo diễn
    list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/directors' + (query ? `?${query}` : ''));
    },

    // Danh sách đạo diễn đã xóa
    trashed(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/directors/trashed' + (query ? `?${query}` : ''));
    },

    // Chi tiết đạo diễn
    get(id) {
        return apiClient.get(`/admin/directors/${id}`);
    },

    // Tạo đạo diễn mới
    create(data) {
        return apiClient.post('/admin/directors', data);
    },

    // Cập nhật đạo diễn
    update(id, data) {
        return apiClient.put(`/admin/directors/${id}`, data);
    },

    // Xóa mềm đạo diễn
    destroy(id) {
        return apiClient.delete(`/admin/directors/${id}`);
    },

    // Khôi phục đạo diễn
    restore(id) {
        return apiClient.post(`/admin/directors/${id}/restore`, {});
    },
};

