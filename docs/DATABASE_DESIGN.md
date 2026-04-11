# Phân tích & Thiết kế Database - VMovies

## Tổng quan

Dựa trên README, hệ thống VMovies cần một database quan hệ (RDBMS) để lưu trữ:
- Thông tin người dùng (User), vai trò (Role)
- Thông tin phim (Movie), tập phim (Episode)
- Phân loại nội dung (Genre, Country, Cast, Crew)
- Tương tác người dùng (Comments, Ratings, Bookmarks, Watch History)

**Cơ sở dữ liệu đề xuất**: MySQL hoặc PostgreSQL

---

## Danh sách các bảng (Tables)

### Quản lý người dùng
```
id (PK)
name
email (UNIQUE)
password
avatar_url
is_admin (boolean)
status (active/banned)
created_at
updated_at
```

### Quản lý phim
```
id (PK)
title (tên phim Việt)
original_title (tên gốc/tiếng Anh)
poster_url (ảnh dọc)
banner_url (ảnh ngang)
trailer_url (link YouTube)
summary (tóm tắt nội dung)
release_year (năm phát hành)
status (ongoing/completed)
type (movie/series)
view_count (lượt xem)
average_rating (điểm đánh giá trung bình)
created_at
updated_at
```

### Quản lý tập phim
```
id (PK)
movie_id (FK)
episode_number (số thứ tự tập)
arc_name (tên Arc/phần - ví dụ: "Arc Wano")
title (tên tập)
video_url (link video)
duration (thời lượng tính bằng giây)
views (lượt xem)
created_at
updated_at
```

### Thể loại
```
id (PK)
name (tên thể loại)
slug (url-friendly name)
description
icon_url
created_at
updated_at
```

### Quốc gia
```
id (PK)
name (tên quốc gia)
code (mã ISO, ví dụ: US, KR, JP)
flag_url
created_at
updated_at
```

### Đạo diễn
```
id (PK)
name (tên đạo diễn)
bio (tiểu sử)
image_url (ảnh đại diện)
created_at
updated_at
```

### Diễn viên
```
id (PK)
name (tên diễn viên)
bio (tiểu sử)
image_url (ảnh đại diện)
created_at
updated_at
```

### Bình luận
```
id (PK)
user_id (FK)
movie_id (FK)
episode_id (FK - nullable, cho phép bình luận tập cụ thể)
content (nội dung bình luận)
is_approved (boolean - duyệt bình luận)
is_deleted (boolean - ẩn bình luận)
created_at
updated_at
```

### Đánh giá phim
```
id (PK)
user_id (FK)
movie_id (FK)
score (1-5 sao)
review_text (đánh giá chi tiết - nullable)
helpful_count (số lượt thấy hữu ích)
created_at
updated_at
```

### Tủ phim yêu thích
```
id (PK)
user_id (FK)
movie_id (FK)
bookmarked_at (ngày lưu)
UNIQUE(user_id, movie_id)
```

### Lịch sử xem
```
id (PK)
user_id (FK)
movie_id (FK)
episode_id (FK)
current_timestamp (mốc thời gian dừng - tính bằng giây)
watched_at (lần xem cuối)
created_at
updated_at
UNIQUE(user_id, episode_id)
```

---

## Quan hệ (Relationships)

### Many-to-Many (M-N)

#### (Phim - Thể loại)
```
id (PK)
movie_id (FK → movies)
genre_id (FK → genres)
created_at
UNIQUE(movie_id, genre_id)
``` 
**Mục đích**: Một phim có nhiều thể loại, một thể loại có nhiều phim.

#### **movie_country** (Phim - Quốc gia)
```
id (PK)
movie_id (FK → movies)
country_id (FK → countries)
created_at
UNIQUE(movie_id, country_id)
```
**Mục đích**: Một phim được sản xuất ở nhiều quốc gia, một quốc gia có nhiều phim.

