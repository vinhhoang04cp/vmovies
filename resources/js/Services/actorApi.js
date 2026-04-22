import { apiClient } from './apiClient';

/**
 * actorApi - Chứa các phương thức quản lý diễn viên (Actor) dành cho Admin.
 */
export const actorApi = {
    // Lấy danh sách diễn viên (có lọc/phân trang)
    list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/actors' + (query ? `?${query}` : ''));
    },

    // Lấy danh sách diễn viên đã bị xóa (thùng rác)
    trashed(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/actors/trashed' + (query ? `?${query}` : ''));
    },

    // Lấy thông tin chi tiết một diễn viên
    get(id) {
        return apiClient.get(`/admin/actors/${id}`);
    },

    // Tạo diễn viên mới
    create(data) {
        return apiClient.post('/admin/actors', data);
    },

    // Cập nhật thông tin diễn viên
    update(id, data) {
        return apiClient.put(`/admin/actors/${id}`, data);
    },

    // Xóa mềm diễn viên
    destroy(id) {
        return apiClient.delete(`/admin/actors/${id}`);
    },

    // Khôi phục diễn viên từ thùng rác
    restore(id) {
        return apiClient.post(`/admin/actors/${id}/restore`, {});
    },
};

