import { useEffect, useState } from 'react';
import { userApi } from '@/Services/userApi';
import { useResourceManagement } from '@/Hooks/useResourceManagement';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Toast from '@/Components/Toast';

/**
 * UserManagement - Thành phần quản trị hệ thống người dùng.
 * 
 * Các chức năng chính:
 * 1. Liệt kê danh sách người dùng đã đăng ký trên hệ thống.
 * 2. Phân biệt vai trò người dùng (Admin/User).
 * 3. Kiểm soát trạng thái hoạt động: Cho phép cấm (Ban) hoặc bỏ cấm (Unban) tài khoản.
 * 4. Tìm kiếm người dùng theo tên hoặc email.
 * 5. Theo dõi ngày tham gia của thành viên.
 */
export default function UserManagement() {
    // Sử dụng hook useResourceManagement để quản lý việc truy vấn danh sách người dùng.
    const {
        items: users,     // Danh sách người dùng.
        loading,        // Trạng thái đang đồng bộ dữ liệu.
        error,          // Lỗi từ backend (nếu có).
        meta,           // Thông tin phân trang.
        page,           // Trang hiện tại.
        search,         // Từ khóa tìm kiếm (name/email).
        sortBy,         // Cột sắp xếp.
        sortDir,        // Hướng sắp xếp (asc/desc).
        setSearch,
        setPage,
        setSortBy,
        setSortDir,
        fetchItems,
        setError,
    } = useResourceManagement(userApi);

    const [toast, setToast] = useState(null); // Quản lý thông báo nổi (Toast).

    /**
     * Effect: Tự động tải lại danh sách khi tiêu chí tìm kiếm hoặc sắp xếp thay đổi.
     */
    useEffect(() => {
        fetchItems(1);
        // eslint-disable-next-line
    }, [search, sortBy, sortDir]);

    /**
     * Effect: Xử lý chuyển trang qua phân trang.
     */
    useEffect(() => {
        if (page > 1) {
            fetchItems(page);
        }
        // eslint-disable-next-line
    }, [page]);

    /**
     * handleBan: Thực hiện lệnh cấm tài khoản người dùng sau khi xác nhận.
     * @param {number} id - ID người dùng.
     */
    const handleBan = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn cấm người dùng này không? Người dùng sẽ không thể đăng nhập vào hệ thống.')) return;

        try {
            const response = await userApi.ban(id);
            if (response.success) {
                setToast({ message: 'Đã cấm tài khoản thành công!', type: 'success' });
                await fetchItems(page); // Tải lại trang hiện tại để cập nhật UI.
            } else {
                setError(response.error || 'Lỗi hệ thống khi thực hiện lệnh cấm');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * handleUnban: Khôi phục quyền truy cập cho tài khoản bị cấm.
     * @param {number} id - ID người dùng.
     */
    const handleUnban = async (id) => {
        try {
            const response = await userApi.unban(id);
            if (response.success) {
                setToast({ message: 'Đã bỏ cấm và khôi phục tài khoản thành công!', type: 'success' });
                await fetchItems(page);
            } else {
                setError(response.error || 'Lỗi hệ thống khi thực hiện lệnh bỏ cấm');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    /**
     * Định nghĩa các cột hiển thị cho bảng người dùng.
     */
    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        { 
            key: 'name', 
            label: 'Họ và tên', 
            sortable: true,
            render: (val) => <span className="font-black text-black uppercase tracking-tight">{val}</span>
        },
        { 
            key: 'email', 
            label: 'Địa chỉ Email', 
            sortable: true,
            render: (val) => <span className="text-gray-600 font-medium">{val}</span>
        },
        {
            key: 'role',
            label: 'Vai trò',
            sortable: true,
            render: (value) => (
                <span className={`px-4 py-1 font-black uppercase text-[10px] border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] ${
                    value === 'admin' ? 'bg-red-500 text-white' : 'bg-blue-400 text-black'
                }`}>
                    {value === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                </span>
            ),
        },
        {
            key: 'is_banned',
            label: 'Trạng thái',
            sortable: true,
            render: (value) => (
                <span className={`px-3 py-1 font-bold text-xs uppercase ${
                    value ? 'text-red-600 bg-red-50 border-2 border-red-600' : 'text-green-600 bg-green-50 border-2 border-green-600'
                }`}>
                    {value ? 'Đã bị cấm' : 'Đang hoạt động'}
                </span>
            ),
        },
        { 
            key: 'created_at', 
            label: 'Ngày gia nhập', 
            sortable: true,
            render: (val) => val ? new Date(val).toLocaleDateString('vi-VN') : '-'
        },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* PHẦN TIÊU ĐỀ TRANG */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-black text-black uppercase tracking-tighter border-b-8 border-black pb-2">
                        Quản lý người dùng
                    </h1>
                </div>

                {/* THÔNG BÁO TOAST */}
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

                {/* THANH TÌM KIẾM NGƯỜI DÙNG */}
                <div className="mb-6 bg-white p-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên người dùng hoặc địa chỉ email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black outline-none transition-colors"
                    />
                </div>

                {/* BẢNG DỮ LIỆU NGƯỜI DÙNG */}
                <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center gap-4">
                            <LoadingSpinner />
                            <span className="font-black uppercase tracking-widest text-gray-400">Đang quét danh sách người dùng...</span>
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
                                                className="px-4 py-1 text-xs bg-green-600 text-white border-2 border-black font-black uppercase shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:shadow-none transition-all"
                                            >
                                                Bỏ cấm
                                            </button>
                                        ) : (
                                            <button
                                                disabled={row.role === 'admin'} // Ngăn chặn việc Admin tự cấm chính mình hoặc Admin khác.
                                                onClick={() => handleBan(row.id)}
                                                className="px-4 py-1 text-xs bg-black text-white border-2 border-black font-black uppercase shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:shadow-none transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                            >
                                                Cấm
                                            </button>
                                        )}
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
            </div>
        </div>
    );
}
