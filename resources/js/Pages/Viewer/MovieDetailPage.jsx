import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '@/Services/publicApi';
import ViewerLayout from '@/Layouts/ViewerLayout';

/**
 * extractItem - Chuẩn hóa dữ liệu trả về cho một đối tượng duy nhất.
 * Xử lý các trường hợp bọc dữ liệu của Laravel API (data.data).
 */
function extractItem(res) {
    if (!res.success) return null;
    const d = res.data?.data;
    if (d && d.id) return d;
    if (d && d.data && d.data.id) return d.data;
    return d || null;
}

/**
 * extractList - Chuẩn hóa dữ liệu trả về cho danh sách đối tượng.
 */
function extractList(res) {
    if (!res.success) return [];
    const backendData = res.data?.data;
    if (Array.isArray(backendData)) return backendData;
    if (backendData?.data && Array.isArray(backendData.data)) return backendData.data;
    return [];
}

/**
 * MovieDetailPage - Trang chi tiết thông tin phim dành cho người xem.
 * 
 * Các tính năng chính:
 * 1. Hiển thị thông tin tổng quan: Poster, Banner, Tên phim, Năm sản xuất, Đánh giá IMDb.
 * 2. Phân loại Thể loại, Quốc gia, Đạo diễn và Diễn viên tham gia.
 * 3. Danh sách các tập phim (Episodes) hiện có.
 * 4. Tích hợp Trailer (YouTube/Video URL).
 * 5. Nút "Xem Phim" tự động chuyển tới tập đầu tiên.
 */
