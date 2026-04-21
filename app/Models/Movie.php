<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Model cốt lõi đại diện cho Bộ phim (Movie)
 * Chứa thông tin tổng quan, trạng thái và các mối quan hệ liên quan đến phim.
 */
class Movie extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Sự kiện khởi tạo model (Booted)
     * Tự động tạo 'slug' từ tiêu đề phim khi thêm mới nếu slug trống.
     */
    protected static function booted(): void
    {
        static::creating(function (Movie $movie) {
            if (empty($movie->slug)) {
                $movie->slug = Str::slug($movie->title).'-'.time();
            }
        });
    }

    /**
     * Các trường có thể gán giá trị
     */
    protected $fillable = [
        'title',            // Tiêu đề phim tiếng Việt
        'original_title',   // Tiêu đề gốc
        'slug',             // Đường dẫn URL
        'poster_url',       // Ảnh bìa dọc
        'banner_url',       // Ảnh bìa ngang
        'trailer_url',      // Link trailer (Youtube,...)
        'summary',          // Tóm tắt nội dung
        'release_year',     // Năm phát hành
        'status',           // Trạng thái (đang chiếu, hoàn thành)
        'type',             // Loại (phim lẻ 'movie', phim bộ 'series')
        'view_count',       // Tổng lượt xem
        'average_rating',   // Điểm đánh giá trung bình
    ];

    /**
     * Ép kiểu dữ liệu
     */
    protected $casts = [
        'release_year' => 'integer',
        'view_count' => 'integer',
        'average_rating' => 'float',
    ];

    /**
     * Kiểm tra phim có phải là phim bộ hay không
     */
    public function isSeries(): bool
    {
        return $this->type === 'series';
    }

    /**
     * Kiểm tra phim đã hoàn thành hay chưa
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Tính toán lại điểm đánh giá trung bình từ bảng 'ratings' và cập nhật vào DB
     */
    public function recalculateRating(): void
    {
        $avg = $this->ratings()->avg('score') ?? 0;
        $this->update(['average_rating' => round($avg, 2)]);
    }

    /**
     * Quan hệ với các Tập phim (Episodes)
     * Một phim có nhiều tập, sắp xếp theo thứ tự tập.
     */
    public function episodes(): HasMany
    {
        return $this->hasMany(Episode::class)->orderBy('episode_number');
    }

    /**
     * Quan hệ với các Bình luận (Comments)
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->where('is_deleted', false);
    }

    /**
     * Quan hệ với các Đánh giá (Ratings)
     */
    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    /**
     * Quan hệ với các Bookmark (Yêu thích)
     */
    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    /**
     * Quan hệ nhiều-nhiều với Thể loại (Genres)
     */
    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class, 'movie_genre');
    }

    /**
     * Quan hệ nhiều-nhiều với Quốc gia (Countries)
     */
    public function countries(): BelongsToMany
    {
        return $this->belongsToMany(Country::class, 'movie_country');
    }

    /**
     * Quan hệ nhiều-nhiều với Đạo diễn (Directors)
     */
    public function directors(): BelongsToMany
    {
        return $this->belongsToMany(Director::class, 'movie_director');
    }

    /**
     * Quan hệ nhiều-nhiều với Diễn viên (Actors)
     */
    public function actors(): BelongsToMany
    {
        return $this->belongsToMany(Actor::class, 'movie_actor')
            ->withPivot('role_name');
    }
}
