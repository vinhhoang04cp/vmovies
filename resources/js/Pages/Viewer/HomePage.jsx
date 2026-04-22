import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '@/Services/publicApi';
import ViewerLayout from '@/Layouts/ViewerLayout';
import HeroBanner from '@/Components/Viewer/HeroBanner';
import MovieRow from '@/Components/Viewer/MovieRow';

/**
 * extractList - Hàm bổ trợ giúp chuẩn hóa dữ liệu trả về từ API.
 * 
 * Do cấu trúc response của Laravel/Inertia có thể bọc qua nhiều lớp (data.data),
 * hàm này giúp lấy ra mảng danh sách thực sự một cách an toàn.
 * 
 * @param {Object} res - Response từ API client.
 * @returns {Array} - Danh sách các đối tượng (Movies/Genres).
 */
function extractList(res) {
    if (!res.success) return [];
    // Cấu trúc backend: { success, data: { data: [...], meta: {...} } }
    const backendData = res.data?.data;
    if (Array.isArray(backendData)) return backendData;
    if (backendData?.data && Array.isArray(backendData.data)) return backendData.data;
    return [];
}

/**
 * HomePage - Trang chủ dành cho người xem (Public side).
 * 
 * Các thành phần chính:
 * 1. HeroBanner: Hiển thị các phim tiêu biểu, có banner đẹp ở đầu trang.
 * 2. Genre Quick Access: Danh sách thể loại giúp người dùng lọc nhanh.
 * 3. MovieRows: Hiển thị các danh mục phim khác nhau (Mới, Phổ biến, Phim bộ, Phim lẻ).
 * 
 * Logic dữ liệu:
 * - Sử dụng Promise.all để tải đồng thời nhiều danh mục phim, tối ưu hóa thời gian phản hồi.
 */
export default function HomePage() {
    // --- CÁC STATE QUẢN LÝ DANH MỤC PHIM ---
    const [heroMovies, setHeroMovies] = useState([]);    // Phim hiển thị trên Slider đầu trang.
    const [newMovies, setNewMovies] = useState([]);      // Danh sách phim mới cập nhật.
    const [popularMovies, setPopularMovies] = useState([]); // Danh sách phim xem nhiều nhất.
    const [seriesMovies, setSeriesMovies] = useState([]);   // Phim bộ (TV Series).
    const [singleMovies, setSingleMovies] = useState([]);   // Phim lẻ (Movie).
    const [genres, setGenres] = useState([]);             // Danh sách thể loại.
    const [loading, setLoading] = useState(true);         // Trạng thái chờ dữ liệu ban đầu.

    /**
     * Effect: Thực hiện truy vấn dữ liệu ngay khi trang được nạp.
     */
    useEffect(() => {
        document.title = 'VMovies - Xem phim online miễn phí';
        
        const fetchAll = async () => {
            try {
                // Tải song song tất cả các nguồn dữ liệu cần thiết cho trang chủ.
                const [newRes, popularRes, seriesRes, singleRes, genreRes] = await Promise.all([
                    publicApi.getMovies({ sort_by: 'created_at', sort_dir: 'desc', per_page: 15 }),
                    publicApi.getMovies({ sort_by: 'view_count', sort_dir: 'desc', per_page: 15 }),
                    publicApi.getMovies({ type: 'series', sort_by: 'created_at', sort_dir: 'desc', per_page: 15 }),
                    publicApi.getMovies({ type: 'single', sort_by: 'created_at', sort_dir: 'desc', per_page: 15 }),
                    publicApi.getGenres({ per_page: 20 }),
                ]);

                // Xử lý và gán dữ liệu cho phim mới.
                const newData = extractList(newRes);
                setNewMovies(newData);
                
                // Lấy 5 phim có ảnh Banner để hiển thị trên Hero section.
                setHeroMovies(newData.filter(m => m.banner_url).slice(0, 5));

                // Gán dữ liệu cho các hàng phim khác.
                setPopularMovies(extractList(popularRes));
                setSeriesMovies(extractList(seriesRes));
                setSingleMovies(extractList(singleRes));
                setGenres(extractList(genreRes));
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu trang chủ:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    /**
     * genreIcons: Bản đồ ánh xạ biểu tượng cảm xúc cho từng thể loại phim.
     * Giúp giao diện sinh động hơn mà không cần nạp quá nhiều file ảnh.
     */
    const genreIcons = {
        'Hành Động': '💥', 'Tình Cảm': '💕', 'Hài Hước': '😂', 'Kinh Dị': '👻',
        'Viễn Tưởng': '🚀', 'Hoạt Hình': '🎨', 'Tâm Lý': '🧠', 'Phiêu Lưu': '🗺️',
        'Hình Sự': '🔍', 'Chiến Tranh': '⚔️', 'Âm Nhạc': '🎵', 'Thể Thao': '⚽',
        'Gia Đình': '👨‍👩‍👧‍👦', 'Cổ Trang': '🏯', 'Võ Thuật': '🥋', 'Khoa Học': '🔬',
    };

    return (
        <ViewerLayout>
            <div className="home-page pb-12">
                {/* 1. KHU VỰC HERO BANNER (Dạng Slider) */}
                <HeroBanner movies={heroMovies} />

                {/* 2. KHU VỰC TRUY CẬP NHANH THEO THỂ LOẠI */}
                {genres.length > 0 && (
                    <section className="home-page__genres container mx-auto px-4 mt-12 mb-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                            <span className="w-2 h-8 bg-yellow-400"></span>
                            Bạn đang muốn xem gì?
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {genres.map((genre) => (
                                <Link
                                    key={genre.id}
                                    to={`/search?genre_id=${genre.id}`}
                                    className="flex items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-yellow-400 hover:bg-gray-800 transition-all group"
                                >
                                    <span className="text-2xl group-hover:scale-125 transition-transform">
                                        {genreIcons[genre.name] || '🎬'}
                                    </span>
                                    <span className="text-gray-300 font-bold group-hover:text-white truncate">
                                        {genre.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. DANH SÁCH CÁC DÒNG PHIM (MOVIE ROWS) */}
                <div className="space-y-4">
                    {/* Hàng phim mới cập nhật */}
                    <MovieRow
                        title="Phim Mới Cập Nhật"
                        movies={newMovies}
                        linkTo="/search?sort_by=created_at&sort_dir=desc"
                        loading={loading}
                    />

                    {/* Hàng phim xem nhiều */}
                    <MovieRow
                        title="Phim Phổ Biến"
                        movies={popularMovies}
                        linkTo="/search?sort_by=view_count&sort_dir=desc"
                        loading={loading}
                    />

                    {/* Hàng phim truyền hình / Anime dài tập */}
                    <MovieRow
                        title="Phim Bộ Hot"
                        movies={seriesMovies}
                        linkTo="/search?type=series"
                        loading={loading}
                    />

                    {/* Hàng phim điện ảnh */}
                    <MovieRow
                        title="Phim Lẻ Mới"
                        movies={singleMovies}
                        linkTo="/search?type=single"
                        loading={loading}
                    />
                </div>
            </div>
        </ViewerLayout>
    );
}
