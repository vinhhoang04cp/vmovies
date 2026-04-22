import { useState, useCallback } from 'react';

/**
 * useResourceManagement - Custom hook dùng chung cho các trang quản lý (Admin).
 * Giúp xử lý các tác vụ lặp đi lặp lại như: Lấy danh sách, Phân trang, Tìm kiếm, Sắp xếp, Xóa, Khôi phục.
 * 
 * @param {Object} apiService - Một instance của service API (ví dụ: movieApi, actorApi).
 */
export function useResourceManagement(apiService) {
    const [items, setItems] = useState([]); // Danh sách dữ liệu (phim, diễn viên, ...)
    const [loading, setLoading] = useState(false); // Trạng thái đang tải API
    const [error, setError] = useState(null); // Lỗi khi gọi API
    const [meta, setMeta] = useState({}); // Thông tin phân trang từ Laravel (total, per_page, last_page...)
    const [page, setPage] = useState(1); // Trang hiện tại
    const [search, setSearch] = useState(''); // Từ khóa tìm kiếm
    const [sortBy, setSortBy] = useState('name'); // Trường cần sắp xếp
    const [sortDir, setSortDir] = useState('asc'); // Hướng sắp xếp (asc/desc)

    /**
     * Hàm gọi API để lấy danh sách items dựa trên các tham số tìm kiếm/sắp xếp/phân trang.
     */
    const fetchItems = useCallback(async (pageNum = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.list({
                page: pageNum,
                search,
                sort_by: sortBy,
                sort_dir: sortDir,
                per_page: 15,
            });

            if (response.success) {
                // Phân tích dữ liệu trả về từ apiClient (thường bọc trong data.data)
                const apiData = response.data?.data || response.data;
                const items = Array.isArray(apiData?.data) ? apiData.data : (Array.isArray(apiData) ? apiData : []);
                const meta = apiData?.meta || {};
                
                setItems(items);
                setMeta(meta);
                setPage(pageNum);
            } else {
                setError(response.error || 'Lỗi khi tải dữ liệu');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [apiService, search, sortBy, sortDir]);

    /**
     * Hàm xử lý xóa một item theo ID.
     */
    const deleteItem = useCallback(async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa mục này?')) return false;

        setLoading(true);
        try {
            const response = await apiService.destroy(id);
            if (response.success) {
                // Sau khi xóa thành công, tải lại danh sách ở trang hiện tại để cập nhật UI
                await fetchItems(page);
                return true;
            } else {
                setError(response.error || 'Lỗi khi thực hiện lệnh xóa');
                return false;
            }
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [apiService, page, fetchItems]);

    /**
     * Hàm xử lý khôi phục một item đã xóa (dành cho các model dùng SoftDelete).
     */
    const restoreItem = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await apiService.restore(id);
            if (response.success) {
                await fetchItems(page);
                return true;
            } else {
                setError(response.error || 'Lỗi khi thực hiện lệnh khôi phục');
                return false;
            }
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [apiService, page, fetchItems]);

    return {
        items,
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
    };
}

