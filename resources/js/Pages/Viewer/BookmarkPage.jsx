import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';
import { viewerApi } from '@/Services/viewerApi';
import ViewerLayout from '@/Layouts/ViewerLayout';
import MovieCard from '@/Components/Viewer/MovieCard';

/**
 * BookmarkPage - Trang danh sách phim yêu thích của người dùng.
 * Yêu cầu đăng nhập để xem.
 */
export default function BookmarkPage() {
    const { isAuthenticated, user } = useAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'Phim yêu thích - VMovies';
        
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const fetchBookmarks = async () => {
            try {
                const res = await viewerApi.getBookmarks({ per_page: 50 });
                if (res.success) {
                    const data = res.data?.data;
                    if (Array.isArray(data)) {
                        setBookmarks(data);
                    } else if (data?.data && Array.isArray(data.data)) {
                        setBookmarks(data.data);
                    }
                }
            } catch (err) {
                console.error('Lỗi khi tải danh sách yêu thích:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookmarks();
    }, [isAuthenticated]);

    /** Xóa bookmark */
    const handleRemove = async (movieId) => {
        try {
            const res = await viewerApi.removeBookmark(movieId);
            if (res.success) {
                setBookmarks(prev => prev.filter(b => {
                    const mId = b.movie_id || b.movie?.id || b.id;
                    return mId !== movieId;
                }));
            }
        } catch (err) {
            console.error('Lỗi khi xóa bookmark:', err);
        }
    };

    if (!isAuthenticated) {
        return (
            <ViewerLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                    <div className="text-6xl mb-6">🔒</div>
                    <h2 className="text-3xl font-black text-white uppercase mb-3">
                        Bạn cần đăng nhập
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-md">
                        Hãy đăng nhập để lưu và quản lý danh sách phim yêu thích của riêng bạn
                    </p>
                    <Link
                        to="/login"
                        className="px-8 py-4 bg-yellow-400 text-black font-black uppercase text-lg border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                        Đăng nhập ngay
                    </Link>
                </div>
            </ViewerLayout>
        );
    }

    return (
        <ViewerLayout>
            <div className="container mx-auto px-4 py-12 min-h-[60vh]">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <span className="w-2 h-10 bg-yellow-400"></span>
                        Phim yêu thích
                    </h1>
                    <p className="text-gray-500 mt-2 font-bold uppercase text-xs tracking-widest">
                        Xin chào, {user?.name} — Đây là danh sách phim bạn đã lưu
                    </p>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-gray-900 animate-pulse rounded-xl border border-gray-800" />
                        ))}
                    </div>
                ) : bookmarks.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {bookmarks.map((item) => {
                            // Bookmark có thể trả về movie object hoặc chính nó là movie
                            const movie = item.movie || item;
                            return (
                                <div key={item.id || movie.id} className="relative group">
                                    <MovieCard movie={movie} />
                                    {/* Nút xóa bookmark */}
                                    <button
                                        onClick={() => handleRemove(movie.id)}
                                        className="absolute top-2 right-2 w-8 h-8 bg-black/70 backdrop-blur-sm border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all opacity-0 group-hover:opacity-100 z-10"
                                        title="Xóa khỏi yêu thích"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center text-center">
                        <div className="text-6xl mb-6">📑</div>
                        <h3 className="text-2xl font-black uppercase text-white mb-3">
                            Danh sách trống
                        </h3>
                        <p className="text-gray-500 max-w-sm mb-8">
                            Bạn chưa lưu phim nào vào danh sách yêu thích. Hãy khám phá và thêm phim ngay!
                        </p>
                        <Link
                            to="/"
                            className="px-8 py-3 bg-yellow-400 text-black font-black uppercase border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none transition-all"
                        >
                            Khám phá phim
                        </Link>
                    </div>
                )}
            </div>
        </ViewerLayout>
    );
}
