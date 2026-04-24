<div align="center">
  <h1>🎬 VMovies - Nền Tảng Xem Phim Trực Tuyến</h1>
  <p>Hệ thống xem phim trực tuyến hiện đại với CMS quản trị toàn diện, xây dựng trên nền tảng Laravel 11 và React (Inertia.js).</p>
</div>

---

## 🌟 Giới thiệu

**VMovies** là một dự án nền tảng xem phim trực tuyến (Movie Streaming Platform) bao gồm trang web dành cho người xem và hệ thống CMS dành cho Quản trị viên. Hệ thống được thiết kế theo kiến trúc monolithic kết hợp SPA (Single Page Application) giúp mang lại trải nghiệm mượt mà, tốc độ tải trang cực nhanh và quản lý dữ liệu dễ dàng.

## 👥 Đối tượng sử dụng & Quyền hạn

| Đối tượng | Quyền hạn |
|---|---|
| **Khách vãng lai (Guest)** | Xem phim, tìm kiếm, xem thông tin chi tiết phim, danh sách tập, đọc bình luận. (Không có tính năng cá nhân hóa). |
| **Thành viên (Member)** | Đầy đủ quyền của khách + Thêm vào Tủ phim (Bookmark), Lịch sử xem phim, Đánh giá phim, Bình luận, Cập nhật hồ sơ cá nhân. |
| **Quản trị viên (Admin)** | Toàn quyền truy cập vào bảng điều khiển (CMS). Quản lý toàn bộ nội dung (Phim, Tập, Thể loại, Nhân sự), kiểm duyệt bình luận và quản lý người dùng. |

---

## 🚀 Các chức năng chính (Features)

### 🛠️ Dành cho Quản trị viên (CMS)
- **Bảng điều khiển (Dashboard):** Thống kê tổng quan số liệu về Phim, Người dùng, Bình luận,...
- **Quản lý Phim (Movies):** Thêm/Sửa/Xóa (Hỗ trợ Soft Delete), quản lý các quan hệ (Thể loại, Quốc gia, Đạo diễn, Diễn viên).
- **Quản lý Tập phim (Episodes):** Thêm tập mới, tạo hàng loạt (Bulk create), sắp xếp thứ tự tập (Reorder).
- **Quản lý Danh mục:** Phân loại theo Thể loại (Genres) và Quốc gia (Countries).
- **Quản lý Nhân sự phim:** Đạo diễn (Directors), Diễn viên (Actors).
- **Quản lý Người dùng:** Xem danh sách, cập nhật thông tin, cấm/mở cấm (Ban/Unban) tài khoản.
- **Kiểm duyệt Bình luận:** Xem danh sách bình luận chờ duyệt (Pending), phê duyệt (Approve) hoặc xóa (Xóa).

### 👤 Dành cho Người xem (Viewer / Member)
- **Xác thực người dùng:** Đăng nhập, Đăng ký, Quên mật khẩu, Đăng xuất (xác thực qua Laravel Sanctum).
- **Khám phá phim:** Xem phim theo danh sách (Mới cập nhật, Nổi bật), Lọc phim theo Thể loại và Quốc gia.
- **Trải nghiệm Xem phim:** Trình phát video (Video Player), chuyển tập mượt mà, thông tin chi tiết phim, điểm số đánh giá.
- **Hồ sơ cá nhân:** Cập nhật thông tin tài khoản, đổi mật khẩu, xóa tài khoản an toàn.
- **Tương tác (Sắp hoàn thiện):** Đánh giá (Rating), Bình luận (Comment), Tủ phim (Bookmark), Lịch sử xem (Watch History).

---

## 💻 Công nghệ sử dụng (Tech Stack)

Dự án đã được nâng cấp và triển khai trên các công nghệ hiện đại nhất:

**Backend:**
- **Framework:** Laravel 11.x (PHP 8.2+)
- **Authentication:** Laravel Sanctum & Laravel Breeze
- **Database:** MySQL / PostgreSQL
- **Architecture:** Mô hình MVC kết hợp Service Pattern (Ví dụ: `CommentService`)

**Frontend:**
- **Library:** React 18
- **SPA Bridge:** Inertia.js 2.0 (Giao tiếp mượt mà giữa Laravel và React không cần xây dựng API RESTful riêng lẻ cho Views)
- **Styling:** Tailwind CSS 3.x, Headless UI
- **Build Tool:** Vite

---

## 📊 Sơ đồ Dữ liệu & Biểu đồ Lớp (ERD & Class Diagram)

### 1. Sơ đồ Thực thể Kết nối (ERD)
Sơ đồ dưới đây mô tả mối quan hệ giữa các thực thể trong cơ sở dữ liệu của dự án.

```mermaid
erDiagram
    USERS ||--o{ COMMENTS : "has"
    USERS ||--o{ RATINGS : "gives"
    USERS ||--o{ BOOKMARKS : "saves"
    USERS ||--o{ WATCH_HISTORY : "tracks"
    ROLES ||--|{ USERS : "assigned to"
    ROLES }|--|{ PERMISSIONS : "has"

    MOVIES ||--o{ EPISODES : "contains"
    MOVIES ||--o{ COMMENTS : "receives"
    MOVIES ||--o{ RATINGS : "receives"
    MOVIES ||--o{ BOOKMARKS : "bookmarked in"
    MOVIES }|--|{ GENRES : "belongs to"
    MOVIES }|--|{ COUNTRIES : "belongs to"
    MOVIES }|--|{ DIRECTORS : "directed by"
    MOVIES }|--|{ ACTORS : "features"
    
    EPISODES ||--o{ COMMENTS : "receives"
    EPISODES ||--o{ WATCH_HISTORY : "watched in"
    MOVIES ||--o{ WATCH_HISTORY : "watched in"
```

