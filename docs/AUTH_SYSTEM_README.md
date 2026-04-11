## Tổng Quan

Hệ thống xác thực và phân quyền đầy đủ được xây dựng với **Laravel Sanctum** và mô hình **RBAC (Role-Based Access Control)**. Kiến trúc sạch (Clean Architecture) với separation of concerns rõ ràng.

### Tính Năng

 Authentication với Sanctum tokens  
 RBAC với Roles & Permissions  
 4 roles mặc định: Admin, Editor, Moderator, User  
 30+ permissions chi tiết  
 Custom Exceptions & Error Handling  
 JSON Response chuẩn  
 Middleware cho authorization  
 Unit & Feature Tests  

---

## Cấu Trúc Dự Án

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Auth/
│   │       └── AuthController.php          # Xử lý requests
│   ├── Middleware/
│   │   ├── IsAdmin.php                     # Kiểm tra admin
│   │   ├── CheckRole.php                   # Kiểm tra role
│   │   └── CheckPermission.php             # Kiểm tra permission
│   ├── Requests/
│   │   └── Auth/
│   │       ├── LoginRequest.php            # Validation cho login
│   │       └── RegisterRequest.php         # Validation cho register
│   ├── Resources/
│   │   ├── AuthUserResource.php            # Response format user
│   │   └── RoleResource.php                # Response format role
│
├── Models/
│   ├── User.php                            # User model + RBAC methods
│   ├── Role.php                            # Role model
│   └── Permission.php                      # Permission model
│
├── Services/
│   └── Auth/
│       └── AuthService.php                 # Business logic
│
├── Exceptions/
│   ├── ApiException.php                    # Base exception
│   ├── AuthenticationException.php         # Auth errors
│   ├── AuthorizationException.php          # Authorization errors
│   └── ValidationException.php             # Validation errors
│
├── Traits/
│   └── JsonResponse.php                    # Helper methods cho response
│
database/
├── migrations/
│   ├── 2026_04_10_000001_create_roles_table.php
│   └── 2026_04_10_000002_create_permissions_table.php
├── seeders/
│   ├── RolePermissionSeeder.php            # Tạo roles & permissions
│   └── UserSeeder.php                      # Tạo test users

tests/
├── Unit/Services/
│   └── AuthServiceTest.php                 # Test business logic
└── Feature/API/
    └── ApiAuthenticationTest.php           # Test API endpoints

routes/
└── api.php                                 # API routes

config/
├── api.php                                 # API configuration
└── auth.php                                # Auth guards & providers

docs/
└── API_AUTHENTICATION.md                   # API documentation
```

---

## Cài Đặt & Setup

### 1. Chuẩn Bị

```bash
# Điều kiện tiên quyết
- PHP 8.2+
- Composer
- MySQL hoặc SQLite
- Laravel 11
```

### 2. Cài Dependencies

```bash
composer install
```

### 3. Cấu Hình Environment

```bash
# Copy .env.example
cp .env.example .env

# Generate application key
php artisan key:generate

# Update database config trong .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vmovies
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 4. Chạy Migrations

```bash
# Chạy tất cả migrations
php artisan migrate

# Hoặc chạy fresh (nếu development)
php artisan migrate:fresh
```

### 5. Seed Roles & Permissions

```bash
# Seed roles, permissions, và test users
php artisan db:seed

# Hoặc chỉ seed roles & permissions
php artisan db:seed --class=RolePermissionSeeder
```

### 6. Khởi Động Server

```bash
php artisan serve
```

Server sẽ chạy tại: `http://localhost:8000`

---

## API Endpoints

### Public Endpoints

```bash
POST   /api/auth/login          # Đăng nhập
POST   /api/auth/register       # Đăng ký
```

### Protected Endpoints (Yêu cầu token)

```bash
GET    /api/auth/me             # Lấy thông tin user hiện tại
POST   /api/auth/refresh        # Làm mới token
POST   /api/auth/logout         # Đăng xuất
```

---

