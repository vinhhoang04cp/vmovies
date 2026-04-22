import { useEffect, useState } from 'react';
import { genreApi } from '@/Services/genreApi';
import { useResourceManagement } from '@/Hooks/useResourceManagement';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import FormModal from '@/Components/FormModal';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Toast from '@/Components/Toast';

/**
 * GenreManagement - Thành phần quản lý danh mục Thể loại phim.
 * 
 * Các tính năng chính:
 * 1. Hiển thị danh sách các thể loại phim (Hành động, Tình cảm, Anime,...).
 * 2. Tìm kiếm và sắp xếp các thể loại theo tên hoặc số lượng phim liên quan.
 * 3. Tạo mới và cập nhật thông tin mô tả cho từng thể loại.
 * 4. Tích hợp phân trang và các thông báo trạng thái (Toast).
 */
export default function GenreManagement() {
    // Sử dụng hook useResourceManagement để quản lý các trạng thái chung của tài nguyên (items, pagination, sorting).
    const {
        items: genres,    // Danh sách thể loại phim.
        loading,        // Trạng thái đang tải dữ liệu.
        error,          // Lỗi từ phía server.
        meta,           // Dữ liệu phân trang (Laravel API).
        page,           // Trang hiện tại.
        search,         // Từ khóa tìm kiếm.
        sortBy,         // Cột đang dùng để sắp xếp.
        sortDir,        // Hướng sắp xếp (asc/desc).
        setSearch,      // Cập nhật từ khóa tìm kiếm.
        setPage,        // Chuyển trang dữ liệu.
        setSortBy,      // Đặt cột sắp xếp.
        setSortDir,     // Đặt hướng sắp xếp.
        fetchItems,     // Hàm kích hoạt lấy dữ liệu.
        deleteItem,     // Xóa thể loại.
        restoreItem,    // Khôi phục (nếu có Soft Delete).
        setError,       // Đặt lỗi thủ công.
    } = useResourceManagement(genreApi);

    // --- CÁC STATE QUẢN LÝ FORM VÀ MODAL ---
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null); // ID thể loại đang sửa (null = tạo mới).
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [formLoading, setFormLoading] = useState(false);
    const [toast, setToast] = useState(null);

    /**
     * Effect: Tự động tải lại danh sách khi tiêu chí tìm kiếm hoặc sắp xếp thay đổi.
     */
    useEffect(() => {
        fetchItems(1);
        // eslint-disable-next-line
    }, [search, sortBy, sortDir]);

    /**
     * Effect: Tải lại dữ liệu khi người dùng chuyển trang.
     */
    useEffect(() => {
        if (page > 1) {
            fetchItems(page);
        }
        // eslint-disable-next-line
    }, [page]);

    /**
     * handleCreate: Chuẩn bị form cho việc thêm mới thể loại.
     */
    const handleCreate = () => {
        setEditingId(null);
        setFormData({ name: '', description: '' });
        setShowModal(true);
    };

    /**
     * handleEdit: Nạp dữ liệu của thể loại được chọn vào form để chỉnh sửa.
     * @param {Object} genre - Đối tượng thể loại.
     */
    const handleEdit = async (genre) => {
        setEditingId(genre.id);
        setFormData({
            name: genre.name,
            description: genre.description || '',
        });
        setShowModal(true);
    };

    /**
     * handleSubmit: Gửi yêu cầu lưu dữ liệu (Thêm hoặc Cập nhật) tới API.
     */
    const handleSubmit = async () => {
        // Kiểm tra dữ liệu đầu vào.
        if (!formData.name.trim()) {
            setError('Tên thể loại không được để trống');
            return;
        }

        setFormLoading(true);
        try {
            let response;
            if (editingId) {
                // Thực hiện cập nhật nếu đang trong chế độ sửa.
                response = await genreApi.update(editingId, formData);
            } else {
                // Tạo mới nếu editingId là null.
                response = await genreApi.create(formData);
            }

            if (response.success) {
                setToast({
                    message: editingId ? 'Cập nhật thể loại thành công!' : 'Đã thêm thể loại mới!',
                    type: 'success',
                });
                setShowModal(false);
                await fetchItems(1); // Làm mới danh sách và quay lại trang 1.
            } else {
                setError(response.error || 'Đã có lỗi xảy ra trong quá trình lưu');
            }
        } catch (err) {
            setError(err.message || 'Lỗi kết nối máy chủ');
        } finally {
            setFormLoading(false);
        }
    };

    /**
     * handleDelete: Xóa thể loại phim sau khi người dùng xác nhận.
     */
    const handleDelete = async (id) => {
        if (!window.confirm('Xác nhận xóa thể loại này?')) return;
        const success = await deleteItem(id);
        if (success) {
            setToast({ message: 'Đã xóa thể loại thành công!', type: 'success' });
        }
    };

    /**
     * Định nghĩa cấu trúc các cột hiển thị trong bảng.
     */
    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        { 
            key: 'name', 
            label: 'Thể loại', 
            sortable: true,
            render: (val) => <span className="font-black text-lg uppercase tracking-tight">{val}</span>
        },
        { 
            key: 'description', 
            label: 'Mô tả', 
            sortable: false,
            render: (val) => <p className="text-gray-500 text-sm italic max-w-md line-clamp-2">{val || 'Không có mô tả'}</p>
        },
        {
            key: 'movies_count',
            label: 'Số lượng phim',
            sortable: true,
            render: (value) => <span className="font-bold text-black border-2 border-black px-3 py-1 bg-gray-100">{value || 0}</span>,
        },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* PHẦN TIÊU ĐỀ VÀ NÚT TÁC VỤ CHÍNH */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h1 className="text-4xl font-black text-black uppercase tracking-tighter border-b-8 border-black pb-2">
                        Quản lý thể loại
                    </h1>
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-8 py-3 bg-black text-white border-2 border-black font-black uppercase transition-all shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] hover:bg-gray-900 disabled:opacity-50"
                    >
                        + Thêm thể loại
                    </button>
                </div>

                {/* THÔNG BÁO TOAST */}
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

                {/* THANH TÌM KIẾM */}
                <div className="mb-6 bg-white p-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <input
                        type="text"
                        placeholder="Tìm kiếm thể loại phim..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black outline-none transition-colors"
                    />
                </div>

                {/* BẢNG HIỂN THỊ DỮ LIỆU */}
                <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center gap-4">
                            <LoadingSpinner />
                            <span className="font-black uppercase tracking-widest text-gray-400">Đang đồng bộ thể loại...</span>
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
                                            className="px-4 py-1 text-xs bg-black text-white border border-black font-black uppercase hover:bg-gray-800 transition"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            className="px-4 py-1 text-xs bg-white text-red-600 border border-red-600 font-black uppercase hover:bg-red-50 transition"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                )}
                                loading={loading}
                            />

                            {/* PHẦN TRANG */}
                            {meta.last_page > 1 && (
                                <div className="p-4 border-t-2 border-black bg-gray-50">
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

                {/* MODAL NHẬP LIỆU */}
                <FormModal
                    isOpen={showModal}
                    title={editingId ? 'Chỉnh sửa thể loại' : 'Tạo thể loại mới'}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    loading={formLoading}
                >
                    <div className="space-y-6">
                        {/* TRƯỜNG: TÊN THỂ LOẠI */}
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">
                                Tên thể loại <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50 font-black"
                                placeholder="VD: Hành động, Kinh dị, Anime..."
                            />
                        </div>

                        {/* TRƯỜNG: MÔ TẢ THỂ LOẠI */}
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">
                                Mô tả chi tiết
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50 font-medium"
                                placeholder="Mô tả đặc điểm của thể loại phim này..."
                                rows={5}
                            />
                        </div>
                    </div>
                </FormModal>
            </div>
        </div>
    );
}
