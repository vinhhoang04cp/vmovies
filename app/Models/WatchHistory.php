<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model đại diện cho Lịch sử xem phim (Watch History)
 * Theo dõi tiến trình xem phim của người dùng.
 */
class WatchHistory extends Model
{
    // Tên bảng trong cơ sở dữ liệu
    protected $table = 'watch_history';

    /**
     * Các trường có thể gán giá trị
     * - user_id: ID người dùng
     * - movie_id: ID bộ phim đã xem
     * - episode_id: ID tập phim cụ thể đang xem
     * - current_timestamp: Mốc thời gian đang xem dở (giây)
     * - watched_at: Thời điểm cuối cùng xem tập phim này
     */
    protected $fillable = [
        'user_id',
        'movie_id',
        'episode_id',
        'current_timestamp',
        'watched_at',
    ];

    /**
     * Ép kiểu dữ liệu
     */
    protected $casts = [
        'current_timestamp' => 'integer',
        'watched_at'        => 'datetime',
    ];

    /**
     * Quan hệ với Người dùng
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Quan hệ với Bộ phim
     */
    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class);
    }

    /**
     * Quan hệ với Tập phim
     */
    public function episode(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }
}

