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
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-none border-4 border-gray-200 border-t-black mx-auto"></div>
                    <p className="text-black font-semibold tracking-widest uppercase text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-black">
            {/* Navigation */}
            <nav className="border-b-2 border-black bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-extrabold tracking-tight uppercase text-black">VMovies</h1>
                        </div>

                        {/* User menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="inline-flex items-center bg-black px-5 py-2 text-sm font-bold tracking-wide text-white hover:bg-gray-800 transition"
                            >
                                <svg
                                    className="mr-2 h-4 w-4"
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
                                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-10">
                                    <div className="py-1">
                                        <div className="block px-4 py-3 text-sm text-black border-b border-gray-200 bg-gray-50">
                                            <div className="font-extrabold">{user?.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left block px-4 py-3 text-sm font-bold text-black hover:bg-black hover:text-white transition-colors"
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
                <h2 className="text-4xl font-extrabold text-black mb-10 tracking-tight uppercase border-b-4 border-black inline-block pb-2">Dashboard</h2>

                {error && (
                    <div className="bg-white p-4 text-sm font-bold text-black border-l-4 border-red-600 shadow-[4px_4px_0_0_rgba(0,0,0,1)] mb-8">
                        ERROR: {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-12 w-12 animate-spin rounded-none border-4 border-gray-200 border-t-black"></div>
                    </div>
                ) : stats ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Total Movies */}
                        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-transform">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Total Movies</p>
                                    <p className="text-4xl font-black text-black">
                                        {stats.totals?.movies || 0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-blue-100 border-2 border-black flex items-center justify-center">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16m10-16v16M4 7h16" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Episodes */}
                        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-transform">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Episodes</p>
                                    <p className="text-4xl font-black text-black">
                                        {stats.totals?.episodes || 0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 border-2 border-black bg-green-100 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Users */}
                        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-transform">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Total Users</p>
                                    <p className="text-4xl font-black text-black">
                                        {stats.totals?.users || 0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-purple-100 border-2 border-black flex items-center justify-center">
                                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 8.048M7 19H5a2 2 0 00-2 2v1h4m6-20h2a2 2 0 012 2v1m0 0h4a2 2 0 012 2v8a2 2 0 01-2 2h-2.5a2 2 0 00-1 3.75A2.001 2.001 0 0115 23h-4a2.002 2.002 0 01-1.001-3.75A2 2 0 0110 19H7.5a2 2 0 01-2-2v-8a2 2 0 012-2h4V4a2 2 0 012-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Comments */}
                        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-transform">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Comments</p>
                                    <p className="text-4xl font-black text-black">
                                        {stats.totals?.comments || 0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 border-2 border-black bg-white flex items-center justify-center">
                                    <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* Admin Menu */}
                {user && (
                    <div className="mt-12 bg-white p-8 border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                        <h3 className="text-xl font-extrabold text-black mb-6 uppercase tracking-wide">Management Hub</h3>
                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                            <Link to="/movies" className="group p-5 border-2 border-black bg-white hover:bg-black transition-colors block">
                                <div className="text-3xl mb-3">🎬</div>
                                <p className="font-extrabold text-black group-hover:text-white uppercase tracking-wider">Movies</p>
                                <p className="text-xs text-gray-500 group-hover:text-gray-400 mt-1">Manage movies & series</p>
                            </Link>
                            <Link to="/genres" className="group p-5 border-2 border-black bg-white hover:bg-black transition-colors block">
                                <div className="text-3xl mb-3">🏷️</div>
                                <p className="font-extrabold text-black group-hover:text-white uppercase tracking-wider">Genres</p>
                                <p className="text-xs text-gray-500 group-hover:text-gray-400 mt-1">Manage categories</p>
                            </Link>
                            <Link to="/countries" className="group p-5 border-2 border-black bg-white hover:bg-black transition-colors block">
                                <div className="text-3xl mb-3">🌍</div>
                                <p className="font-extrabold text-black group-hover:text-white uppercase tracking-wider">Countries</p>
                                <p className="text-xs text-gray-500 group-hover:text-gray-400 mt-1">Regions & limits</p>
                            </Link>
                            <Link to="/directors" className="group p-5 border-2 border-black bg-white hover:bg-black transition-colors block">
                                <div className="text-3xl mb-3">🎥</div>
                                <p className="font-extrabold text-black group-hover:text-white uppercase tracking-wider">Directors</p>
                                <p className="text-xs text-gray-500 group-hover:text-gray-400 mt-1">Film directors database</p>
                            </Link>
                            <Link to="/actors" className="group p-5 border-2 border-black bg-white hover:bg-black transition-colors block">
                                <div className="text-3xl mb-3">👤</div>
                                <p className="font-extrabold text-black group-hover:text-white uppercase tracking-wider">Actors</p>
                                <p className="text-xs text-gray-500 group-hover:text-gray-400 mt-1">Cast & crew</p>
                            </Link>
                            <Link to="/users" className="group p-5 border-2 border-black bg-white hover:bg-black transition-colors block">
                                <div className="text-3xl mb-3">👥</div>
                                <p className="font-extrabold text-black group-hover:text-white uppercase tracking-wider">Users</p>
                                <p className="text-xs text-gray-500 group-hover:text-gray-400 mt-1">Account management</p>
                            </Link>
                            <Link to="/comments" className="group p-5 border-2 border-black bg-white hover:bg-black transition-colors block">
                                <div className="text-3xl mb-3">💬</div>
                                <p className="font-extrabold text-black group-hover:text-white uppercase tracking-wider">Comments</p>
                                <p className="text-xs text-gray-500 group-hover:text-gray-400 mt-1">Moderation queue</p>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Pending Actions */}
                {stats?.pending_actions && (
                    <div className="mt-8 bg-black p-8 text-white border-4 border-black">
                        <h3 className="text-xl font-extrabold mb-6 uppercase tracking-wide border-b border-gray-800 pb-2 inline-block">Attention Required</h3>
                        <div className="grid gap-6 md:grid-cols-4">
                            <div className="border-l-4 border-white pl-4">
                                <p className="text-xs uppercase tracking-widest text-gray-400">Pending Comm.</p>
                                <p className="text-3xl font-black mt-1">
                                    {stats.pending_actions.pending_comments}
                                </p>
                            </div>
                            <div className="border-l-4 border-red-500 pl-4">
                                <p className="text-xs uppercase tracking-widest text-gray-400">Banned Users</p>
                                <p className="text-3xl font-black mt-1 text-red-500">
                                    {stats.pending_actions.banned_users}
                                </p>
                            </div>
                            <div className="border-l-4 border-gray-600 pl-4">
                                <p className="text-xs uppercase tracking-widest text-gray-400">Trashed Movies</p>
                                <p className="text-3xl font-black mt-1 text-gray-400">
                                    {stats.pending_actions.trashed_movies}
                                </p>
                            </div>
                            <div className="border-l-4 border-gray-600 pl-4">
                                <p className="text-xs uppercase tracking-widest text-gray-400">Trashed Eps</p>
                                <p className="text-3xl font-black mt-1 text-gray-400">
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

