import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { publicApi } from '@/Services/publicApi';
import ViewerLayout from '@/Layouts/ViewerLayout';
import MovieCard from '@/Components/Viewer/MovieCard';

function extractList(res) {
    if (!res.success) return [];
    const backendData = res.data?.data;
    if (Array.isArray(backendData)) return backendData;
    if (backendData?.data && Array.isArray(backendData.data)) return backendData.data;
    return [];
}

function extractPagination(res) {
    if (!res.success) return null;
    // Laravel pagination: res.data = { success, data: { data: [...], meta: {...} } }
    const backendData = res.data?.data;
    if (backendData?.meta) return backendData.meta;
    // Or it could be at res.data level
    if (res.data?.meta) return res.data.meta;
    // Laravel puts current_page, last_page etc at root level of paginated response
    if (backendData?.current_page) return backendData;
    return null;
}

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);

    const query = searchParams.get('q') || '';
    const genreId = searchParams.get('genre_id') || '';
    const countryId = searchParams.get('country_id') || '';
    const type = searchParams.get('type') || '';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortDir = searchParams.get('sort_dir') || 'desc';
    const page = searchParams.get('page') || '1';

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

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
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
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();

        // Update page title
        const titleParts = ['Tìm kiếm'];
        if (query) titleParts.push(`"${query}"`);
        if (type === 'single') titleParts.push('- Phim Lẻ');
        if (type === 'series') titleParts.push('- Phim Bộ');
        document.title = `${titleParts.join(' ')} - VMovies`;
    }, [query, genreId, countryId, type, sortBy, sortDir, page]);

    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        newParams.delete('page'); // Reset page on filter change
        setSearchParams(newParams);
    };

    const goToPage = (p) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', p);
        setSearchParams(newParams);
        window.scrollTo(0, 0);
    };

    const activeGenre = genres.find(g => g.id.toString() === genreId);
    const activeCountry = countries.find(c => c.id.toString() === countryId);

    return (
        <ViewerLayout>
            <div className="search-page">
                {/* Search header */}
                <div className="search-page__header">
                    <h1 className="search-page__title">
                        {query ? (
                            <>Kết quả tìm kiếm: <span className="search-page__query">"{query}"</span></>
                        ) : type === 'single' ? (
                            'Phim Lẻ'
                        ) : type === 'series' ? (
                            'Phim Bộ'
                        ) : activeGenre ? (
                            <>Thể loại: <span className="search-page__query">{activeGenre.name}</span></>
                        ) : activeCountry ? (
                            <>Quốc gia: <span className="search-page__query">{activeCountry.name}</span></>
                        ) : (
                            'Tất cả phim'
                        )}
                    </h1>
                    {pagination && (
                        <p className="search-page__count">
                            Tìm thấy {pagination.total || movies.length} kết quả
                        </p>
                    )}
                </div>

                {/* Filters */}
                <div className="search-page__filters">
                    {/* Type filter */}
                    <div className="search-page__filter-group">
                        <button
                            className={`search-page__filter-btn ${!type ? 'search-page__filter-btn--active' : ''}`}
                            onClick={() => updateFilter('type', '')}
                        >
                            Tất cả
                        </button>
                        <button
                            className={`search-page__filter-btn ${type === 'series' ? 'search-page__filter-btn--active' : ''}`}
                            onClick={() => updateFilter('type', 'series')}
                        >
                            Phim Bộ
                        </button>
                        <button
                            className={`search-page__filter-btn ${type === 'single' ? 'search-page__filter-btn--active' : ''}`}
                            onClick={() => updateFilter('type', 'single')}
                        >
                            Phim Lẻ
                        </button>
                    </div>

                    {/* Genre filter */}
                    <select
                        className="search-page__filter-select"
                        value={genreId}
                        onChange={(e) => updateFilter('genre_id', e.target.value)}
                    >
                        <option value="">Tất cả thể loại</option>
                        {genres.map((g) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>

                    {/* Country filter */}
                    <select
                        className="search-page__filter-select"
                        value={countryId}
                        onChange={(e) => updateFilter('country_id', e.target.value)}
                    >
                        <option value="">Tất cả quốc gia</option>
                        {countries.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        className="search-page__filter-select"
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
                        <option value="title-desc">Tên Z-A</option>
                    </select>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="search-page__grid">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="movie-card movie-card--skeleton">
                                <div className="movie-card__poster">
                                    <div className="movie-card__skeleton" />
                                </div>
                                <div className="movie-card__info">
                                    <div className="movie-card__skeleton-text" />
                                    <div className="movie-card__skeleton-text movie-card__skeleton-text--short" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : movies.length > 0 ? (
                    <div className="search-page__grid">
                        {movies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                ) : (
                    <div className="search-page__empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="search-page__empty-icon">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <h3>Không tìm thấy phim nào</h3>
                        <p>Thử thay đổi từ khóa hoặc bộ lọc</p>
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="search-page__pagination">
                        {pagination.current_page > 1 && (
                            <button
                                className="search-page__page-btn"
                                onClick={() => goToPage(pagination.current_page - 1)}
                            >
                                ← Trước
                            </button>
                        )}

                        {Array.from({ length: Math.min(pagination.last_page, 7) }, (_, i) => {
                            let pageNum;
                            if (pagination.last_page <= 7) {
                                pageNum = i + 1;
                            } else if (pagination.current_page <= 4) {
                                pageNum = i + 1;
                            } else if (pagination.current_page >= pagination.last_page - 3) {
                                pageNum = pagination.last_page - 6 + i;
                            } else {
                                pageNum = pagination.current_page - 3 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    className={`search-page__page-btn ${pageNum === pagination.current_page ? 'search-page__page-btn--active' : ''}`}
                                    onClick={() => goToPage(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        {pagination.current_page < pagination.last_page && (
                            <button
                                className="search-page__page-btn"
                                onClick={() => goToPage(pagination.current_page + 1)}
                            >
                                Sau →
                            </button>
                        )}
                    </div>
                )}
            </div>
        </ViewerLayout>
    );
}
