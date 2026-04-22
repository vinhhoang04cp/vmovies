import { useEffect, useState } from 'react';
import { commentApi } from '@/Services/commentApi';
import { useResourceManagement } from '@/Hooks/useResourceManagement';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Toast from '@/Components/Toast';

/**
 * CommentManagement - Thành phần giao diện quản trị dành cho việc kiểm duyệt và quản lý bình luận.
 * 
 * Các tính năng chính:
 * 1. Hiển thị danh sách bình luận từ tất cả người dùng trên các phim khác nhau.
 * 2. Lọc nhanh các bình luận đang ở trạng thái "Chờ duyệt" (Pending).
 * 3. Phê duyệt (Approve) các bình luận hợp lệ để hiển thị công khai.
 * 4. Xóa (Delete) các bình luận vi phạm quy tắc cộng đồng.
 * 5. Tìm kiếm bình luận theo nội dung hoặc tên người dùng.
 */
export default function CommentManagement() {
    // Sử dụng custom hook để quản lý các thao tác CRUD và trạng thái danh sách.
    const {
        items: comments, // Danh sách các bình luận lấy từ API.
        loading,       // Trạng thái đang tải dữ liệu.
        error,         // Thông báo lỗi nếu có.
        meta,          // Thông tin phân trang (tổng số, trang cuối, v.v.).
        page,          // Số trang hiện tại.
        search,        // Từ khóa tìm kiếm.
        sortBy,        // Trường dữ liệu dùng để sắp xếp.
        sortDir,       // Hướng sắp xếp (tăng/giảm).
        setSearch,     // Hàm cập nhật từ khóa tìm kiếm.
        setPage,       // Hàm thay đổi trang.
        setSortBy,     // Hàm thay đổi trường sắp xếp.
        setSortDir,    // Hàm thay đổi hướng sắp xếp.
        fetchItems,    // Hàm gọi API lấy dữ liệu.
        deleteItem,    // Hàm thực hiện xóa một bản ghi.
        setError,      // Hàm thiết lập thông báo lỗi thủ công.
    } = useResourceManagement(commentApi);

    // --- CÁC STATE NỘI BỘ ---
    const [toast, setToast] = useState(null); // Quản lý thông báo toast thành công/thất bại.
    const [showPending, setShowPending] = useState(false); // State để lọc chỉ hiển thị bình luận chưa duyệt.

    /**
     * Effect: Tự động gọi API tải dữ liệu khi có sự thay đổi về tìm kiếm, 
     * sắp xếp hoặc trạng thái lọc "Chờ duyệt".
     */
    useEffect(() => {
        // Mỗi khi thay đổi tiêu chí lọc, chúng ta luôn quay về trang 1.
        fetchItems(1);
        // eslint-disable-next-line
    }, [search, sortBy, sortDir, showPending]);

    /**
     * Effect: Xử lý tải dữ liệu khi người dùng chuyển trang.
     */
    useEffect(() => {
        if (page > 1) {
            fetchItems(page);
        }
        // eslint-disable-next-line
    }, [page]);

    /**
     * handleApprove: Chuyển trạng thái bình luận từ 'pending' sang 'approved'.
     * Sau khi duyệt thành công, bình luận sẽ xuất hiện trên trang xem phim của người dùng.
     * @param {number} id - ID của bình luận cần phê duyệt.
     */
    const handleApprove = async (id) => {
        try {
            const response = await commentApi.approve(id);
            if (response.success) {
                setToast({ message: 'Phê duyệt bình luận thành công!', type: 'success' });
                // Tải lại dữ liệu tại trang hiện tại để cập nhật trạng thái mới nhất.
                await fetchItems(page); 
            } else {
                setError(response.error || 'Lỗi khi thực hiện phê duyệt');
            }
        } catch (err) {
            setError(err.message || 'Lỗi hệ thống khi phê duyệt');
        }
    };

    /**
     * handleDelete: Gỡ bỏ hoàn toàn một bình luận khỏi hệ thống.
     * Thường dùng cho các bình luận spam hoặc chứa nội dung không phù hợp.
     * @param {number} id - ID của bình luận cần xóa.
     */
    const handleDelete = async (id) => {
        // Hiển thị hộp thoại xác nhận trước khi xóa dữ liệu quan trọng.
        if (!window.confirm('Bạn có chắc chắn muốn xóa hoàn toàn bình luận này không?')) return;

        const success = await deleteItem(id);
        if (success) {
            setToast({ message: 'Đã gỡ bỏ bình luận thành công!', type: 'success' });
        }
    };

    /**
     * Cấu hình các cột cho Table.
     */
    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        {
            key: 'user_name',
            label: 'Người dùng',
            sortable: true,
            render: (value) => <span className="font-bold">{value || 'Ẩn danh'}</span>,
        },
        {
            key: 'content',
            label: 'Nội dung',
            sortable: false,
            render: (value) => (
                <div className="max-w-xs md:max-w-md break-words text-gray-700 italic" title={value}>
                    "{value}"
                </div>
            ),
        },
        {
            key: 'movie_title',
            label: 'Tại phim',
            sortable: true,
            render: (value) => <span className="text-blue-600 font-medium">{value || '-'}</span>,
        },
        {
            key: 'status',
            label: 'Trạng thái',
            sortable: true,
            render: (value) => (
                <span className={`px-2 py-1 rounded-none border border-black text-[10px] uppercase font-black ${
                    value === 'approved' ? 'bg-green-400 text-black' :
                    value === 'pending' ? 'bg-yellow-400 text-black' :
                    'bg-red-400 text-white'
                }`}>
                    {value === 'approved' ? 'Đã duyệt' :
                     value === 'pending' ? 'Chờ duyệt' :
                     'Từ chối'}
                </span>
            ),
        },
        { 
            key: 'created_at', 
            label: 'Ngày gửi', 
            sortable: true,
            render: (value) => new Date(value).toLocaleString('vi-VN')
        },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                {/* TIÊU ĐỀ VÀ BỘ LỌC TRẠNG THÁI */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <h1 className="text-4xl font-black text-black uppercase tracking-tighter border-b-8 border-black pb-2">
                        Kiểm duyệt bình luận
                    </h1>
                    
                    <button
                        onClick={() => setShowPending(!showPending)}
                        className={`px-6 py-2 border-2 border-black font-black uppercase transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
                            showPending
                                ? 'bg-yellow-400 text-black'
                                : 'bg-black text-white hover:bg-gray-800'
                        }`}
                    >
                        {showPending ? '● Đang xem: Chờ duyệt' : '○ Xem tất cả bình luận'}
                    </button>
                </div>

                {/* THÔNG BÁO TẠM THỜI */}
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

                {/* Ô TÌM KIẾM DỮ LIỆU */}
                <div className="mb-6 bg-white p-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo nội dung bình luận, tên phim hoặc người dùng..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black outline-none transition-colors italic"
                    />
                </div>

                {/* BẢNG DỮ LIỆU CHÍNH */}
                <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
                    {loading ? (
                        <div className="p-16 flex flex-col justify-center items-center gap-4">
                            <LoadingSpinner />
                            <span className="font-black uppercase tracking-widest text-gray-400">Đang đồng bộ dữ liệu...</span>
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
                                        {/* Nút Duyệt chỉ xuất hiện khi bình luận chưa được duyệt */}
                                        {row.status === 'pending' && (
                                            <button
                                                onClick={() => handleApprove(row.id)}
                                                className="px-4 py-1 text-xs bg-green-500 text-black border border-black font-black uppercase hover:bg-green-400 transition"
                                            >
                                                Duyệt
                                            </button>
                                        )}
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

                            {/* PHẦN PHÂN TRANG */}
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
            </div>
        </div>
    );
}
