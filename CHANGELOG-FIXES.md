# Nhật ký Khắc phục & Tối ưu hóa dự án VMovies

Tài liệu này ghi lại toàn bộ các thay đổi và cải tiến kỹ thuật đã thực hiện trên dự án **VMovies** nhằm giải quyết triệt để các vấn đề từ P0 đến P3.

---

## 🛠️ P0 — Bảo mật & Sửa lỗi nghiêm trọng (Security & Crucial Bugs)

### 1. Giới hạn tần suất và chống dò tìm tài khoản (P0.1, P0.2)
- **Rate Limit Login:** Áp dụng middleware `throttle:5,1` trên các route `/api/auth/login` và `/api/auth/register`.
- **Brute Force Defense:** Tích hợp `RateLimiter` của Laravel trong `AuthService::login` dựa trên `email` và `IP`. Khóa tài khoản trong 60 giây sau 5 lần thử thất bại liên tiếp (ném mã lỗi `TOO_MANY_ATTEMPTS` - HTTP 429).
- **User Enumeration Prevention:** Đồng bộ hóa tất cả thông báo lỗi sai email/mật khẩu thành `"Email hoặc mật khẩu không đúng"` (mã `INVALID_CREDENTIALS` - HTTP 421/401) để tránh kẻ tấn công dò tìm tài khoản có sẵn trong cơ sở dữ liệu.

### 2. Sửa lỗi tải ảnh phim & Tối ưu hóa liên kết (P0.3, P3.5)
- **Fix Poster/Banner Mapping:** Đồng bộ hóa schema gửi đi từ `MovieManagement.jsx` sử dụng đúng các cột cơ sở dữ liệu của Backend (`poster_url` và `banner_url` thay vì `poster`/`banner`).
- **Atomic Relations Sync:** Nâng cấp phương thức `handleSubmit` để gửi trực tiếp mảng `genres`, `countries`, `directors`, và `actors` trong một request tạo/cập nhật duy nhất, loại bỏ hoàn toàn vòng lặp N-requests bất đồng bộ trước kia.

### 3. Bảo vệ Token qua Cookie HttpOnly (P0.4)
- **Middleware `ReadTokenFromCookie`:** Đọc tự động cookie `auth_token` và nạp vào header `Authorization: Bearer <token>` để Sanctum nhận dạng trong suốt.
- **AuthController:** Gắn Cookie `auth_token` bảo mật (`httpOnly`, `Secure`, `SameSite=Lax`, hết hạn sau 7 ngày) trực tiếp vào response header khi đăng nhập/đăng ký thành công, xóa cookie khi đăng xuất.
- **Frontend Integration:** Cập nhật `AuthContext.jsx`, `apiClient.js` sử dụng thuộc tính `credentials: 'include'` để tự động truyền nhận cookie, loại bỏ hoàn toàn việc lưu trữ token trong `localStorage` (kháng XSS tuyệt đối).

---

## 🏗️ P1 — Kiến trúc & Tính đúng đắn (Architecture & Correctness)

### 1. Đồng bộ hóa nguồn phân quyền duy nhất (P1.1)
- **Role-based check:** Chuyển đổi toàn bộ trường kiểm tra `'is_admin'` của `UserResource.php` để lấy nguồn từ `role` thông qua hàm `$user->isAdmin()`.
- **Database Migration:** Tạo và chạy thành công migration drop cột `is_admin` trong bảng `users` để chuyển hoàn toàn sang quản lý vai trò tập trung.

### 2. Thiết lập Policy & RBAC động (P1.2, P1.3)
- **Granular Policies:** Tạo `MoviePolicy`, `CommentPolicy`, `UserPolicy`, `EpisodePolicy` để bảo vệ tài nguyên chi tiết:
  - Viewer chỉ có quyền xóa comment của chính mình, Admin/Moderator có quyền xóa comment của người khác.
  - Ngăn Admin tự xóa hoặc tự khóa (ban) chính mình, hoặc tác động lên các Admin khác.
- **Dynamic Gates:** Tự động đăng ký các Gate động từ cơ sở dữ liệu bảng `permissions` tại `AppServiceProvider`.
- **Route Authorization:** Áp dụng middleware phân quyền granular `permission:<name>` cho toàn bộ các route admin trong `routes/api.php` thay cho middleware block `admin` cứng nhắc cũ.

### 3. Tải Video qua Hàng đợi (P1.4)
- **Queued Uploads:** Tạo hàng đợi queued job `ProcessEpisodeVideo.php` và dịch vụ `FileUploadService` để xử lý di chuyển và nén file video một cách bất đồng bộ.
- **Episode Status:** Episode được tạo với trạng thái `'processing'` ở cột `video_url` và sẽ được job cập nhật khi hoàn tất, giúp tăng tốc độ phản hồi API cho trang quản trị.

