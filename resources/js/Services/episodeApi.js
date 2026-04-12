import { apiClient } from './apiClient';

export const episodeApi = {
    // Danh sách tập phim theo movie
    listByMovie(movieId, params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/admin/movies/${movieId}/episodes` + (query ? `?${query}` : ''));
    },

    // Chi tiết tập phim
    get(id) {
        return apiClient.get(`/admin/episodes/${id}`);
    },

    // Tạo tập phim mới cho movie (JSON)
    create(movieId, data) {
        return apiClient.post(`/admin/movies/${movieId}/episodes`, data);
    },

    // Tạo tập phim mới cho movie (multipart - với file upload)
    createWithFile(movieId, formData) {
        return apiClient.postMultipart(`/admin/movies/${movieId}/episodes`, formData);
    },

    // Cập nhật tập phim (JSON)
    update(id, data) {
        return apiClient.put(`/admin/episodes/${id}`, data);
    },

    // Cập nhật tập phim (multipart - với file upload)
    // PHP không hỗ trợ $_FILES cho PUT, dùng POST + _method=PUT (method spoofing)
    updateWithFile(id, formData) {
        formData.append('_method', 'PUT');
        return apiClient.postMultipart(`/admin/episodes/${id}`, formData);
    },

    // Xóa mềm tập phim
    destroy(id) {
        return apiClient.delete(`/admin/episodes/${id}`);
    },

    // Khôi phục tập phim
    restore(id) {
        return apiClient.post(`/admin/episodes/${id}/restore`, {});
    },

    // Danh sách tập phim đã xóa
    trashed(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/episodes/trashed' + (query ? `?${query}` : ''));
    },

    // Tạo nhiều tập phim cùng lúc
    bulkCreate(movieId, episodes) {
        return apiClient.post('/admin/episodes/bulk-create', {
            movie_id: movieId,
            episodes,
        });
    },

    // Sắp xếp lại tập phim
    reorder(movieId, episodes) {
        return apiClient.put('/admin/episodes/reorder', {
            movie_id: movieId,
            episodes,
        });
    },
};