#### (Phim - Đạo diễn)
```
id (PK)
movie_id (FK → movies)
director_id (FK → directors)
created_at
UNIQUE(movie_id, director_id)
```
**Mục đích**: Một phim có nhiều đạo diễn, một đạo diễn làm nhiều phim.

#### (Phim - Diễn viên)
```
id (PK)
movie_id (FK → movies)
actor_id (FK → actors)
role_name (vai diễn - nullable)
created_at
UNIQUE(movie_id, actor_id)
```
**Mục đích**: Một phim có nhiều diễn viên, một diễn viên đóng nhiều phim.

---

## Sơ đồ Quan hệ (Entity-Relationship Diagram) - Chi Tiết

### Toàn cảnh hệ thống

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                          VMOVIES DATABASE DIAGRAM                             ║
╚═══════════════════════════════════════════════════════════════════════════════╝

                    ┌─────────────────────────────────┐
                    │           USERS                 │
                    ├─────────────────────────────────┤
                    │ PK: id (BIGINT)                 │
                    │ • name (VARCHAR 255)            │
                    │ • email (VARCHAR 255) UNIQUE    │
                    │ • password (VARCHAR 255)        │
                    │ • avatar_url (TEXT, nullable)   │
                    │ • status (VARCHAR 20)           │
                    │ • phone (VARCHAR 20, nullable)  │
                    │ • date_of_birth (DATE, nullable)│
                    │ • created_at (TIMESTAMP)        │
                    │ • updated_at (TIMESTAMP)        │
                    └────────────────┬──────────────────┘
                                     │ 1:N
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         │ 1:N                       │ 1:N                       │ 1:N
         ▼                           ▼                           ▼
    ┌─────────────┐          ┌──────────────┐          ┌──────────────┐
    │  COMMENTS   │          │   RATINGS    │          │  BOOKMARKS   │
    ├─────────────┤          ├──────────────┤          ├──────────────┤
    │ PK: id      │          │ PK: id       │          │ PK: id       │
    │ FK: user_id │          │ FK: user_id  │          │ FK: user_id  │
    │ FK: movie_id│          │ FK: movie_id │          │ FK: movie_id │
    │ FK: episode_│          │ • score      │          │ • bookmarked_ │
    │     id (NK) │          │   (TINYINT   │          │   at (TS)     │
    │ • content   │          │   1-5)       │          │ UNIQUE KEY:  │
    │ • is_apprvd │          │ • review_txt │          │ (user_movie) │
    │ • is_delete │          │ • helpful_ct │          │              │
    │ • created_at          │ • created_at │          │ • created_at │
    │ • updated_at          │ • updated_at │          │ • updated_at │
    └─────────────┘          └──────────────┘          └──────────────┘
         │                           │
         └─────────────┬─────────────┘
                       │ 1:N (movie_id)
                       │
                       ▼
                  ┌──────────────┐
                  │ WATCH_HISTORY│
                  ├──────────────┤
                  │ PK: id       │
                  │ FK: user_id  │
                  │ FK: movie_id │
                  │ FK: episode_ │
                  │     id       │
                  │ • current_ts │
                  │   (SECONDS)  │
                  │ • watched_at │
                  │ • created_at │
                  │ • updated_at │
                  │ UNIQUE KEY:  │
                  │ (user_epi)   │
                  └──────────────┘
