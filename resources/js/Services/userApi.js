import { apiClient } from './apiClient';

/**
 * userApi - Quản lý tài khoản người dùng trong hệ thống (dành cho Admin).
 */
export const userApi = {
    // Lấy danh sách người dùng (khách hàng, admin khác...)
    list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/users' + (query ? `?${query}` : ''));
    },

    // Lấy chi tiết thông tin một người dùng
    get(id) {
        return apiClient.get(`/admin/users/${id}`);
    },

    // Cập nhật thông tin người dùng (ví dụ: thay đổi quyền hạn)
    update(id, data) {
        return apiClient.put(`/admin/users/${id}`, data);
    },

    // Xóa vĩnh viễn tài khoản người dùng
    destroy(id) {
        return apiClient.delete(`/admin/users/${id}`);
    },

    // Khóa tài khoản người dùng (không cho đăng nhập)
    ban(id) {
        return apiClient.patch(`/admin/users/${id}/ban`, {});
    },

    // Mở khóa tài khoản người dùng
    unban(id) {
        return apiClient.patch(`/admin/users/${id}/unban`, {});
    },
};

