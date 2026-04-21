<?php
// linh
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model đại diện cho thông tin Diễn viên (Actor)
 */
class Actor extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Các trường có thể gán giá trị (Mass Assignable)
     * - name: Tên diễn viên
     * - bio: Tiểu sử / Thông tin chi tiết
     * - image_url: Đường dẫn ảnh đại diện
     */
    protected $fillable = ['name', 'bio', 'image_url'];

    /**
     * Định nghĩa mối quan hệ nhiều-nhiều với Model Movie (Phim)
     * Một diễn viên có thể tham gia nhiều bộ phim.
     * Sử dụng bảng trung gian 'movie_actor' và lấy thêm thông tin 'role_name' (tên vai diễn) từ bảng này.
     */
    public function movies(): BelongsToMany
    {
        return $this->belongsToMany(Movie::class, 'movie_actor')
                    ->withPivot('role_name');
    }
}

