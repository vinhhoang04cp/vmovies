import axios from 'axios';
// Gán thư viện axios vào đối tượng window toàn cục để có thể sử dụng ở bất kỳ đâu trong ứng dụng
// mà không cần phải import lại.
window.axios = axios;

// Thiết lập các header mặc định cho mọi request axios
// Cho biết đây là một request AJAX (được gửi bằng XMLHttpRequest). 
// Laravel dùng header này để phân biệt request từ API/frontend so với request truy cập web thông thường.
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Ép buộc server trả về định dạng JSON cho mọi response thay vì trả về HTML
window.axios.defaults.headers.common['Accept'] = 'application/json';

// Cấu hình Base URL (địa chỉ gốc) cho mọi API request.
// Lấy từ biến môi trường VITE_API_URL, nếu không có thì mặc định gọi vào http://localhost:8000/api
window.axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Thiết lập defaults.withCredentials = true để tự động gửi cookie trong các request axios
window.axios.defaults.withCredentials = true;

