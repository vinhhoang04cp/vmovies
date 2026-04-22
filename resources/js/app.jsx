// Import file CSS chính của ứng dụng
import '../css/app.css';
// Khởi chạy file cấu hình ban đầu (Axios, biến môi trường...)
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

// Lấy tên ứng dụng từ biến môi trường, mặc định là 'Laravel'
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Khởi tạo ứng dụng Inertia.js (Mô hình kết hợp chặt chẽ giữa Laravel Backend và React Frontend)
createInertiaApp({
    // Cấu hình Title Bar của trình duyệt (Hiển thị Tên Trang - Tên App)
    title: (title) => `${title} - ${appName}`,
    
    // Resolve (Tìm kiếm và tải) các trang React trong thư mục Pages/
    // Inertia sẽ dựa vào đường dẫn mà Controller backend trả về để map với file .jsx tương ứng
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'), // Tự động gom tất cả file .jsx vào bundle
        ),
        
    // Hàm setup dùng để mount React app vào DOM (Thẻ <div> có id="app" trong file HTML của Laravel)
    setup({ el, App, props }) {
        const root = createRoot(el); // Tạo root cho React 18+

        // Render ứng dụng với các props (dữ liệu ban đầu do Laravel cấp)
        root.render(<App {...props} />);
    },
    
    // Cấu hình thanh tiến trình loading (Progress Bar) xuất hiện ở cạnh trên màn hình khi chuyển trang
    progress: {
        color: '#4B5563', // Màu xám cho thanh progress
    },
});
