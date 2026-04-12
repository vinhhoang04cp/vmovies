import { apiClient } from './apiClient';

export const movieApi = {
    // Danh sách phim
    list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/movies' + (query ? `?${query}` : ''));
    },

    // Danh sách phim đã xóa
    trashed(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/movies/trashed' + (query ? `?${query}` : ''));
    },

    // Chi tiết phim
    get(id) {
        return apiClient.get(`/admin/movies/${id}`);
    },

    // Tạo phim mới
    create(data) {
        return apiClient.post('/admin/movies', data);
    },

    // Cập nhật phim
    update(id, data) {
        return apiClient.put(`/admin/movies/${id}`, data);
    },

    // Xóa mềm phim
    destroy(id) {
        return apiClient.delete(`/admin/movies/${id}`);
    },

    // Khôi phục phim
    restore(id) {
        return apiClient.post(`/admin/movies/${id}/restore`, {});
    },

    // Gắn thể loại vào phim
    attachGenre(movieId, genreId) {
        return apiClient.post(`/admin/movies/${movieId}/genres/${genreId}`, {});
    },

    // Bỏ thể loại khỏi phim
    detachGenre(movieId, genreId) {
        return apiClient.delete(`/admin/movies/${movieId}/genres/${genreId}`);
    },

    // Gắn quốc gia vào phim
    attachCountry(movieId, countryId) {
        return apiClient.post(`/admin/movies/${movieId}/countries/${countryId}`, {});
    },

    // Bỏ quốc gia khỏi phim
    detachCountry(movieId, countryId) {
        return apiClient.delete(`/admin/movies/${movieId}/countries/${countryId}`);
    },

    // Gắn đạo diễn vào phim
    attachDirector(movieId, directorId) {
        return apiClient.post(`/admin/movies/${movieId}/directors/${directorId}`, {});
    },

    // Bỏ đạo diễn khỏi phim
    detachDirector(movieId, directorId) {
        return apiClient.delete(`/admin/movies/${movieId}/directors/${directorId}`);
    },

    // Gắn diễn viên vào phim
    attachActor(movieId, actorId) {
        return apiClient.post(`/admin/movies/${movieId}/actors/${actorId}`, {});
    },

    // Bỏ diễn viên khỏi phim
    detachActor(movieId, actorId) {
        return apiClient.delete(`/admin/movies/${movieId}/actors/${actorId}`);
    },
};

