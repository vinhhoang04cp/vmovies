import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load token từ localStorage khi component mount
    useEffect(() => {
        const savedToken = localStorage.getItem('auth_token');
        if (savedToken) {
            setToken(savedToken);
            // Có thể gọi API /me để lấy user info
            fetchUser(savedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (authToken) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.data.user);
                setError(null);
            } else if (response.status === 401) {
                // Token hết hạn hoặc không hợp lệ
                localStorage.removeItem('auth_token');
                setToken(null);
                setUser(null);
            }
        } catch (err) {
            console.error('Error fetching user:', err);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            const authToken = data.data.token;
            localStorage.setItem('auth_token', authToken);
            setToken(authToken);
            setUser(data.data.user);

            return { success: true };
        } catch (err) {
            const errorMsg = err.message || 'An error occurred during login';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password, passwordConfirmation) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            const authToken = data.data.token;
            localStorage.setItem('auth_token', authToken);
            setToken(authToken);
            setUser(data.data.user);

            return { success: true };
        } catch (err) {
            const errorMsg = err.message || 'An error occurred during registration';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
            setLoading(false);
        }
    };

    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                error,
                isAuthenticated,
                login,
                register,
                logout,
                setError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

