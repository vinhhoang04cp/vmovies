import { apiClient } from './apiClient';

/**
 * episodeApi - Quản lý các tập phim (Episode) của từng bộ phim.
 */
export const episodeApi = {
    // Lấy danh sách tập phim thuộc về một bộ phim cụ thể
    listByMovie(movieId, params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/admin/movies/${movieId}/episodes` + (query ? `?${query}` : ''));
    },

    // Lấy thông tin chi tiết một tập phim
    get(id) {
        return apiClient.get(`/admin/episodes/${id}`);
    },

    // Tạo tập phim mới (dạng dữ liệu JSON - không có file đính kèm)
    create(movieId, data) {
        return apiClient.post(`/admin/movies/${movieId}/episodes`, data);
    },

    // Tạo tập phim mới kèm upload file (dùng FormData cho video/phụ đề)
    createWithFile(movieId, formData) {
        return apiClient.postMultipart(`/admin/movies/${movieId}/episodes`, formData);
    },

    // Cập nhật tập phim (dạng JSON)
    update(id, data) {
        return apiClient.put(`/admin/episodes/${id}`, data);
    },

    // Cập nhật tập phim kèm upload file (dùng method spoofing '_method=PUT')
    // Giải thích: PHP không đọc được dữ liệu multipart từ request PUT trực tiếp.
    updateWithFile(id, formData) {
        formData.append('_method', 'PUT');
        return apiClient.postMultipart(`/admin/episodes/${id}`, formData);
    },

    // Xóa tập phim (xóa mềm)
    destroy(id) {
        return apiClient.delete(`/admin/episodes/${id}`);
    },

    // Khôi phục tập phim đã xóa
    restore(id) {
        return apiClient.post(`/admin/episodes/${id}/restore`, {});
    },

    // Lấy danh sách các tập phim đã bị xóa (thùng rác)
    trashed(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/episodes/trashed' + (query ? `?${query}` : ''));
    },

    // Tạo nhanh nhiều tập phim cùng lúc
    bulkCreate(movieId, episodes) {
        return apiClient.post('/admin/episodes/bulk-create', {
            movie_id: movieId,
            episodes,
        });
    },

    // Thay đổi thứ tự sắp xếp của các tập phim
    reorder(movieId, episodes) {
        return apiClient.put('/admin/episodes/reorder', {
            movie_id: movieId,
            episodes,
        });
    },
};