### 4. Thống nhất thang điểm Đánh giá (P1.5, P1.6, P1.7)
- **Rating Limits:** Thống nhất thang điểm 1-10 sao ở cả Frontend & Backend. Sửa validation của rating và cập nhật `RatingFactory`.
- **Password Constraints:** Đồng bộ hóa quy định bảo mật mật khẩu ở Frontend `RegisterAPI.jsx` thành tối thiểu 8 ký tự để khớp với Backend.
- **Token Expiration:** Đặt thời gian hết hạn của token Sanctum là 7 ngày (`config/sanctum.php` - 10080 phút) và refactor API `/auth/refresh` để xoay vòng token tự động và ghi nhận cookie mới.

---

## ⚡ P2 — Hiệu năng (Performance)

### 1. Tối ưu Caching dữ liệu đọc nhiều (P2.1)
- **Cache Versioning:** Áp dụng mẫu thiết kế Cache Versioning linh hoạt cho `GenreService` và `CountryService` thông qua các key phiên bản `'genres:version'` và `'countries:version'`. Khi có bất kỳ hành động ghi nào, phiên bản được tăng lên tức thì giúp invalidate cache mà không cần tag (tương thích mọi driver cache).
- **Dashboard Stats Cache:** Lưu cache 10 phút cho toàn bộ các dữ liệu thống kê admin nặng trong `DashboardService`. Tự động xóa cache ngay khi có biến động dữ liệu.

### 2. Khắc phục lỗi N+1 Query & Eager Loading (P2.2)
- **In-memory Check:** Tối ưu hóa các phương thức `hasPermission`, `hasAnyPermission` trong model `Role` để kiểm tra trực tiếp từ Collection quan hệ `permissions` đã eager-load, loại bỏ hoàn toàn các truy vấn SQL lặp đi lặp lại.
- **Middleware Eager Load:** Nạp trước quan hệ `role.permissions` của người dùng tại các middleware phân quyền (`CheckPermission`, `CheckRole`, `IsAdmin`) và tầng sinh token `AuthService`.

### 3. Phân trang & Index cơ sở dữ liệu (P2.3)
- **Sliding Window Pagination:** Thiết kế lại thuật toán phân trang tại `Pagination.jsx` và `SearchPage.jsx` giới hạn tối đa 5 nút trang hiển thị xung quanh trang hiện tại để cải thiện mỹ thuật giao diện.
- **DB Indexing:** Tạo và chạy thành công migration thêm index cho cột `name` của các bảng `actors`, `directors`, và `genres` để tăng tốc truy vấn lọc/sắp xếp.

### 4. Silent Token Refresh (P2.4)
- **HTTP Interceptor:** Triển khai bộ chặn phản hồi 401 thông minh trong `apiClient.js` tự động gửi request đến `/auth/refresh` để làm mới token và tự động thực hiện lại request lỗi ban đầu một cách trong suốt với người dùng.
- **Decoupled Expired Flow:** Phát sự kiện custom `auth:expired` để `AuthContext.jsx` tự động xóa sạch trạng thái đăng nhập khi token không thể refresh, đảm bảo bảo mật.

---

## ✨ P3 — Mở rộng & Hoàn thiện (Extensions & Completion)

### 1. HTTP Security Headers & CORS chuẩn (P3.1)
- **Security Headers Middleware:** Tự động thiết lập các header bảo mật thiết yếu (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: no-referrer-when-downgrade`) và cấu hình `Content-Security-Policy` (CSP) an toàn.
- **Config CORS:** Thiết lập file cấu hình CORS `config/cors.php` đồng bộ chuẩn theo các cài đặt từ `config/api.php`.

### 2. Dọn dẹp Code chết & Xóa sạch Breeze/Inertia (P3.2)
- **Dead Files Deletion:** Xóa bỏ toàn bộ các file view React Inertia cũ của Breeze (`ForgotPassword.jsx`, `Login.jsx`, `Register.jsx`, `ResetPassword.jsx`, `VerifyEmail.jsx`, `ConfirmPassword.jsx`).
- **Dead Controllers Deletion:** Loại bỏ hoàn toàn các controller Breeze web auth dư thừa trong `app/Http/Controllers/Auth/`.
- **Dead Routes Deletion:** Xóa bỏ file `routes/auth.php` và gỡ bỏ hoàn toàn khai báo của nó trong `routes/web.php` giúp thu gọn codebase tối đa.

### 3. Phòng chống Spam lượt xem thực tế (P3.3)
- **10-Min IP Lock:** Triển khai cơ chế tăng view thông minh tại `showEpisode`. Sử dụng cache lưu IP của người xem trong 10 phút. Chỉ tăng `views` của tập phim và `view_count` của bộ phim khi IP này chưa xem tập đó trong vòng 10 phút qua.

### 4. Đồng bộ xóa mềm & Số tập phim trùng lặp (P3.4)
- **Unique Constraint Drop:** Drop unique constraint mức vật lý DB của `['movie_id', 'episode_number']` để cho phép tạo số tập trùng với các tập đã bị xóa mềm.
- **Application Validation:** Đảm bảo toàn bộ việc kiểm tra trùng số tập được điều khiển chặt chẽ bởi logic backend của `EpisodeService`, tích hợp kiểm tra trùng trước khi khôi phục (`restore()`) tập phim cũ.

---

*Tất cả các thay đổi trên đã được kiểm tra, chạy migration thành công và seed đầy đủ dữ liệu thử nghiệm chuẩn cho dự án.*
