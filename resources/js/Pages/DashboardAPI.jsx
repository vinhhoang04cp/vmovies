import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';
import { apiClient } from '@/Services/apiClient';

export default function DashboardAPI() {
    const navigate = useNavigate();
    const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Fetch dashboard stats
    useEffect(() => {
        const fetchStats = async () => {
            if (!isAuthenticated) return;

            setLoading(true);
            const result = await apiClient.get('/admin/dashboard');

            if (result.success) {
                setStats(result.data.data);
                setError(null);
            } else {
                setError(result.error);
            }
            setLoading(false);
        };

        fetchStats();
    }, [isAuthenticated]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600 mx-auto"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="border-b border-gray-200 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-indigo-600">VMovies Admin</h1>
                        </div>

                        {/* User menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                                <svg
                                    className="mr-2 h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {user?.name}
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                    <div className="py-1">
                                        <div className="block px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                            <div className="font-semibold">{user?.name}</div>
                                            <div className="text-xs text-gray-500">{user?.email}</div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

                {error && (
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200 mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600"></div>
                    </div>
                ) : stats ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Total Movies */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Movies</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {stats.totals?.movies || 0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16m10-16v16M4 7h16" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Episodes */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Episodes</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {stats.totals?.episodes || 0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Users */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {stats.totals?.users || 0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 8.048M7 19H5a2 2 0 00-2 2v1h4m6-20h2a2 2 0 012 2v1m0 0h4a2 2 0 012 2v8a2 2 0 01-2 2h-2.5a2 2 0 00-1 3.75A2.001 2.001 0 0115 23h-4a2.002 2.002 0 01-1.001-3.75A2 2 0 0110 19H7.5a2 2 0 01-2-2v-8a2 2 0 012-2h4V4a2 2 0 012-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Comments */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Comments</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {stats.totals?.comments || 0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* Admin Menu */}
                {user && (
                    <div className="mt-8 rounded-lg bg-white p-6 shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Management</h3>
                        <div className="grid gap-3 md:grid-cols-4">
                            <Link to="/movies" className="p-4 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-500 transition">
                                <div className="text-2xl mb-2">🎬</div>
                                <p className="font-semibold text-gray-900">Quản lý phim</p>
                                <p className="text-sm text-gray-600">CRUD phim, series</p>
                            </Link>
                            <Link to="/genres" className="p-4 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-500 transition">
                                <div className="text-2xl mb-2">🏷️</div>
                                <p className="font-semibold text-gray-900">Thể loại</p>
                                <p className="text-sm text-gray-600">Quản lý thể loại phim</p>
                            </Link>
                            <Link to="/countries" className="p-4 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-500 transition">
                                <div className="text-2xl mb-2">🌍</div>
                                <p className="font-semibold text-gray-900">Quốc gia</p>
                                <p className="text-sm text-gray-600">Quản lý quốc gia</p>
                            </Link>
                            <Link to="/directors" className="p-4 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-500 transition">
                                <div className="text-2xl mb-2">🎥</div>
                                <p className="font-semibold text-gray-900">Đạo diễn</p>
                                <p className="text-sm text-gray-600">Quản lý đạo diễn</p>
                            </Link>
                            <Link to="/actors" className="p-4 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-500 transition">
                                <div className="text-2xl mb-2">👤</div>
                                <p className="font-semibold text-gray-900">Diễn viên</p>
                                <p className="text-sm text-gray-600">Quản lý diễn viên</p>
                            </Link>
                            <Link to="/users" className="p-4 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-500 transition">
                                <div className="text-2xl mb-2">👥</div>
                                <p className="font-semibold text-gray-900">Người dùng</p>
                                <p className="text-sm text-gray-600">Quản lý tài khoản</p>
                            </Link>
                            <Link to="/comments" className="p-4 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-500 transition">
                                <div className="text-2xl mb-2">💬</div>
                                <p className="font-semibold text-gray-900">Bình luận</p>
                                <p className="text-sm text-gray-600">Duyệt bình luận</p>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Pending Actions */}
                {stats?.pending_actions && (
                    <div className="mt-8 rounded-lg bg-white p-6 shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="border-l-4 border-yellow-500 pl-4">
                                <p className="text-sm text-gray-600">Pending Comments</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {stats.pending_actions.pending_comments}
                                </p>
                            </div>
                            <div className="border-l-4 border-red-500 pl-4">
                                <p className="text-sm text-gray-600">Banned Users</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {stats.pending_actions.banned_users}
                                </p>
                            </div>
                            <div className="border-l-4 border-gray-500 pl-4">
                                <p className="text-sm text-gray-600">Trashed Movies</p>
                                <p className="text-2xl font-bold text-gray-600">
                                    {stats.pending_actions.trashed_movies}
                                </p>
                            </div>
                            <div className="border-l-4 border-gray-500 pl-4">
                                <p className="text-sm text-gray-600">Trashed Episodes</p>
                                <p className="text-2xl font-bold text-gray-600">
                                    {stats.pending_actions.trashed_episodes}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

