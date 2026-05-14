import { useState, useEffect } from 'react';
import { useAuth } from '@/Context/AuthContext';
import { viewerApi } from '@/Services/viewerApi';
import { useNavigate } from 'react-router-dom';

/**
 * BookmarkButton - Nút thêm/xóa phim khỏi danh sách yêu thích.
 * 
 * @param {number} movieId - ID phim.
 * @param {string} className - CSS class bổ sung.
 */
export default function BookmarkButton({ movieId, className = '' }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [bookmarked, setBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);

    /** Kiểm tra trạng thái bookmark khi mount */
    useEffect(() => {
        if (!isAuthenticated || !movieId) return;

        const checkBookmark = async () => {
            try {
                const res = await viewerApi.checkBookmark(movieId);
                if (res.success) {
                    setBookmarked(res.data?.data?.bookmarked === true);
                }
            } catch (err) {
                // Bỏ qua lỗi
            }
        };
        checkBookmark();
    }, [movieId, isAuthenticated]);

    /** Toggle bookmark */
    const handleToggle = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (loading) return;
        setLoading(true);
        setAnimating(true);

        try {
            if (bookmarked) {
                const res = await viewerApi.removeBookmark(movieId);
                if (res.success) setBookmarked(false);
            } else {
                const res = await viewerApi.addBookmark(movieId);
                if (res.success) setBookmarked(true);
            }
        } catch (err) {
            console.error('Lỗi khi thao tác bookmark:', err);
        } finally {
            setLoading(false);
            setTimeout(() => setAnimating(false), 300);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`group flex items-center gap-2 px-5 py-3 border-2 font-black uppercase text-sm transition-all ${
                bookmarked
                    ? 'bg-yellow-400 border-black text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-yellow-300'
                    : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-yellow-400 hover:text-white'
            } ${animating ? 'scale-95' : ''} ${className}`}
            title={bookmarked ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
        >
            <svg
                className={`w-5 h-5 transition-transform ${animating ? 'scale-125' : ''} ${
                    bookmarked ? 'text-black' : 'text-current'
                }`}
                fill={bookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
            </svg>
            {bookmarked ? 'Đã lưu' : 'Lưu phim'}
        </button>
    );
}
