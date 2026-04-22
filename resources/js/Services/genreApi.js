import { apiClient } from './apiClient';

/**
 * genreApi - Quản lý danh mục thể loại phim (Genre).
 */
export const genreApi = {
    // Lấy danh sách thể loại
    list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/genres' + (query ? `?${query}` : ''));
    },

    // Lấy danh sách thể loại đã bị xóa
    trashed(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/genres/trashed' + (query ? `?${query}` : ''));
    },

    // Lấy thông tin một thể loại
    get(id) {
        return apiClient.get(`/admin/genres/${id}`);
    },

    // Tạo thể loại phim mới
    create(data) {
        return apiClient.post('/admin/genres', data);
    },

    // Cập nhật thông tin thể loại
    update(id, data) {
        return apiClient.put(`/admin/genres/${id}`, data);
    },

    // Xóa thể loại
    destroy(id) {
        return apiClient.delete(`/admin/genres/${id}`);
    },

    // Khôi phục thể loại đã xóa
    restore(id) {
        return apiClient.post(`/admin/genres/${id}/restore`, {});
    },
};

