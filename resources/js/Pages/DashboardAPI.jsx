import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';
import { apiClient } from '@/Services/apiClient';

/**
 * DashboardAPI - Trang tổng quan quản trị (Admin Dashboard).
 * 
 * Đây là trung tâm điều khiển chính của hệ thống VMovies, bao gồm:
 * 1. Hiển thị các số liệu thống kê tổng hợp (Phim, Tập phim, Người dùng, Bình luận).
 * 2. Cung cấp các lối tắt truy cập nhanh vào các module quản lý (Management Hub).
 * 3. Hiển thị các hành động cần chú ý (Bình luận chờ duyệt, User bị khóa...).
 * 4. Kiểm soát quyền truy cập và xác thực người dùng.
 */
export default function DashboardAPI() {
    const navigate = useNavigate();
    
    // --- AUTHENTICATION & CONTEXT ---
    // Sử dụng useAuth để lấy thông tin người dùng và trạng thái đăng nhập.
    const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
    
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [stats, setStats] = useState(null);      // Lưu trữ dữ liệu thống kê từ API.
    const [loading, setLoading] = useState(true);   // Trạng thái chờ tải dữ liệu thống kê.
    const [error, setError] = useState(null);      // Lưu trữ thông báo lỗi nếu có.
    const [showDropdown, setShowDropdown] = useState(false); // Điều khiển menu người dùng.

    /**
     * Effect: Bảo vệ tuyến đường (Route Guard).
     * Nếu người dùng chưa đăng nhập, tự động chuyển hướng về trang /login.
     */
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    /**
     * Effect: Nạp dữ liệu thống kê từ Backend.
     * Chỉ thực hiện khi người dùng đã được xác thực thành công.
     */
    useEffect(() => {
        const fetchStats = async () => {
            if (!isAuthenticated) return;

            setLoading(true);
            try {
                // Gọi API lấy dữ liệu dashboard dành riêng cho admin.
                const result = await apiClient.get('/admin/dashboard');

                if (result.success) {
                    setStats(result.data.data);
                    setError(null);
                } else {
                    setError(result.error || 'Không thể nạp dữ liệu thống kê.');
                }
            } catch (err) {
                setError('Đã xảy ra lỗi kết nối với máy chủ.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [isAuthenticated]);

    /**
     * handleLogout - Xử lý đăng xuất và dọn dẹp session.
     */
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Hiển thị màn hình chờ khi đang xác thực người dùng.
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-none border-4 border-gray-200 border-t-black mx-auto"></div>
                    <p className="text-black font-extrabold tracking-widest uppercase text-xs">Đang xác thực hệ thống...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-black">
            {/* 1. THANH ĐIỀU HƯỚNG TRÊN (TOP NAV) */}
            <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 justify-between items-center">
                        {/* Logo & Brand */}
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-black"></div>
                            <h1 className="text-2xl font-black tracking-tighter uppercase text-black">VMovies <span className="text-gray-400">Admin</span></h1>
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="inline-flex items-center bg-black px-6 py-3 text-xs font-black tracking-widest text-white uppercase hover:bg-gray-800 transition shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]"
                            >
                                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                {user?.name || 'ADMINISTRATOR'}
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-3 w-56 bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] z-10">
                                    <div className="py-1">
                                        <div className="block px-4 py-4 text-sm text-black border-b-2 border-black bg-gray-50">
                                            <div className="font-black uppercase text-xs tracking-wider mb-1">Tài khoản quản trị</div>
                                            <div className="font-bold text-gray-600 truncate">{user?.email}</div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left block px-4 py-4 text-sm font-black text-red-600 hover:bg-red-50 transition-colors uppercase tracking-widest"
                                        >
                                            Đăng xuất khỏi hệ thống
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* 2. NỘI DUNG CHÍNH (MAIN CONTENT) */}
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="mb-12">
                    <h2 className="text-5xl font-black text-black tracking-tighter uppercase mb-2">Bảng điều khiển</h2>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.3em]">Hệ thống quản trị nội dung video trực tuyến</p>
                </div>

                {/* Thông báo lỗi tập trung */}
                {error && (
                    <div className="bg-red-50 p-6 text-sm font-black text-red-600 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] mb-10 flex items-center gap-4 uppercase">
                        <span className="text-2xl">⚠️</span>
                        LỖI HỆ THỐNG: {error}
                    </div>
                )}

                {/* 3. KHU VỰC THỐNG KÊ (KPI CARDS) */}
                {loading ? (
                    <div className="grid gap-6 md:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 animate-pulse border-2 border-black"></div>
                        ))}
                    </div>
                ) : stats ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {/* Tổng số Phim */}
                        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] transition-all group">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Tổng số phim</p>
                            <div className="flex items-end justify-between">
                                <p className="text-6xl font-black text-black leading-none">{stats.totals?.movies || 0}</p>
                                <div className="text-4xl group-hover:scale-125 transition-transform">🎬</div>
                            </div>
                        </div>

                        {/* Tổng số Tập phim */}
                        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] transition-all group">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Tổng số tập</p>
                            <div className="flex items-end justify-between">
                                <p className="text-6xl font-black text-black leading-none">{stats.totals?.episodes || 0}</p>
                                <div className="text-4xl group-hover:scale-125 transition-transform">🎞️</div>
                            </div>
                        </div>

                        {/* Tổng số Người dùng */}
                        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] transition-all group">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Người dùng</p>
                            <div className="flex items-end justify-between">
                                <p className="text-6xl font-black text-black leading-none">{stats.totals?.users || 0}</p>
                                <div className="text-4xl group-hover:scale-125 transition-transform">👤</div>
                            </div>
                        </div>

                        {/* Tổng số Bình luận */}
                        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] transition-all group">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Bình luận</p>
                            <div className="flex items-end justify-between">
                                <p className="text-6xl font-black text-black leading-none">{stats.totals?.comments || 0}</p>
                                <div className="text-4xl group-hover:scale-125 transition-transform">💬</div>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* 4. HUB QUẢN LÝ (MANAGEMENT HUB) */}
                <div className="mt-16 bg-white p-10 border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-4 h-10 bg-black"></div>
                        <h3 className="text-3xl font-black text-black uppercase tracking-tighter">Trung tâm quản lý tài nguyên</h3>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                        {[
                            { to: "/movies", emoji: "🎬", label: "Phim", desc: "Quản lý phim bộ & phim lẻ" },
                            { to: "/genres", emoji: "🏷️", label: "Thể loại", desc: "Cấu trúc danh mục phim" },
                            { to: "/countries", emoji: "🌍", label: "Quốc gia", desc: "Khu vực và vùng lãnh thổ" },
                            { to: "/directors", emoji: "🎥", label: "Đạo diễn", desc: "Cơ sở dữ liệu đạo diễn" },
                            { to: "/actors", emoji: "👤", label: "Diễn viên", desc: "Danh sách ekip & diễn viên" },
                            { to: "/users", emoji: "👥", label: "Người dùng", desc: "Phân quyền & trạng thái" },
                            { to: "/comments", emoji: "💬", label: "Bình luận", desc: "Kiểm duyệt & phản hồi" },
                        ].map((item) => (
                            <Link key={item.to} to={item.to} className="group p-6 border-4 border-black bg-white hover:bg-black transition-all block shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.emoji}</div>
                                <p className="font-black text-black group-hover:text-white uppercase tracking-wider text-lg">{item.label}</p>
                                <p className="text-[10px] font-bold text-gray-500 group-hover:text-gray-400 mt-1 uppercase tracking-widest">{item.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 5. CÁC HÀNH ĐỘNG CẦN CHÚ Ý (PENDING ACTIONS) */}
                {stats?.pending_actions && (
                    <div className="mt-12 bg-black p-10 text-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-2 h-8 bg-red-500"></div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Cần xử lý ngay</h3>
                        </div>
                        
                        <div className="grid gap-10 md:grid-cols-4">
                            <div className="border-l-4 border-white pl-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Bình luận chờ</p>
                                <p className="text-5xl font-black text-white">{stats.pending_actions.pending_comments}</p>
                            </div>
                            <div className="border-l-4 border-red-500 pl-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">User bị khóa</p>
                                <p className="text-5xl font-black text-red-500">{stats.pending_actions.banned_users}</p>
                            </div>
                            <div className="border-l-4 border-gray-700 pl-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Phim trong thùng rác</p>
                                <p className="text-5xl font-black text-gray-500">{stats.pending_actions.trashed_movies}</p>
                            </div>
                            <div className="border-l-4 border-gray-700 pl-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Tập phim đã xóa</p>
                                <p className="text-5xl font-black text-gray-500">{stats.pending_actions.trashed_episodes}</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
