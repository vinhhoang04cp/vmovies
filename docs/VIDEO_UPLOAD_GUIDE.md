# Hướng dẫn Upload Video cho Tập Phim

## Tổng quan

Tính năng upload video cho phép quản lý viên tải video trực tiếp lên server local (storage) mà không cần phải dùng các dịch vụ cloud như AWS S3, Google Cloud, v.v.

## Cách hoạt động

### Backend
- **FileUploadService.php**: Xử lý upload file video vào thư mục `storage/app/public/episodes/{episode_id}/`
- **EpisodeService**: Tích hợp upload video khi tạo/cập nhật tập phim
- **EpisodeController**: Nhận multipart form data với video_file
- **Validation**: Hỗ trợ các định dạng: `mp4, mov, avi, mkv, flv, wmv, webm` (tối đa 1GB)

### Frontend
- **apiClient.js**: Thêm `postMultipart()` và `putMultipart()` để gửi FormData
- **episodeApi.js**: Thêm `createWithFile()` và `updateWithFile()`
- **EpisodeManagement.jsx**: Giao diện upload file kèm theo các trường khác

### Storage
- Các video được lưu tại: `storage/app/public/episodes/{episode_id}/{uuid}.{ext}`
- Public URL: `http://localhost:8000/storage/episodes/{episode_id}/{uuid}.{ext}`
- Đã tạo symbolic link: `public/storage` → `storage/app/public`

## Hướng dẫn sử dụng

### Cách 1: Upload video file
1. Mở trang "Quản lý phim" → Click vào nút "Tập phim" của một bộ phim
2. Click "Thêm tập phim"
3. Điền thông tin tập:
   - **Số tập**: (bắt buộc)
   - **Tiêu đề tập**: (tùy chọn)
   - **Tên Arc**: (tùy chọn)
   - **URL Video**: (để trống nếu upload file)
   - **Upload Video File**: Click để chọn file từ máy
   - **Thời lượng (giây)**: (tùy chọn)
4. Click "Lưu"

### Cách 2: Dùng URL trực tiếp
1. Nếu bạn đã có URL video từ nơi khác, nhập vào trường "URL Video"
2. Để trống "Upload Video File"
3. Click "Lưu"

## Định dạng video hỗ trợ
- `mp4`: MPEG-4 Video (phổ biến nhất)
- `mov`: Apple QuickTime (macOS)
- `avi`: Audio Video Interleave (Windows)
- `mkv`: Matroska Video (chất lượng cao)
- `flv`: Flash Video
- `wmv`: Windows Media Video
- `webm`: WebM Video (web)

## Lưu ý
- **Kích thước tối đa**: 1GB per file
- **Thư mục lưu trữ**: `storage/app/public/episodes/` (cần đủ dung lượng)
- **Backup**: Hãy backup thường xuyên thư mục này
- **Xóa video**: Khi xóa tập phim, video cũng sẽ bị xóa tự động
- **Cập nhật video**: Upload video mới sẽ xóa video cũ tự động

## API Endpoints

### Tạo tập với video
```
POST /api/admin/movies/{movieId}/episodes
Content-Type: multipart/form-data

- episode_number (required): số tập
- title (optional): tiêu đề
- arc_name (optional): tên arc
- video_url (optional): nếu không upload file
- video_file (optional): file video
- duration (optional): thời lượng (giây)
```

### Cập nhật tập với video
```
PUT /api/admin/episodes/{episodeId}
Content-Type: multipart/form-data

Các trường giống như tạo mới
```

## Troubleshooting

### Video không upload
- Kiểm tra dung lượng disk còn trống
- Kiểm tra quyền thư mục `storage/app/public`
- Xem logs: `storage/logs/laravel.log`

### Link video không hoạt động
- Kiểm tra symbolic link: `public/storage → storage/app/public`
- Chạy: `php artisan storage:link`
- Kiểm tra URL: `http://localhost:8000/storage/episodes/...`

### File quá lớn
- Tăng giới hạn upload trong `.env`:
  ```
  UPLOAD_MAX_FILESIZE=2GB
  POST_MAX_SIZE=2GB
  ```
- Restart web server

## Security
- Các file video được lưu trong thư mục public/storage có thể truy cập từ web
- Kiểm tra quyền truy cập nếu cần bảo vệ
- Hãy validate file upload trước khi lưu (validation hiện tại đã có)

