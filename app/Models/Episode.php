<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model đại diện cho Tập phim (Episode)
 * Một bộ phim có thể có nhiều tập (đặc biệt là phim bộ).
 */
class Episode extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Các trường có thể gán giá trị
     * - movie_id: ID bộ phim mà tập này thuộc về
     * - episode_number: Số thứ tự tập phim
     * - arc_name: Tên chương/phần (nếu có, VD: Skypiea Arc)
     * - title: Tiêu đề tập phim
     * - video_url: Đường dẫn video của tập phim
     * - duration: Thời lượng (giây)
     * - views: Lượt xem riêng cho từng tập
     */
    protected $fillable = [
        'movie_id',
        'episode_number',
        'arc_name',
        'title',
        'video_url',
        'duration',
        'views',
    ];

    /**
     * Ép kiểu dữ liệu
     */
    protected $casts = [
        'episode_number' => 'integer',
        'duration' => 'integer',
        'views' => 'integer',
    ];

    /**
     * Accessor: Trả về thời lượng dạng H:i:s từ số giây gốc
     */
    public function getDurationFormattedAttribute(): string
    {
        return gmdate('H:i:s', $this->duration);
    }

    /**
     * Quan hệ với Bộ phim (Movie)
     * Mỗi tập phim phải thuộc về một bộ phim.
     */
    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class);
    }

    /**
     * Quan hệ với các Bình luận (Comments)
     * Một tập phim có thể có nhiều bình luận từ người xem.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->where('is_deleted', false);
    }

    /**
     * Quan hệ với Lịch sử xem (WatchHistories)
     * Lưu trữ vết xem của người dùng đối với tập phim này.
     */
    public function watchHistories(): HasMany
    {
        return $this->hasMany(WatchHistory::class);
    }
}
