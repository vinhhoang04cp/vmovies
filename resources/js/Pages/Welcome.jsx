import { Head, Link } from '@inertiajs/react';

/**
 * Welcome - Trang chào mừng mặc định của ứng dụng VMovies.
 * 
 * Hiển thị các liên kết điều hướng cơ bản và giới thiệu về hệ sinh thái.
 */
export default function Welcome({ auth, laravelVersion, phpVersion }) {
    /**
     * handleImageError - Xử lý khi ảnh screenshot không tải được.
     */
    const handleImageError = () => {
        document
            .getElementById('screenshot-container')
            ?.classList.add('!hidden');
        document.getElementById('docs-card')?.classList.add('!row-span-1');
        document
            .getElementById('docs-card-content')
            ?.classList.add('!flex-row');
        document.getElementById('background')?.classList.add('!hidden');
    };

    return (
        <>
            <Head title="Chào mừng đến với VMovies" />
            <div className="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50">
                {/* Background Decoration */}
                <img
                    id="background"
                    className="absolute -left-20 top-0 max-w-[877px]"
                    src="https://laravel.com/assets/img/welcome/background.svg"
                />
                <div className="relative flex min-h-screen flex-col items-center justify-center selection:bg-[#FF2D20] selection:text-white">
                    <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                        {/* Header: Logo và Navigation */}
                        <header className="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3">
                            <div className="flex lg:col-start-2 lg:justify-center">
                                {/* VMovies Logo Placeholder / Icon */}
                                <div className="text-4xl font-black text-black dark:text-white uppercase italic tracking-tighter">
                                    VMovies
                                </div>
                            </div>
                            <nav className="-mx-3 flex flex-1 justify-end">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white font-bold"
                                    >
                                        Bảng điều khiển
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white font-bold"
                                        >
                                            Đăng nhập
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white font-bold"
                                        >
                                            Đăng ký
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </header>

                        <main className="mt-6">
                            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
                                {/* Card: Tài liệu hướng dẫn */}
                                <div
                                    className="flex flex-col items-start gap-6 overflow-hidden rounded-lg bg-white p-6 shadow-xl ring-1 ring-black/5 transition duration-300 hover:ring-black/20 lg:p-10 dark:bg-zinc-900"
                                >
                                    <div className="relative flex items-center gap-6">
                                        <div className="pt-3 sm:pt-5 lg:pt-0">
                                            <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight">
                                                Hệ thống Quản lý Phim
                                            </h2>

                                            <p className="mt-4 text-sm/relaxed">
                                                Chào mừng bạn đến với VMovies - Hệ thống quản lý và trình phát phim hiện đại. 
                                                Dự án này được xây dựng trên nền tảng Laravel, React và InertiaJS, 
                                                mang lại trải nghiệm mượt mà và hiệu năng cao.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card: Tính năng nổi bật */}
                                <div
                                    className="flex flex-col items-start gap-6 overflow-hidden rounded-lg bg-white p-6 shadow-xl ring-1 ring-black/5 transition duration-300 hover:ring-black/20 lg:p-10 dark:bg-zinc-900"
                                >
                                    <div className="relative flex items-center gap-6">
                                        <div className="pt-3 sm:pt-5 lg:pt-0">
                                            <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight">
                                                Công nghệ hiện đại
                                            </h2>

                                            <p className="mt-4 text-sm/relaxed">
                                                Sử dụng TailwindCSS cho giao diện "Brutalist" mạnh mẽ, 
                                                kết hợp cùng cơ chế xác thực đa dạng (Inertia Session & API Token) 
                                                giúp hệ thống linh hoạt và bảo mật.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>

                        <footer className="py-16 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white/70">
                            VMovies &copy; {new Date().getFullYear()} | Laravel v{laravelVersion} (PHP v{phpVersion})
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