export default function MovieDetailPage() {
    const { id } = useParams(); // Lấy Movie ID từ URL.
    const [movie, setMovie] = useState(null);       // Thông tin chi tiết phim.
    const [episodes, setEpisodes] = useState([]);   // Danh sách tập phim.
    const [loading, setLoading] = useState(true);   // Trạng thái tải trang.
    const [showFullDesc, setShowFullDesc] = useState(false); // Trạng thái ẩn/hiện mô tả dài.

    /**
     * Effect: Tải thông tin phim và tập phim khi ID thay đổi.
     */
    useEffect(() => {
        const fetchMovie = async () => {
            setLoading(true);
            try {
                // Tải song song thông tin phim và danh sách tập phim để tiết kiệm thời gian.
                const [movieRes, episodesRes] = await Promise.all([
                    publicApi.getMovie(id),
                    publicApi.getEpisodes(id, { per_page: 100 }), // Lấy tối đa 100 tập.
                ]);

                const movieData = extractItem(movieRes);
                if (movieData) {
                    setMovie(movieData);
                    document.title = `${movieData.title} - Xem phim tại VMovies`;
                }
                setEpisodes(extractList(episodesRes));
            } catch (err) {
                console.error('Lỗi khi tải thông tin phim:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMovie();
    }, [id]);

    // --- GIAO DIỆN KHI ĐANG TẢI (SKELETON) ---
    if (loading) {
        return (
            <ViewerLayout>
                <div className="movie-detail movie-detail--loading min-h-screen bg-gray-900 flex flex-col items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-64 h-96 bg-gray-800 rounded-lg"></div>
                        <div className="h-8 w-48 bg-gray-800 rounded"></div>
                        <div className="h-4 w-96 bg-gray-800 rounded"></div>
                    </div>
                </div>
            </ViewerLayout>
        );
    }

    // --- GIAO DIỆN KHI KHÔNG TÌM THẤY PHIM ---
    if (!movie) {
        return (
            <ViewerLayout>
                <div className="movie-detail movie-detail--not-found min-h-screen flex flex-col items-center justify-center text-center p-4">
                    <h2 className="text-4xl font-black text-white uppercase mb-4">Không tìm thấy phim</h2>
                    <p className="text-gray-400 mb-8 max-w-md">Phim bạn yêu cầu không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống do vi phạm bản quyền hoặc lỗi kỹ thuật.</p>
                    <Link to="/" className="px-8 py-3 bg-yellow-400 text-black font-black uppercase border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none transition-all">
                        Trở về trang chủ
                    </Link>
                </div>
            </ViewerLayout>
        );
    }

    // Ưu tiên banner, nếu không có thì lấy poster làm hình nền mờ.
    const backdropUrl = movie.banner_url || movie.poster_url;
    const firstEpisode = episodes[0]; // Tập phim đầu tiên để bắt đầu xem.

    return (
        <ViewerLayout>
            <div className="movie-detail text-white">
                {/* 1. KHU VỰC HERO (BACKDROP & OVERLAY) */}
                <div className="relative min-h-[60vh] flex items-end">
                    {backdropUrl && (
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${backdropUrl})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent" />
                        </div>
                    )}
                    
                    <div className="container mx-auto px-4 relative z-10 pb-12 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 items-end">
                        {/* Poster phim */}
                        <div className="hidden md:block">
                            <img 
                                src={movie.poster_url} 
                                alt={movie.title} 
                                className="w-full rounded-xl border-4 border-gray-800 shadow-2xl"
                            />
                        </div>

                        {/* Thông tin nhanh */}
                        <div className="flex flex-col gap-4">
                            <h1 className="text-5xl font-black uppercase tracking-tight leading-tight">
                                {movie.title}
                            </h1>
                            {movie.original_title && (
                                <p className="text-xl text-gray-400 font-bold -mt-2">{movie.original_title}</p>
                            )}

                            {/* Nhãn thông tin (Badges) */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {movie.average_rating > 0 && (
                                    <span className="bg-yellow-400 text-black px-3 py-1 font-black rounded flex items-center gap-1">
                                        ⭐ {Number(movie.average_rating).toFixed(1)}
                                    </span>
                                )}
                                <span className="bg-gray-800 px-3 py-1 font-bold rounded">{movie.release_year}</span>
                                <span className="bg-gray-800 px-3 py-1 font-bold rounded">
                                    {movie.type === 'series' ? 'Phim Bộ' : 'Phim Lẻ'}
                                </span>
                                <span className="bg-blue-600 px-3 py-1 font-bold rounded uppercase text-xs">
                                    {movie.status === 'completed' ? 'Hoàn thành' : 'Đang ra'}
                                </span>
                                <span className="bg-gray-800 px-3 py-1 font-bold rounded">Tập: {episodes.length}</span>
                            </div>

                            {/* Danh sách Thể loại */}
                            <div className="flex flex-wrap gap-2">
                                {movie.genres?.map((genre) => (
                                    <Link
                                        key={genre.id}
                                        to={`/search?genre_id=${genre.id}`}
                                        className="text-sm font-bold text-gray-300 hover:text-yellow-400 transition-colors"
                                    >
                                        #{genre.name}
                                    </Link>
                                ))}
                            </div>

                            {/* Tóm tắt nội dung */}
                            <div className="mt-4 max-w-3xl">
                                <p className={`text-gray-300 leading-relaxed ${!showFullDesc ? 'line-clamp-3' : ''}`}>
                                    {movie.summary || 'Nội dung phim đang được cập nhật...'}
                                </p>
                                {movie.summary?.length > 200 && (
                                    <button
                                        onClick={() => setShowFullDesc(!showFullDesc)}
                                        className="text-yellow-400 font-black uppercase text-xs mt-2 hover:underline"
                                    >
                                        {showFullDesc ? '[ Thu gọn ]' : '[ Xem thêm nội dung ]'}
                                    </button>
                                )}
                            </div>

                            {/* Nút tác vụ chính */}
                            <div className="flex gap-4 mt-6">
                                {firstEpisode ? (
                                    <Link
                                        to={`/watch/${movie.id}/${firstEpisode.id}`}
                                        className="flex items-center gap-2 px-8 py-4 bg-yellow-400 text-black font-black uppercase text-lg border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                        Xem ngay
                                    </Link>
                                ) : (
                                    <button disabled className="px-8 py-4 bg-gray-700 text-gray-500 font-black uppercase border-2 border-gray-600 cursor-not-allowed">
                                        Phim sắp chiếu
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. KHU VỰC THÔNG TIN CHI TIẾT DƯỚI BANNER */}
                <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
                    <div className="space-y-12">
                        {/* DANH SÁCH TẬP PHIM */}
                        {episodes.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-yellow-400"></span>
                                    Danh sách tập phim
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {episodes.map((ep) => (
                                        <Link
                                            key={ep.id}
                                            to={`/watch/${movie.id}/${ep.id}`}
                                            className="group bg-gray-900 border border-gray-800 p-4 hover:border-yellow-400 transition-all text-center"
                                        >
                                            <div className="font-black text-xl group-hover:text-yellow-400">Tập {ep.episode_number}</div>
                                            {ep.title && <div className="text-[10px] text-gray-500 uppercase mt-1 truncate">{ep.title}</div>}
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* TRAILER PHIM */}
                        {movie.trailer_url && (
                            <section>
                                <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-yellow-400"></span>
                                    Video Trailer
                                </h2>
                                <div className="aspect-video bg-black border-4 border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                                    <iframe
                                        src={movie.trailer_url}
                                        title={`${movie.title} - Official Trailer`}
                                        className="w-full h-full"
                                        allowFullScreen
                                    />
                                </div>
                            </section>
                        )}
                    </div>

                    {/* CỘT PHỤ (SIDEBAR): ĐẠO DIỄN, DIỄN VIÊN */}
                    <aside className="space-y-8">
                        {/* Thông tin bổ sung */}
                        <div className="bg-gray-900 p-6 border border-gray-800 rounded-xl space-y-4">
                            <h3 className="font-black uppercase text-gray-500 text-sm tracking-widest border-b border-gray-800 pb-2">Thông tin chi tiết</h3>
                            
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 uppercase font-bold">Đạo diễn</span>
                                <span className="text-white font-bold">{movie.directors?.map(d => d.name).join(', ') || 'Đang cập nhật'}</span>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 uppercase font-bold">Quốc gia</span>
                                <span className="text-white font-bold">{movie.countries?.map(c => c.name).join(', ') || 'Đang cập nhật'}</span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 uppercase font-bold">Lượt xem</span>
                                <span className="text-white font-bold">{Number(movie.view_count || 0).toLocaleString()} views</span>
                            </div>
                        </div>

                        {/* Diễn viên */}
                        {movie.actors?.length > 0 && (
                            <section>
                                <h3 className="font-black uppercase text-gray-500 text-sm tracking-widest border-b border-gray-800 pb-4 mb-4">Diễn viên chính</h3>
                                <div className="space-y-3">
                                    {movie.actors.slice(0, 10).map((actor) => (
                                        <div key={actor.id} className="flex items-center gap-3 group cursor-pointer">
                                            <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700 overflow-hidden flex-shrink-0 group-hover:border-yellow-400 transition-colors">
                                                {actor.avatar_url ? (
                                                    <img src={actor.avatar_url} alt={actor.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-black uppercase">
                                                        {actor.name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-gray-300 font-bold group-hover:text-white transition-colors">{actor.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </aside>
                </div>
            </div>
        </ViewerLayout>
    );
}
