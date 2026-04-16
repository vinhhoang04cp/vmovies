import { Link } from 'react-router-dom';

export default function ViewerFooter() {
    return (
        <footer className="viewer-footer">
            <div className="viewer-footer__inner">
                <div className="viewer-footer__grid">
                    {/* Brand */}
                    <div className="viewer-footer__brand">
                        <Link to="/" className="viewer-footer__logo">
                            <div className="viewer-footer__logo-icon">
                                <svg viewBox="0 0 40 40" fill="none">
                                    <circle cx="20" cy="20" r="18" stroke="#eab308" strokeWidth="2.5" />
                                    <polygon points="16,12 30,20 16,28" fill="#eab308" />
                                </svg>
                            </div>
                            <div>
                                <span className="viewer-footer__logo-name">VMovies</span>
                                <span className="viewer-footer__logo-tagline">Phim hay cả rổ</span>
                            </div>
                        </Link>
                        <p className="viewer-footer__desc">
                            VMovies là nơi tổng hợp phim lẻ, phim bộ, anime và nhiều nội dung giải trí phổ biến
                            với giao diện dễ dùng, tốc độ truy cập nhanh và danh mục được cập nhật liên tục.
                        </p>
                    </div>

                    {/* Quick links */}
                    <div className="viewer-footer__links">
                        <h4 className="viewer-footer__links-title">Danh mục</h4>
                        <Link to="/search?type=single" className="viewer-footer__link">Phim Lẻ</Link>
                        <Link to="/search?type=series" className="viewer-footer__link">Phim Bộ</Link>
                        <Link to="/search?sort_by=view_count&sort_dir=desc" className="viewer-footer__link">Phim Hot</Link>
                        <Link to="/search?sort_by=created_at&sort_dir=desc" className="viewer-footer__link">Phim Mới</Link>
                    </div>

                    <div className="viewer-footer__links">
                        <h4 className="viewer-footer__links-title">Thông tin</h4>
                        <Link to="/" className="viewer-footer__link">Giới thiệu</Link>
                        <Link to="/" className="viewer-footer__link">Liên hệ</Link>
                        <Link to="/" className="viewer-footer__link">Điều khoản</Link>
                        <Link to="/" className="viewer-footer__link">Chính sách bảo mật</Link>
                    </div>
                </div>

                <div className="viewer-footer__bottom">
                    <p>&copy; {new Date().getFullYear()} VMovies. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
