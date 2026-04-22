import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

/**
 * Register - Trang Đăng ký tài khoản (Inertia version).
 * 
 * Thành phần này cho phép người dùng mới tạo tài khoản trên hệ thống.
 * Sử dụng hook useForm để quản lý quy trình nhập liệu và xác thực từ Server.
 */
export default function Register() {
    // Khởi tạo các trường dữ liệu: tên, email, mật khẩu và xác nhận mật khẩu.
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    /**
     * submit - Hàm xử lý gửi form đăng ký.
     */
    const submit = (e) => {
        e.preventDefault();

        // Gửi yêu cầu POST đến route 'register' của Laravel.
        post(route('register'), {
            // Sau khi hoàn tất, xóa trắng các trường mật khẩu để đảm bảo an toàn.
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Đăng ký tài khoản" />

            <form onSubmit={submit}>
                {/* Trường nhập Tên người dùng */}
                <div>
                    <InputLabel htmlFor="name" value="Họ và Tên" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* Trường nhập Email */}
                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Địa chỉ Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Trường nhập Mật khẩu */}
                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Mật khẩu" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Trường nhập Xác nhận mật khẩu */}
                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Xác nhận mật khẩu"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                {/* Khu vực hành động: Chuyển sang đăng nhập và nút Đăng ký */}
                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Bạn đã có tài khoản?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Đăng ký ngay
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
