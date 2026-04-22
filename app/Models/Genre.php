<?php

// linh

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model đại diện cho Thể loại (Genre)
 */
class Genre extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Các trường có thể gán giá trị
     * - name: Tên thể loại (VD: Hành động, Tình cảm)
     * - slug: Đường dẫn thân thiện cho thể loại
     * - description: Mô tả chi tiết về thể loại
     * - icon_url: Đường dẫn ảnh biểu tượng
     */
    protected $fillable = ['name', 'slug', 'description', 'icon_url'];

    /**
     * Quan hệ nhiều-nhiều với Movie
     * Một thể loại có thể áp dụng cho nhiều bộ phim.
     */
    public function movies(): BelongsToMany
    {
        return $this->belongsToMany(Movie::class, 'movie_genre');
    }
}
