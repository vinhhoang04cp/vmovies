import { createContext, useState, useContext, useEffect } from 'react';

/**
 * AuthContext - Ngữ cảnh quản lý trạng thái đăng nhập toàn cục của ứng dụng.
 * Giúp các component có thể truy cập thông tin người dùng (user), token, và các hàm login/logout.
 */
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // Thông tin người dùng hiện tại
    const [token, setToken] = useState(null); // JWT Token dùng để xác thực các request API
    const [loading, setLoading] = useState(true); // Trạng thái đang kiểm tra phiên làm việc (init app)
    const [error, setError] = useState(null); // Lưu trữ lỗi phát sinh khi đăng nhập/đăng ký

    // Effect: Tự động chạy khi ứng dụng khởi chạy (hoặc mount lần đầu)
    useEffect(() => {
        // Kiểm tra xem có token được lưu trong localStorage từ lần đăng nhập trước không
        const savedToken = localStorage.getItem('auth_token');
        if (savedToken) {
            setToken(savedToken);
            // Nếu có token, gọi API /auth/me để lấy lại thông tin người dùng mới nhất
            fetchUser(savedToken);
        } else {
            setLoading(false);
        }
    }, []);

    // Hàm lấy thông tin người dùng từ server dựa trên token
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
                setUser(data.data.user); // Lưu thông tin người dùng vào state
                setError(null);
            } else if (response.status === 401) {
                // Token đã hết hạn hoặc không hợp lệ trên server -> Xóa sạch session local
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

    // Hàm xử lý đăng nhập
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
                throw new Error(data.message || 'Đăng nhập thất bại');
            }

            const authToken = data.data.token;
            // Lưu token vào localStorage để duy trì phiên làm việc khi reload trang
            localStorage.setItem('auth_token', authToken);
            setToken(authToken);
            setUser(data.data.user);

            return { success: true };
        } catch (err) {
            const errorMsg = err.message || 'Đã có lỗi xảy ra trong quá trình đăng nhập';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý đăng ký tài khoản mới
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
                throw new Error(data.message || 'Đăng ký thất bại');
            }

            const authToken = data.data.token;
            localStorage.setItem('auth_token', authToken);
            setToken(authToken);
            setUser(data.data.user);

            return { success: true };
        } catch (err) {
            const errorMsg = err.message || 'Đã có lỗi xảy ra trong quá trình đăng ký';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý đăng xuất
    const logout = async () => {
        setLoading(true);
        try {
            // Thông báo cho server xóa token (nếu backend có hỗ trợ blacklist)
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
            // Bất kể server trả về gì, frontend luôn xóa sạch dữ liệu cục bộ
            localStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
            setLoading(false);
        }
    };

    // Kiểm tra nhanh xem người dùng đã login chưa
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

/**
 * useAuth - Custom hook để các component con sử dụng AuthContext một cách dễ dàng.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

