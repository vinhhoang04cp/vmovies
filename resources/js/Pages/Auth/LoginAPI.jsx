import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

/**
 * LoginAPI - Trang Đăng nhập dành cho môi trường API/SPA.
 * 
 * Khác với phiên bản Inertia, phiên bản này sử dụng AuthContext để quản lý trạng thái
 * đăng nhập thông qua API Token. Phù hợp cho các ứng dụng React thuần túy kết nối với Laravel Sanctum.
 */
export default function LoginAPI() {
    const navigate = useNavigate();
    
    // Lấy các hàm và trạng thái từ AuthContext.
    const { login, loading, error, setError } = useAuth();

    // Quản lý dữ liệu form bằng useState thuần.
    const [formData, setFormData] = useState({
        email: 'admin@vmovies.com', // Dữ liệu mẫu (có thể xóa khi production)
        password: 'password',
    });

    // Quản lý lỗi validation tại client.
    const [formErrors, setFormErrors] = useState({});

    /**
     * handleChange - Cập nhật dữ liệu form khi người dùng nhập liệu.
     * Tự động xóa thông báo lỗi của trường tương ứng khi người dùng bắt đầu sửa.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        
        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    /**
     * handleSubmit - Xử lý gửi yêu cầu đăng nhập qua API.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setError(null);

        // Kiểm tra validation cơ bản phía Client.
        const errors = {};
        if (!formData.email) errors.email = 'Vui lòng nhập địa chỉ Email';
        if (!formData.password) errors.password = 'Vui lòng nhập mật khẩu';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        // Thực hiện gọi hàm login từ AuthContext.
        const result = await login(formData.email, formData.password);

        if (result.success) {
            // Chuyển hướng đến bảng điều khiển nếu đăng nhập thành công.
            navigate('/dashboard');
        } else {
            // Hiển thị lỗi trả về từ Server.
            setFormErrors({ submit: result.error });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                {/* Header trang đăng nhập */}
                <div className="border-b-2 border-black bg-black px-8 py-10">
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">VMovies</h1>
                    <p className="mt-2 text-gray-400 text-[10px] font-black tracking-[0.3em] uppercase">Hệ thống quản trị nội dung</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-8">
                    {/* Hiển thị thông báo lỗi từ Server */}
                    {(error || formErrors.submit) && (
                        <div className="bg-red-50 p-4 text-xs font-bold text-red-700 border-2 border-red-200 uppercase">
                            ⚠️ {error || formErrors.submit}
                        </div>
                    )}

                    {/* Trường Email */}
                    <div>
                        <InputLabel htmlFor="email" value="Email Quản trị" className="uppercase text-[10px] font-black tracking-widest text-gray-500" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-2 block w-full border-2 border-black rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-none transition-all"
                            placeholder="admin@vmovies.com"
                            disabled={loading}
                            autoComplete="email"
                        />
                        <InputError message={formErrors.email} className="mt-2" />
                    </div>

                    {/* Trường Mật khẩu */}
                    <div>
                        <InputLabel htmlFor="password" value="Mật khẩu" className="uppercase text-[10px] font-black tracking-widest text-gray-500" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-2 block w-full border-2 border-black rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-none transition-all"
                            placeholder="••••••••"
                            disabled={loading}
                            autoComplete="current-password"
                        />
                        <InputError message={formErrors.password} className="mt-2" />
                    </div>

                    {/* Nút gửi */}
                    <div className="pt-4">
                        <PrimaryButton
                            className="w-full justify-center py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-gray-800 transition-all border-2 border-black active:translate-y-1 active:shadow-none"
                            disabled={loading}
                        >
                            {loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
                        </PrimaryButton>
                    </div>

                    {/* Link Đăng ký */}
                    <div className="text-center text-[10px] font-bold text-gray-500 pt-6 border-t border-gray-100 uppercase tracking-widest">
                        Chưa có tài khoản quản trị?{' '}
                        <Link
                            to="/register"
                            className="text-black underline decoration-2 underline-offset-4 hover:text-gray-600 transition-colors"
                        >
                            Đăng ký ngay
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
