import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

export default function HeroBanner({ movies = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const goToSlide = useCallback((index) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 600);
    }, [isTransitioning]);

    useEffect(() => {
        if (movies.length <= 1) return;
        const interval = setInterval(() => {
            goToSlide((currentIndex + 1) % movies.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [currentIndex, movies.length, goToSlide]);

    if (!movies.length) {
        return (
            <div className="hero-banner hero-banner--skeleton">
                <div className="hero-banner__skeleton-shimmer" />
            </div>
        );
    }

    const movie = movies[currentIndex];
    const backdropUrl = movie.banner_url || movie.poster_url;

    return (
        <div className="hero-banner">
            {/* Background */}
            <div className="hero-banner__backdrop-container">
                {movies.map((m, idx) => (
                    <div
                        key={m.id}
                        className={`hero-banner__backdrop ${idx === currentIndex ? 'hero-banner__backdrop--active' : ''}`}
                        style={{ backgroundImage: `url(${m.banner_url || m.poster_url || ''})` }}
                    />
                ))}
                <div className="hero-banner__overlay" />
            </div>

            {/* Content */}
            <div className="hero-banner__content">
                <div className="hero-banner__info">
                    <h1 className="hero-banner__title" key={`title-${currentIndex}`}>
                        {movie.title}
                    </h1>
                    {movie.original_title && (
                        <p className="hero-banner__original-title">{movie.original_title}</p>
                    )}

                    {/* Badges */}
                    <div className="hero-banner__badges">
                        {movie.average_rating > 0 && (
                            <span className="hero-banner__badge hero-banner__badge--rating">
                                IMDb {Number(movie.average_rating).toFixed(1)}
                            </span>
                        )}
                        {movie.release_year && (
                            <span className="hero-banner__badge">{movie.release_year}</span>
                        )}
                        {movie.type && (
                            <span className="hero-banner__badge">
                                {movie.type === 'series' ? 'Phim Bộ' : 'Phim Lẻ'}
                            </span>
                        )}
                        {movie.episodes_count > 0 && (
                            <span className="hero-banner__badge">Tập {movie.episodes_count}</span>
                        )}
                    </div>

                    {/* Genre tags */}
                    {movie.genres?.length > 0 && (
                        <div className="hero-banner__genres">
                            {movie.genres.map((genre) => (
                                <Link
                                    key={genre.id}
                                    to={`/search?genre_id=${genre.id}`}
                                    className="hero-banner__genre-tag"
                                >
                                    {genre.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    {movie.summary && (
                        <p className="hero-banner__desc">{movie.summary}</p>
                    )}

                    {/* Actions */}
                    <div className="hero-banner__actions">
                        <Link to={`/movie/${movie.id}`} className="hero-banner__play-btn">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="hero-banner__play-icon">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </Link>
                        <Link to={`/movie/${movie.id}`} className="hero-banner__action-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                        </Link>
                        <Link to={`/movie/${movie.id}`} className="hero-banner__action-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Actor avatars */}
                {movie.actors?.length > 0 && (
                    <div className="hero-banner__actors">
                        {movie.actors.slice(0, 6).map((actor) => (
                            <div key={actor.id} className="hero-banner__actor-avatar" title={actor.name}>
                                {actor.avatar_url ? (
                                    <img src={actor.avatar_url} alt={actor.name} />
                                ) : (
                                    <div className="hero-banner__actor-placeholder">
                                        {actor.name?.charAt(0) || '?'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Slide indicators */}
            {movies.length > 1 && (
                <div className="hero-banner__indicators">
                    {movies.map((_, idx) => (
                        <button
                            key={idx}
                            className={`hero-banner__indicator ${idx === currentIndex ? 'hero-banner__indicator--active' : ''}`}
                            onClick={() => goToSlide(idx)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
