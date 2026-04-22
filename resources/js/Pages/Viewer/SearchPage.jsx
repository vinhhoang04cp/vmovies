import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { publicApi } from '@/Services/publicApi';
import ViewerLayout from '@/Layouts/ViewerLayout';
import MovieCard from '@/Components/Viewer/MovieCard';

/**
 * extractList - Hàm chuẩn hóa dữ liệu danh sách trả về từ API.
 */
function extractList(res) {
    if (!res.success) return [];
    const backendData = res.data?.data;
    if (Array.isArray(backendData)) return backendData;
    if (backendData?.data && Array.isArray(backendData.data)) return backendData.data;
    return [];
}

/**
 * extractPagination - Hàm trích xuất thông tin phân trang của Laravel.
 * Dữ liệu này cần thiết để điều khiển các nút chuyển trang (Trang trước, Trang sau, Số trang).
 */
function extractPagination(res) {
    if (!res.success) return null;
    const backendData = res.data?.data;
    if (backendData?.meta) return backendData.meta;
    if (res.data?.meta) return res.data.meta;
    if (backendData?.current_page) return backendData;
    return null;
}

/**
 * SearchPage - Trang tìm kiếm và lọc phim tổng hợp.
 * 
 * Các tính năng:
 * 1. Tìm kiếm theo từ khóa (query).
 * 2. Lọc theo Thể loại, Quốc gia, và Loại phim (Bộ/Lẻ).
 * 3. Sắp xếp linh hoạt (Mới nhất, Xem nhiều, Đánh giá cao,...).
 * 4. Đồng bộ hóa bộ lọc với URL (Search Params) giúp người dùng có thể chia sẻ liên kết kết quả.
 * 5. Phân trang dữ liệu (Pagination).
 */
