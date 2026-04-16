import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function MovieCard({ movie, showEpisodeCount = true }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const posterUrl = movie.poster_url || movie.banner_url;

    return (
        <Link to={`/movie/${movie.id}`} className="movie-card" id={`movie-card-${movie.id}`}>
            <div className="movie-card__poster">
                {/* Skeleton while loading */}
                {!imageLoaded && !imageError && (
                    <div className="movie-card__skeleton" />
                )}

                {/* Poster image */}
                {posterUrl && !imageError ? (
                    <img
                        src={posterUrl}
                        alt={movie.title}
                        className={`movie-card__image ${imageLoaded ? 'movie-card__image--loaded' : ''}`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="movie-card__no-image">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M15.6 11.8c.7-.3 1.4.4 1.1 1.1l-3 7a.8.8 0 01-1.4.1L10 17.5l-2.5 2.3a.8.8 0 01-1.3-.6v-3.5L3.7 13.4a.8.8 0 01.1-1.4l7-3z" />
                            <path d="M14 4.1V2m3.4 3.4l1.4-1.4M20 10h2.1M4 4l16 16" />
                        </svg>
                        <span>No Image</span>
                    </div>
                )}

                {/* Hover overlay */}
                <div className="movie-card__overlay">
                    <div className="movie-card__play">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>

                {/* Episode badge */}
                {showEpisodeCount && movie.episodes_count > 0 && (
                    <span className="movie-card__episode-badge">
                        PD. {movie.episodes_count}
                    </span>
                )}

                {/* Rating badge */}
                {movie.average_rating > 0 && (
                    <span className="movie-card__rating-badge">
                        ★ {Number(movie.average_rating).toFixed(1)}
                    </span>
                )}
            </div>

            <div className="movie-card__info">
                <h3 className="movie-card__title">{movie.title}</h3>
                {movie.original_title && (
                    <p className="movie-card__original-title">{movie.original_title}</p>
                )}
            </div>
        </Link>
    );
}
