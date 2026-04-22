import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

/**
 * ResetPassword - Trang đặt lại mật khẩu mới.
 * 
 * Người dùng sử dụng trang này sau khi nhấp vào liên kết từ email khôi phục mật khẩu.
 */
export default function ResetPassword({ token, email }) {
    // Khởi tạo form với token và email được cung cấp từ URL, cùng các trường mật khẩu mới.
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    /**
     * submit - Gửi yêu cầu cập nhật mật khẩu mới.
     */
    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            // Sau khi hoàn tất, xóa trắng mật khẩu.
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Đặt lại mật khẩu" />

            <form onSubmit={submit}>
                {/* Trường Email (thường đã được điền sẵn) */}
                <div>
                    <InputLabel htmlFor="email" value="Địa chỉ Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Trường Mật khẩu mới */}
                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Mật khẩu mới" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Xác nhận mật khẩu"
                    />

                    <TextInput
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Cập nhật mật khẩu
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
