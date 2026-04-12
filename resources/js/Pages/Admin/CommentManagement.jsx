import { useEffect, useState } from 'react';
import { commentApi } from '@/Services/commentApi';
import { useResourceManagement } from '@/Hooks/useResourceManagement';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Toast from '@/Components/Toast';

export default function CommentManagement() {
    const {
        items: comments,
        loading,
        error,
        meta,
        page,
        search,
        sortBy,
        sortDir,
        setSearch,
        setPage,
        setSortBy,
        setSortDir,
        fetchItems,
        deleteItem,
        setError,
    } = useResourceManagement(commentApi);

    const [toast, setToast] = useState(null);
    const [showPending, setShowPending] = useState(false);

    useEffect(() => {
        fetchItems(1);
        // eslint-disable-next-line
    }, [search, sortBy, sortDir, showPending]);

    useEffect(() => {
        if (page > 1) {
            fetchItems(page);
        }
        // eslint-disable-next-line
    }, [page]);

    const handleApprove = async (id) => {
        try {
            const response = await commentApi.approve(id);
            if (response.success) {
                setToast({ message: 'Phê duyệt bình luận thành công!', type: 'success' });
                await fetchItems(page);
            } else {
                setError(response.error || 'Lỗi khi phê duyệt');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

        const success = await deleteItem(id);
        if (success) {
            setToast({ message: 'Xóa bình luận thành công!', type: 'success' });
        }
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        {
            key: 'user_name',
            label: 'Người dùng',
            sortable: true,
            render: (value) => value || 'Ẩn danh',
        },
        {
            key: 'content',
            label: 'Nội dung',
            sortable: false,
            render: (value) => (
                <div className="max-w-xs truncate text-gray-700">{value}</div>
            ),
        },
        {
            key: 'movie_title',
            label: 'Phim',
            sortable: true,
            render: (value) => value || '-',
        },
        {
            key: 'status',
            label: 'Trạng thái',
            sortable: true,
            render: (value) => (
                <span className={`px-2 py-1 rounded text-white text-sm ${
                    value === 'approved' ? 'bg-green-600' :
                    value === 'pending' ? 'bg-yellow-600' :
                    'bg-red-600'
                }`}>
                    {value === 'approved' ? 'Đã duyệt' :
                     value === 'pending' ? 'Chờ duyệt' :
                     'Từ chối'}
                </span>
            ),
        },
        { key: 'created_at', label: 'Ngày tạo', sortable: true },
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Quản lý bình luận</h1>
                    <button
                        onClick={() => setShowPending(!showPending)}
                        className={`px-4 py-2 rounded transition ${
                            showPending
                                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                    >
                        {showPending ? 'Tất cả bình luận' : 'Chờ phê duyệt'}
                    </button>
                </div>

                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {error && (
                    <Toast message={error} type="error" onClose={() => setError(null)} />
                )}

                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bình luận..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="bg-white rounded-lg shadow">
                    {loading ? (
                        <div className="p-8 flex justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            <Table
                                columns={columns}
                                data={comments}
                                onSort={(col, dir) => {
                                    setSortBy(col);
                                    setSortDir(dir);
                                }}
                                sortBy={sortBy}
                                sortDir={sortDir}
                                rowAction={(row) => (
                                    <div className="flex gap-2 justify-center">
                                        {row.status === 'pending' && (
                                            <button
                                                onClick={() => handleApprove(row.id)}
                                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                                            >
                                                Phê duyệt
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                )}
                                loading={loading}
                            />

                            {meta.last_page > 1 && (
                                <div className="p-4">
                                    <Pagination
                                        currentPage={page}
                                        lastPage={meta.last_page}
                                        total={meta.total}
                                        perPage={meta.per_page}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

