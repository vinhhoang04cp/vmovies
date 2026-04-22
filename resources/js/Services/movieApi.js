import { apiClient } from './apiClient';

/**
 * movieApi - Chứa các phương thức quản lý phim dành cho trang Admin.
 */
export const movieApi = {
    // Lấy danh sách phim (có hỗ trợ lọc và phân trang qua params)
    list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/movies' + (query ? `?${query}` : ''));
    },

    // Lấy danh sách các phim đã bị xóa mềm (thùng rác)
    trashed(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/movies/trashed' + (query ? `?${query}` : ''));
    },

    // Lấy chi tiết thông tin của một bộ phim cụ thể qua ID
    get(id) {
        return apiClient.get(`/admin/movies/${id}`);
    },

    // Tạo một bộ phim mới
    create(data) {
        return apiClient.post('/admin/movies', data);
    },

    // Cập nhật thông tin phim đã có
    update(id, data) {
        return apiClient.put(`/admin/movies/${id}`, data);
    },

    // Xóa mềm một bộ phim (đưa vào thùng rác)
    destroy(id) {
        return apiClient.delete(`/admin/movies/${id}`);
    },

    // Khôi phục bộ phim đã bị xóa mềm
    restore(id) {
        return apiClient.post(`/admin/movies/${id}/restore`, {});
    },

    // Các hàm quản lý mối quan hệ (nhiều - nhiều) của phim:
    
    // Gắn một thể loại (Genre) vào phim
    attachGenre(movieId, genreId) {
        return apiClient.post(`/admin/movies/${movieId}/genres/${genreId}`, {});
    },

    // Gỡ một thể loại ra khỏi phim
    detachGenre(movieId, genreId) {
        return apiClient.delete(`/admin/movies/${movieId}/genres/${genreId}`);
    },

    // Gắn một quốc gia (Country) vào phim
    attachCountry(movieId, countryId) {
        return apiClient.post(`/admin/movies/${movieId}/countries/${countryId}`, {});
    },

    // Gỡ một quốc gia ra khỏi phim
    detachCountry(movieId, countryId) {
        return apiClient.delete(`/admin/movies/${movieId}/countries/${countryId}`);
    },

    // Gắn một đạo diễn (Director) vào phim
    attachDirector(movieId, directorId) {
        return apiClient.post(`/admin/movies/${movieId}/directors/${directorId}`, {});
    },

    // Gỡ một đạo diễn ra khỏi phim
    detachDirector(movieId, directorId) {
        return apiClient.delete(`/admin/movies/${movieId}/directors/${directorId}`);
    },

    // Gắn một diễn viên (Actor) vào phim
    attachActor(movieId, actorId) {
        return apiClient.post(`/admin/movies/${movieId}/actors/${actorId}`, {});
    },

    // Gỡ một diễn viên ra khỏi phim
    detachActor(movieId, actorId) {
        return apiClient.delete(`/admin/movies/${movieId}/actors/${actorId}`);
    },
};

