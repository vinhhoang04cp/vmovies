import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '@/Services/publicApi';
import ViewerLayout from '@/Layouts/ViewerLayout';

function extractItem(res) {
    if (!res.success) return null;
    const d = res.data?.data;
    if (d && d.id) return d;
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

export default function WatchPage() {
    const { movieId, episodeId } = useParams();
    const [movie, setMovie] = useState(null);
    const [episode, setEpisode] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
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
                    document.title = `${episodeData.title || `Tập ${episodeData.episode_number}`} - VMovies`;
                }

                setEpisodes(extractList(episodesRes));
            } catch (err) {
                console.error('Failed to fetch watch data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [movieId, episodeId]);

    // Find prev/next episodes
    const currentIndex = episodes.findIndex(ep => ep.id === parseInt(episodeId));
    const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
    const nextEpisode = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

    if (loading) {
        return (
            <ViewerLayout>
                <div className="watch-page watch-page--loading">
                    <div className="watch-page__player-skeleton" />
                    <div className="watch-page__info-skeleton" />
                </div>
            </ViewerLayout>
        );
    }

    if (!movie || !episode) {
        return (
            <ViewerLayout>
                <div className="watch-page watch-page--not-found">
                    <h2>Không tìm thấy tập phim</h2>
                    <Link to="/" className="watch-page__back-link">← Về trang chủ</Link>
                </div>
            </ViewerLayout>
        );
    }

    // Determine video source type
    const renderPlayer = () => {
        if (!episode.video_url) {
            return (
                <div className="watch-page__no-video">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M10 9l5 3-5 3V9z" />
                    </svg>
                    <p>Video chưa được cập nhật</p>
                </div>
            );
        }

        const url = episode.video_url;

        // YouTube embed
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
                    className="watch-page__iframe"
                />
            );
        }

        // Generic iframe embed (for third-party embed URLs)
        if (url.includes('embed') || url.includes('player')) {
            return (
                <iframe
                    src={url}
                    title={episode.title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="watch-page__iframe"
                />
            );
        }

        // Direct video file
        return (
            <video controls autoPlay className="watch-page__video">
                <source src={url} />
                Your browser does not support the video tag.
            </video>
        );
    };

    return (
        <ViewerLayout>
            <div className="watch-page">
                {/* Navigation */}
                <div className="watch-page__nav">
                    <Link to={`/movie/${movie.id}`} className="watch-page__back">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </Link>
                    <h1 className="watch-page__movie-title">
                        Xem phim {movie.title}
                        {episode.episode_number && ` - Tập ${episode.episode_number}`}
                    </h1>
                </div>

                {/* Player */}
                <div className="watch-page__player">
                    {renderPlayer()}
                </div>

                {/* Episode navigation */}
                <div className="watch-page__episode-nav">
                    {prevEpisode ? (
                        <Link
                            to={`/watch/${movieId}/${prevEpisode.id}`}
                            className="watch-page__ep-nav-btn"
                        >
                            ← Tập {prevEpisode.episode_number}
                        </Link>
                    ) : <div />}
                    {nextEpisode && (
                        <Link
                            to={`/watch/${movieId}/${nextEpisode.id}`}
                            className="watch-page__ep-nav-btn watch-page__ep-nav-btn--next"
                        >
                            Tập {nextEpisode.episode_number} →
                        </Link>
                    )}
                </div>

                {/* Movie info under player */}
                <div className="watch-page__info">
                    <div className="watch-page__movie-info">
                        <h2 className="watch-page__title">{movie.title}</h2>
                        {movie.original_title && (
                            <p className="watch-page__original-title">{movie.original_title}</p>
                        )}
                        {movie.summary && (
                            <p className="watch-page__summary">{movie.summary}</p>
                        )}
                    </div>
                </div>

                {/* Episode List */}
                {episodes.length > 1 && (
                    <div className="watch-page__episodes">
                        <h3 className="watch-page__episodes-title">Chọn tập phim</h3>
                        <div className="watch-page__episodes-grid">
                            {episodes.map((ep) => (
                                <Link
                                    key={ep.id}
                                    to={`/watch/${movieId}/${ep.id}`}
                                    className={`watch-page__episode-btn ${ep.id === parseInt(episodeId) ? 'watch-page__episode-btn--active' : ''}`}
                                >
                                    Tập {ep.episode_number}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ViewerLayout>
    );
}
