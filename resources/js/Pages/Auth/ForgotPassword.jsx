import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

/**
 * ForgotPassword - Trang yêu cầu khôi phục mật khẩu.
 * 
 * Cho phép người dùng nhập email để nhận liên kết đặt lại mật khẩu.
 */
export default function ForgotPassword({ status }) {
    // Chỉ cần quản lý trường email.
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    /**
     * submit - Gửi yêu cầu lấy link reset mật khẩu.
     */
    const submit = (e) => {
        e.preventDefault();

        // Gửi yêu cầu đến route xử lý email khôi phục mật khẩu của Laravel.
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Quên mật khẩu" />

            <div className="mb-4 text-sm text-gray-600">
                Bạn quên mật khẩu? Không vấn đề gì. Hãy cho chúng tôi biết địa chỉ email của bạn 
                 và chúng tôi sẽ gửi cho bạn liên kết đặt lại mật khẩu qua email để bạn có thể chọn mật khẩu mới.
            </div>

            {/* Hiển thị thông báo thành công khi email đã được gửi đi */}
            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="Nhập email của bạn..."
                />

                <InputError message={errors.email} className="mt-2" />

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Gửi liên kết đặt lại mật khẩu
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
