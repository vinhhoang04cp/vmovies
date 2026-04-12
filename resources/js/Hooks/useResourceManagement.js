import { useState, useCallback } from 'react';

/**
 * useResourceManagement - Custom hook để quản lý CRUD resource
 */
export function useResourceManagement(apiService) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortDir, setSortDir] = useState('asc');

    // Fetch danh sách items
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
                // apiClient wraps: { success, data: { success, data: { data: [], meta: {} } } }
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

    // Xóa item
    const deleteItem = useCallback(async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return false;

        setLoading(true);
        try {
            const response = await apiService.destroy(id);
            if (response.success) {
                await fetchItems(page);
                return true;
            } else {
                setError(response.error || 'Lỗi khi xóa');
                return false;
            }
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [apiService, page, fetchItems]);

    // Khôi phục item
    const restoreItem = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await apiService.restore(id);
            if (response.success) {
                await fetchItems(page);
                return true;
            } else {
                setError(response.error || 'Lỗi khi khôi phục');
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

