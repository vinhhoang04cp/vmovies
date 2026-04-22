<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model đại diện cho thông tin Phim đã lưu (Bookmark)
 * Lưu vết người dùng nào đã lưu phim nào vào danh sách yêu thích.
 */
class Bookmark extends Model
{
    // Bảng này không sử dụng các cột timestamps (created_at, updated_at) mặc định
    public $timestamps = false;

    /**
     * Các trường có thể gán giá trị
     * - user_id: ID người dùng
     * - movie_id: ID bộ phim
     * - bookmarked_at: Thời điểm thực hiện lưu phim
     */
    protected $fillable = [
        'user_id',
        'movie_id',
        'bookmarked_at',
    ];

    /**
     * Ép kiểu dữ liệu (Casting)
     * - bookmarked_at: Chuyển về định dạng Carbon/DateTime của Laravel
     */
    protected $casts = [
        'bookmarked_at' => 'datetime',
    ];

    /**
     * Quan hệ ngược lại với Model User (Người dùng)
     * Mỗi bookmark thuộc về một người dùng duy nhất.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Quan hệ ngược lại với Model Movie (Phim)
     * Mỗi bookmark trỏ tới một bộ phim duy nhất.
     */
    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class);
    }
}
