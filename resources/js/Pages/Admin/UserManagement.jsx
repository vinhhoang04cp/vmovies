import { useEffect, useState } from 'react';
import { userApi } from '@/Services/userApi';
import { useResourceManagement } from '@/Hooks/useResourceManagement';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Toast from '@/Components/Toast';

export default function UserManagement() {
    const {
        items: users,
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
        setError,
    } = useResourceManagement(userApi);

    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchItems(1);
        // eslint-disable-next-line
    }, [search, sortBy, sortDir]);

    useEffect(() => {
        if (page > 1) {
            fetchItems(page);
        }
        // eslint-disable-next-line
    }, [page]);

    const handleBan = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn cấm người dùng này?')) return;

        try {
            const response = await userApi.ban(id);
            if (response.success) {
                setToast({ message: 'Cấm người dùng thành công!', type: 'success' });
                await fetchItems(page);
            } else {
                setError(response.error || 'Lỗi khi cấm người dùng');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUnban = async (id) => {
        try {
            const response = await userApi.unban(id);
            if (response.success) {
                setToast({ message: 'Bỏ cấm người dùng thành công!', type: 'success' });
                await fetchItems(page);
            } else {
                setError(response.error || 'Lỗi khi bỏ cấm');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        { key: 'name', label: 'Tên', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        {
            key: 'role',
            label: 'Vai trò',
            sortable: true,
            render: (value) => (
                <span className={`px-2 py-1 rounded text-white text-sm ${
                    value === 'admin' ? 'bg-red-600' : 'bg-blue-600'
                }`}>
                    {value === 'admin' ? 'Admin' : 'Người dùng'}
                </span>
            ),
        },
        {
            key: 'is_banned',
            label: 'Trạng thái',
            sortable: true,
            render: (value) => (
                <span className={`px-2 py-1 rounded text-white text-sm ${
                    value ? 'bg-red-500' : 'bg-green-500'
                }`}>
                    {value ? 'Đã cấm' : 'Hoạt động'}
                </span>
            ),
        },
        { key: 'created_at', label: 'Ngày tạo', sortable: true },
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Quản lý người dùng</h1>
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
                        placeholder="Tìm kiếm người dùng..."
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
                                data={users}
                                onSort={(col, dir) => {
                                    setSortBy(col);
                                    setSortDir(dir);
                                }}
                                sortBy={sortBy}
                                sortDir={sortDir}
                                rowAction={(row) => (
                                    <div className="flex gap-2 justify-center">
                                        {row.is_banned ? (
                                            <button
                                                onClick={() => handleUnban(row.id)}
                                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                                            >
                                                Bỏ cấm
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBan(row.id)}
                                                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                                            >
                                                Cấm
                                            </button>
                                        )}
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

