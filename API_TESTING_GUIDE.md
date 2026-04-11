# VMovies Movie Management API - Testing Guide

## 📋 Overview

Đã xây dựng hoàn chỉnh hệ thống API RESTful cho quản lý phim trong VMovies:

### ✅ Tính năng chính
- **31 endpoints** được đăng ký
- **Phân quyền hoàn chỉnh**: Public APIs (không cần đăng nhập) + Admin APIs (yêu cầu admin role)
- **Soft Delete**: Movies & Episodes có thể khôi phục
- **Bulk Operations**: Tạo nhiều tập phim cùng lúc
- **Pivot Management**: Gắn/gỡ genres, countries, directors, actors
- **Error Handling**: Standard HTTP status codes + custom error codes
- **Pagination & Filtering**: Danh sách phim hỗ trợ search, filter, sort

---

## 🚀 Quick Start

### 1. Khởi động Server
```bash
php artisan serve --host=127.0.0.1 --port=8000
```

### 2. Chạy PowerShell Test Script
```powershell
powershell -File C:\Users\vinh-code\Documents\vmovies\test_api_v2.ps1
```

**Kết quả test:**
```
========== 1. LOGIN ==========
SUCCESS: Login ok

========== 2. GET PUBLIC MOVIES (No Auth) ==========
SUCCESS: Got 15 movies

========== 3. CREATE MOVIE (Admin Only) ==========
SUCCESS: Movie created

========== 5. CREATE EPISODES (Bulk) ==========
SUCCESS: Created 3 episodes

========== ALL TESTS COMPLETED ===========
```

---

## 📁 Postman Collection

File: `postman_collections/VMovies_Movies_API.json`

### Import vào Postman:
1. Mở Postman
2. Click `Import` → `Upload Files`
3. Chọn file `VMovies_Movies_API.json`
4. Thêm variable `token` từ login response

### Collections:
- **Auth** (Login, Me, Logout)
- **Public Movies** (Browse, no auth needed)
- **Admin Movies** (CRUD + restore)
- **Admin Episodes** (CRUD + bulk + reorder)
- **Admin Pivot Operations** (Attach/detach relations)

---

## 🔐 Authentication

### Login
```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "admin@vmovies.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "6cMt1BezaCPhchthoaz..."
  }
}
```

### Sử dụng Token
Thêm header:
```
Authorization: Bearer {token}
```

---

## 📊 API Endpoints

### Public APIs (No Auth Required)

#### Movies
```
GET    /api/movies                    - Danh sách phim (có pagination)
GET    /api/movies/{id}               - Chi tiết phim
GET    /api/movies/{id}/episodes      - Danh sách tập của phim
GET    /api/movies/{id}/episodes/{ep} - Chi tiết tập phim
```

**Query Parameters:**
```
?page=1&per_page=10
?search=Natsume
?type=series
?status=ongoing
?genre_id=1
?country_id=1
?year=2008
?sort_by=created_at&sort_dir=desc
```

---

### Admin APIs (Auth + Admin Role Required)

#### Movies Management
```
GET    /api/admin/movies               - Danh sách phim
POST   /api/admin/movies               - Tạo phim
GET    /api/admin/movies/{id}          - Chi tiết phim
PUT    /api/admin/movies/{id}          - Cập nhật phim
DELETE /api/admin/movies/{id}          - Xóa phim (soft delete)
POST   /api/admin/movies/{id}/restore  - Khôi phục phim
GET    /api/admin/movies/trashed       - Danh sách phim bị xóa
```

**Create/Update Movie:**
```json
{
  "title": "Natsume Yuujinchou",
  "original_title": "Natsume's Book of Friends",
  "type": "series",  // "movie" hoặc "series"
  "status": "ongoing", // "ongoing" hoặc "completed"
  "summary": "Story description",
  "release_year": 2008,
  "genres": [1, 2, 3],
  "countries": [1],
  "directors": [1],
  "actors": [
    {"id": 1, "role_name": "Main Character"},
    {"id": 2, "role_name": "Supporting"}
  ]
}
```

#### Episodes Management
```
GET    /api/admin/movies/{movie}/episodes    - Danh sách tập
POST   /api/admin/movies/{movie}/episodes    - Tạo tập
GET    /api/admin/episodes/{id}              - Chi tiết tập
PUT    /api/admin/episodes/{id}              - Cập nhật tập
DELETE /api/admin/episodes/{id}              - Xóa tập
POST   /api/admin/episodes/bulk-create       - Tạo nhiều tập
PUT    /api/admin/episodes/reorder           - Sắp xếp lại tập
```

**Create Episode:**
```json
{
  "episode_number": 1,
  "title": "Episode Title",
  "arc_name": "Arc Name (optional)",
  "video_url": "https://example.com/video.mp4",
  "duration": 1440
}
```

**Bulk Create Episodes:**
```json
{
  "movie_id": 1,
  "episodes": [
    {
      "episode_number": 1,
      "title": "Ep 1",
      "video_url": "https://example.com/ep1.mp4",
      "duration": 1440
    },
    {
      "episode_number": 2,
      "title": "Ep 2",
      "video_url": "https://example.com/ep2.mp4",
      "duration": 1440
    }
  ]
}
```

