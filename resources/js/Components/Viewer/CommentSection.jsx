import { useState, useEffect } from 'react';
import { useAuth } from '@/Context/AuthContext';
import { viewerApi } from '@/Services/viewerApi';
import { Link } from 'react-router-dom';

/**
 * CommentSection - Khu vực bình luận cho phim hoặc tập phim.
 * 
 * @param {number} movieId - ID của bộ phim.
 * @param {number|null} episodeId - ID tập phim (nếu bình luận cho tập cụ thể).
 */
export default function CommentSection({ movieId, episodeId = null }) {
    const { isAuthenticated, user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalComments, setTotalComments] = useState(0);

    /** Tải danh sách bình luận */
    const fetchComments = async (pageNum = 1, append = false) => {
        try {
            setLoading(true);
            const params = { page: pageNum, per_page: 10 };
            if (episodeId) params.episode_id = episodeId;
            
            const res = await viewerApi.getMovieComments(movieId, params);
            
            if (res.success) {
                const backendData = res.data?.data;
                let commentList = [];
                let meta = null;

                if (Array.isArray(backendData)) {
                    commentList = backendData;
                } else if (backendData?.data && Array.isArray(backendData.data)) {
                    commentList = backendData.data;
                    meta = backendData.meta || backendData;
                }

                if (append) {
                    setComments(prev => [...prev, ...commentList]);
                } else {
                    setComments(commentList);
                }

                if (meta) {
                    setHasMore(meta.current_page < meta.last_page);
                    setTotalComments(meta.total || commentList.length);
                } else {
                    setHasMore(false);
                    setTotalComments(commentList.length);
                }
            }
        } catch (err) {
            console.error('Lỗi khi tải bình luận:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments(1);
        setPage(1);
    }, [movieId, episodeId]);

    /** Gửi bình luận mới */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        try {
            const res = await viewerApi.postComment(movieId, newComment.trim(), episodeId);
            if (res.success) {
                setNewComment('');
                // Tải lại danh sách bình luận để hiển thị bình luận mới
                fetchComments(1);
                setPage(1);
            }
        } catch (err) {
            console.error('Lỗi khi gửi bình luận:', err);
        } finally {
            setSubmitting(false);
        }
    };

    /** Xóa bình luận */
    const handleDelete = async (commentId) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa bình luận này?')) return;
        
        try {
            const res = await viewerApi.deleteComment(commentId);
            if (res.success) {
                setComments(prev => prev.filter(c => c.id !== commentId));
                setTotalComments(prev => prev - 1);
            }
        } catch (err) {
            console.error('Lỗi khi xóa bình luận:', err);
        }
    };

    /** Tải thêm bình luận */
    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchComments(nextPage, true);
    };

    /** Tính toán thời gian trôi qua */
    const timeAgo = (dateStr) => {
        if (!dateStr) return '';
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 30) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <section className="comment-section">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-yellow-400"></span>
                Bình luận
                {totalComments > 0 && (
                    <span className="text-sm font-bold text-gray-500 normal-case">
                        ({totalComments})
                    </span>
                )}
            </h2>

            {/* FORM GỬI BÌNH LUẬN */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex gap-4">
                        {/* Avatar người dùng */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0 border-2 border-gray-700">
                            <span className="text-black font-black text-sm">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Chia sẻ cảm nghĩ của bạn về phim..."
                                rows={3}
                                className="w-full bg-gray-900 border-2 border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:border-yellow-400 focus:outline-none transition-colors resize-none"
                                maxLength={1000}
                                disabled={submitting}
                            />
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-gray-600 font-bold">
                                    {newComment.length}/1000 ký tự
                                </span>
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || submitting}
                                    className="px-6 py-2.5 bg-yellow-400 text-black font-black uppercase text-xs tracking-widest border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                                >
                                    {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-8 p-6 bg-gray-900/50 border-2 border-gray-800 rounded-xl text-center">
                    <p className="text-gray-400 mb-3">
                        Bạn cần đăng nhập để bình luận
                    </p>
                    <Link
                        to="/login"
                        className="inline-block px-6 py-2.5 bg-yellow-400 text-black font-black uppercase text-xs tracking-widest border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                    >
                        Đăng nhập ngay
                    </Link>
                </div>
            )}

            {/* DANH SÁCH BÌNH LUẬN */}
            {loading && comments.length === 0 ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-24 bg-gray-800 rounded" />
                                <div className="h-3 w-full bg-gray-800 rounded" />
                                <div className="h-3 w-2/3 bg-gray-800 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-1">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="group flex gap-4 p-4 rounded-xl hover:bg-gray-900/50 transition-colors"
                        >
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 border-2 border-gray-700">
                                <span className="text-white font-black text-sm">
                                    {comment.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                            </div>

                            {/* Nội dung */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-white text-sm">
                                        {comment.user?.name || 'Ẩn danh'}
                                    </span>
                                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                                        {timeAgo(comment.created_at)}
                                    </span>
                                    {comment.user?.is_admin && (
                                        <span className="text-[9px] font-black uppercase bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full tracking-wider">
                                            Admin
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed break-words">
                                    {comment.content}
                                </p>

                                {/* Nút xóa - chỉ hiển thị cho chủ bình luận */}
                                {isAuthenticated && user?.id === comment.user_id && (
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        Xóa bình luận
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Nút tải thêm */}
                    {hasMore && (
                        <div className="pt-4 text-center">
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="px-6 py-3 bg-gray-900 border-2 border-gray-800 text-gray-400 font-black uppercase text-xs tracking-widest hover:border-yellow-400 hover:text-white transition-all"
                            >
                                {loading ? 'Đang tải...' : 'Xem thêm bình luận'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-12 text-center">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-gray-500 font-bold">
                        Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nhận!
                    </p>
                </div>
            )}
        </section>
    );
}
