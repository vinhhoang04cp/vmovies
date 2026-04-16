import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard';

export default function MovieRow({ title, movies = [], linkTo, loading = false }) {
    const scrollRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setShowLeftArrow(el.scrollLeft > 20);
        setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
    };

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        const scrollAmount = el.clientWidth * 0.8;
        el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <section className="movie-row">
                <div className="movie-row__header">
                    <h2 className="movie-row__title">{title}</h2>
                </div>
                <div className="movie-row__scroll">
                    {[...Array(6)].map((_, i) => (
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
            </section>
        );
    }

    if (!movies.length) return null;

    return (
        <section className="movie-row">
            <div className="movie-row__header">
                <h2 className="movie-row__title">{title}</h2>
                {linkTo && (
                    <Link to={linkTo} className="movie-row__see-all">
                        Xem toàn bộ
                        <svg viewBox="0 0 20 20" fill="currentColor" className="movie-row__see-all-icon">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </Link>
                )}
            </div>

            <div className="movie-row__container">
                {showLeftArrow && (
                    <button className="movie-row__arrow movie-row__arrow--left" onClick={() => scroll('left')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                )}

                <div className="movie-row__scroll" ref={scrollRef} onScroll={handleScroll}>
                    {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>

                {showRightArrow && movies.length > 4 && (
                    <button className="movie-row__arrow movie-row__arrow--right" onClick={() => scroll('right')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                )}
            </div>
        </section>
    );
}
