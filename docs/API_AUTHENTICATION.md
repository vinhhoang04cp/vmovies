# 🔐 VMovies API - Authentication & Authorization Documentation

## Tổng Quan

Hệ thống xác thực và phân quyền VMovies API sử dụng **Laravel Sanctum** với mô hình **RBAC (Role-Based Access Control)**. Mỗi người dùng được gán một role (Admin, Editor, Moderator, User), và mỗi role có các permission cụ thể.

---

## 📚 Cấu Trúc RBAC

### Roles (Vai trò)

1. **Admin** - Quản trị viên hệ thống
   - Có toàn bộ quyền
   - Quản lý phim, tập phim, người dùng, bình luận
   - Truy cập dashboard thống kê

2. **Editor** - Biên tập viên nội dung
   - Tạo, chỉnh sửa, xóa phim và tập phim
   - Quản lý danh mục (thể loại, quốc gia)
   - Quản lý nhân sự (đạo diễn, diễn viên)

3. **Moderator** - Kiểm duyệt viên
   - Duyệt bình luận
   - Quản lý người dùng (ban/unban)
   - Truy cập dashboard

4. **User** - Người dùng thường
   - Xem thông tin phim, diễn viên, thể loại
   - Bình luận, đánh giá phim
   - Lưu phim yêu thích

### Permissions

Hệ thống có 30+ permissions được nhóm theo resource:

```
MOVIES:
  - movie.create
  - movie.read
  - movie.update
  - movie.delete
  - movie.restore

EPISODES:
  - episode.create
  - episode.read
  - episode.update
  - episode.delete

GENRES:
  - genre.create
  - genre.read
  - genre.update
  - genre.delete

COUNTRIES:
  - country.create
  - country.read
  - country.update
  - country.delete

DIRECTORS:
  - director.create
  - director.read
  - director.update
  - director.delete

ACTORS:
  - actor.create
  - actor.read
  - actor.update
  - actor.delete

USERS:
  - user.read
  - user.update
  - user.delete
  - user.ban

COMMENTS:
  - comment.read
  - comment.delete
  - comment.approve

DASHBOARD:
  - dashboard.access
```

---

## 🔑 API Endpoints

### 1. Login
**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "admin@vmovies.com",
  "password": "password"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@vmovies.com",
      "avatar_url": null,
      "status": "active",
      "role": {
        "id": 1,
        "name": "admin",
        "display_name": "Administrator"
      },
      "is_admin": true,
      "created_at": "2026-04-10T10:00:00.000000Z"
    },
    "token": "1|K7vW8xY9zAa1BbC2dDeE3fFg4hHi5jJk6lLmM7nNoOpPq"
  }
}
```

**Error Responses:**

```json
{
  "success": false,
  "message": "Email not found",
  "error_code": "EMAIL_NOT_FOUND",
  "errors": null
}
```

```json
{
  "success": false,
  "message": "Invalid password",
  "error_code": "INVALID_PASSWORD",
  "errors": null
}
```

```json
{
  "success": false,
  "message": "Your account has been banned",
  "error_code": "ACCOUNT_BANNED",
  "errors": null
}
```

---

### 2. Register
**POST** `/api/auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 52,
      "name": "John Doe",
      "email": "john@example.com",
      "avatar_url": null,
      "status": "active",
      "role": {
        "id": 4,
        "name": "user",
        "display_name": "User"
      },
      "is_admin": false,
      "created_at": "2026-04-10T12:30:00.000000Z"
    },
    "token": "2|K7vW8xY9zAa1BbC2dDeE3fFg4hHi5jJk6lLmM7nNoOpPq"
  }
}
```

**Validation Errors (422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "errors": {
    "email": ["This email is already registered"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

---

### 3. Get Current User
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "name": "Admin",
    "email": "admin@vmovies.com",
    "avatar_url": null,
    "status": "active",
    "role": {
      "id": 1,
      "name": "admin",
      "display_name": "Administrator",
      "permissions": [
        "movie.create",
        "movie.read",
        "movie.update",
        "movie.delete",
        "movie.restore",
        "episode.create",
        "episode.read",
        "episode.update",
        "episode.delete",
        "genre.create",
        "genre.read",
        "genre.update",
        "genre.delete",
        ...
      ]
    },
    "is_admin": true,
    "created_at": "2026-04-10T10:00:00.000000Z"
  }
}
```

---

### 4. Refresh Token
**POST** `/api/auth/refresh`

**Headers:**
```
Authorization: Bearer {old_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "3|NewTokenStringHere..."
  }
}
```

---

### 5. Logout
**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

## 🛡️ Middleware & Authorization

### Middleware Sẵn Có

1. **auth:sanctum** - Kiểm tra token hợp lệ
   ```php
   Route::middleware('auth:sanctum')->get('/path', ...)
   ```

2. **admin** - Kiểm tra user là admin
   ```php
   Route::middleware(['auth:sanctum', 'admin'])->get('/path', ...)
   ```

