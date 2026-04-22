<?php

// linh

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model đại diện cho Đạo diễn (Director)
 */
class Director extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Các trường có thể gán giá trị
     * - name: Tên đạo diễn
     * - bio: Tiểu sử / Thông tin sự nghiệp
     * - image_url: Đường dẫn ảnh chân dung
     */
    protected $fillable = ['name', 'bio', 'image_url'];

    /**
     * Quan hệ nhiều-nhiều với Movie
     * Một đạo diễn có thể thực hiện nhiều bộ phim.
     */
    public function movies(): BelongsToMany
    {
        return $this->belongsToMany(Movie::class, 'movie_director');
    }
}
