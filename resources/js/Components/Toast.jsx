import React from 'react';

/**
 * Toast - Thông báo tạm thời (success, error, warning, info)
 */
export default function Toast({
    message,
    type = 'info',  // 'success', 'error', 'warning', 'info'
    onClose,
    autoClose = 5000
}) {
    React.useEffect(() => {
        if (autoClose && onClose) {
            const timer = setTimeout(onClose, autoClose);
            return () => clearTimeout(timer);
        }
    }, [autoClose, onClose]);

    const bgClasses = {
        success: 'bg-green-100 text-green-800 border-green-300',
        error: 'bg-red-100 text-red-800 border-red-300',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        info: 'bg-blue-100 text-blue-800 border-blue-300',
    };

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };

    return (
        <div className={`border-l-4 p-4 mb-4 rounded ${bgClasses[type]}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{icons[type]}</span>
                    <span>{message}</span>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-4 font-bold opacity-70 hover:opacity-100"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}

