// Import file CSS chính của ứng dụng
import '../css/app.css';
// Import file khởi tạo axios
import './bootstrap';

// Sử dụng React Router DOM để điều hướng (Client-side routing)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Context cung cấp state đăng nhập (Auth state) cho toàn bộ ứng dụng
import { AuthProvider } from '@/Context/AuthContext';
// Import các Route Guards (Chặn người dùng chưa đăng nhập hoặc đã đăng nhập)
import { ProtectedRoute, PublicRoute } from '@/Context/ProtectedRoute';

// createRoot từ React 18 để render UI
import { createRoot } from 'react-dom/client';

// ==========================================
// Import Các Màn Hình (Pages)
// ==========================================

// Màn hình xác thực
import LoginAPI from '@/Pages/Auth/LoginAPI';
import RegisterAPI from '@/Pages/Auth/RegisterAPI';

// Màn hình tổng quan khi đăng nhập thành công
import DashboardAPI from '@/Pages/DashboardAPI';

// Các màn hình thuộc phần Quản trị (Admin)
import MovieManagement from '@/Pages/Admin/MovieManagement';
import GenreManagement from '@/Pages/Admin/GenreManagement';
import CountryManagement from '@/Pages/Admin/CountryManagement';
import DirectorManagement from '@/Pages/Admin/DirectorManagement';
import ActorManagement from '@/Pages/Admin/ActorManagement';
import UserManagement from '@/Pages/Admin/UserManagement';
import CommentManagement from '@/Pages/Admin/CommentManagement';
import EpisodeManagement from '@/Pages/Admin/EpisodeManagement';

// Các màn hình dành cho khán giả xem phim
import HomePage from '@/Pages/Viewer/HomePage';
import MovieDetailPage from '@/Pages/Viewer/MovieDetailPage';
import WatchPage from '@/Pages/Viewer/WatchPage';
import SearchPage from '@/Pages/Viewer/SearchPage';

// Layout bọc khung giao diện trang Admin (chứa Header, Sidebar...)
import AdminLayout from '@/Layouts/AdminLayout';

/**
 * Component App chính của hệ thống.
 * Cấu trúc: 
 * Router (Theo dõi URL) -> AuthProvider (Cung cấp user state) -> Routes (Định tuyến màn hình)
 */
function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* ═══ Public Viewer Routes (Giao diện người xem công khai) ═══ */}
                    {/* Bất kỳ ai cũng có thể vào các trang này mà không cần đăng nhập */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/movie/:id" element={<MovieDetailPage />} />
                    <Route path="/watch/:movieId/:episodeId" element={<WatchPage />} />
                    <Route path="/search" element={<SearchPage />} />

                    {/* ═══ Auth Routes (Tuyến đường xác thực) ═══ */}
                    {/* PublicRoute bọc lại để đảm bảo: Nếu đã đăng nhập, sẽ bị đá ra khỏi trang này (thường chuyển về /dashboard) */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <LoginAPI />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <RegisterAPI />
                            </PublicRoute>
                        }
                    />

                    {/* ═══ Protected routes (Tuyến đường bảo vệ - Cần đăng nhập) ═══ */}
                    {/* ProtectedRoute đảm bảo: Chưa đăng nhập sẽ bị đá văng về trang /login */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardAPI />
                            </ProtectedRoute>
                        }
                    />

                    {/* ═══ Admin routes (Trang CMS cho Quản trị viên) ═══ */}
                    {/* Vừa yêu cầu ProtectedRoute (phải đăng nhập), vừa được bọc bởi AdminLayout (để có thanh menu) */}
                    <Route
                        path="/movies"
                        element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <MovieManagement />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/movies/:movieId/episodes"
                        element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <EpisodeManagement />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/genres"
                        element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <GenreManagement />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/countries"
                        element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <CountryManagement />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/directors"
                        element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <DirectorManagement />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/actors"
                        element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <ActorManagement />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <UserManagement />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/comments"
                        element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <CommentManagement />
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

// Khởi tạo React App và render toàn bộ nội dung App() vào thẻ <div id="app"> trên file blade HTML
const root = createRoot(document.getElementById('app'));
root.render(<App />);
