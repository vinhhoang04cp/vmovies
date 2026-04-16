import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';
import { publicApi } from '@/Services/publicApi';

export default function ViewerHeader() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [genres, setGenres] = useState([]);
    const [countries, setCountries] = useState([]);
    const [scrolled, setScrolled] = useState(false);

    const genreRef = useRef(null);
    const countryRef = useRef(null);
    const userRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const extractList = (res) => {
            if (!res.success) return [];
            const d = res.data?.data;
            if (Array.isArray(d)) return d;
            if (d?.data && Array.isArray(d.data)) return d.data;
            return [];
        };
        const fetchData = async () => {
            const [genreRes, countryRes] = await Promise.all([
                publicApi.getGenres({ per_page: 50 }),
                publicApi.getCountries({ per_page: 50 }),
            ]);
            setGenres(extractList(genreRes));
            setCountries(extractList(countryRes));
        };
        fetchData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (genreRef.current && !genreRef.current.contains(e.target)) setGenreDropdownOpen(false);
            if (countryRef.current && !countryRef.current.contains(e.target)) setCountryDropdownOpen(false);
            if (userRef.current && !userRef.current.contains(e.target)) setUserDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className={`viewer-header ${scrolled ? 'viewer-header--scrolled' : ''}`}>
            <div className="viewer-header__inner">
                {/* Logo */}
                <Link to="/" className="viewer-header__logo">
                    <div className="viewer-header__logo-icon">
                        <svg viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="18" stroke="#eab308" strokeWidth="2.5" />
                            <polygon points="16,12 30,20 16,28" fill="#eab308" />
                        </svg>
                    </div>
                    <div className="viewer-header__logo-text">
                        <span className="viewer-header__logo-name">VMovies</span>
                        <span className="viewer-header__logo-tagline">Phim hay cả rổ</span>
                    </div>
                </Link>

                {/* Search bar - Desktop */}
                <form onSubmit={handleSearch} className="viewer-header__search">
                    <svg className="viewer-header__search-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Tìm kiếm phim, diễn viên..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="viewer-header__search-input"
                    />
                </form>

                {/* Navigation */}
                <nav className="viewer-header__nav">
                    <Link to="/" className="viewer-header__nav-link">Chủ Đề</Link>

                    <div ref={genreRef} className="viewer-header__dropdown-wrapper">
                        <button
                            onClick={() => setGenreDropdownOpen(!genreDropdownOpen)}
                            className="viewer-header__nav-link viewer-header__nav-link--dropdown"
                        >
                            Thể Loại
                            <svg className={`viewer-header__chevron ${genreDropdownOpen ? 'viewer-header__chevron--open' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {genreDropdownOpen && (
                            <div className="viewer-header__dropdown">
                                {genres.map((genre) => (
                                    <Link
                                        key={genre.id}
                                        to={`/search?genre_id=${genre.id}`}
                                        className="viewer-header__dropdown-item"
                                        onClick={() => setGenreDropdownOpen(false)}
                                    >
                                        {genre.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div ref={countryRef} className="viewer-header__dropdown-wrapper">
                        <button
                            onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                            className="viewer-header__nav-link viewer-header__nav-link--dropdown"
                        >
                            Quốc Gia
                            <svg className={`viewer-header__chevron ${countryDropdownOpen ? 'viewer-header__chevron--open' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {countryDropdownOpen && (
                            <div className="viewer-header__dropdown">
                                {countries.map((country) => (
                                    <Link
                                        key={country.id}
                                        to={`/search?country_id=${country.id}`}
                                        className="viewer-header__dropdown-item"
                                        onClick={() => setCountryDropdownOpen(false)}
                                    >
                                        {country.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link to="/search?type=single" className="viewer-header__nav-link">Phim Lẻ</Link>
                    <Link to="/search?type=series" className="viewer-header__nav-link">Phim Bộ</Link>
                </nav>

                {/* Auth Button */}
                <div className="viewer-header__auth">
                    {isAuthenticated ? (
                        <div ref={userRef} className="viewer-header__dropdown-wrapper">
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="viewer-header__user-btn"
                            >
                                <svg viewBox="0 0 20 20" fill="currentColor" className="viewer-header__user-icon">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                <span>{user?.name || 'User'}</span>
                            </button>
                            {userDropdownOpen && (
                                <div className="viewer-header__dropdown viewer-header__dropdown--right">
                                    {user?.role === 'admin' && (
                                        <Link to="/dashboard" className="viewer-header__dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                                            Dashboard
                                        </Link>
                                    )}
                                    <button onClick={handleLogout} className="viewer-header__dropdown-item viewer-header__dropdown-item--danger">
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="viewer-header__login-btn">
                            <svg viewBox="0 0 20 20" fill="currentColor" className="viewer-header__user-icon">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Thành viên
                        </Link>
                    )}
                </div>

                {/* Mobile menu toggle */}
                <button
                    className="viewer-header__mobile-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="viewer-header__mobile-menu">
                    <form onSubmit={handleSearch} className="viewer-header__mobile-search">
                        <input
                            type="text"
                            placeholder="Tìm kiếm phim..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="viewer-header__search-input"
                        />
                    </form>
                    <Link to="/" className="viewer-header__mobile-link" onClick={() => setMobileMenuOpen(false)}>Trang chủ</Link>
                    <Link to="/search?type=single" className="viewer-header__mobile-link" onClick={() => setMobileMenuOpen(false)}>Phim Lẻ</Link>
                    <Link to="/search?type=series" className="viewer-header__mobile-link" onClick={() => setMobileMenuOpen(false)}>Phim Bộ</Link>
                    {isAuthenticated ? (
                        <>
                            {user?.role === 'admin' && (
                                <Link to="/dashboard" className="viewer-header__mobile-link" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                            )}
                            <button onClick={handleLogout} className="viewer-header__mobile-link viewer-header__mobile-link--danger">Đăng xuất</button>
                        </>
                    ) : (
                        <Link to="/login" className="viewer-header__mobile-link" onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>
                    )}
                </div>
            )}
        </header>
    );
}
