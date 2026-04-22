import { Navigate } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';

/**
 * ProtectedRoute - Thành phần bảo vệ các trang yêu cầu đăng nhập.
 * 
 * @param {boolean} adminOnly - Nếu true, chỉ tài khoản có role 'admin' mới được truy cập.
 */
export function ProtectedRoute({ children, adminOnly = false }) {
    const { isAuthenticated, loading, user } = useAuth();

    // Trong khi đang kiểm tra token và user info, hiển thị màn hình loading
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600 mx-auto"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    // Nếu không có token hoặc chưa đăng nhập -> Chuyển hướng về trang Login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Nếu trang yêu cầu quyền Admin mà người dùng hiện tại không phải Admin -> Chuyển về Dashboard
    if (adminOnly && user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    // Đủ điều kiện -> Hiển thị nội dung bên trong (children)
    return children;
}

/**
 * PublicRoute - Ngược lại với ProtectedRoute, bảo vệ các trang KHÔNG dành cho người đã đăng nhập.
 * Ví dụ: Đã login rồi thì không cho quay lại trang Login/Register nữa.
 */
export function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600 mx-auto"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Nếu đã đăng nhập -> Không cho vào trang login/register, đẩy thẳng vào dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