```

### Phần quản lý phim và nội dung

```
                      ┌───────────────────────────┐
                      │        MOVIES             │
                      ├───────────────────────────┤
                      │ PK: id (BIGINT)           │
                      │ • title (VARCHAR 255)     │
                      │ • original_title (TEXT)   │
                      │ • slug (VARCHAR 255)      │
                      │ • poster_url (TEXT)       │
                      │ • banner_url (TEXT)       │
                      │ • trailer_url (TEXT, NK)  │
                      │ • summary (LONGTEXT)      │
                      │ • description (TEXT)      │
                      │ • release_year (YEAR)     │
                      │ • status (VARCHAR: ongoing│
                      │         /completed)       │
                      │ • type (VARCHAR: movie/   │
                      │         series)           │
                      │ • view_count (BIGINT)     │
                      │ • rating_avg (DECIMAL 3,2)
                      │ • created_at (TIMESTAMP)  │
                      │ • updated_at (TIMESTAMP)  │
                      └────────────┬──────────────┘
                                   │ 1:N
                                   ▼
                         ┌──────────────────┐
                         │    EPISODES      │
                         ├──────────────────┤
                         │ PK: id (BIGINT)  │
                         │ FK: movie_id     │
                         │ • episode_num    │
                         │   (SMALLINT)     │
                         │ • arc_name (TEXT)│
                         │ • title (VARCHAR)│
                         │ • description(TX)│
                         │ • video_url (TXT)│
                         │ • duration (INT) │
                         │ • views (BIGINT) │
                         │ • release_date   │
                         │ • created_at     │
                         │ • updated_at     │
                         └──────────────────┘


        ╔════════════════════════════════════════════════════╗
        ║    MANY-TO-MANY (N:M) RELATIONSHIPS               ║
        ╚════════════════════════════════════════════════════╝

        MOVIES ◄─────N:M─────► GENRES
        ┌───────────────────────────────┐
        │      MOVIE_GENRE (Pivot)      │
        ├───────────────────────────────┤
        │ PK: id                        │
        │ FK: movie_id                  │
        │ FK: genre_id                  │
        │ • created_at                  │
        │ UNIQUE KEY: (movie_genre)     │
        └───────────────────────────────┘
                    │              ▲
                    │              │
                    └──────────────┘

        MOVIES ◄─────N:M─────► COUNTRIES
        ┌───────────────────────────────┐
        │    MOVIE_COUNTRY (Pivot)      │
        ├───────────────────────────────┤
        │ PK: id                        │
        │ FK: movie_id                  │
        │ FK: country_id                │
        │ • created_at                  │
        │ UNIQUE KEY: (movie_country)   │
        └───────────────────────────────┘
                    │              ▲
                    │              │
                    └──────────────┘

        MOVIES ◄─────N:M─────► DIRECTORS
        ┌───────────────────────────────┐
        │    MOVIE_DIRECTOR (Pivot)     │
        ├───────────────────────────────┤
        │ PK: id                        │
        │ FK: movie_id                  │
        │ FK: director_id               │
        │ • created_at                  │
        │ UNIQUE KEY: (movie_director)  │
        └───────────────────────────────┘
                    │              ▲
                    │              │
                    └──────────────┘

        MOVIES ◄─────N:M─────► ACTORS
        ┌───────────────────────────────┐
        │     MOVIE_ACTOR (Pivot)       │
        ├───────────────────────────────┤
        │ PK: id                        │
        │ FK: movie_id                  │
        │ FK: actor_id                  │
        │ • role_name (VARCHAR, NK)     │
        │ • created_at                  │
        │ UNIQUE KEY: (movie_actor)     │
        └───────────────────────────────┘
                    │              ▲
                    │              │
                    └──────────────┘
```

### Bảng tham chiếu (Reference Tables)

```
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│      GENRES        │  │     COUNTRIES      │  │     DIRECTORS      │
├────────────────────┤  ├────────────────────┤  ├────────────────────┤
│ PK: id (INT)       │  │ PK: id (INT)       │  │ PK: id (INT)       │
│ • name (VARCHAR)   │  │ • name (VARCHAR)   │  │ • name (VARCHAR)   │
│ • slug (VARCHAR)   │  │ • code (CHAR 2)    │  │ • bio (LONGTEXT)   │
│ • description(TEXT)│  │ • flag_url (TEXT)  │  │ • image_url (TEXT) │
│ • icon_url (TEXT)  │  │ • created_at (TS)  │  │ • created_at (TS)  │
│ • created_at (TS)  │  │ • updated_at (TS)  │  │ • updated_at (TS)  │
│ • updated_at (TS)  │  └────────────────────┘  └────────────────────┘
└────────────────────┘

┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│      ACTORS        │  │       ROLES        │  │    PERMISSIONS     │
├────────────────────┤  ├────────────────────┤  ├────────────────────┤
│ PK: id (INT)       │  │ PK: id (INT)       │  │ PK: id (INT)       │
│ • name (VARCHAR)   │  │ • name (VARCHAR)   │  │ • name (VARCHAR)   │
│ • bio (LONGTEXT)   │  │   UNIQUE           │  │   UNIQUE           │
│ • image_url (TEXT) │  │ • display_name(VCH)│  │ • display_name(VCH)│
│ • created_at (TS)  │  │ • created_at (TS)  │  │ • created_at (TS)  │
│ • updated_at (TS)  │  │ • updated_at (TS)  │  │ • updated_at (TS)  │
└────────────────────┘  └────────────────────┘  └────────────────────┘
```

### Hệ thống phân quyền

```
                    ┌─────────────────────────┐
                    │        USERS            │
                    └────────────┬────────────┘
                                 │ N:M
                                 │
                    ┌────────────▼────────────┐
                    │     ROLE_USER           │
                    │  (M-N Pivot Table)      │
                    ├─────────────────────────┤
                    │ PK: id                  │
                    │ FK: user_id             │
                    │ FK: role_id             │
                    │ • created_at            │
                    │ UNIQUE(user_role)       │
                    └────────────┬────────────┘
                                 │
                                 │ N:M
                                 ▼
                    ┌─────────────────────────┐
                    │       ROLES             │
                    ├─────────────────────────┤
                    │ PK: id (INT)            │
                    │ • name (VARCHAR)        │
                    │   UNIQUE                │
                    │ • display_name (VARCHAR)│
                    │ • created_at (TS)       │
                    │ • updated_at (TS)       │
                    └────────────┬────────────┘
                                 │ N:M
                                 │
                    ┌────────────▼────────────┐
                    │   ROLE_PERMISSION       │
                    │  (M-N Pivot Table)      │
                    ├─────────────────────────┤
                    │ PK: id                  │
                    │ FK: role_id             │
                    │ FK: permission_id       │
                    │ • created_at            │
                    │ UNIQUE(role_permission) │
                    └────────────┬────────────┘
                                 │
                                 │ N:M
                                 ▼
                    ┌─────────────────────────┐
                    │     PERMISSIONS         │
                    ├─────────────────────────┤
                    │ PK: id (INT)            │
                    │ • name (VARCHAR)        │
                    │   UNIQUE                │
                    │ • display_name (VARCHAR)│
                    │ • created_at (TS)       │
                    │ • updated_at (TS)       │
                    └─────────────────────────┘
```

### Bảng hỗ trợ API Authentication

```
┌──────────────────────────────────┐
│   PERSONAL_ACCESS_TOKENS         │
├──────────────────────────────────┤
│ PK: id (BIGINT)                  │
│ • tokenable_type (VARCHAR)       │
│   (e.g., "App\Models\User")      │
│ • tokenable_id (BIGINT)          │
│   (FK → users.id)                │
│ • name (VARCHAR)                 │
│ • token (VARCHAR) UNIQUE         │
│ • abilities (TEXT - JSON)        │
│ • last_used_at (TIMESTAMP, NK)   │
│ • expires_at (TIMESTAMP, NK)     │
│ • created_at (TIMESTAMP)         │
│ • updated_at (TIMESTAMP)         │
└──────────────────────────────────┘
```

### Chú giải ký hiệu

| Ký hiệu | Ý nghĩa |
|---------|---------|
| **PK** | Primary Key (Khóa chính) |
| **FK** | Foreign Key (Khóa ngoài) |
| **N:M** | Quan hệ Nhiều-Nhiều (Many-to-Many) |
| **1:N** | Quan hệ Một-Nhiều (One-to-Many) |
| **NK** | Nullable Key (Có thể NULL) |
| **TS** | TIMESTAMP |
| **VCH** | VARCHAR |
| **TX** | TEXT |
| **UNIQUE KEY** | Ràng buộc duy nhất (không được trùng lặp) |
```

