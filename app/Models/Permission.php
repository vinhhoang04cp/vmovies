<?php
// duong
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Model đại diện cho Quyền hạn (Permission)
 * Định nghĩa các thao tác cụ thể mà một vai trò có thể thực hiện (VD: 'edit-movie', 'delete-user').
 */
class Permission extends Model
{
    use HasFactory;

    /**
     * Các trường có thể gán giá trị
     * - name: Mã quyền (VD: 'create_movie')
     * - display_name: Tên hiển thị (VD: 'Thêm phim mới')
     * - description: Mô tả chi tiết quyền hạn này làm gì
     */
    protected $fillable = [
        'name',
        'display_name',
        'description',
    ];

    /**
     * Quan hệ nhiều-nhiều với Vai trò (Role)
     * Một quyền có thể thuộc về nhiều vai trò khác nhau.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permissions');
    }
}

