import '../css/app.css';
import './bootstrap';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/Context/AuthContext';
import { ProtectedRoute, PublicRoute } from '@/Context/ProtectedRoute';
import { createRoot } from 'react-dom/client';

// Pages
import LoginAPI from '@/Pages/Auth/LoginAPI';
import RegisterAPI from '@/Pages/Auth/RegisterAPI';
import DashboardAPI from '@/Pages/DashboardAPI';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
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

                    {/* Protected routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardAPI />
                            </ProtectedRoute>
                        }
                    />

                    {/* Redirect to login by default */}
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

// Mount React app to #app
const root = createRoot(document.getElementById('app'));
root.render(<App />);

