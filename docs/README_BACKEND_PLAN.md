# 🚀 KẾ HOẠCH XÂY DỰNG BACKEND CMS - RESTful API - VMOVIES

**Thời gian thực hiện: Tuần 2 (10/4/2026 - 16/4/2026)**

---

## 🎯 MỤC TIÊU

- Xây dựng hệ thống Backend (API) cho Admin CMS theo chuẩn RESTful.
- Xác thực & phân quyền (Laravel Sanctum + Middleware).
- CRUD đầy đủ cho tất cả resource: phim, tập phim, danh mục, nhân sự, người dùng, bình luận.
- Validation & Error Handling chuẩn.
- Có thể test qua Postman.

---

## 📋 DANH SÁCH ENDPOINTS RESTful API

### 🔐 Xác thực & Phân quyền

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

### 📽️ Quản lý phim (Movies)

```
GET    /api/admin/movies
POST   /api/admin/movies
GET    /api/admin/movies/{id}
PUT    /api/admin/movies/{id}
DELETE /api/admin/movies/{id}
POST   /api/admin/movies/{id}/restore

POST   /api/admin/movies/{id}/genres/{genreId}
DELETE /api/admin/movies/{id}/genres/{genreId}
POST   /api/admin/movies/{id}/countries/{countryId}
DELETE /api/admin/movies/{id}/countries/{countryId}
POST   /api/admin/movies/{id}/directors/{directorId}
DELETE /api/admin/movies/{id}/directors/{directorId}
POST   /api/admin/movies/{id}/actors/{actorId}
DELETE /api/admin/movies/{id}/actors/{actorId}
```

### 📺 Quản lý tập phim (Episodes)

```
GET    /api/admin/movies/{movieId}/episodes
POST   /api/admin/movies/{movieId}/episodes
GET    /api/admin/episodes/{id}
PUT    /api/admin/episodes/{id}
DELETE /api/admin/episodes/{id}
POST   /api/admin/episodes/bulk-create
PUT    /api/admin/episodes/reorder
```

### 🏷️ Quản lý danh mục

```
GET    /api/admin/genres
POST   /api/admin/genres
GET    /api/admin/genres/{id}
PUT    /api/admin/genres/{id}
DELETE /api/admin/genres/{id}

GET    /api/admin/countries
POST   /api/admin/countries
GET    /api/admin/countries/{id}
PUT    /api/admin/countries/{id}
DELETE /api/admin/countries/{id}
```

### 👥 Quản lý nhân sự phim

```
GET    /api/admin/directors
POST   /api/admin/directors
GET    /api/admin/directors/{id}
PUT    /api/admin/directors/{id}
DELETE /api/admin/directors/{id}

GET    /api/admin/actors
POST   /api/admin/actors
GET    /api/admin/actors/{id}
PUT    /api/admin/actors/{id}
DELETE /api/admin/actors/{id}
```

### 👤 Quản lý người dùng

```
GET    /api/admin/users
GET    /api/admin/users/{id}
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}
PATCH  /api/admin/users/{id}/ban
PATCH  /api/admin/users/{id}/unban
```

### 💬 Quản lý bình luận

```
GET    /api/admin/comments
GET    /api/admin/comments/{id}
PATCH  /api/admin/comments/{id}/approve
DELETE /api/admin/comments/{id}
GET    /api/admin/comments/pending
```

### 📊 Thống kê & Dashboard

```
GET    /api/admin/dashboard
GET    /api/admin/stats/movies
GET    /api/admin/stats/users
GET    /api/admin/stats/comments
```

---

