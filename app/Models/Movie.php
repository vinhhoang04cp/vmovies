<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Movie extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Auto-generate slug from title if not provided.
     */
    protected static function booted(): void
    {
        static::creating(function (Movie $movie) {
            if (empty($movie->slug)) {
                $movie->slug = Str::slug($movie->title) . '-' . time();
            }
        });
    }

    protected $fillable = [
        'title',
        'original_title',
        'slug',
        'poster_url',
        'banner_url',
        'trailer_url',
        'summary',
        'release_year',
        'status',
        'type',
        'view_count',
        'average_rating',
    ];

    protected $casts = [
        'release_year'   => 'integer',
        'view_count'     => 'integer',
        'average_rating' => 'float',
    ];

    // Helpers
    public function isSeries(): bool
    {
        return $this->type === 'series';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Tính lại điểm đánh giá trung bình và lưu vào DB
     */
    public function recalculateRating(): void
    {
        $avg = $this->ratings()->avg('score') ?? 0;
        $this->update(['average_rating' => round($avg, 2)]);
    }

    // Relationships
    public function episodes(): HasMany
    {
        return $this->hasMany(Episode::class)->orderBy('episode_number');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->where('is_deleted', false);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class, 'movie_genre');
    }

    public function countries(): BelongsToMany
    {
        return $this->belongsToMany(Country::class, 'movie_country');
    }

    public function directors(): BelongsToMany
    {
        return $this->belongsToMany(Director::class, 'movie_director');
    }

    public function actors(): BelongsToMany
    {
        return $this->belongsToMany(Actor::class, 'movie_actor')
                    ->withPivot('role_name');
    }
}

