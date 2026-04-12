import React from 'react';

/**
 * LoadingSpinner - Hiển thị spinner loading
 */
export default function LoadingSpinner({ size = 'md', message = 'Đang tải...' }) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`${sizeClasses[size]} border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin`}></div>
            {message && <p className="text-gray-600">{message}</p>}
        </div>
    );
}

