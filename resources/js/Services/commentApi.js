import { apiClient } from './apiClient';

export const commentApi = {
    // Danh sách bình luận
    list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/comments' + (query ? `?${query}` : ''));
    },

    // Danh sách bình luận chờ phê duyệt
    pending(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/comments/pending' + (query ? `?${query}` : ''));
    },

    // Chi tiết bình luận
    get(id) {
        return apiClient.get(`/admin/comments/${id}`);
    },

    // Phê duyệt bình luận
    approve(id) {
        return apiClient.patch(`/admin/comments/${id}/approve`, {});
    },

    // Xóa bình luận
    destroy(id) {
        return apiClient.delete(`/admin/comments/${id}`);
    },
};

