<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rating extends Model
{
    use HasFactory;

    // cac truong co the duoc gan gia tri khi tao moi Rating
    protected $fillable = [
        'user_id',
        'movie_id',
        'score',
        'review_text',
        'helpful_count',
    ];

    // cast diem danh gia va so luot danh gia huu ich thanh kieu integer
    protected $casts = [
        'score'         => 'integer',
        'helpful_count' => 'integer',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class);
    }
}

