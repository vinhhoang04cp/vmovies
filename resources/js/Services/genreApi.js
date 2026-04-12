import { apiClient } from './apiClient';

export const genreApi = {
    // Danh sách thể loại
    list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/genres' + (query ? `?${query}` : ''));
    },

    // Danh sách thể loại đã xóa
    trashed(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/genres/trashed' + (query ? `?${query}` : ''));
    },

    // Chi tiết thể loại
    get(id) {
        return apiClient.get(`/admin/genres/${id}`);
    },

    // Tạo thể loại mới
    create(data) {
        return apiClient.post('/admin/genres', data);
    },

    // Cập nhật thể loại
    update(id, data) {
        return apiClient.put(`/admin/genres/${id}`, data);
    },

    // Xóa mềm thể loại
    destroy(id) {
        return apiClient.delete(`/admin/genres/${id}`);
    },

    // Khôi phục thể loại
    restore(id) {
        return apiClient.post(`/admin/genres/${id}/restore`, {});
    },
};

