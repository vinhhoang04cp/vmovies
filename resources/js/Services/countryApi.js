import { apiClient } from './apiClient';

/**
 * countryApi - Quản lý danh mục quốc gia (Country) cho phim.
 */
export const countryApi = {
    // Lấy danh sách quốc gia
    list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/countries' + (query ? `?${query}` : ''));
    },

    // Lấy danh sách quốc gia trong thùng rác
    trashed(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/countries/trashed' + (query ? `?${query}` : ''));
    },

    // Chi tiết một quốc gia
    get(id) {
        return apiClient.get(`/admin/countries/${id}`);
    },

    // Tạo quốc gia mới
    create(data) {
        return apiClient.post('/admin/countries', data);
    },

    // Cập nhật tên hoặc mã quốc gia
    update(id, data) {
        return apiClient.put(`/admin/countries/${id}`, data);
    },

    // Xóa quốc gia
    destroy(id) {
        return apiClient.delete(`/admin/countries/${id}`);
    },

    // Khôi phục quốc gia
    restore(id) {
        return apiClient.post(`/admin/countries/${id}/restore`, {});
    },
};