export default function SearchPage() {
    // Sử dụng useSearchParams để đọc và ghi các tham số trên URL (VD: ?q=naruto&genre_id=1).
    const [searchParams, setSearchParams] = useSearchParams();
    
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [movies, setMovies] = useState([]);      // Danh sách phim khớp với bộ lọc.
    const [genres, setGenres] = useState([]);      // Toàn bộ thể loại để hiển thị trong dropdown.
    const [countries, setCountries] = useState([]); // Toàn bộ quốc gia để hiển thị trong dropdown.
    const [loading, setLoading] = useState(true);   // Trạng thái chờ tải dữ liệu.
    const [pagination, setPagination] = useState(null); // Lưu metadata phân trang.

    // --- LẤY CÁC GIÁ TRỊ LỌC TỪ URL ---
    const query = searchParams.get('q') || '';
    const genreId = searchParams.get('genre_id') || '';
    const countryId = searchParams.get('country_id') || '';
    const type = searchParams.get('type') || '';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortDir = searchParams.get('sort_dir') || 'desc';
    const page = searchParams.get('page') || '1';

    /**
     * Effect: Tải danh sách Thể loại và Quốc gia một lần duy nhất khi trang nạp.
     * Phục vụ cho các bộ lọc tĩnh trong dropdown.
     */
    useEffect(() => {
        const fetchFilters = async () => {
            const [genreRes, countryRes] = await Promise.all([
                publicApi.getGenres({ per_page: 50 }),
                publicApi.getCountries({ per_page: 50 }),
            ]);
            setGenres(extractList(genreRes));
            setCountries(extractList(countryRes));
        };
        fetchFilters();
    }, []);

    /**
     * Effect: Tải danh sách phim mỗi khi bất kỳ bộ lọc nào thay đổi.
     */
    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                // Chuẩn bị các tham số gửi lên API.
                const params = { per_page: 24, page };
                if (query) params.search = query;
                if (genreId) params.genre_id = genreId;
                if (countryId) params.country_id = countryId;
                if (type) params.type = type;
                if (sortBy) params.sort_by = sortBy;
                if (sortDir) params.sort_dir = sortDir;

                const res = await publicApi.getMovies(params);
                setMovies(extractList(res));
                setPagination(extractPagination(res));
            } catch (err) {
                console.error('Lỗi khi thực hiện tìm kiếm:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();

        // Tự động cập nhật tiêu đề tab trình duyệt theo ngữ cảnh tìm kiếm.
        const titleParts = ['Tìm kiếm'];
        if (query) titleParts.push(`"${query}"`);
        if (type === 'single') titleParts.push('- Phim Lẻ');
        if (type === 'series') titleParts.push('- Phim Bộ');
        document.title = `${titleParts.join(' ')} - VMovies`;
    }, [query, genreId, countryId, type, sortBy, sortDir, page]);

    /**
     * updateFilter - Cập nhật một tham số lọc mới vào URL.
     * Khi lọc thay đổi, luôn reset về trang 1.
     */
    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        newParams.delete('page'); // Reset trang.
        setSearchParams(newParams);
    };

    /**
     * goToPage - Chuyển sang một trang dữ liệu khác.
     */
    const goToPage = (p) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', p);
        setSearchParams(newParams);
        window.scrollTo(0, 0); // Cuộn lên đầu trang sau khi chuyển.
    };

    const activeGenre = genres.find(g => g.id.toString() === genreId);
    const activeCountry = countries.find(c => c.id.toString() === countryId);

    return (
        <ViewerLayout>
            <div className="search-page container mx-auto px-4 py-12">
                {/* 1. TIÊU ĐỀ TRANG VÀ THÔNG TIN TỔNG QUAN */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <span className="w-2 h-10 bg-yellow-400"></span>
                            {query ? (
                                <>Tìm kiếm: <span className="text-yellow-400">"{query}"</span></>
                            ) : type === 'single' ? (
                                'Kho Phim Lẻ'
                            ) : type === 'series' ? (
                                'Kho Phim Bộ'
                            ) : activeGenre ? (
                                <>Thể loại: <span className="text-yellow-400">{activeGenre.name}</span></>
                            ) : activeCountry ? (
                                <>Quốc gia: <span className="text-yellow-400">{activeCountry.name}</span></>
                            ) : (
                                'Tất cả phim'
                            )}
                        </h1>
                        {pagination && (
                            <p className="text-gray-500 mt-2 font-bold uppercase text-xs tracking-widest">
                                Khám phá {pagination.total || movies.length} kết quả phù hợp
                            </p>
                        )}
                    </div>

                    {/* Sắp xếp nhanh */}
                    <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 p-2 rounded-xl">
                        <span className="text-xs font-black text-gray-500 uppercase ml-2">Sắp xếp:</span>
                        <select
                            className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer pr-4"
                            value={`${sortBy}-${sortDir}`}
                            onChange={(e) => {
                                const [sb, sd] = e.target.value.split('-');
                                const newParams = new URLSearchParams(searchParams);
                                newParams.set('sort_by', sb);
                                newParams.set('sort_dir', sd);
                                newParams.delete('page');
                                setSearchParams(newParams);
                            }}
                        >
                            <option value="created_at-desc">Mới nhất</option>
                            <option value="created_at-asc">Cũ nhất</option>
                            <option value="view_count-desc">Xem nhiều nhất</option>
                            <option value="average_rating-desc">Đánh giá cao</option>
                            <option value="title-asc">Tên A-Z</option>
                        </select>
                    </div>
                </div>

                {/* 2. BỘ LỌC CHUYÊN SÂU */}
                <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {/* Lọc theo Loại phim */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Định dạng phim</label>
                        <div className="flex gap-2">
                            {['', 'series', 'single'].map((t) => (
                                <button
                                    key={t}
                                    className={`flex-1 py-3 px-4 border-2 font-black uppercase text-xs transition-all ${
                                        type === t 
                                        ? 'bg-yellow-400 border-black text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]' 
                                        : 'bg-gray-900 border-gray-800 text-gray-500'
                                    }`}
                                    onClick={() => updateFilter('type', t)}
                                >
                                    {t === '' ? 'Tất cả' : t === 'series' ? 'Phim Bộ' : 'Phim Lẻ'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lọc theo Thể loại */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Chủ đề / Thể loại</label>
                        <select
                            className="w-full bg-gray-900 border-2 border-gray-800 p-3 text-white font-bold focus:border-yellow-400 outline-none transition-colors"
                            value={genreId}
                            onChange={(e) => updateFilter('genre_id', e.target.value)}
                        >
                            <option value="">Tất cả chủ đề</option>
                            {genres.map((g) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Lọc theo Quốc gia */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Khu vực / Quốc gia</label>
                        <select
                            className="w-full bg-gray-900 border-2 border-gray-800 p-3 text-white font-bold focus:border-yellow-400 outline-none transition-colors"
                            value={countryId}
                            onChange={(e) => updateFilter('country_id', e.target.value)}
                        >
                            <option value="">Toàn thế giới</option>
                            {countries.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 3. KẾT QUẢ TÌM KIẾM */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-gray-900 animate-pulse rounded-xl border border-gray-800" />
                        ))}
                    </div>
                ) : movies.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {movies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 border-4 border-gray-800">
                            <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black uppercase text-white mb-2">Hệ thống không tìm thấy phim phù hợp</h3>
                        <p className="text-gray-500 max-w-sm">Vui lòng thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại các bộ lọc để có kết quả tốt hơn.</p>
                    </div>
                )}

                {/* 4. PHÂN TRANG (PAGINATION) */}
                {pagination && pagination.last_page > 1 && (
                    <div className="mt-16 flex justify-center items-center gap-2">
                        {pagination.current_page > 1 && (
                            <button
                                className="w-12 h-12 bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all"
                                onClick={() => goToPage(pagination.current_page - 1)}
                            >
                                ←
                            </button>
                        )}

                        {Array.from({ length: Math.min(pagination.last_page, 5) }, (_, i) => {
                            let pageNum;
                            if (pagination.last_page <= 5) pageNum = i + 1;
                            else if (pagination.current_page <= 3) pageNum = i + 1;
                            else if (pagination.current_page >= pagination.last_page - 2) pageNum = pagination.last_page - 4 + i;
                            else pageNum = pagination.current_page - 2 + i;

                            return (
                                <button
                                    key={pageNum}
                                    className={`w-12 h-12 font-black border-2 transition-all ${
                                        pageNum === pagination.current_page 
                                        ? 'bg-white border-black text-black shadow-[4px_4px_0_0_rgba(250,204,21,1)]' 
                                        : 'bg-gray-900 border-gray-800 text-gray-400'
                                    }`}
                                    onClick={() => goToPage(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        {pagination.current_page < pagination.last_page && (
                            <button
                                className="w-12 h-12 bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all"
                                onClick={() => goToPage(pagination.current_page + 1)}
                            >
                                →
                            </button>
                        )}
                    </div>
                )}
            </div>
        </ViewerLayout>
    );
}
