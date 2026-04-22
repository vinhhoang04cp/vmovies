import { useEffect, useState } from 'react';
import { actorApi } from '@/Services/actorApi';
import { useResourceManagement } from '@/Hooks/useResourceManagement';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import FormModal from '@/Components/FormModal';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Toast from '@/Components/Toast';

/**
 * ActorManagement - Thành phần giao diện quản lý danh sách diễn viên dành cho quản trị viên.
 * 
 * Component này cung cấp các tính năng:
 * 1. Hiển thị danh sách diễn viên dưới dạng bảng (Table).
 * 2. Tìm kiếm diễn viên theo tên.
 * 3. Phân trang dữ liệu từ server.
 * 4. Thêm mới diễn viên thông qua Modal.
 * 5. Chỉnh sửa thông tin diễn viên hiện có.
 * 6. Xóa diễn viên.
 * 
 * Sử dụng `useResourceManagement` - một custom hook giúp trừu tượng hóa các logic 
 * gọi API CRUD cơ bản, quản lý trạng thái loading, lỗi và phân trang.
 */
export default function ActorManagement() {
    // Giải cấu trúc các giá trị trả về từ custom hook quản lý tài nguyên.
    // actorApi là đối tượng chứa các phương thức gọi API (get, create, update, delete).
    const {
        items: actors, // Danh sách diễn viên hiện tại được hiển thị trên bảng.
        loading,       // Trạng thái boolean chỉ định dữ liệu đang được tải từ API.
        error,         // Lưu trữ thông báo lỗi nếu có bất kỳ lỗi nào xảy ra trong quá trình gọi API.
        meta,          // Thông tin meta của Laravel Pagination (tổng bản ghi, số trang, v.v.).
        page,          // Số trang hiện tại người dùng đang xem.
        search,        // Từ khóa tìm kiếm hiện tại.
        sortBy,        // Tên cột đang được dùng để sắp xếp (ví dụ: 'name', 'id').
        sortDir,       // Hướng sắp xếp: 'asc' (tăng dần) hoặc 'desc' (giảm dần).
        setSearch,     // Hàm để cập nhật từ khóa tìm kiếm.
        setPage,       // Hàm để thay đổi trang hiện tại.
        setSortBy,     // Hàm để thay đổi cột sắp xếp.
        setSortDir,    // Hàm để thay đổi hướng sắp xếp.
        fetchItems,    // Hàm thực hiện gọi API để lấy dữ liệu dựa trên search/page/sort.
        deleteItem,    // Hàm thực hiện gọi API xóa một bản ghi.
        restoreItem,   // Hàm khôi phục bản ghi (nếu API hỗ trợ soft delete).
        setError,      // Hàm thủ công để thiết lập thông báo lỗi.
    } = useResourceManagement(actorApi);

    // --- CÁC STATE NỘI BỘ ---
    const [showModal, setShowModal] = useState(false); // Trạng thái hiển thị/ẩn Modal form
    const [editingId, setEditingId] = useState(null); // ID của diễn viên đang được chỉnh sửa (null nếu là thêm mới)
    const [formData, setFormData] = useState({        // Dữ liệu form nhập liệu
        name: '',
        bio: '',
        birth_date: '',
        nationality: '',
        image_url: '',
    });
    const [formLoading, setFormLoading] = useState(false); // Trạng thái loading riêng cho nút Submit form
    const [toast, setToast] = useState(null);              // Quản lý thông báo toast tạm thời

    /**
     * Effect: Theo dõi sự thay đổi của search, sortBy và sortDir.
     * Khi người dùng thay đổi tiêu chí tìm kiếm hoặc sắp xếp, chúng ta quay lại trang 1
     * để đảm bảo dữ liệu hiển thị chính xác từ đầu danh sách kết quả mới.
     */
    useEffect(() => {
        fetchItems(1); 
        // eslint-disable-next-line
    }, [search, sortBy, sortDir]);

    /**
     * Effect: Theo dõi sự thay đổi của trang (page).
     * Khi người dùng nhấn vào các nút phân trang, fetchItems sẽ được gọi với số trang tương ứng.
     */
    useEffect(() => {
        if (page > 1) {
            fetchItems(page);
        }
        // eslint-disable-next-line
    }, [page]);

    /**
     * handleCreate: Chuẩn bị state để mở modal thêm mới.
     * - Đặt editingId về null để Form biết đây là chế độ "Thêm mới".
     * - Reset formData về giá trị mặc định.
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
     * handleEdit: Chuẩn bị dữ liệu để mở modal chỉnh sửa.
     * @param {Object} actor - Đối tượng diễn viên được chọn từ bảng.
     */
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

    /**
     * handleSubmit: Xử lý việc gửi dữ liệu lên server.
     * Logic sẽ tự động phân nhánh dựa trên việc có `editingId` hay không.
     */
    const handleSubmit = async () => {
        // Validation cơ bản phía client: Tên không được để trống.
        if (!formData.name.trim()) {
            setError('Tên diễn viên không được để trống');
            return;
        }

        setFormLoading(true);
        try {
            let response;
            if (editingId) {
                // Chế độ Cập nhật: Gọi API update với ID tương ứng.
                response = await actorApi.update(editingId, formData);
            } else {
                // Chế độ Thêm mới: Gọi API create.
                response = await actorApi.create(formData);
            }

            if (response.success) {
                setToast({
                    message: editingId ? 'Cập nhật diễn viên thành công!' : 'Thêm diễn viên mới thành công!',
                    type: 'success',
                });
                setShowModal(false);
                // Sau khi lưu thành công, tải lại trang 1 để cập nhật danh sách hiển thị.
                await fetchItems(1); 
            } else {
                // Xử lý trường hợp API trả về thông báo lỗi cụ thể.
                setError(response.error || 'Đã có lỗi xảy ra khi lưu dữ liệu');
            }
        } catch (err) {
            // Xử lý lỗi kết nối hoặc lỗi ngoại lệ khác.
            setError(err.message || 'Lỗi hệ thống, vui lòng thử lại sau');
        } finally {
            setFormLoading(false);
        }
    };

    /**
     * handleDelete: Xử lý xóa diễn viên sau khi xác nhận.
     * @param {number} id - ID của diễn viên cần xóa.
     */
    const handleDelete = async (id) => {
        // Hàm deleteItem từ hook đã bao gồm việc hiển thị confirm và gọi API.
        const success = await deleteItem(id);
        if (success) {
            setToast({ message: 'Xóa diễn viên thành công!', type: 'success' });
        }
    };

    /**
     * Định nghĩa cấu trúc các cột cho component Table.
     * Mỗi cột bao gồm key (trường dữ liệu), label (tiêu đề hiển thị) và các thuộc tính khác.
     */
    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        { key: 'name', label: 'Tên diễn viên', sortable: true },
        { key: 'nationality', label: 'Quốc tịch', sortable: true },
        { key: 'birth_date', label: 'Ngày sinh', sortable: true },
        {
            key: 'movies_count',
            label: 'Số phim tham gia',
            sortable: true,
            // Sử dụng hàm render để tùy chỉnh hiển thị giá trị mặc định nếu là null/undefined.
            render: (value) => value || 0,
        },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* TIÊU ĐỀ TRANG VÀ NÚT THÊM MỚI */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-4xl font-extrabold text-black uppercase tracking-tight border-b-4 border-black inline-block pb-2">
                        Quản lý diễn viên
                    </h1>
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-4 py-2 bg-black text-white rounded-none border border-black hover:bg-gray-800 hover:text-white uppercase font-bold disabled:opacity-50 transition shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                    >
                        + Thêm diễn viên
                    </button>
                </div>

                {/* THÔNG BÁO TOAST (HIỂN THỊ TẠM THỜI) */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {/* THÔNG BÁO LỖI (NẾU CÓ) */}
                {error && (
                    <Toast message={error} type="error" onClose={() => setError(null)} />
                )}

                {/* BỘ LỌC TÌM KIẾM */}
                <div className="mb-6 bg-white p-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
                    <input
                        type="text"
                        placeholder="Tìm kiếm diễn viên theo tên..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    />
                </div>

                {/* BẢNG HIỂN THỊ DỮ LIỆU CHÍNH */}
                <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex justify-center items-center">
                            <LoadingSpinner />
                            <span className="ml-3 font-bold uppercase">Đang tải dữ liệu...</span>
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
                                // Định nghĩa các hành động cho mỗi dòng trong bảng
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

                            {/* PHẦN PHÂN TRANG (CHỈ HIỂN THỊ KHI CÓ TRÊN 1 TRANG) */}
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

                {/* MODAL FORM: DÙNG CHUNG CHO CẢ THÊM VÀ SỬA */}
                <FormModal
                    isOpen={showModal}
                    title={editingId ? 'Chỉnh sửa thông tin diễn viên' : 'Thêm diễn viên mới'}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    loading={formLoading}
                >
                    <div className="space-y-4">
                        {/* TRƯỜNG: TÊN DIỄN VIÊN */}
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">
                                Tên diễn viên *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50"
                                placeholder="Nhập tên đầy đủ của diễn viên"
                            />
                        </div>

                        {/* TRƯỜNG: QUỐC TỊCH */}
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
                                className="w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50"
                                placeholder="VD: Việt Nam, Hoa Kỳ, Nhật Bản..."
                            />
                        </div>

                        {/* TRƯỜNG: NGÀY SINH */}
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
                                className="w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50"
                            />
                        </div>

                        {/* TRƯỜNG: URL ẢNH */}
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
                                className="w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50"
                                placeholder="Dán link ảnh tại đây (https://...)"
                            />
                        </div>

                        {/* TRƯỜNG: TIỂU SỬ */}
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">
                                Tiểu sử / Thông tin thêm
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) =>
                                    setFormData({ ...formData, bio: e.target.value })
                                }
                                className="w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50 min-h-[100px]"
                                placeholder="Nhập tóm tắt tiểu sử hoặc thông tin nghề nghiệp..."
                                rows={4}
                            />
                        </div>
                    </div>
                </FormModal>
            </div>
        </div>
    );
}

