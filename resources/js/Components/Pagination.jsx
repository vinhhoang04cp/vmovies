import React from 'react';

/**
 * Pagination - Điều khiển phân trang
 */
export default function Pagination({
    currentPage = 1,
    lastPage = 1,
    onPageChange,
    perPage = 15,
    total = 0,
}) {
    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, total);

    return (
        <div className="flex items-center justify-between mt-6 p-4 bg-gray-50 rounded border border-gray-200">
            <div className="text-sm text-gray-600">
                Hiển thị {startItem}-{endItem} trên {total} mục
            </div>
            <div className="flex gap-2">
                <button
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    ← Trước
                </button>

                <div className="flex items-center gap-1">
                    {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`px-3 py-2 rounded border transition ${
                                currentPage === page
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    disabled={currentPage >= lastPage}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    Sau →
                </button>
            </div>
        </div>
    );
}

