import { apiClient } from './apiClient';

export const actorApi = {
    // Danh sách diễn viên
    list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/actors' + (query ? `?${query}` : ''));
    },

    // Danh sách diễn viên đã xóa
    trashed(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/actors/trashed' + (query ? `?${query}` : ''));
    },

    // Chi tiết diễn viên
    get(id) {
        return apiClient.get(`/admin/actors/${id}`);
    },

    // Tạo diễn viên mới
    create(data) {
        return apiClient.post('/admin/actors', data);
    },

    // Cập nhật diễn viên
    update(id, data) {
        return apiClient.put(`/admin/actors/${id}`, data);
    },

    // Xóa mềm diễn viên
    destroy(id) {
        return apiClient.delete(`/admin/actors/${id}`);
    },

    // Khôi phục diễn viên
    restore(id) {
        return apiClient.post(`/admin/actors/${id}/restore`, {});
    },
};

