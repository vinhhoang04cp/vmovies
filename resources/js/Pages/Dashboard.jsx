import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

/**
 * Dashboard - Trang cá nhân sau khi đăng nhập (Breeze Default).
 * 
 * Đây là trang mặc định của Laravel Breeze sau khi người dùng đăng nhập thành công.
 * Trang này sử dụng AuthenticatedLayout để đảm bảo chỉ những người dùng đã xác thực mới có thể truy cập.
 */
export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-gray-800 uppercase tracking-tight">
                    Bảng điều khiển cá nhân
                </h2>
            }
        >
            {/* Cập nhật tiêu đề tab trình duyệt */}
            <Head title="Bảng điều khiển" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:rounded-xl">
                        <div className="p-10 text-gray-900">
                            <h3 className="text-2xl font-black mb-2 uppercase">Chào mừng bạn trở lại!</h3>
                            <p className="text-gray-500 font-medium">Bạn đã đăng nhập thành công vào hệ thống VMovies.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