3. **role:{role}** - Kiểm tra role cụ thể (có thể dùng `|` để chỉ định nhiều role)
   ```php
   Route::middleware(['auth:sanctum', 'role:admin|editor'])->get('/path', ...)
   ```

4. **permission:{permission}** - Kiểm tra permission cụ thể
   ```php
   Route::middleware(['auth:sanctum', 'permission:movie.create'])->post('/path', ...)
   ```

### Ví dụ Route Groups

```php
// Public routes (không cần xác thực)
Route::post('/auth/login', ...);
Route::post('/auth/register', ...);

// Protected routes (cần xác thực)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', ...);
    Route::post('/auth/logout', ...);
    Route::post('/auth/refresh', ...);
});

// Admin routes (cần xác thực + admin role)
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::resource('movies', MovieController::class);
    Route::resource('episodes', EpisodeController::class);
    // ...
});
```

---

## 🔍 Checking Authorization trong Code

### Trong Controller

```php
// Kiểm tra user đã xác thực
if (!auth()->check()) {
    return response()->json(['error' => 'Unauthorized'], 401);
}

// Kiểm tra admin
if (!auth()->user()->isAdmin()) {
    return response()->json(['error' => 'Forbidden'], 403);
}

// Kiểm tra role
if (!auth()->user()->hasRole('editor')) {
    return response()->json(['error' => 'Forbidden'], 403);
}

// Kiểm tra permission
if (!auth()->user()->hasPermission('movie.create')) {
    return response()->json(['error' => 'Forbidden'], 403);
}

// Kiểm tra bất kỳ permission nào trong danh sách
if (!auth()->user()->hasAnyPermission(['movie.create', 'movie.update'])) {
    return response()->json(['error' => 'Forbidden'], 403);
}

// Kiểm tra tất cả permissions
if (!auth()->user()->hasAllPermissions(['movie.create', 'movie.update'])) {
    return response()->json(['error' => 'Forbidden'], 403);
}
```

### Trong Middleware

```php
public function handle(Request $request, Closure $next)
{
    if (!$request->user()->hasPermission('movie.create')) {
        throw new AuthorizationException('Permission denied');
    }
    return $next($request);
}
```

---

## 📝 User Model Methods

```php
$user = Auth::user();

// Authorization checks
$user->isAdmin()                                  // bool
$user->hasRole('admin')                         // bool
$user->hasAnyRole(['admin', 'editor'])          // bool
$user->hasPermission('movie.create')            // bool
$user->hasAnyPermission(['movie.create', ...])  // bool
$user->hasAllPermissions(['movie.create', ...]) // bool

// User attributes
$user->id
$user->name
$user->email
$user->status                                   // 'active' | 'banned'
$user->role                                     // Role model
$user->role->permissions                        // Collection of permissions
```

---

## ⚠️ Error Codes & Status Codes

| Status | Error Code | Meaning |
|--------|-----------|---------|
| 200 | SUCCESS | Request berhasil |
| 201 | CREATED | Resource tạo thành công |
| 400 | BAD_REQUEST | Request không hợp lệ |
| 401 | UNAUTHORIZED / AUTHENTICATION_FAILED | Không xác thực hoặc token sai |
| 403 | FORBIDDEN / AUTHORIZATION_FAILED | Không có quyền truy cập |
| 404 | NOT_FOUND | Resource không tìm thấy |
| 409 | CONFLICT | Dữ liệu xung đột |
| 422 | VALIDATION_ERROR | Validation không vượt qua |
| 429 | TOO_MANY_REQUESTS | Request quá nhiều (rate limit) |
| 500 | INTERNAL_SERVER_ERROR | Lỗi server |

---

## 🚀 Testing với Postman

1. Import file `postman_collections/VMovies_Auth_API.json` vào Postman
2. Đặt biến `base_url` = `http://localhost:8000`
3. Gọi endpoint `Login` với tài khoản admin
4. Copy token từ response vào biến `token`
5. Gọi các endpoint khác với token đã có

---

## 📌 Lưu Ý Quan Trọng

1. **Token Security**: Token được lưu trong database, được hủy khi logout
2. **Token Expiration**: Hiện tại không có thời gian hết hạn (có thể cấu hình)
3. **CORS**: Nếu frontend ở domain khác, cần cấu hình CORS
4. **Rate Limiting**: Được bật mặc định (60 requests/phút)
5. **Password Hashing**: Mật khẩu được mã hóa với bcrypt

---

## 📦 Installation & Setup

```bash
# 1. Cài đặt dependencies
composer install

# 2. Tạo .env file
cp .env.example .env

# 3. Generate key
php artisan key:generate

# 4. Chạy migrations
php artisan migrate

# 5. Seed roles & permissions
php artisan db:seed --class=RolePermissionSeeder

# 6. Seed users
php artisan db:seed

# 7. Khởi động server
php artisan serve

# Server sẽ chạy tại http://localhost:8000
```

---

**Last Updated**: 10/04/2026