## Hướng Dẫn Sử Dụng

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vmovies.com",
    "password": "password"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@vmovies.com",
      "role": {"id": 1, "name": "admin"},
      "is_admin": true
    },
    "token": "1|K7vW8xY9zAa1BbC2dDeE3fFg4hHi5jJk6lLmM7nNoOpPq"
  }
}
```

### Sử Dụng Token

```bash
# Lấy thông tin user hiện tại
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer {token}"
```

### Register

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### Logout

```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer {token}"
```

---

## Authorization & Middleware

### Middleware Có Sẵn

#### 1. `admin` - Chỉ Admin

```php
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Chỉ admin có thể truy cập
});
```

#### 2. `role:{role}` - Kiểm tra Role

```php
Route::middleware(['auth:sanctum', 'role:admin|editor'])->group(function () {
    // Chỉ admin hoặc editor có thể truy cập
});
```

#### 3. `permission:{permission}` - Kiểm tra Permission

```php
Route::middleware(['auth:sanctum', 'permission:movie.create'])->post('/movies', ...);
```

### Kiểm tra Authorization trong Code

```php
$user = auth()->user();

// Kiểm tra role
if ($user->hasRole('admin')) { ... }
if ($user->hasAnyRole(['admin', 'editor'])) { ... }

// Kiểm tra permission
if ($user->hasPermission('movie.create')) { ... }
if ($user->hasAnyPermission(['movie.create', 'movie.update'])) { ... }

// Kiểm tra admin
if ($user->isAdmin()) { ... }
```

---

## Test Users

Sau khi seed database, bạn có thể sử dụng những tài khoản này:

| Email | Password | Role |
|-------|----------|------|
| admin@vmovies.com | password | Admin |
| editor@vmovies.com | password | Editor |
| moderator@vmovies.com | password | Moderator |
| user@vmovies.com | password | User |

---

## Testing

### Chạy Unit Tests

```bash
php artisan test tests/Unit/Services/AuthServiceTest.php
```

### Chạy Feature Tests

```bash
php artisan test tests/Feature/API/ApiAuthenticationTest.php
```

### Chạy Tất Cả Tests

```bash
php artisan test
```

### Với Coverage Report

```bash
php artisan test --coverage
```

---

## Roles & Permissions

### Admin Role

Có **tất cả** permissions

### Editor Role

- `movie.create`, `movie.read`, `movie.update`, `movie.delete`, `movie.restore`
- `episode.create`, `episode.read`, `episode.update`, `episode.delete`
- `genre.create`, `genre.read`, `genre.update`
- `country.create`, `country.read`, `country.update`
- `director.create`, `director.read`, `director.update`
- `actor.create`, `actor.read`, `actor.update`
- `dashboard.access`

### Moderator Role

- `comment.read`, `comment.delete`, `comment.approve`
- `user.read`, `user.ban`
- `dashboard.access`

### User Role

- `movie.read`, `genre.read`, `country.read`, `director.read`, `actor.read`

---

## Database Schema

### Users Table (Thêm mới)
- `role_id` - Foreign key đến roles table

### Roles Table (Tạo mới)
- `id` (PK)
- `name` - Unique (admin, editor, moderator, user)
- `display_name` - Hiển thị
- `description` - Mô tả
- `timestamps`

### Permissions Table (Tạo mới)
- `id` (PK)
- `name` - Unique
- `display_name`
- `description`
- `timestamps`

### Role Permissions Table (Tạo mới)
- `role_id` (FK)
- `permission_id` (FK)
- Primary Key: (role_id, permission_id)

---

## Security Features

 Password hashing với bcrypt  
 Token-based authentication  
 RBAC authorization  
 Permission checking  
 Rate limiting (configurable)  
 CORS support  
 Exception handling  
 Validation rules  

---

## Error Handling

### Exception Classes

- `ApiException` - Base exception cho API
- `AuthenticationException` - Lỗi xác thực (401)
- `AuthorizationException` - Lỗi phân quyền (403)
- `ValidationException` - Lỗi validation (422)

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "error_code": "ERROR_CODE",
  "errors": null
}
```

---

## Clean Architecture Pattern

### Layers

1. **Controller** - HTTP request handling
2. **Request** - Request validation
3. **Service** - Business logic
4. **Model** - Database & relationships
5. **Resource** - Response formatting
6. **Exception** - Error handling
7. **Middleware** - Authorization

### SOLID Principles

- **S**ingle Responsibility - Mỗi class có 1 trách nhiệm
- **O**pen/Closed - Mở mở rộng, đóng sửa đổi
- **L**iskov Substitution - Thay thế được các subclass
- **I**nterface Segregation - Interface nhỏ, cụ thể
- **D**ependency Inversion - Phụ thuộc vào abstraction

---

## Support & Documentation

- Full API Documentation: `docs/API_AUTHENTICATION.md`
- Postman Collection: `postman_collections/VMovies_Auth_API.json`
- Test Files: `tests/`

---

**Last Updated**: 10/04/2026
**Version**: 1.0.0

