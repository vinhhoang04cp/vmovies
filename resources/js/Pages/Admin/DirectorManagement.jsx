import { useEffect, useState } from 'react';
import { directorApi } from '@/Services/directorApi';
import { useResourceManagement } from '@/Hooks/useResourceManagement';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import FormModal from '@/Components/FormModal';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Toast from '@/Components/Toast';

export default function DirectorManagement() {
    const {
        items: directors,
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
        restoreItem,
        setError,
    } = useResourceManagement(directorApi);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        birth_date: '',
        nationality: '',
        image_url: '',
    });
    const [formLoading, setFormLoading] = useState(false);
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

    const handleCreate = () => {
        setEditingId(null);
        setFormData({
            name: '',
            bio: '',
            birth_date: '',
            nationality: '',
            image_url: '',
        });
        setShowModal(true);
    };

    const handleEdit = async (director) => {
        setEditingId(director.id);
        setFormData({
            name: director.name || '',
            bio: director.bio || '',
            birth_date: director.birth_date || '',
            nationality: director.nationality || '',
            image_url: director.image_url || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError('Tên đạo diễn không được để trống');
            return;
        }

        setFormLoading(true);
        try {
            let response;
            if (editingId) {
                response = await directorApi.update(editingId, formData);
            } else {
                response = await directorApi.create(formData);
            }

            if (response.success) {
                setToast({
                    message: editingId ? 'Cập nhật thành công!' : 'Tạo thành công!',
                    type: 'success',
                });
                setShowModal(false);
                await fetchItems(1);
            } else {
                setError(response.error || 'Lỗi khi lưu');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const success = await deleteItem(id);
        if (success) {
            setToast({ message: 'Xóa thành công!', type: 'success' });
        }
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        { key: 'name', label: 'Tên đạo diễn', sortable: true },
        { key: 'nationality', label: 'Quốc tịch', sortable: true },
        { key: 'birth_date', label: 'Ngày sinh', sortable: true },
        {
            key: 'movies_count',
            label: 'Số phim',
            sortable: true,
            render: (value) => value || 0,
        },
    ];

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Quản lý đạo diễn</h1>
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        + Thêm đạo diễn
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
                        placeholder="Tìm kiếm đạo diễn..."
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
                                data={directors}
                                onSort={(col, dir) => {
                                    setSortBy(col);
                                    setSortDir(dir);
                                }}
                                sortBy={sortBy}
                                sortDir={sortDir}
                                rowAction={(row) => (
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleEdit(row)}
                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                        >
                                            Sửa
                                        </button>
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

                <FormModal
                    isOpen={showModal}
                    title={editingId ? 'Sửa đạo diễn' : 'Tạo đạo diễn mới'}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    loading={formLoading}
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên đạo diễn *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập tên đạo diễn"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quốc tịch
                        </label>
                        <input
                            type="text"
                            value={formData.nationality}
                            onChange={(e) =>
                                setFormData({ ...formData, nationality: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="VD: Việt Nam, Hàn Quốc..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày sinh
                        </label>
                        <input
                            type="date"
                            value={formData.birth_date}
                            onChange={(e) =>
                                setFormData({ ...formData, birth_date: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL Ảnh
                        </label>
                        <input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) =>
                                setFormData({ ...formData, image_url: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tiểu sử
                        </label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) =>
                                setFormData({ ...formData, bio: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Mô tả về đạo diễn..."
                            rows={3}
                        />
                    </div>
                </FormModal>
            </div>
        </div>
    );
}

