<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model đại diện cho Đánh giá (Rating)
 * Lưu trữ điểm số và nhận xét của người dùng dành cho bộ phim.
 */
class Rating extends Model
{
    use HasFactory;

    /**
     * Các trường có thể gán giá trị
     * - user_id: ID người dùng đánh giá
     * - movie_id: ID bộ phim
     * - score: Điểm đánh giá (VD: từ 1 đến 10)
     * - review_text: Nội dung nhận xét
     * - helpful_count: Số lượt người khác bấm 'Hữu ích' cho đánh giá này
     */
    protected $fillable = [
        'user_id',
        'movie_id',
        'score',
        'review_text',
        'helpful_count',
    ];

    /**
     * Ép kiểu dữ liệu
     */
    protected $casts = [
        'score'         => 'integer',
        'helpful_count' => 'integer',
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
}