### 2. Biểu đồ Lớp (Class Diagram)
Biểu đồ lớp thể hiện kiến trúc các Model trong Laravel và các mối quan hệ (Relationships) giữa chúng.

```mermaid
classDiagram
    class User {
        +String name
        +String email
        +role() BelongsTo
        +comments() HasMany
        +ratings() HasMany
        +bookmarks() HasMany
        +watchHistory() HasMany
        +isAdmin() bool
        +hasRole(role) bool
    }

    class Role {
        +String name
        +permissions() BelongsToMany
        +users() HasMany
    }

    class Permission {
        +String name
        +roles() BelongsToMany
    }

    class Movie {
        +String title
        +String description
        +episodes() HasMany
        +genres() BelongsToMany
        +countries() BelongsToMany
        +directors() BelongsToMany
        +actors() BelongsToMany
        +comments() HasMany
        +ratings() HasMany
        +bookmarks() HasMany
        +isSeries() bool
    }

    class Episode {
        +String name
        +String video_url
        +movie() BelongsTo
        +comments() HasMany
        +watchHistories() HasMany
    }

    class Comment {
        +String content
        +String status
        +user() BelongsTo
        +movie() BelongsTo
        +episode() BelongsTo
    }

    class Genre {
        +movies() BelongsToMany
    }
    class Country {
        +movies() BelongsToMany
    }
    class Director {
        +movies() BelongsToMany
    }
    class Actor {
        +movies() BelongsToMany
    }

    class Rating {
        +int score
        +user() BelongsTo
        +movie() BelongsTo
    }

    class Bookmark {
        +user() BelongsTo
        +movie() BelongsTo
    }

    class WatchHistory {
        +int watched_seconds
        +user() BelongsTo
        +movie() BelongsTo
        +episode() BelongsTo
    }

    User "1" --> "*" Comment
    User "1" --> "*" Rating
    User "1" --> "*" Bookmark
    User "1" --> "*" WatchHistory
    Role "1" --> "*" User
    Role "*" <--> "*" Permission

    Movie "1" --> "*" Episode
    Movie "*" <--> "*" Genre
    Movie "*" <--> "*" Country
    Movie "*" <--> "*" Director
    Movie "*" <--> "*" Actor
    Movie "1" --> "*" Comment
    Movie "1" --> "*" Rating
    Movie "1" --> "*" Bookmark
    
    Episode "1" --> "*" Comment
    Episode "1" --> "*" WatchHistory
```

---

## 📂 Cấu trúc thư mục (Project Structure)

```text
vmovies/
├── app/
│   ├── Http/Controllers/    # Chứa các Controller xử lý logic (Admin, Auth, Viewer)
│   ├── Models/              # Các Eloquent Models (Movie, Episode, User, Role, Comment...)
│   └── Services/            # Nơi chứa Business Logic (ví dụ: CommentService)
├── database/
│   ├── migrations/          # Schema database (Bảng movies, episodes, pivot tables...)
│   └── seeders/             # Dữ liệu mẫu ban đầu
├── resources/
│   └── js/
│       └── Pages/           # Các React Components (Inertia Pages)
│           ├── Admin/       # Giao diện CMS cho Admin
│           ├── Auth/        # Giao diện Đăng nhập/Đăng ký
│           ├── Profile/     # Giao diện quản lý hồ sơ người dùng
│           └── Viewer/      # Giao diện xem phim cho Khách/Thành viên
├── routes/
│   ├── web.php              # Routing cho SPA Inertia
│   └── api.php              # Routing cho API endpoints
└── ...
```

---

## 🛠️ Hướng dẫn cài đặt & Chạy dự án (Local Development)

### Yêu cầu môi trường:
- PHP >= 8.2
- Composer
- Node.js & npm
- MySQL / PostgreSQL Server

### Các bước cài đặt:

1. **Clone repository và cài đặt thư viện PHP:**
   ```bash
   git clone <repo-url> vmovies
   cd vmovies
   composer install
   ```

2. **Cài đặt thư viện Node.js:**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường (.env):**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Nhớ cấu hình thông tin kết nối Database trong file `.env`.*

4. **Chạy Migration & Seed Database:**
   ```bash
   php artisan migrate
   # Nếu có seeder: php artisan db:seed
   ```

5. **Khởi chạy ứng dụng (Chạy song song Backend & Frontend):**
   ```bash
   npm run dev
   # Câu lệnh này sẽ dùng concurrently để chạy cả "php artisan serve" và "vite"
   ```

6. Truy cập ứng dụng tại: `http://localhost:8000`

---

## 🚦 Yêu cầu phi chức năng (Non-functional Requirements)
- **Giao diện:** Responsive, tối ưu hóa cho màn hình Mobile & Desktop. Sử dụng Tailwind CSS linh hoạt.
- **Hiệu năng:** SPA mượt mà không load lại trang, áp dụng Cache cho các truy vấn nặng.
- **Bảo mật:** CSRF Protection (Inertia), XSS Protection, SQL Injection Protection (Eloquent ORM), Authorization/Policies bảo vệ các API Admin.

---

> **Mọi thắc mắc hoặc góp ý, vui lòng liên hệ nhóm phát triển!**