---

## Các chỉ mục (Indexes)

Để tối ưu tốc độ truy vấn, cần tạo các chỉ mục:

```sql
-- Tìm kiếm nhanh theo email
CREATE INDEX idx_users_email ON users(email);

-- Tìm kiếm phim theo tên
CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_movies_type ON movies(type);

-- Tìm tập phim của một bộ phim
CREATE INDEX idx_episodes_movie_id ON episodes(movie_id);

-- Tìm bình luận của một phim/tập
CREATE INDEX idx_comments_movie_id ON comments(movie_id);
CREATE INDEX idx_comments_episode_id ON comments(episode_id);

-- Tìm đánh giá của một phim
CREATE INDEX idx_ratings_movie_id ON ratings(movie_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);

-- Tìm bookmark của người dùng
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- Tìm lịch sử xem
CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watch_history_user_episode ON watch_history(user_id, episode_id);
```

---

## Ràng buộc toàn vẹn (Constraints)

1. **Foreign Keys**: Tất cả khóa ngoài phải tham chiếu đến bản ghi tồn tại.
2. **Unique Constraints**:
   - `users.email` - Email không được trùng lặp
   - `movie_genre (movie_id, genre_id)` - Không trùng lặp phim-thể loại
   - `bookmarks (user_id, movie_id)` - Mỗi user chỉ bookmark phim 1 lần
   - `watch_history (user_id, episode_id)` - Mỗi user chỉ có 1 lịch sử cho mỗi tập

3. **Check Constraints**:
   - `ratings.score` BETWEEN 1 AND 5
   - `episodes.duration > 0`
   - `movies.release_year > 0 AND release_year <= YEAR(CURDATE())`

---

## Thống kê dữ liệu

| Bảng | Mục đích | Ước tính lượng dữ liệu |
|------|---------|----------------------|
| users | 1 triệu người dùng | ~1GB (with avatars) |
| movies | 10.000 bộ phim | ~100MB |
| episodes | 1 triệu tập phim | ~50MB (metadata) |
| genres | 20-30 thể loại | <1MB |
| countries | ~200 quốc gia | <1MB |
| comments | 10 triệu bình luận | ~1GB |
| ratings | 5 triệu đánh giá | ~500MB |
| bookmarks | 50 triệu bookmark | ~500MB |
| watch_history | 100 triệu lịch sử | ~2GB |

---

## Optimization Tips

1. **Partitioning**: Chia bảng `comments`, `ratings`, `watch_history` theo `created_at` hoặc `user_id` vì dữ liệu quá lớn.

2. **Caching**: Dùng Redis cache cho:
   - Danh sách phim nổi bật
   - Phim xem nhiều nhất tuần
   - Bộ đếm view, rating
   - Danh sách tập của mỗi phim

3. **Full-text Search**: Dùng Meilisearch hoặc Elasticsearch cho tìm kiếm nhanh trên `movies.title`, `movies.original_title`, `actors.name`.

4. **Read Replicas**: Nếu traffic cao, dùng multiple read replicas cho các truy vấn SELECT.

---

## Checklist Thiết kế

- [ ] Tạo migration cho tất cả bảng
- [ ] Tạo Model & Relationship cho mỗi bảng
- [ ] Tạo Seeder sinh dữ liệu test
- [ ] Kiểm tra Performance với dữ liệu lớn
- [ ] Tạo Backup Strategy
- [ ] Thiết lập Monitoring & Logging

---

> **Bước tiếp theo**: Tạo migrations và models trong Laravel để hiện thực hóa design này.