## 🏗️ CẤU TRÚC THƯ MỤC & FILE CẦN TẠO

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── Admin/
│   │   │   ├── MovieController.php
│   │   │   ├── EpisodeController.php
│   │   │   ├── GenreController.php
│   │   │   ├── CountryController.php
│   │   │   ├── DirectorController.php
│   │   │   ├── ActorController.php
│   │   │   ├── CommentController.php
│   │   │   ├── UserController.php
│   │   │   └── DashboardController.php
│   ├── Requests/
│   │   ├── LoginRequest.php
│   │   ├── StoreMovieRequest.php
│   │   ├── UpdateMovieRequest.php
│   │   ├── StoreEpisodeRequest.php
│   │   ├── StoreGenreRequest.php
│   │   ├── StoreCountryRequest.php
│   │   ├── StoreDirectorRequest.php
│   │   ├── StoreActorRequest.php
│   ├── Resources/
│   │   ├── MovieResource.php
│   │   ├── EpisodeResource.php
│   │   ├── GenreResource.php
│   │   ├── CountryResource.php
│   │   ├── DirectorResource.php
│   │   ├── ActorResource.php
│   │   ├── UserResource.php
│   │   ├── CommentResource.php
│   │   └── DashboardResource.php
│   ├── Middleware/
│   │   ├── IsAdmin.php
│   │   └── VerifyToken.php
├── Traits/
│   ├── JsonResponse.php
│   └── ImageUpload.php
├── Exceptions/
│   └── ApiException.php

routes/
├── api.php

config/
├── api.php
```

---

## 🔐 XÁC THỰC & PHÂN QUYỀN

- Sử dụng Laravel Sanctum (hoặc JWT).
- Middleware kiểm tra quyền admin cho các route /api/admin/*.
- Token lưu ở header: `Authorization: Bearer {token}`.

---

## 📝 RESPONSE FORMAT CHUẨN

**Thành công:**
```json
{
  "success": true,
  "message": "Thành công",
  "data": { ... }
}
```
**Lỗi:**
```json
{
  "success": false,
  "message": "Lỗi xác thực",
  "errors": { ... },
  "code": 422
}
```

---

## 📅 KẾ HOẠCH CHI TIẾT THEO NGÀY

### Ngày 1-2: Xác thực & phân quyền
- Cài đặt Sanctum/JWT.
- Tạo AuthController, LoginRequest, Middleware IsAdmin.
- Test login/logout bằng Postman.

### Ngày 3-4: CRUD danh mục (thể loại, quốc gia)
- GenreController, CountryController, Request, Resource.
- Route group cho admin.
- Test CRUD qua Postman.

### Ngày 5-6: CRUD nhân sự (đạo diễn, diễn viên)
- DirectorController, ActorController, Request, Resource.
- Xử lý upload ảnh.
- Gắn diễn viên vào phim.

### Ngày 7: CRUD phim & tập phim
- MovieController, EpisodeController, Request, Resource.
- Xử lý upload poster/banner.
- Gắn thể loại, quốc gia, đạo diễn, diễn viên vào phim.
- Test CRUD movies/episodes.

---

## 🛠️ VALIDATION RULES (TIÊU BIỂU)

- Movie: title, original_title, summary, release_year, type, status, poster, banner, trailer_url, genres, countries, directors, actors.
- Episode: episode_number, arc_name, title, video_url, duration.
- Genre: name, slug, description, icon_url.

---

## 🧪 TESTING & ERROR HANDLING

- Tạo Postman collection cho từng nhóm API.
- Response error rõ ràng, status code chuẩn (200, 201, 400, 401, 403, 404, 409, 422, 500).

---

## 📌 LƯU Ý QUAN TRỌNG

- Xóa nên dùng soft delete.
- Tất cả list endpoints phải có pagination.
- Khi lấy movie detail phải include genres, actors, directors, episodes.
- Lưu ảnh vào storage/app/public, tạo symlink.
- CORS nếu frontend chạy domain khác.
- Nên setup rate limit cho API.

---

## 🎯 KẾT QUẢ KỲ VỌNG

- RESTful API hoàn chỉnh cho Admin CMS.
- Xác thực & phân quyền hoạt động.
- CRUD đầy đủ cho phim, tập phim, danh mục, nhân sự.
- Upload ảnh hoạt động.
- Validation rules chặt chẽ.
- Response format chuẩn.
- Có Postman collection để test.
- Sẵn sàng cho frontend sử dụng API.

---

> **Bước tiếp theo:** Bắt đầu từ Ngày 1: Authentication Setup!

---

Bạn có thể copy toàn bộ nội dung này vào file README.md hoặc PLAN.md để làm tài liệu phát triển backend CMS cho dự án VMovies.

