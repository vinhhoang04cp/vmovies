import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '@/Services/publicApi';
import ViewerLayout from '@/Layouts/ViewerLayout';

/**
 * extractItem - Helper trích xuất một đối tượng duy nhất từ phản hồi API.
 */
function extractItem(res) {
    if (!res.success) return null;
    const d = res.data?.data;
    if (d && d.id) return d;
    if (d && d.data && d.data.id) return d.data;
    return d || null;
}

/**
 * extractList - Helper trích xuất danh sách từ phản hồi API (có hỗ trợ Laravel Pagination).
 */
function extractList(res) {
    if (!res.success) return [];
    const backendData = res.data?.data;
    if (Array.isArray(backendData)) return backendData;
    if (backendData?.data && Array.isArray(backendData.data)) return backendData.data;
    return [];
}

/**
 * WatchPage - Trang xem phim chi tiết.
 * 
 * Logic chính:
 * 1. Tải thông tin phim, tập phim hiện tại và danh sách các tập phim liên quan.
 * 2. Tự động nhận diện nguồn video (YouTube, Embed Iframe, hoặc tệp MP4 trực tiếp).
 * 3. Hỗ trợ chuyển tập nhanh (Next/Prev) và chọn tập từ danh sách.
 * 4. Tối ưu hóa giao diện cho trải nghiệm xem phim "Cinema" (nền tối, tập trung vào trình phát).
 */
