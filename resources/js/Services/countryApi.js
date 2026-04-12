import { apiClient } from './apiClient';

export const countryApi = {
    // Danh sách quốc gia
    list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/countries' + (query ? `?${query}` : ''));
    },

    // Danh sách quốc gia đã xóa
    trashed(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiClient.get('/admin/countries/trashed' + (query ? `?${query}` : ''));
    },

    // Chi tiết quốc gia
    get(id) {
        return apiClient.get(`/admin/countries/${id}`);
    },

    // Tạo quốc gia mới
    create(data) {
        return apiClient.post('/admin/countries', data);
    },

    // Cập nhật quốc gia
    update(id, data) {
        return apiClient.put(`/admin/countries/${id}`, data);
    },

    // Xóa mềm quốc gia
    destroy(id) {
        return apiClient.delete(`/admin/countries/${id}`);
    },

    // Khôi phục quốc gia
    restore(id) {
        return apiClient.post(`/admin/countries/${id}/restore`, {});
    },
};

