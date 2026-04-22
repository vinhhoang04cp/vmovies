<?php

// duong

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Model đại diện cho Vai trò (Role)
 * Phân cấp người dùng (VD: Admin, Member, Editor).
 */
class Role extends Model
{
    use HasFactory;

    /**
     * Các trường có thể gán giá trị
     * - name: Mã vai trò (VD: 'admin')
     * - display_name: Tên hiển thị (VD: 'Quản trị viên')
     * - description: Mô tả vai trò
     */
    protected $fillable = [
        'name',
        'display_name',
        'description',
    ];

    /**
     * Quan hệ nhiều-nhiều với Quyền hạn (Permissions)
     * Một vai trò có thể có nhiều quyền khác nhau.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permissions');
    }

    /**
     * Quan hệ nhiều-nhiều với Người dùng (Users)
     * Một vai trò có thể gán cho nhiều người dùng.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    /**
     * Kiểm tra xem vai trò này có một quyền cụ thể hay không
     */
    public function hasPermission(string $permissionName): bool
    {
        return $this->permissions()->where('name', $permissionName)->exists();
    }

    /**
     * Kiểm tra xem vai trò này có ít nhất một trong các quyền được liệt kê hay không
     */
    public function hasAnyPermission(array $permissionNames): bool
    {
        return $this->permissions()->whereIn('name', $permissionNames)->exists();
    }

    /**
     * Kiểm tra xem vai trò này có đầy đủ tất cả các quyền được liệt kê hay không
     */
    public function hasAllPermissions(array $permissionNames): bool
    {
        return count($permissionNames) === $this->permissions()
            ->whereIn('name', $permissionNames)
            ->count();
    }
}
