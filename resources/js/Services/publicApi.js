import { apiClient } from './apiClient';

/**
 * Public API — không cần auth token.
 * Dành cho giao diện người xem (viewer).
 */
export const publicApi = {
    // ── Movies ─────────────────────────────────────────
    getMovies(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/movies' + (query ? `?${query}` : ''));
    },

    getMovie(id) {
        return apiClient.get(`/movies/${id}`);
    },

    getEpisodes(movieId, params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/movies/${movieId}/episodes` + (query ? `?${query}` : ''));
    },

    getEpisode(movieId, episodeId) {
        return apiClient.get(`/movies/${movieId}/episodes/${episodeId}`);
    },

    // ── Genres ──────────────────────────────────────────
    getGenres(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/genres' + (query ? `?${query}` : ''));
    },

    // ── Countries ───────────────────────────────────────
    getCountries(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/countries' + (query ? `?${query}` : ''));
    },
};
