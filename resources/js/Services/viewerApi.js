import { apiClient } from './apiClient';

/**
 * viewerApi - API service dành cho người dùng đã đăng nhập (không phải admin).
 * Bao gồm các chức năng: Bookmark, Comment, Rating.
 * Tất cả đều yêu cầu token xác thực (Bearer Token).
 */
export const viewerApi = {
    // ══════════════════════════════════════════════
    //  BOOKMARK (Phim yêu thích)
    // ══════════════════════════════════════════════

    /** Lấy danh sách bookmark của người dùng hiện tại */
    getBookmarks(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/bookmarks' + (query ? `?${query}` : ''));
    },

    /** Thêm phim vào bookmark */
    addBookmark(movieId) {
        return apiClient.post('/bookmarks', { movie_id: movieId });
    },

    /** Xóa phim khỏi bookmark */
    removeBookmark(movieId) {
        return apiClient.delete(`/bookmarks/${movieId}`);
    },

    /** Kiểm tra phim đã được bookmark chưa */
    checkBookmark(movieId) {
        return apiClient.get(`/bookmarks/check/${movieId}`);
    },

    // ══════════════════════════════════════════════
    //  COMMENT (Bình luận)
    // ══════════════════════════════════════════════

    /** Lấy danh sách bình luận cho một bộ phim */
    getMovieComments(movieId, params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/movies/${movieId}/comments` + (query ? `?${query}` : ''));
    },

    /** Gửi bình luận cho phim */
    postComment(movieId, content, episodeId = null) {
        const body = { content };
        if (episodeId) body.episode_id = episodeId;
        return apiClient.post(`/movies/${movieId}/comments`, body);
    },

    /** Xóa bình luận của chính mình */
    deleteComment(commentId) {
        return apiClient.delete(`/comments/${commentId}`);
    },

    // ══════════════════════════════════════════════
    //  RATING (Đánh giá)
    // ══════════════════════════════════════════════

    /** Lấy thông tin đánh giá của phim (bao gồm rating của user hiện tại) */
    getMovieRatings(movieId, params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/movies/${movieId}/ratings` + (query ? `?${query}` : ''));
    },

    /** Gửi hoặc cập nhật đánh giá cho phim */
    rateMovie(movieId, score, reviewText = '') {
        return apiClient.post(`/movies/${movieId}/ratings`, {
            score,
            review_text: reviewText,
        });
    },

    /** Lấy đánh giá của user hiện tại cho phim */
    getMyRating(movieId) {
        return apiClient.get(`/movies/${movieId}/ratings/mine`);
    },
};
