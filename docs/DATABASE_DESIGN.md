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

## Sơ đồ Quan hệ (Entity-Relationship Diagram)

```
┌──────────────┐
│    users     │
├──────────────┤
│ id (PK)      │
│ name         │
│ email        │
│ password     │
│ is_admin     │
│ status       │
└──────────────┘
       │
       │ 1:N
       ├─────────────────┬────────────────┬──────────────┐
       │                 │                │              │
       ▼                 ▼                ▼              ▼
┌──────────────┐  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   comments   │  │   ratings    │ │  bookmarks   │ │watch_history │
├──────────────┤  ├──────────────┤ ├──────────────┤ ├──────────────┤
│ user_id (FK) │  │ user_id (FK) │ │ user_id (FK) │ │ user_id (FK) │
│ movie_id (FK)│  │ movie_id (FK)│ │ movie_id (FK)│ │ movie_id (FK)│
│ episode_id   │  │ score        │ │ bookmarked_at│ │ episode_id   │
│ content      │  │ review_text  │ │              │ │ timestamp    │
└──────────────┘  └──────────────┘ └──────────────┘ └──────────────┘


┌──────────────┐
│    movies    │◄─────────────┬─────────────┬─────────────┐
├──────────────┤              │             │             │
│ id (PK)      │          N:M│          N:M│          N:M│
│ title        │              │             │             │
│ summary      │              ▼             ▼             ▼
│ release_year │      ┌──────────────┐ ┌──────────┐ ┌──────────┐
│ type         │      │movie_genre   │ │movie_    │ │movie_    │
│ status       │      │              │ │country   │ │director  │
│ views        │      └──────────────┘ └──────────┘ └──────────┘
│ avg_rating   │              │             │             │
└──────────────┘              ▼             ▼             ▼
       │                ┌──────────────┐ ┌──────────┐ ┌──────────┐
       │             1:N│   genres     │ │countries │ │directors │
       │                ├──────────────┤ ├──────────┤ ├──────────┤
       │                │ name         │ │ name     │ │ name     │
       │                │ slug         │ │ code     │ │ bio      │
       │                └──────────────┘ └──────────┘ └──────────┘
       │
       │ 1:N
       ▼
┌──────────────┐        N:M
│  episodes    │───────────────┐
├──────────────┤               │
│ movie_id(FK) │               ▼
│ episode_num  │        ┌──────────────┐
│ arc_name     │        │movie_actor   │
│ title        │        ├──────────────┤
│ video_url    │        │ movie_id(FK) │
│ duration     │        │ actor_id(FK) │
│ views        │        │ role_name    │
└──────────────┘        └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │    actors    │
                        ├──────────────┤
                        │ name         │
                        │ bio          │
                        │ image_url    │
                        └──────────────┘
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

