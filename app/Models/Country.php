<?php

// linh

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model đại diện cho Quốc gia (Country)
 * Thông tin xuất xứ của các bộ phim.
 */
class Country extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Các trường có thể gán giá trị
     * - name: Tên quốc gia (VD: Việt Nam, Mỹ)
     * - code: Mã quốc gia (VD: VN, US)
     * - flag_url: Đường dẫn ảnh quốc kỳ
     */
    protected $fillable = ['name', 'code', 'flag_url'];

    /**
     * Quan hệ nhiều-nhiều với Movie
     * Một quốc gia có thể sản xuất nhiều bộ phim và ngược lại.
     */
    public function movies(): BelongsToMany
    {
        return $this->belongsToMany(Movie::class, 'movie_country');
    }
}
