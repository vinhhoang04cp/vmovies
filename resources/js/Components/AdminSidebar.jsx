import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';

export default function AdminSidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);

    const isActive = (path) => location.pathname === path;

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/movies', label: 'Quản lý phim', icon: '🎬' },
        { path: '/genres', label: 'Thể loại', icon: '🏷️' },
        { path: '/countries', label: 'Quốc gia', icon: '🌍' },
        { path: '/directors', label: 'Đạo diễn', icon: '🎥' },
        { path: '/actors', label: 'Diễn viên', icon: '👤' },
        { path: '/users', label: 'Người dùng', icon: '👥' },
        { path: '/comments', label: 'Bình luận', icon: '💬' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div
                className={`${
                    isOpen ? 'w-64' : 'w-20'
                } bg-gray-800 text-white transition-all duration-300 flex flex-col shadow-lg`}
            >
                {/* Logo/Header */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    {isOpen && <h1 className="text-xl font-bold">VMovies</h1>}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 hover:bg-gray-700 rounded transition"
                    >
                        {isOpen ? '◀' : '▶'}
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded transition ${
                                isActive(item.path)
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700'
                            }`}
                            title={isOpen ? '' : item.label}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {isOpen && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* User Info & Logout */}
                <div className="border-t border-gray-700 p-4 space-y-2">
                    {isOpen && (
                        <div className="text-sm text-gray-300 mb-2">
                            <p className="font-semibold truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                    >
                        {isOpen ? 'Đăng xuất' : '🚪'}
                    </button>
                </div>
            </div>
        </div>
    );
}

