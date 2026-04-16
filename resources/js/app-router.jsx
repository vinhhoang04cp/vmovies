import '../css/app.css';
import './bootstrap';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/Context/AuthContext';
import { ProtectedRoute, PublicRoute } from '@/Context/ProtectedRoute';
import { createRoot } from 'react-dom/client';

// Auth Pages
import LoginAPI from '@/Pages/Auth/LoginAPI';
import RegisterAPI from '@/Pages/Auth/RegisterAPI';

// Dashboard
import DashboardAPI from '@/Pages/DashboardAPI';

// Admin Pages
import MovieManagement from '@/Pages/Admin/MovieManagement';
import GenreManagement from '@/Pages/Admin/GenreManagement';
import CountryManagement from '@/Pages/Admin/CountryManagement';
import DirectorManagement from '@/Pages/Admin/DirectorManagement';
import ActorManagement from '@/Pages/Admin/ActorManagement';
import UserManagement from '@/Pages/Admin/UserManagement';
import CommentManagement from '@/Pages/Admin/CommentManagement';
import EpisodeManagement from '@/Pages/Admin/EpisodeManagement';

// Viewer Pages
import HomePage from '@/Pages/Viewer/HomePage';
import MovieDetailPage from '@/Pages/Viewer/MovieDetailPage';
import WatchPage from '@/Pages/Viewer/WatchPage';
import SearchPage from '@/Pages/Viewer/SearchPage';

// Layout
import AdminLayout from '@/Layouts/AdminLayout';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* ═══ Public Viewer Routes ═══ */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/movie/:id" element={<MovieDetailPage />} />
                    <Route path="/watch/:movieId/:episodeId" element={<WatchPage />} />
                    <Route path="/search" element={<SearchPage />} />

                    {/* ═══ Auth Routes ═══ */}
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

                    {/* ═══ Protected routes - Dashboard ═══ */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardAPI />
                            </ProtectedRoute>
                        }
                    />

                    {/* ═══ Admin routes with sidebar ═══ */}
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

// Mount React app to #app
const root = createRoot(document.getElementById('app'));
root.render(<App />);
