import { useEffect, useState } from 'react';
import { genreApi } from '@/Services/genreApi';
import { useResourceManagement } from '@/Hooks/useResourceManagement';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import FormModal from '@/Components/FormModal';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Toast from '@/Components/Toast';

export default function GenreManagement() {
    const {
        items: genres,
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
    } = useResourceManagement(genreApi);

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [formLoading, setFormLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Fetch danh sách khi mount hoặc khi filters thay đổi
    useEffect(() => {
        fetchItems(1);
        // eslint-disable-next-line
    }, [search, sortBy, sortDir]);

    // Fetch khi page thay đổi
    useEffect(() => {
        if (page > 1) {
            fetchItems(page);
        }
        // eslint-disable-next-line
    }, [page]);

    // Mở modal tạo mới
    const handleCreate = () => {
        setEditingId(null);
        setFormData({ name: '', description: '' });
        setShowModal(true);
    };

    // Mở modal sửa
    const handleEdit = async (genre) => {
        setEditingId(genre.id);
        setFormData({
            name: genre.name,
            description: genre.description || '',
        });
        setShowModal(true);
    };

    // Submit form
    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError('Tên thể loại không được để trống');
            return;
        }

        setFormLoading(true);
        try {
            let response;
            if (editingId) {
                response = await genreApi.update(editingId, formData);
            } else {
                response = await genreApi.create(formData);
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

    // Xóa
    const handleDelete = async (id) => {
        const success = await deleteItem(id);
        if (success) {
            setToast({ message: 'Xóa thành công!', type: 'success' });
        }
    };

    // Khôi phục
    const handleRestore = async (id) => {
        const success = await restoreItem(id);
        if (success) {
            setToast({ message: 'Khôi phục thành công!', type: 'success' });
        }
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        { key: 'name', label: 'Tên thể loại', sortable: true },
        { key: 'description', label: 'Mô tả', sortable: false },
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
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Quản lý thể loại phim</h1>
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        + Thêm thể loại
                    </button>
                </div>

                {/* Toast */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {/* Error */}
                {error && (
                    <Toast message={error} type="error" onClose={() => setError(null)} />
                )}

                {/* Search & Filter */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <input
                        type="text"
                        placeholder="Tìm kiếm thể loại..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow">
                    {loading ? (
                        <div className="p-8 flex justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            <Table
                                columns={columns}
                                data={genres}
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

                            {/* Pagination */}
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

                {/* Form Modal */}
                <FormModal
                    isOpen={showModal}
                    title={editingId ? 'Sửa thể loại' : 'Tạo thể loại mới'}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    loading={formLoading}
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên thể loại *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="VD: Hành động, Lãng mạn..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Mô tả thể loại..."
                            rows={3}
                        />
                    </div>
                </FormModal>
            </div>
        </div>
    );
}

