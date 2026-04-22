<?php

// duong

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Model đại diện cho Người dùng (User)
 * Xử lý xác thực, phân quyền và các hoạt động cá nhân của người dùng.
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Các trường có thể gán giá trị (Mass Assignable)
     */
    protected $fillable = [
        'name',       // Tên người dùng
        'email',      // Địa chỉ email (duy nhất)
        'password',   // Mật khẩu (đã mã hóa)
        'avatar_url', // Link ảnh đại diện
        'is_admin',   // Đánh dấu quản trị viên (boolean)
        'status',     // Trạng thái tài khoản (active, banned,...)
    ];

    /**
     * Các trường bị ẩn khi chuyển đổi model sang JSON (API)
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Định nghĩa kiểu dữ liệu trả về cho các thuộc tính
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    /**
     * Kiểm tra tài khoản có bị khóa hay không
     */
    public function isBanned(): bool
    {
        return $this->status === 'banned';
    }

    // --- Relationships (Mối quan hệ) ---

    /**
     * Một người dùng có thể viết nhiều bình luận
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Một người dùng có thể gửi nhiều đánh giá
     */
    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    /**
     * Một người dùng có thể lưu nhiều bookmark
     */
    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    /**
     * Một người dùng có lịch sử xem phim
     */
    public function watchHistory(): HasMany
    {
        return $this->hasMany(WatchHistory::class);
    }

    /**
     * Quan hệ Many-to-Many lấy danh sách phim đã lưu
     */
    public function bookmarkedMovies()
    {
        return $this->belongsToMany(Movie::class, 'bookmarks')
            ->withPivot('bookmarked_at')
            ->orderByPivot('bookmarked_at', 'desc');
    }

    // --- RBAC (Phân quyền dựa trên vai trò) ---

    /**
     * Mỗi người dùng thuộc về một vai trò (Role)
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Kiểm tra tên vai trò
     */
    public function hasRole(string $roleName): bool
    {
        return $this->role && $this->role->name === $roleName;
    }

    /**
     * Kiểm tra có thuộc bất kỳ vai trò nào trong danh sách không
     */
    public function hasAnyRole(array $roleNames): bool
    {
        return $this->role && in_array($this->role->name, $roleNames);
    }

    /**
     * Kiểm tra có quyền hạn cụ thể không
     */
    public function hasPermission(string $permissionName): bool
    {
        return $this->role && $this->role->hasPermission($permissionName);
    }

    /**
     * Kiểm tra có ít nhất một trong các quyền hạn không
     */
    public function hasAnyPermission(array $permissionNames): bool
    {
        return $this->role && $this->role->hasAnyPermission($permissionNames);
    }

    /**
     * Kiểm tra có tất cả các quyền hạn được yêu cầu không
     */
    public function hasAllPermissions(array $permissionNames): bool
    {
        return $this->role && $this->role->hasAllPermissions($permissionNames);
    }

    /**
     * Kiểm tra nhanh có phải Admin không
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }
}
