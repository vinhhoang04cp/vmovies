import { useEffect, useState } from 'react';
import { countryApi } from '@/Services/countryApi';
import { useResourceManagement } from '@/Hooks/useResourceManagement';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import FormModal from '@/Components/FormModal';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Toast from '@/Components/Toast';

/**
 * CountryManagement - Thành phần giao diện quản lý danh mục Quốc gia (Countries).
 * 
 * Các tính năng chính:
 * 1. Hiển thị danh sách các quốc gia hỗ trợ phim trong hệ thống.
 * 2. Tìm kiếm quốc gia theo tên hoặc mã ISO (VD: VN, US).
 * 3. Thêm mới, chỉnh sửa và xóa thông tin quốc gia.
 * 4. Tự động chuyển mã quốc gia thành chữ in hoa.
 * 5. Hiển thị số lượng phim thuộc về từng quốc gia.
 */
export default function CountryManagement() {
    // Sử dụng custom hook để quản lý các tác vụ CRUD và trạng thái UI (loading, pagination, search).
    const {
        items: countries, // Mảng chứa danh sách quốc gia.
        loading,        // Trạng thái đang tải dữ liệu từ server.
        error,          // Chứa thông tin lỗi nếu có.
        meta,           // Dữ liệu meta phân trang.
        page,           // Trang hiện tại.
        search,         // Từ khóa tìm kiếm hiện tại.
        sortBy,         // Tên cột đang sắp xếp.
        sortDir,        // Hướng sắp xếp (asc/desc).
        setSearch,      // Hàm cập nhật search.
        setPage,        // Hàm cập nhật trang.
        setSortBy,      // Hàm cập nhật cột sắp xếp.
        setSortDir,     // Hàm cập nhật hướng sắp xếp.
        fetchItems,     // Hàm gọi API lấy danh sách mới.
        deleteItem,     // Hàm thực hiện xóa một quốc gia.
        setError,       // Hàm thiết lập thông báo lỗi thủ công.
    } = useResourceManagement(countryApi);

    // --- CÁC STATE QUẢN LÝ UI NỘI BỘ ---
    const [showModal, setShowModal] = useState(false); // Điều khiển việc hiển thị Modal (Thêm/Sửa).
    const [editingId, setEditingId] = useState(null); // Lưu ID của quốc gia đang được chọn để sửa (null = Thêm mới).
    const [formData, setFormData] = useState({ name: '', code: '' }); // Lưu trữ dữ liệu đang nhập trong form.
    const [formLoading, setFormLoading] = useState(false); // Trạng thái loading riêng khi nhấn nút Lưu.
    const [toast, setToast] = useState(null); // Quản lý thông báo Toast hiển thị nhanh.

    /**
     * Effect: Theo dõi search, sortBy và sortDir để tải lại dữ liệu.
     * Luôn quay về trang 1 khi tiêu chí tìm kiếm thay đổi để không bị mất kết quả.
     */
    useEffect(() => {
        fetchItems(1);
        // eslint-disable-next-line
    }, [search, sortBy, sortDir]);

    /**
     * Effect: Tải dữ liệu trang mới khi số trang thay đổi.
     */
    useEffect(() => {
        if (page > 1) {
            fetchItems(page);
        }
        // eslint-disable-next-line
    }, [page]);

    /**
     * handleCreate: Chuẩn bị form trắng để thêm mới quốc gia.
     */
    const handleCreate = () => {
        setEditingId(null);
        setFormData({ name: '', code: '' });
        setShowModal(true);
    };

    /**
     * handleEdit: Điền dữ liệu của quốc gia hiện tại vào form để chỉnh sửa.
     * @param {Object} country - Đối tượng quốc gia được chọn.
     */
    const handleEdit = async (country) => {
        setEditingId(country.id);
        setFormData({
            name: country.name,
            code: country.code || '',
        });
        setShowModal(true);
    };

    /**
     * handleSubmit: Gửi dữ liệu form lên backend (Create hoặc Update).
     */
    const handleSubmit = async () => {
        // Kiểm tra tính hợp lệ cơ bản (Tên không được trống).
        if (!formData.name.trim()) {
            setError('Tên quốc gia không được để trống');
            return;
        }

        setFormLoading(true);
        try {
            let response;
            if (editingId) {
                // Trường hợp Sửa: Gọi API update kèm theo ID.
                response = await countryApi.update(editingId, formData);
            } else {
                // Trường hợp Thêm mới: Gọi API create.
                response = await countryApi.create(formData);
            }

            if (response.success) {
                setToast({
                    message: editingId ? 'Cập nhật quốc gia thành công!' : 'Thêm quốc gia mới thành công!',
                    type: 'success',
                });
                setShowModal(false);
                // Sau khi lưu, tải lại danh sách tại trang đầu để cập nhật thay đổi.
                await fetchItems(1); 
            } else {
                setError(response.error || 'Đã có lỗi xảy ra khi lưu dữ liệu');
            }
        } catch (err) {
            setError(err.message || 'Lỗi kết nối server');
        } finally {
            setFormLoading(false);
        }
    };

    /**
     * handleDelete: Thực hiện xóa quốc gia sau khi đã xác nhận.
     * @param {number} id - ID quốc gia cần xóa.
     */
    const handleDelete = async (id) => {
        // Luôn yêu cầu xác nhận trước khi thực hiện hành động xóa không thể hoàn tác.
        if (!window.confirm('Bạn có chắc chắn muốn xóa quốc gia này? Hành động này có thể ảnh hưởng đến các phim thuộc quốc gia này.')) return;
        
        const success = await deleteItem(id);
        if (success) {
            setToast({ message: 'Đã xóa quốc gia thành công!', type: 'success' });
        }
    };

    /**
     * Cấu hình hiển thị bảng dữ liệu.
     */
    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        { 
            key: 'name', 
            label: 'Tên quốc gia', 
            sortable: true,
            render: (val) => <span className="font-black uppercase tracking-tight">{val}</span>
        },
        { 
            key: 'code', 
            label: 'Mã ISO', 
            sortable: true,
            render: (val) => (
                <span className="px-2 py-0.5 bg-gray-200 text-black border border-black font-mono font-bold text-xs">
                    {val || 'N/A'}
                </span>
            )
        },
        {
            key: 'movies_count',
            label: 'Số phim',
            sortable: true,
            render: (value) => (
                <span className="text-gray-500 font-bold">{value || 0}</span>
            ),
        },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* HEADER VÀ HÀNH ĐỘNG CHÍNH */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-black text-black uppercase tracking-tighter border-b-8 border-black pb-2">
                        Quản lý quốc gia
                    </h1>
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-6 py-2 bg-black text-white border-2 border-black font-black uppercase transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
                    >
                        + Thêm quốc gia
                    </button>
                </div>

                {/* THÀNH PHẦN THÔNG BÁO (TOAST/ERROR) */}
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

                {/* THANH TÌM KIẾM DỮ LIỆU */}
                <div className="mb-6 bg-white p-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <input
                        type="text"
                        placeholder="Tìm kiếm quốc gia theo tên hoặc mã (VD: Vietnam, US...)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black outline-none transition-colors"
                    />
                </div>

                {/* KHU VỰC HIỂN THỊ BẢNG DỮ LIỆU */}
                <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
                    {loading ? (
                        <div className="p-16 flex flex-col items-center gap-4">
                            <LoadingSpinner />
                            <span className="font-black uppercase text-gray-400 italic">Đang tải danh sách quốc gia...</span>
                        </div>
                    ) : (
                        <>
                            <Table
                                columns={columns}
                                data={countries}
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

                            {/* ĐIỀU KHIỂN PHÂN TRANG */}
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

                {/* MODAL FORM: NHẬP LIỆU THÔNG TIN QUỐC GIA */}
                <FormModal
                    isOpen={showModal}
                    title={editingId ? 'Chỉnh sửa thông tin quốc gia' : 'Đăng ký quốc gia mới'}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    loading={formLoading}
                >
                    <div className="space-y-6">
                        {/* TRƯỜNG: TÊN QUỐC GIA */}
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">
                                Tên quốc gia <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full px-3 py-3 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50 font-bold"
                                placeholder="VD: Việt Nam, Hoa Kỳ, Nhật Bản..."
                            />
                        </div>

                        {/* TRƯỜNG: MÃ ISO */}
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">
                                Mã quốc gia (ISO Alpha-2)
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                                }
                                className="w-full px-3 py-3 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50 font-mono text-lg"
                                placeholder="VD: VN, US, JP..."
                                maxLength={3}
                            />
                            <p className="mt-2 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                                * Mã quốc gia được sử dụng để phân loại và hiển thị bản đồ/cờ quốc tế.
                            </p>
                        </div>
                    </div>
                </FormModal>
            </div>
        </div>
    );
}
