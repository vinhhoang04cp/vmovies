<?php

// duong

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model đại diện cho Bình luận (Comment)
 * Người dùng có thể để lại bình luận cho một bộ phim hoặc một tập phim cụ thể.
 */
class Comment extends Model
{
    use HasFactory;

    /**
     * Các trường có thể gán giá trị
     * - user_id: ID người dùng viết bình luận
     * - movie_id: ID bộ phim được bình luận
     * - episode_id: ID tập phim (có thể null nếu bình luận chung cho cả phim)
     * - content: Nội dung bình luận
     * - is_approved: Trạng thái đã kiểm duyệt hay chưa
     * - is_deleted: Trạng thái đã bị xóa (ẩn đi) hay chưa
     */
    protected $fillable = [
        'user_id',
        'movie_id',
        'episode_id',
        'content',
        'is_approved',
        'is_deleted',
    ];

    /**
     * Ép kiểu dữ liệu (Casting)
     * Chuyển các trường trạng thái sang kiểu boolean (đúng/sai)
     */
    protected $casts = [
        'is_approved' => 'boolean',
        'is_deleted' => 'boolean',
    ];

    /**
     * Quan hệ với Người dùng (User)
     * Mỗi bình luận thuộc về một người dùng.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Quan hệ với Bộ phim (Movie)
     * Mỗi bình luận nằm trong trang thông tin của một bộ phim.
     */
    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class);
    }

    /**
     * Quan hệ với Tập phim (Episode)
     * Bình luận có thể gắn trực tiếp vào một tập phim cụ thể.
     */
    public function episode(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }
}
