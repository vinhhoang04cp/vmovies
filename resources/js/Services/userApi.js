import { apiClient } from './apiClient';

export const userApi = {
    // Danh sách người dùng
    list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/users' + (query ? `?${query}` : ''));
    },

    // Chi tiết người dùng
    get(id) {
        return apiClient.get(`/admin/users/${id}`);
    },

    // Cập nhật người dùng
    update(id, data) {
        return apiClient.put(`/admin/users/${id}`, data);
    },

    // Xóa người dùng
    destroy(id) {
        return apiClient.delete(`/admin/users/${id}`);
    },

    // Ban người dùng
    ban(id) {
        return apiClient.patch(`/admin/users/${id}/ban`, {});
    },

    // Unban người dùng
    unban(id) {
        return apiClient.patch(`/admin/users/${id}/unban`, {});
    },
};

