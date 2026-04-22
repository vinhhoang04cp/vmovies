import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

/**
 * ConfirmPassword - Trang xác nhận mật khẩu.
 * 
 * Được sử dụng khi người dùng cố gắng truy cập vào các khu vực bảo mật yêu cầu xác minh lại danh tính.
 */
export default function ConfirmPassword() {
    // Chỉ yêu cầu nhập mật khẩu hiện tại.
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    /**
     * submit - Gửi yêu cầu xác nhận mật khẩu.
     */
    const submit = (e) => {
        e.preventDefault();

        // Gửi đến route xác nhận của Laravel.
        post(route('password.confirm'), {
            // Xóa trắng mật khẩu sau khi gửi để bảo mật.
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Xác nhận mật khẩu" />

            <div className="mb-4 text-sm text-gray-600">
                Đây là khu vực bảo mật của ứng dụng. Vui lòng xác nhận mật khẩu của bạn trước khi tiếp tục.
            </div>

            <form onSubmit={submit}>
                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Mật khẩu" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Xác nhận
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
