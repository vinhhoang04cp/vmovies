import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '@/Services/publicApi';
import ViewerLayout from '@/Layouts/ViewerLayout';
import HeroBanner from '@/Components/Viewer/HeroBanner';
import MovieRow from '@/Components/Viewer/MovieRow';

/**
 * Trích xuất mảng data từ API response.
 * apiClient trả { success, data: { success, data: { data: [...], meta, links } } }
 * hoặc data trực tiếp nếu không phải paginated.
 */
function extractList(res) {
    if (!res.success) return [];
    // res.data = backend JSON: { success, data: { data: [...], meta } }
    const backendData = res.data?.data;
    if (Array.isArray(backendData)) return backendData;
    if (backendData?.data && Array.isArray(backendData.data)) return backendData.data;
    return [];
}

export default function HomePage() {
    const [heroMovies, setHeroMovies] = useState([]);
    const [newMovies, setNewMovies] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [seriesMovies, setSeriesMovies] = useState([]);
    const [singleMovies, setSingleMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'VMovies - Xem phim online miễn phí';
        const fetchAll = async () => {
            try {
                const [newRes, popularRes, seriesRes, singleRes, genreRes] = await Promise.all([
                    publicApi.getMovies({ sort_by: 'created_at', sort_dir: 'desc', per_page: 15 }),
                    publicApi.getMovies({ sort_by: 'view_count', sort_dir: 'desc', per_page: 15 }),
                    publicApi.getMovies({ type: 'series', sort_by: 'created_at', sort_dir: 'desc', per_page: 15 }),
                    publicApi.getMovies({ type: 'single', sort_by: 'created_at', sort_dir: 'desc', per_page: 15 }),
                    publicApi.getGenres({ per_page: 20 }),
                ]);

                const newData = extractList(newRes);
                setNewMovies(newData);
                setHeroMovies(newData.filter(m => m.banner_url).slice(0, 5));

                setPopularMovies(extractList(popularRes));
                setSeriesMovies(extractList(seriesRes));
                setSingleMovies(extractList(singleRes));
                setGenres(extractList(genreRes));
            } catch (err) {
                console.error('Failed to fetch homepage data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Genre icon mapping
    const genreIcons = {
        'Hành Động': '💥', 'Tình Cảm': '💕', 'Hài Hước': '😂', 'Kinh Dị': '👻',
        'Viễn Tưởng': '🚀', 'Hoạt Hình': '🎨', 'Tâm Lý': '🧠', 'Phiêu Lưu': '🗺️',
        'Hình Sự': '🔍', 'Chiến Tranh': '⚔️', 'Âm Nhạc': '🎵', 'Thể Thao': '⚽',
        'Gia Đình': '👨‍👩‍👧‍👦', 'Cổ Trang': '🏯', 'Võ Thuật': '🥋', 'Khoa Học': '🔬',
    };

    return (
        <ViewerLayout>
            <div className="home-page">
                {/* Hero Banner */}
                <HeroBanner movies={heroMovies} />

                {/* Genre Quick Access */}
                {genres.length > 0 && (
                    <section className="home-page__genres">
                        <h2 className="home-page__section-title">Bạn đang quan tâm gì?</h2>
                        <div className="home-page__genre-grid">
                            {genres.map((genre) => (
                                <Link
                                    key={genre.id}
                                    to={`/search?genre_id=${genre.id}`}
                                    className="home-page__genre-card"
                                >
                                    <span className="home-page__genre-icon">
                                        {genreIcons[genre.name] || '🎬'}
                                    </span>
                                    <span className="home-page__genre-name">{genre.name}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Movie Sections */}
                <MovieRow
                    title="Phim Mới Cập Nhật"
                    movies={newMovies}
                    linkTo="/search?sort_by=created_at&sort_dir=desc"
                    loading={loading}
                />

                <MovieRow
                    title="Phim Phổ Biến"
                    movies={popularMovies}
                    linkTo="/search?sort_by=view_count&sort_dir=desc"
                    loading={loading}
                />

                <MovieRow
                    title="Phim Bộ Hot"
                    movies={seriesMovies}
                    linkTo="/search?type=series"
                    loading={loading}
                />

                <MovieRow
                    title="Phim Lẻ Mới"
                    movies={singleMovies}
                    linkTo="/search?type=single"
                    loading={loading}
                />
            </div>
        </ViewerLayout>
    );
}
