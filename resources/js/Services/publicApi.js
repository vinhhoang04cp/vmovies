import { apiClient } from './apiClient';

/**
 * publicApi - Chứa các phương thức lấy dữ liệu công khai, không cần đăng nhập.
 * Dành riêng cho giao diện người xem (Viewer).
 */
export const publicApi = {
    // ── Movies (Phim) ─────────────────────────────────────────
    
    // Lấy danh sách phim hiển thị ở trang chủ (có hỗ trợ tìm kiếm, lọc)
    getMovies(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/movies' + (query ? `?${query}` : ''));
    },

    // Lấy thông tin chi tiết của một bộ phim (bao gồm cả các tập phim)
    getMovie(id) {
        return apiClient.get(`/movies/${id}`);
    },

    // Lấy danh sách tập phim của một bộ phim
    getEpisodes(movieId, params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/movies/${movieId}/episodes` + (query ? `?${query}` : ''));
    },

    // Lấy thông tin chi tiết của một tập phim cụ thể để xem video
    getEpisode(movieId, episodeId) {
        return apiClient.get(`/movies/${movieId}/episodes/${episodeId}`);
    },

    // ── Genres (Thể loại) ──────────────────────────────────────────
    
    // Lấy danh sách các thể loại phim để hiển thị ở menu hoặc bộ lọc
    getGenres(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/genres' + (query ? `?${query}` : ''));
    },

    // ── Countries (Quốc gia) ───────────────────────────────────────
    
    // Lấy danh sách các quốc gia để hiển thị ở menu hoặc bộ lọc
    getCountries(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/countries' + (query ? `?${query}` : ''));
    },
};
