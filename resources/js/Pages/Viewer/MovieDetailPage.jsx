import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '@/Services/publicApi';
import ViewerLayout from '@/Layouts/ViewerLayout';

/**
 * Trích xuất data object từ API response.
 * apiClient trả { success, data: { success, message, data: <resource> } }
 */
function extractItem(res) {
    if (!res.success) return null;
    const d = res.data?.data;
    // Nếu d có field 'id' thì đó là resource trực tiếp
    if (d && d.id) return d;
    // Nếu d là nested (paginated) thì lấy .data
    if (d && d.data && d.data.id) return d.data;
    return d || null;
}

function extractList(res) {
    if (!res.success) return [];
    const backendData = res.data?.data;
    if (Array.isArray(backendData)) return backendData;
    if (backendData?.data && Array.isArray(backendData.data)) return backendData.data;
    return [];
}

export default function MovieDetailPage() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFullDesc, setShowFullDesc] = useState(false);

    useEffect(() => {
        const fetchMovie = async () => {
            setLoading(true);
            try {
                const [movieRes, episodesRes] = await Promise.all([
                    publicApi.getMovie(id),
                    publicApi.getEpisodes(id, { per_page: 100 }),
                ]);

                const movieData = extractItem(movieRes);
                if (movieData) {
                    setMovie(movieData);
                    document.title = `${movieData.title} - VMovies`;
                }
                setEpisodes(extractList(episodesRes));
            } catch (err) {
                console.error('Failed to fetch movie:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMovie();
    }, [id]);

    if (loading) {
        return (
            <ViewerLayout>
                <div className="movie-detail movie-detail--loading">
                    <div className="movie-detail__skeleton-hero" />
                    <div className="movie-detail__skeleton-content">
                        <div className="movie-detail__skeleton-line movie-detail__skeleton-line--title" />
                        <div className="movie-detail__skeleton-line" />
                        <div className="movie-detail__skeleton-line movie-detail__skeleton-line--short" />
                    </div>
                </div>
            </ViewerLayout>
        );
    }

    if (!movie) {
        return (
            <ViewerLayout>
                <div className="movie-detail movie-detail--not-found">
                    <h2>Không tìm thấy phim</h2>
                    <p>Phim bạn yêu cầu không tồn tại hoặc đã bị xóa.</p>
                    <Link to="/" className="movie-detail__back-link">← Về trang chủ</Link>
                </div>
            </ViewerLayout>
        );
    }

    const backdropUrl = movie.banner_url || movie.poster_url;
    const firstEpisode = episodes[0];

    return (
        <ViewerLayout>
            <div className="movie-detail">
                {/* Hero backdrop */}
                <div className="movie-detail__hero">
                    {backdropUrl && (
                        <div
                            className="movie-detail__backdrop"
                            style={{ backgroundImage: `url(${backdropUrl})` }}
                        />
                    )}
                    <div className="movie-detail__hero-overlay" />

                    <div className="movie-detail__hero-content">
                        <h1 className="movie-detail__title">{movie.title}</h1>
                        {movie.original_title && (
                            <p className="movie-detail__original-title">{movie.original_title}</p>
                        )}

                        {/* Badges */}
                        <div className="movie-detail__badges">
                            {movie.average_rating > 0 && (
                                <span className="movie-detail__badge movie-detail__badge--rating">
                                    IMDb {Number(movie.average_rating).toFixed(1)}
                                </span>
                            )}
                            {movie.release_year && (
                                <span className="movie-detail__badge">{movie.release_year}</span>
                            )}
                            {movie.type && (
                                <span className="movie-detail__badge">
                                    {movie.type === 'series' ? 'Phim Bộ' : 'Phim Lẻ'}
                                </span>
                            )}
                            {movie.status && (
                                <span className="movie-detail__badge">
                                    {movie.status === 'completed' ? 'Hoàn thành' : 'Đang chiếu'}
                                </span>
                            )}
                            {episodes.length > 0 && (
                                <span className="movie-detail__badge">Tập {episodes.length}</span>
                            )}
                        </div>

                        {/* Genre tags */}
                        {movie.genres?.length > 0 && (
                            <div className="movie-detail__genres">
                                {movie.genres.map((genre) => (
                                    <Link
                                        key={genre.id}
                                        to={`/search?genre_id=${genre.id}`}
                                        className="movie-detail__genre-tag"
                                    >
                                        {genre.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        {movie.summary && (
                            <div className="movie-detail__desc-container">
                                <p className={`movie-detail__desc ${showFullDesc ? 'movie-detail__desc--full' : ''}`}>
                                    {movie.summary}
                                </p>
                                {movie.summary.length > 200 && (
                                    <button
                                        className="movie-detail__desc-toggle"
                                        onClick={() => setShowFullDesc(!showFullDesc)}
                                    >
                                        {showFullDesc ? 'Thu gọn' : 'Xem thêm'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="movie-detail__actions">
                            {firstEpisode ? (
                                <Link
                                    to={`/watch/${movie.id}/${firstEpisode.id}`}
                                    className="movie-detail__play-btn"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    Xem Phim
                                </Link>
                            ) : (
                                <button className="movie-detail__play-btn movie-detail__play-btn--disabled" disabled>
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    Chưa có tập phim
                                </button>
                            )}
                        </div>

                        {/* Actors */}
                        {movie.actors?.length > 0 && (
                            <div className="movie-detail__actors-row">
                                {movie.actors.slice(0, 8).map((actor) => (
                                    <div key={actor.id} className="movie-detail__actor" title={actor.name}>
                                        <div className="movie-detail__actor-avatar">
                                            {actor.avatar_url ? (
                                                <img src={actor.avatar_url} alt={actor.name} />
                                            ) : (
                                                <span>{actor.name?.charAt(0) || '?'}</span>
                                            )}
                                        </div>
                                        <span className="movie-detail__actor-name">{actor.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Movie info section */}
                <div className="movie-detail__body">
                    {/* Additional Info */}
                    <div className="movie-detail__info-grid">
                        {movie.directors?.length > 0 && (
                            <div className="movie-detail__info-item">
                                <span className="movie-detail__info-label">Đạo diễn</span>
                                <span className="movie-detail__info-value">
                                    {movie.directors.map(d => d.name).join(', ')}
                                </span>
                            </div>
                        )}
                        {movie.countries?.length > 0 && (
                            <div className="movie-detail__info-item">
                                <span className="movie-detail__info-label">Quốc gia</span>
                                <span className="movie-detail__info-value">
                                    {movie.countries.map(c => c.name).join(', ')}
                                </span>
                            </div>
                        )}
                        {movie.release_year && (
                            <div className="movie-detail__info-item">
                                <span className="movie-detail__info-label">Năm phát hành</span>
                                <span className="movie-detail__info-value">{movie.release_year}</span>
                            </div>
                        )}
                        {movie.view_count > 0 && (
                            <div className="movie-detail__info-item">
                                <span className="movie-detail__info-label">Lượt xem</span>
                                <span className="movie-detail__info-value">
                                    {Number(movie.view_count).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Episodes */}
                    {episodes.length > 0 && (
                        <div className="movie-detail__episodes">
                            <h2 className="movie-detail__episodes-title">Danh sách tập phim</h2>
                            <div className="movie-detail__episodes-grid">
                                {episodes.map((ep) => (
                                    <Link
                                        key={ep.id}
                                        to={`/watch/${movie.id}/${ep.id}`}
                                        className="movie-detail__episode-btn"
                                    >
                                        <span className="movie-detail__episode-number">
                                            Tập {ep.episode_number}
                                        </span>
                                        {ep.title && (
                                            <span className="movie-detail__episode-name">{ep.title}</span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trailer */}
                    {movie.trailer_url && (
                        <div className="movie-detail__trailer">
                            <h2 className="movie-detail__trailer-title">Trailer</h2>
                            <div className="movie-detail__trailer-container">
                                <iframe
                                    src={movie.trailer_url}
                                    title={`${movie.title} - Trailer`}
                                    allowFullScreen
                                    className="movie-detail__trailer-iframe"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ViewerLayout>
    );
}
