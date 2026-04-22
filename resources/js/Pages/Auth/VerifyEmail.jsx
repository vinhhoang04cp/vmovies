import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

/**
 * VerifyEmail - Trang xác thực email.
 * 
 * Hiển thị sau khi đăng ký nếu hệ thống yêu cầu xác nhận email trước khi sử dụng.
 */
export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    /**
     * submit - Gửi lại email xác thực.
     */
    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Xác thực Email" />

            <div className="mb-4 text-sm text-gray-600">
                Cảm ơn bạn đã đăng ký! Trước khi bắt đầu, bạn có thể xác thực địa chỉ email của mình 
                bằng cách nhấp vào liên kết chúng tôi vừa gửi cho bạn không? Nếu bạn không nhận được email, 
                chúng tôi sẽ sẵn lòng gửi cho bạn một email khác.
            </div>

            {/* Thông báo khi liên kết xác thực mới đã được gửi */}
            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    Một liên kết xác thực mới đã được gửi đến địa chỉ email bạn đã cung cấp khi đăng ký.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <PrimaryButton disabled={processing}>
                        Gửi lại email xác thực
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Đăng xuất
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