export default function WatchPage() {
    const { movieId, episodeId } = useParams();
    
    // --- STATE QUẢN LÝ ---
    const [movie, setMovie] = useState(null);      // Thông tin phim tổng quát.
    const [episode, setEpisode] = useState(null);  // Dữ liệu tập phim đang xem.
    const [episodes, setEpisodes] = useState([]);  // Danh sách toàn bộ các tập của phim này.
    const [loading, setLoading] = useState(true);   // Trạng thái chờ nạp dữ liệu.

    /**
     * Effect: Nạp toàn bộ dữ liệu cần thiết khi vào trang hoặc chuyển tập.
     */
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Gọi song song 3 API để tiết kiệm thời gian nạp trang.
                const [movieRes, episodeRes, episodesRes] = await Promise.all([
                    publicApi.getMovie(movieId),
                    publicApi.getEpisode(movieId, episodeId),
                    publicApi.getEpisodes(movieId, { per_page: 200 }),
                ]);

                const movieData = extractItem(movieRes);
                if (movieData) setMovie(movieData);

                const episodeData = extractItem(episodeRes);
                if (episodeData) {
                    setEpisode(episodeData);
                    // Cập nhật tiêu đề tab trình duyệt theo tên phim và tập.
                    document.title = `${movieData?.title || ''} - Tập ${episodeData.episode_number} - VMovies`;
                }

                setEpisodes(extractList(episodesRes));
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu xem phim:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0); // Cuộn lên đầu trang khi chuyển tập.
    }, [movieId, episodeId]);

    // --- LOGIC ĐIỀU HƯỚNG TẬP PHIM ---
    const currentIndex = episodes.findIndex(ep => ep.id === parseInt(episodeId));
    const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
    const nextEpisode = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

    if (loading) {
        return (
            <ViewerLayout>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="aspect-video bg-gray-900 animate-pulse rounded-2xl mb-8 border border-gray-800" />
                    <div className="h-10 bg-gray-900 animate-pulse rounded-lg w-1/3 mb-4" />
                    <div className="h-20 bg-gray-900 animate-pulse rounded-lg w-full" />
                </div>
            </ViewerLayout>
        );
    }

    if (!movie || !episode) {
        return (
            <ViewerLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                    <h2 className="text-3xl font-black text-white uppercase mb-4">Không tìm thấy tập phim</h2>
                    <Link to="/" className="px-8 py-3 bg-yellow-400 text-black font-black uppercase rounded-xl hover:bg-yellow-500 transition-all">
                        ← Trở về trang chủ
                    </Link>
                </div>
            </ViewerLayout>
        );
    }

    /**
     * renderPlayer - Hàm xử lý logic hiển thị trình phát video dựa trên nguồn dữ liệu.
     */
    const renderPlayer = () => {
        if (!episode.video_url) {
            return (
                <div className="aspect-video bg-gray-900 flex flex-col items-center justify-center text-center p-8 border-4 border-dashed border-gray-800 rounded-3xl">
                    <svg className="w-20 h-20 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Video hiện đang được xử lý hoặc chưa cập nhật</p>
                </div>
            );
        }

        const url = episode.video_url;

        // Trường hợp 1: Link YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('youtu.be')
                ? url.split('/').pop()
                : new URL(url).searchParams.get('v') || url.split('/').pop();
            return (
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title={episode.title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="w-full aspect-video rounded-3xl shadow-2xl border-2 border-gray-800"
                />
            );
        }

        // Trường hợp 2: Link Embed từ bên thứ ba (HDO, Fmovies, v.v.)
        if (url.includes('embed') || url.includes('player')) {
            return (
                <iframe
                    src={url}
                    title={episode.title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="w-full aspect-video rounded-3xl shadow-2xl border-2 border-gray-800"
                />
            );
        }

        // Trường hợp 3: Tệp video trực tiếp (MP4, WEBM...)
        return (
            <video controls autoPlay className="w-full aspect-video rounded-3xl shadow-2xl bg-black border-2 border-gray-800">
                <source src={url} />
                Trình duyệt của bạn không hỗ trợ phát video trực tiếp.
            </video>
        );
    };

    return (
        <ViewerLayout>
            <div className="watch-page bg-black/30 pb-20">
                {/* 1. THANH ĐIỀU HƯỚNG NHANH */}
                <div className="container mx-auto px-4 py-6 flex items-center gap-4">
                    <Link 
                        to={`/movie/${movie.id}`} 
                        className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-white hover:bg-yellow-400 hover:text-black transition-all"
                        title="Quay lại chi tiết phim"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                            {movie.title}
                        </h1>
                        <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
                            {episode.title ? episode.title : `Đang xem: Tập ${episode.episode_number}`}
                        </p>
                    </div>
                </div>

                {/* 2. KHU VỰC TRÌNH PHÁT VIDEO (MAIN PLAYER) */}
                <div className="container mx-auto px-0 md:px-4 mb-10">
                    <div className="relative group">
                        {renderPlayer()}
                        
                        {/* Overlay điều hướng nhanh khi di chuột (Optional) */}
                        <div className="absolute top-1/2 left-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                             {prevEpisode && (
                                <Link to={`/watch/${movieId}/${prevEpisode.id}`} className="p-4 bg-black/60 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-all">
                                    ←
                                </Link>
                             )}
                        </div>
                        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                             {nextEpisode && (
                                <Link to={`/watch/${movieId}/${nextEpisode.id}`} className="p-4 bg-black/60 rounded-full text-white hover:bg-yellow-400 hover:text-black transition-all">
                                    →
                                </Link>
                             )}
                        </div>
                    </div>
                </div>

                {/* 3. ĐIỀU KHIỂN VÀ DANH SÁCH TẬP PHIM */}
                <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* Cột trái: Thông tin và Chuyển tập */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex flex-wrap gap-4">
                            {prevEpisode && (
                                <Link
                                    to={`/watch/${movieId}/${prevEpisode.id}`}
                                    className="flex-1 min-w-[140px] py-4 bg-gray-900 border-2 border-gray-800 rounded-2xl text-center font-black uppercase text-sm text-gray-400 hover:border-yellow-400 hover:text-white transition-all"
                                >
                                    ← Tập trước ({prevEpisode.episode_number})
                                </Link>
                            )}
                            {nextEpisode && (
                                <Link
                                    to={`/watch/${movieId}/${nextEpisode.id}`}
                                    className="flex-1 min-w-[140px] py-4 bg-yellow-400 border-2 border-black rounded-2xl text-center font-black uppercase text-sm text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all"
                                >
                                    Tập tiếp theo ({nextEpisode.episode_number}) →
                                </Link>
                            )}
                        </div>

                        <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-3xl">
                            <h2 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter">Nội dung phim</h2>
                            <p className="text-gray-400 leading-relaxed text-lg italic">
                                {movie.summary || "Đang cập nhật nội dung cho bộ phim này..."}
                            </p>
                        </div>
                    </div>

                    {/* Cột phải: Danh sách tập phim */}
                    <div className="space-y-6">
                        <div className="bg-gray-900 border-2 border-gray-800 rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-yellow-400"></span>
                                    Danh sách tập
                                </h3>
                                <span className="text-[10px] font-black bg-gray-800 px-2 py-1 rounded text-gray-400 uppercase">
                                    {episodes.length} Tập
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {episodes.map((ep) => (
                                    <Link
                                        key={ep.id}
                                        to={`/watch/${movieId}/${ep.id}`}
                                        className={`py-3 rounded-xl text-center font-bold text-sm transition-all border-2 ${
                                            ep.id === parseInt(episodeId)
                                            ? 'bg-yellow-400 border-black text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                                            : 'bg-gray-800 border-transparent text-gray-400 hover:border-gray-600 hover:text-white'
                                        }`}
                                    >
                                        {ep.episode_number}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Tip nhỏ cho người dùng */}
                        <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl">
                            <p className="text-blue-400 text-xs font-bold leading-relaxed">
                                <span className="text-blue-300 uppercase block mb-1">💡 Mẹo nhỏ:</span>
                                Nếu video bị lag, hãy thử tải lại trang hoặc kiểm tra kết nối mạng của bạn. Hệ thống hỗ trợ tốt nhất trên Chrome và Safari.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ViewerLayout>
    );
}