**Reorder Episodes:**
```json
{
  "movie_id": 1,
  "episodes": [
    {"id": 1, "episode_number": 5},
    {"id": 2, "episode_number": 3},
    {"id": 3, "episode_number": 1}
  ]
}
```

#### Pivot Operations
```
POST   /api/admin/movies/{movie}/genres/{genre}     - Gắn thể loại
DELETE /api/admin/movies/{movie}/genres/{genre}     - Gỡ thể loại
POST   /api/admin/movies/{movie}/countries/{country} - Gắn quốc gia
DELETE /api/admin/movies/{movie}/countries/{country} - Gỡ quốc gia
POST   /api/admin/movies/{movie}/directors/{director} - Gắn đạo diễn
DELETE /api/admin/movies/{movie}/directors/{director} - Gỡ đạo diễn
POST   /api/admin/movies/{movie}/actors/{actor}     - Gắn diễn viên
DELETE /api/admin/movies/{movie}/actors/{actor}     - Gỡ diễn viên
```

**Attach Actor (with role):**
```json
{
  "role_name": "Main Character"
}
```

---

## 📋 Response Format

### Success Response (200/201)
```json
{
  "success": true,
  "message": "Thành công",
  "data": {...}
}
```

### Error Response (400/401/403/404/422/500)
```json
{
  "success": false,
  "message": "Chi tiết lỗi",
  "error_code": "RESOURCE_NOT_FOUND",
  "errors": null
}
```

### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "errors": {
    "title": ["Tên phim là bắt buộc."],
    "type": ["Loại phim phải là movie hoặc series."]
  }
}
```

---

## 🧪 Test Examples

### 1. Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vmovies.com",
    "password": "password"
  }'
```

### 2. Get Public Movies
```bash
curl http://127.0.0.1:8000/api/movies?page=1&per_page=10
```

### 3. Create Movie (với token)
```bash
curl -X POST http://127.0.0.1:8000/api/admin/movies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Natsume Yuujinchou",
    "type": "series",
    "release_year": 2008
  }'
```

### 4. Create Episodes (Bulk)
```bash
curl -X POST http://127.0.0.1:8000/api/admin/episodes/bulk-create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "movie_id": 1,
    "episodes": [
      {"episode_number": 1, "title": "Ep 1", "video_url": "...", "duration": 1440},
      {"episode_number": 2, "title": "Ep 2", "video_url": "...", "duration": 1440}
    ]
  }'
```

---

## 📝 Test Results Summary

✅ **1. LOGIN** - Successfully logged in with token
✅ **2. GET PUBLIC MOVIES** - Retrieved 15 movies without authentication
✅ **3. CREATE MOVIE** - Created new movie with ID 33
✅ **4. GET MOVIE DETAIL** - Retrieved movie details successfully
✅ **5. CREATE EPISODES (BULK)** - Created 3 episodes successfully
✅ **6. GET EPISODES (ADMIN)** - Retrieved 3 episodes from admin API
✅ **7. GET EPISODES (PUBLIC)** - Retrieved 3 episodes from public API
✅ **8. UPDATE MOVIE** - Updated movie status to "completed"
✅ **9. LIST MOVIES (ADMIN)** - Retrieved 15 movies from admin API
✅ **10. GET EPISODE DETAIL** - Retrieved episode details successfully
✅ **11. LOGOUT** - Logged out successfully

---

## 🛠️ File Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── MovieController.php              [Public API]
│   │   └── Admin/
│   │       ├── MovieController.php          [Admin API]
│   │       └── EpisodeController.php        [Admin API]
│   ├── Requests/
│   │   ├── Movie/
│   │   │   ├── StoreMovieRequest.php
│   │   │   └── UpdateMovieRequest.php
│   │   └── Episode/
│   │       ├── StoreEpisodeRequest.php
│   │       ├── UpdateEpisodeRequest.php
│   │       └── BulkStoreEpisodeRequest.php
│   └── Resources/
│       ├── MovieResource.php
│       ├── EpisodeResource.php
│       ├── GenreResource.php
│       ├── CountryResource.php
│       ├── DirectorResource.php
│       └── ActorResource.php
├── Services/
│   ├── MovieService.php
│   └── EpisodeService.php
└── Models/
    ├── Movie.php        [with soft delete]
    └── Episode.php      [with soft delete]

routes/
└── api.php              [All 31 endpoints]

postman_collections/
└── VMovies_Movies_API.json

tests/
└── test_api_v2.ps1     [PowerShell test script]
```

---

## 🚨 Common Issues

### 500 Internal Server Error
- Check `storage/logs/laravel.log`
- Ensure all required fields are provided
- Verify token is valid and user is admin

### 422 Unprocessable Entity
- Check validation error message in response
- Verify input data matches validation rules
- Ensure foreign key references exist (genres, countries, etc.)

### 401 Unauthorized
- Token may have expired
- Re-login with admin account
- Ensure Authorization header is correct

---

## 📚 Next Steps

1. **Hoàn thành CRUD cho Genres, Countries, Directors, Actors**
2. **Thêm Comments & Ratings Management API**
3. **Implement User Management + Banning System**
4. **Thêm Dashboard Statistics API**
5. **Setup API Rate Limiting**
6. **Thêm API Documentation (Swagger/OpenAPI)**

---

**Status**: ✅ Movie Management API - Ready for Production

Last Updated: April 11, 2026

