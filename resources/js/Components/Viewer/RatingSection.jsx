import { useState, useEffect } from 'react';
import { useAuth } from '@/Context/AuthContext';
import { viewerApi } from '@/Services/viewerApi';
import { Link } from 'react-router-dom';

/**
 * RatingSection - Khu vực đánh giá (rating) phim dành cho người xem.
 * 
 * @param {number} movieId - ID phim.
 * @param {number|null} currentRating - Điểm đánh giá trung bình hiện tại.
 */
export default function RatingSection({ movieId, currentRating = 0 }) {
    const { isAuthenticated, user } = useAuth();
    const [myScore, setMyScore] = useState(0);
    const [hoverScore, setHoverScore] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');

    /** Lấy đánh giá của user hiện tại (nếu đã đánh giá) */
    useEffect(() => {
        if (!isAuthenticated || !movieId) return;

        const fetchMyRating = async () => {
            try {
                const res = await viewerApi.getMyRating(movieId);
                if (res.success && res.data?.data) {
                    const rating = res.data.data;
                    if (rating?.score) {
                        setMyScore(rating.score);
                        setReviewText(rating.review_text || '');
                        setSubmitted(true);
                    }
                }
            } catch (err) {
                // Nếu chưa đánh giá, bỏ qua lỗi
            }
        };
        fetchMyRating();
    }, [movieId, isAuthenticated]);

    /** Gửi đánh giá */
    const handleSubmit = async () => {
        if (myScore === 0 || submitting) return;
        
        setSubmitting(true);
        setError('');
        try {
            const res = await viewerApi.rateMovie(movieId, myScore, reviewText.trim());
            if (res.success) {
                setSubmitted(true);
                setShowForm(false);
            } else {
                setError(res.error || 'Không thể gửi đánh giá');
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setSubmitting(false);
        }
    };

    /** Render ngôi sao đánh giá */
    const renderStars = (interactive = false) => {
        const displayScore = interactive ? (hoverScore || myScore) : myScore;
        
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={!interactive}
                        className={`text-2xl transition-all duration-150 ${
                            interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'
                        } ${
                            star <= displayScore
                                ? 'text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]'
                                : 'text-gray-700'
                        }`}
                        onClick={() => interactive && setMyScore(star)}
                        onMouseEnter={() => interactive && setHoverScore(star)}
                        onMouseLeave={() => interactive && setHoverScore(0)}
                        title={`${star}/10`}
                    >
                        ★
                    </button>
                ))}
                <span className="ml-3 text-lg font-black text-white">
                    {displayScore > 0 ? `${displayScore}/10` : ''}
                </span>
            </div>
        );
    };

    return (
        <section className="rating-section">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-yellow-400"></span>
                Đánh giá phim
                {currentRating > 0 && (
                    <span className="flex items-center gap-1 text-sm font-bold text-yellow-400 normal-case">
                        ⭐ {Number(currentRating).toFixed(1)}/10
                    </span>
                )}
            </h2>

            {isAuthenticated ? (
                <div className="bg-gray-900/50 border-2 border-gray-800 rounded-xl p-6">
                    {submitted && !showForm ? (
                        /* Hiển thị đánh giá đã gửi */
                        <div className="text-center">
                            <div className="mb-3">
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                    Đánh giá của bạn
                                </span>
                            </div>
                            {renderStars(false)}
                            {reviewText && (
                                <p className="mt-3 text-gray-400 text-sm italic">
                                    "{reviewText}"
                                </p>
                            )}
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-4 text-xs font-black uppercase tracking-widest text-yellow-400 hover:text-white transition-colors"
                            >
                                Chỉnh sửa đánh giá
                            </button>
                        </div>
                    ) : (
                        /* Form đánh giá */
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                                {submitted ? 'Cập nhật đánh giá' : 'Bạn thấy phim thế nào?'}
                            </p>

                            {renderStars(true)}

                            {myScore > 0 && (
                                <div className="mt-4 space-y-3">
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Viết nhận xét ngắn gọn (không bắt buộc)..."
                                        rows={2}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:border-yellow-400 focus:outline-none transition-colors resize-none text-sm"
                                        maxLength={500}
                                        disabled={submitting}
                                    />

                                    {error && (
                                        <p className="text-red-400 text-xs font-bold">{error}</p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600">
                                            {reviewText.length}/500
                                        </span>
                                        <div className="flex gap-2">
                                            {showForm && (
                                                <button
                                                    onClick={() => setShowForm(false)}
                                                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                                                >
                                                    Hủy
                                                </button>
                                            )}
                                            <button
                                                onClick={handleSubmit}
                                                disabled={submitting}
                                                className="px-6 py-2.5 bg-yellow-400 text-black font-black uppercase text-xs tracking-widest border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
                                            >
                                                {submitting ? 'Đang gửi...' : submitted ? 'Cập nhật' : 'Gửi đánh giá'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-gray-900/50 border-2 border-gray-800 rounded-xl p-6 text-center">
                    <p className="text-gray-400 mb-3">
                        Đăng nhập để đánh giá phim này
                    </p>
                    <Link
                        to="/login"
                        className="inline-block px-6 py-2.5 bg-yellow-400 text-black font-black uppercase text-xs tracking-widest border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                    >
                        Đăng nhập
                    </Link>
                </div>
            )}
        </section>
    );
}
