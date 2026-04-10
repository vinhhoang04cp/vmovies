# 🚀 Hướng Dẫn Chạy VMovies Authentication System

## ⚡ Quick Start (5 phút)

### Bước 1: Clone & Setup
```bash
# Vào thư mục project
cd C:\Users\vinh-code\Documents\vmovies

# Cài dependencies
composer install

# Copy .env
cp .env.example .env

# Generate key
php artisan key:generate
```

### Bước 2: Database
```bash
# Chạy migrations
php artisan migrate

# Seed dữ liệu (roles, permissions, test users)
php artisan db:seed
```

### Bước 3: Chạy Server
```bash
# Terminal 1: Khởi động PHP server
php artisan serve

# Server chạy tại: http://localhost:8000
```

### Bước 4: Test API
```bash
# Terminal 2: Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vmovies.com","password":"password"}'
```

---

## 📋 Chi Tiết Các Bước

### 1️⃣ Environment Setup

**File: .env**
```env
APP_NAME=VMovies
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vmovies
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 2️⃣ Database Configuration

**Có 2 cách chọn:**

#### Option A: SQLite (Dễ, không cần MySQL)
```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

#### Option B: MySQL (Recommended)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vmovies
DB_USERNAME=root
DB_PASSWORD=
```

### 3️⃣ Chạy Migrations

```bash
# Fresh migration (clear database)
php artisan migrate:fresh

# Hoặc normal migrate
php artisan migrate
```

**Migrations được tạo:**
- `2026_04_10_000001_create_roles_table.php`
- `2026_04_10_000002_create_permissions_table.php`
- Các migrations cũ từ Laravel

### 4️⃣ Seed Dữ Liệu

```bash
# Seed tất cả (roles, permissions, users)
php artisan db:seed

# Hoặc seed riêng lẻ
php artisan db:seed --class=RolePermissionSeeder
php artisan db:seed --class=UserSeeder
```

**Dữ liệu tạo ra:**
- 4 Roles: Admin, Editor, Moderator, User
- 30+ Permissions
- Test Users:
  - admin@vmovies.com (Admin)
  - editor@vmovies.com (Editor)
  - moderator@vmovies.com (Moderator)
  - + 50 regular users
  - + 5 banned users

---

## 🧪 Testing

### 1. Test với Postman

**Import Collection:**
1. Mở Postman
2. File → Import
3. Chọn: `postman_collections/VMovies_Auth_API.json`
4. Set `base_url = http://localhost:8000`

**Test flow:**
1. POST `/api/auth/login` - Lấy token
2. Copy token vào biến `{{token}}`
3. GET `/api/auth/me` - Kiểm tra user info
4. POST `/api/auth/refresh` - Làm mới token
5. POST `/api/auth/logout` - Đăng xuất

### 2. Test với cURL

```bash
# 1. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vmovies.com",
    "password": "password"
  }'

# Response: Copy token từ data.token

# 2. Get Current User
TOKEN="<paste_token_here>"
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 3. Logout
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Unit Tests

```bash
# Chạy auth service tests
php artisan test tests/Unit/Services/AuthServiceTest.php

# Chạy API tests
php artisan test tests/Feature/API/ApiAuthenticationTest.php

# Chạy tất cả tests
php artisan test

# Với verbose
php artisan test --verbose

