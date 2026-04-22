import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

/**
 * Login - Trang Đăng nhập (Inertia version).
 * 
 * Thành phần này xử lý việc đăng nhập của người dùng thông qua Inertia.js.
 * Nó sử dụng hook useForm để quản lý trạng thái biểu mẫu, xử lý lỗi và gửi dữ liệu.
 */
export default function Login({ status, canResetPassword }) {
    // Khởi tạo form với các trường cần thiết: email, password và remember.
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    /**
     * submit - Hàm xử lý gửi biểu mẫu.
     * Ngăn chặn hành vi mặc định của form và gửi yêu cầu POST đến route 'login'.
     */
    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            // Sau khi hoàn tất (thành công hoặc thất bại), reset lại trường mật khẩu để bảo mật.
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Đăng nhập" />

            {/* Hiển thị trạng thái thông báo từ server (ví dụ: thông báo reset mật khẩu thành công) */}
            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                {/* Trường nhập Email */}
                <div>
                    <InputLabel htmlFor="email" value="Địa chỉ Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
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
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Tùy chọn Ghi nhớ đăng nhập */}
                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Ghi nhớ đăng nhập
                        </span>
                    </label>
                </div>

                {/* Khu vực hành động: Quên mật khẩu và Nút Đăng nhập */}
                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Quên mật khẩu?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Đăng nhập
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
