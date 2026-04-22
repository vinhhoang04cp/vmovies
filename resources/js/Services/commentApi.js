import { apiClient } from './apiClient';

/**
 * commentApi - Quản lý các bình luận (Comments) của người xem phim.
 */
export const commentApi = {
    // Lấy danh sách toàn bộ bình luận
    list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/comments' + (query ? `?${query}` : ''));
    },

    // Lấy danh sách các bình luận đang chờ phê duyệt (kiểm duyệt)
    pending(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/comments/pending' + (query ? `?${query}` : ''));
    },

    // Lấy chi tiết một bình luận
    get(id) {
        return apiClient.get(`/admin/comments/${id}`);
    },

    // Chấp nhận (phê duyệt) cho phép bình luận hiển thị công khai
    approve(id) {
        return apiClient.patch(`/admin/comments/${id}/approve`, {});
    },

    // Xóa bỏ bình luận (nếu vi phạm quy định)
    destroy(id) {
        return apiClient.delete(`/admin/comments/${id}`);
    },
};

