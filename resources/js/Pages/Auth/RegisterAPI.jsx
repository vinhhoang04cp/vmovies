import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

/**
 * RegisterAPI - Trang Đăng ký dành cho môi trường API/SPA.
 * 
 * Sử dụng AuthContext để thực hiện đăng ký thông qua API.
 * Bao gồm logic kiểm tra validation chi tiết phía Client trước khi gửi yêu cầu.
 */
export default function RegisterAPI() {
    const navigate = useNavigate();
    const { register, loading, error, setError } = useAuth();

    // Khởi tạo trạng thái dữ liệu form.
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    // Quản lý lỗi validation phía Client.
    const [formErrors, setFormErrors] = useState({});

    /**
     * handleChange - Cập nhật dữ liệu khi người dùng nhập liệu.
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
     * handleSubmit - Xử lý đăng ký tài khoản mới.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setError(null);

        // --- VALIDATION CHI TIẾT PHÍA CLIENT ---
        const errors = {};
        if (!formData.name) errors.name = 'Vui lòng nhập họ tên đầy đủ';
        
        if (!formData.email) {
            errors.email = 'Vui lòng nhập địa chỉ email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Định dạng email không hợp lệ';
        }

        if (!formData.password) {
            errors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.password_confirmation) {
            errors.password_confirmation = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.password !== formData.password_confirmation) {
            errors.password_confirmation = 'Mật khẩu xác nhận không khớp';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        // Gọi hàm đăng ký từ context.
        const result = await register(
            formData.name,
            formData.email,
            formData.password,
            formData.password_confirmation
        );

        if (result.success) {
            navigate('/dashboard');
        } else {
            setFormErrors({ submit: result.error });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                {/* Header trang đăng ký */}
                <div className="border-b-2 border-black bg-black px-8 py-10">
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">VMovies</h1>
                    <p className="mt-2 text-gray-400 text-[10px] font-black tracking-[0.3em] uppercase">Khởi tạo tài khoản quản trị</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-8">
                    {/* Hiển thị lỗi từ hệ thống */}
                    {(error || formErrors.submit) && (
                        <div className="bg-red-50 p-4 text-xs font-bold text-red-700 border-2 border-red-200 uppercase">
                            ⚠️ {error || formErrors.submit}
                        </div>
                    )}

                    {/* Trường Họ tên */}
                    <div>
                        <InputLabel htmlFor="name" value="Họ và Tên" className="uppercase text-[10px] font-black tracking-widest text-gray-500" />
                        <TextInput
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-2 block w-full border-2 border-black rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                            placeholder="Nguyễn Văn A"
                            disabled={loading}
                            autoComplete="name"
                        />
                        <InputError message={formErrors.name} className="mt-2" />
                    </div>

                    {/* Trường Email */}
                    <div>
                        <InputLabel htmlFor="email" value="Địa chỉ Email" className="uppercase text-[10px] font-black tracking-widest text-gray-500" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-2 block w-full border-2 border-black rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                            placeholder="admin@vmovies.com"
                            disabled={loading}
                            autoComplete="email"
                        />
                        <InputError message={formErrors.email} className="mt-2" />
                    </div>

                    {/* Trường Mật khẩu */}
                    <div>
                        <InputLabel htmlFor="password" value="Mật khẩu mới" className="uppercase text-[10px] font-black tracking-widest text-gray-500" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-2 block w-full border-2 border-black rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                            placeholder="••••••••"
                            disabled={loading}
                            autoComplete="new-password"
                        />
                        <InputError message={formErrors.password} className="mt-2" />
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Xác nhận lại mật khẩu" className="uppercase text-[10px] font-black tracking-widest text-gray-500" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            className="mt-2 block w-full border-2 border-black rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                            placeholder="••••••••"
                            disabled={loading}
                            autoComplete="new-password"
                        />
                        <InputError message={formErrors.password_confirmation} className="mt-2" />
                    </div>

                    {/* Nút Đăng ký */}
                    <div className="pt-4">
                        <PrimaryButton
                            className="w-full justify-center py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-gray-800 transition-all border-2 border-black"
                            disabled={loading}
                        >
                            {loading ? 'Đang khởi tạo tài khoản...' : 'Đăng ký tài khoản'}
                        </PrimaryButton>
                    </div>

                    {/* Link Đăng nhập */}
                    <div className="text-center text-[10px] font-bold text-gray-500 pt-6 border-t border-gray-100 uppercase tracking-widest">
                        Bạn đã có tài khoản?{' '}
                        <Link
                            to="/login"
                            className="text-black underline decoration-2 underline-offset-4 hover:text-gray-600 transition-colors"
                        >
                            Đăng nhập ngay
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