# Với coverage
php artisan test --coverage
```

---

## 📂 Cấu Trúc File Tạo Ra

### Controllers
- `app/Http/Controllers/Auth/AuthController.php` ✅

### Services
- `app/Services/Auth/AuthService.php` ✅

### Models
- `app/Models/Role.php` ✅
- `app/Models/Permission.php` ✅
- `app/Models/User.php` (Updated) ✅

### Middleware
- `app/Http/Middleware/IsAdmin.php` ✅
- `app/Http/Middleware/CheckRole.php` ✅
- `app/Http/Middleware/CheckPermission.php` ✅

### Requests
- `app/Http/Requests/Auth/LoginRequest.php` (Updated) ✅
- `app/Http/Requests/Auth/RegisterRequest.php` ✅

### Resources
- `app/Http/Resources/AuthUserResource.php` ✅
- `app/Http/Resources/RoleResource.php` ✅

### Exceptions
- `app/Exceptions/ApiException.php` ✅
- `app/Exceptions/AuthenticationException.php` ✅
- `app/Exceptions/AuthorizationException.php` ✅
- `app/Exceptions/ValidationException.php` ✅

### Traits
- `app/Traits/JsonResponse.php` ✅

### Migrations
- `database/migrations/2026_04_10_000001_create_roles_table.php` ✅
- `database/migrations/2026_04_10_000002_create_permissions_table.php` ✅

### Seeders
- `database/seeders/RolePermissionSeeder.php` ✅
- `database/seeders/UserSeeder.php` (Updated) ✅
- `database/seeders/DatabaseSeeder.php` (Updated) ✅

### Routes
- `routes/api.php` ✅

### Config
- `config/api.php` ✅

### Tests
- `tests/Unit/Services/AuthServiceTest.php` ✅
- `tests/Feature/API/ApiAuthenticationTest.php` ✅

### Documentation
- `docs/API_AUTHENTICATION.md` ✅
- `AUTH_SYSTEM_README.md` ✅
- `QUICK_START.md` (File này)

---

## ❌ Troubleshooting

### 1. "SQLSTATE[HY000]: General error"

**Nguyên nhân:** Database connection failed

**Giải pháp:**
```bash
# Check .env file
cat .env | grep DB_

# Verify MySQL running
mysql -u root -p

# Hoặc dùng SQLite
# Chỉnh .env: DB_CONNECTION=sqlite
```

### 2. "TokenMismatchException"

**Nguyên nhân:** CSRF token không hợp lệ

**Giải pháp:** API không cần CSRF, check Authorization header

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. "Unauthenticated"

**Nguyên nhân:** Token không hợp lệ hoặc hết hạn

**Giải pháp:**
```bash
# Login lại để lấy token mới
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vmovies.com","password":"password"}'
```

### 4. "Class not found"

**Nguyên nhân:** Autoloader chưa update

**Giải pháp:**
```bash
composer dump-autoload
php artisan clear-compiled
```

### 5. Port 8000 đang sử dụng

**Giải pháp:**
```bash
# Chạy trên port khác
php artisan serve --port=8001

# Hoặc kill process
lsof -i :8000
kill -9 <PID>
```

---

## 🎯 Next Steps

Sau khi auth system hoạt động, bạn có thể:

1. **Tạo Movie CRUD API** - Xem `README_BACKEND_PLAN.md`
2. **Tạo Episode CRUD API**
3. **Tạo Genre/Country CRUD API**
4. **Tạo Director/Actor CRUD API**
5. **Setup Frontend** - Lấy token từ API

---

## 📞 Useful Commands

```bash
# Database
php artisan migrate              # Chạy migrations
php artisan migrate:fresh        # Fresh migrations
php artisan migrate:rollback     # Rollback last batch
php artisan db:seed              # Seed all seeders
php artisan db:seed --class=RolePermissionSeeder

# Tinker (Interactive shell)
php artisan tinker

# Clear cache
php artisan cache:clear
php artisan view:clear
php artisan config:clear

# List all routes
php artisan route:list

# Testing
php artisan test
php artisan test --verbose
php artisan test --coverage

# Serve with hot reload
php artisan serve --host=0.0.0.0

# Generate key
php artisan key:generate
```

---

## 📖 Documentation

- **API Reference**: `docs/API_AUTHENTICATION.md`
- **Auth System Docs**: `AUTH_SYSTEM_README.md`
- **Backend Plan**: `README_BACKEND_PLAN.md`
- **Postman Collection**: `postman_collections/VMovies_Auth_API.json`

---

## ✅ Checklist - Sau khi Setup

- [ ] Migrations chạy thành công
- [ ] Dữ liệu được seed vào database
- [ ] Login API hoạt động
- [ ] Token được tạo ra
- [ ] Get current user hoạt động
- [ ] Logout hoạt động
- [ ] Tests pass
- [ ] Postman collection import thành công

---

**Ready to test?** → Login tại `http://localhost:8000/api/auth/login` 🚀

Last Updated: 10/04/2026

