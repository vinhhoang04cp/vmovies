import { useEffect, useState } from 'react';
import { actorApi } from '@/Services/actorApi';
import { useResourceManagement } from '@/Hooks/useResourceManagement';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import FormModal from '@/Components/FormModal';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Toast from '@/Components/Toast';

export default function ActorManagement() {
    const {
        items: actors,
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
    } = useResourceManagement(actorApi);

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

    const handleEdit = async (actor) => {
        setEditingId(actor.id);
        setFormData({
            name: actor.name || '',
            bio: actor.bio || '',
            birth_date: actor.birth_date || '',
            nationality: actor.nationality || '',
            image_url: actor.image_url || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError('Tên diễn viên không được để trống');
            return;
        }

        setFormLoading(true);
        try {
            let response;
            if (editingId) {
                response = await actorApi.update(editingId, formData);
            } else {
                response = await actorApi.create(formData);
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
        { key: 'name', label: 'Tên diễn viên', sortable: true },
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
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-4xl font-extrabold text-black uppercase tracking-tight border-b-4 border-black inline-block pb-2">Quản lý diễn viên</h1>
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-4 py-2 bg-black text-white rounded-none border border-black hover:bg-gray-800 hover:text-white uppercase font-bold disabled:opacity-50 transition"
                    >
                        + Thêm diễn viên
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

                <div className="mb-6 bg-white p-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
                    <input
                        type="text"
                        placeholder="Tìm kiếm diễn viên..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    />
                </div>

                <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
                    {loading ? (
                        <div className="p-8 flex justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            <Table
                                columns={columns}
                                data={actors}
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
                                            className="px-3 py-1 text-sm bg-black text-white rounded-none border border-black hover:bg-gray-800 hover:text-white uppercase font-bold transition"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            className="px-3 py-1 text-sm bg-red-600 text-white rounded-none hover:bg-red-800 uppercase font-bold transition"
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
                    title={editingId ? 'Sửa diễn viên' : 'Tạo diễn viên mới'}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    loading={formLoading}
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên diễn viên *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            placeholder="Nhập tên diễn viên"
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
                            className="w-full px-3 py-2 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
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
                            className="w-full px-3 py-2 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
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
                            className="w-full px-3 py-2 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
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
                            className="w-full px-3 py-2 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            placeholder="Mô tả về diễn viên..."
                            rows={3}
                        />
                    </div>
                </FormModal>
            </div>
        </div>
    );
}

