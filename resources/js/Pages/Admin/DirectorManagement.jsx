import { useEffect, useState } from 'react';
import { directorApi } from '@/Services/directorApi';
import { useResourceManagement } from '@/Hooks/useResourceManagement';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import FormModal from '@/Components/FormModal';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Toast from '@/Components/Toast';

/**
 * DirectorManagement - Thành phần giao diện dành cho việc quản lý cơ sở dữ liệu Đạo diễn.
 * 
 * Các chức năng bao gồm:
 * 1. Hiển thị danh sách đạo diễn dưới dạng bảng với khả năng sắp xếp.
 * 2. Tìm kiếm đạo diễn theo tên hoặc các thuộc tính khác.
 * 3. Quản lý thông tin chi tiết: tiểu sử, ngày sinh, quốc tịch và ảnh chân dung.
 * 4. Tích hợp phân trang dữ liệu mượt mà.
 */
export default function DirectorManagement() {
    // Sử dụng hook useResourceManagement để trừu tượng hóa các tương tác API phức tạp.
    const {
        items: directors, // Danh sách đạo diễn hiện có.
        loading,        // Trạng thái đang tải từ API.
        error,          // Lưu trữ các thông báo lỗi hệ thống.
        meta,           // Dữ liệu phân trang của Laravel.
        page,           // Trang dữ liệu hiện tại.
        search,         // Từ khóa tìm kiếm từ ô input.
        sortBy,         // Trường đang được dùng để sắp xếp kết quả.
        sortDir,        // Hướng sắp xếp: 'asc' hoặc 'desc'.
        setSearch,      // Cập nhật từ khóa tìm kiếm.
        setPage,        // Chuyển trang.
        setSortBy,      // Cập nhật trường sắp xếp.
        setSortDir,     // Cập nhật hướng sắp xếp.
        fetchItems,     // Hàm kích hoạt việc lấy dữ liệu từ server.
        deleteItem,     // Hàm thực thi lệnh xóa bản ghi.
        setError,       // Hàm thủ công để đặt thông báo lỗi lên giao diện.
    } = useResourceManagement(directorApi);

    // --- CÁC STATE NỘI BỘ QUẢN LÝ FORM VÀ UI ---
    const [showModal, setShowModal] = useState(false); // Điều khiển ẩn/hiện Modal form.
    const [editingId, setEditingId] = useState(null); // Lưu ID đạo diễn đang được sửa (null = tạo mới).
    const [formData, setFormData] = useState({        // Trạng thái lưu trữ dữ liệu nhập liệu của form.
        name: '',
        bio: '',
        birth_date: '',
        nationality: '',
        image_url: '',
    });
    const [formLoading, setFormLoading] = useState(false); // Trạng thái loading riêng cho nút lưu form.
    const [toast, setToast] = useState(null); // Quản lý các thông báo Toast thành công/thất bại.

    /**
     * Effect: Tự động tải lại dữ liệu khi tiêu chí tìm kiếm hoặc sắp xếp thay đổi.
     * Luôn reset về trang 1 khi tiêu chí lọc thay đổi để tránh bị lỗi trang không tồn tại.
     */
    useEffect(() => {
        fetchItems(1);
        // eslint-disable-next-line
    }, [search, sortBy, sortDir]);

    /**
     * Effect: Xử lý việc tải dữ liệu khi người dùng chuyển trang thông qua Pagination.
     */
    useEffect(() => {
        if (page > 1) {
            fetchItems(page);
        }
        // eslint-disable-next-line
    }, [page]);

    /**
     * handleCreate: Khởi tạo state cho việc tạo mới một đạo diễn.
     */
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

    /**
     * handleEdit: Nạp dữ liệu hiện có của đạo diễn vào form để chỉnh sửa.
     * @param {Object} director - Đối tượng đạo diễn được chọn từ bảng.
     */
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

    /**
     * handleSubmit: Xử lý việc gửi yêu cầu Lưu (Thêm/Sửa) tới backend.
     */
    const handleSubmit = async () => {
        // Validation phía Client: Kiểm tra tên bắt buộc.
        if (!formData.name.trim()) {
            setError('Tên đạo diễn là thông tin bắt buộc');
            return;
        }

        setFormLoading(true);
        try {
            let response;
            if (editingId) {
                // Nếu đang có ID -> Thực hiện cập nhật.
                response = await directorApi.update(editingId, formData);
            } else {
                // Nếu ID là null -> Thực hiện tạo mới.
                response = await directorApi.create(formData);
            }

            if (response.success) {
                setToast({
                    message: editingId ? 'Cập nhật thông tin đạo diễn thành công!' : 'Đã thêm đạo diễn mới thành công!',
                    type: 'success',
                });
                setShowModal(false);
                // Cập nhật lại danh sách hiển thị sau khi thao tác thành công.
                await fetchItems(1); 
            } else {
                setError(response.error || 'Đã có lỗi xảy ra trong quá trình lưu dữ liệu');
            }
        } catch (err) {
            setError(err.message || 'Lỗi kết nối tới hệ thống');
        } finally {
            setFormLoading(false);
        }
    };

    /**
     * handleDelete: Xử lý gỡ bỏ thông tin đạo diễn sau khi người dùng xác nhận.
     * @param {number} id - ID của đạo diễn cần xóa.
     */
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đạo diễn này không? Hành động này không thể hoàn tác.')) return;
        
        const success = await deleteItem(id);
        if (success) {
            setToast({ message: 'Xóa đạo diễn thành công!', type: 'success' });
        }
    };

    /**
     * Cấu hình các cột hiển thị cho Table.
     */
    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        { 
            key: 'name', 
            label: 'Đạo diễn', 
            sortable: true,
            render: (val) => <span className="font-black uppercase">{val}</span>
        },
        { 
            key: 'nationality', 
            label: 'Quốc tịch', 
            sortable: true,
            render: (val) => val || <span className="text-gray-300 italic">Chưa cập nhật</span>
        },
        { 
            key: 'birth_date', 
            label: 'Ngày sinh', 
            sortable: true,
            render: (val) => val ? new Date(val).toLocaleDateString('vi-VN') : '-'
        },
        {
            key: 'movies_count',
            label: 'Tổng phim',
            sortable: true,
            render: (value) => <span className="font-bold text-black">{value || 0}</span>,
        },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* TIÊU ĐỀ TRANG VÀ NÚT TẠO MỚI */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h1 className="text-4xl font-black text-black uppercase tracking-tighter border-b-8 border-black pb-2">
                        Quản lý đạo diễn
                    </h1>
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-8 py-3 bg-black text-white border-2 border-black font-black uppercase transition-all shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] hover:bg-gray-900 disabled:opacity-50"
                    >
                        + Đạo diễn mới
                    </button>
                </div>

                {/* THÔNG BÁO TẠM THỜI (TOAST) */}
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

                {/* THANH TÌM KIẾM DỮ LIỆU */}
                <div className="mb-6 bg-white p-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đạo diễn theo tên, tiểu sử hoặc quốc tịch..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black outline-none transition-colors"
                    />
                </div>

                {/* VÙNG HIỂN THỊ DỮ LIỆU BẢNG */}
                <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center gap-4">
                            <LoadingSpinner />
                            <span className="font-black uppercase tracking-widest text-gray-400">Đang đồng bộ dữ liệu đạo diễn...</span>
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

                            {/* ĐIỀU HƯỚNG PHÂN TRANG */}
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

                {/* MODAL CẬP NHẬT DỮ LIỆU */}
                <FormModal
                    isOpen={showModal}
                    title={editingId ? 'Chỉnh sửa đạo diễn' : 'Thêm mới đạo diễn'}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    loading={formLoading}
                >
                    <div className="space-y-6">
                        {/* TRƯỜNG: TÊN ĐẠO DIỄN */}
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">
                                Tên đạo diễn <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50 font-bold"
                                placeholder="VD: Christopher Nolan, Steven Spielberg..."
                            />
                        </div>

                        {/* TRƯỜNG: QUỐC TỊCH & NGÀY SINH (CHIA CỘT) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">
                                    Quốc tịch
                                </label>
                                <input
                                    type="text"
                                    value={formData.nationality}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nationality: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50 font-bold"
                                    placeholder="VD: Việt Nam, Hoa Kỳ..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">
                                    Ngày sinh
                                </label>
                                <input
                                    type="date"
                                    value={formData.birth_date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, birth_date: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50 font-bold"
                                />
                            </div>
                        </div>

                        {/* TRƯỜNG: URL ẢNH CHÂN DUNG */}
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">
                                URL Ảnh chân dung (Tùy chọn)
                            </label>
                            <input
                                type="url"
                                value={formData.image_url}
                                onChange={(e) =>
                                    setFormData({ ...formData, image_url: e.target.value })
                                }
                                className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50"
                                placeholder="Link liên kết ảnh (https://...)"
                            />
                        </div>

                        {/* TRƯỜNG: TIỂU SỬ CHI TIẾT */}
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">
                                Tiểu sử / Thông tin nghề nghiệp
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) =>
                                    setFormData({ ...formData, bio: e.target.value })
                                }
                                className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50 font-medium"
                                placeholder="Tóm tắt sự nghiệp, các tác phẩm nổi bật hoặc thành tựu..."
                                rows={5}
                            />
                        </div>
                    </div>
                </FormModal>
            </div>
        </div>
    );
}
