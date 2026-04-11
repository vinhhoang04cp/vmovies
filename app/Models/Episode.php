<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Episode extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'movie_id',
        'episode_number',
        'arc_name',
        'title',
        'video_url',
        'duration',
        'views',
    ];

    protected $casts = [
        'episode_number' => 'integer',
        'duration'       => 'integer',
        'views'          => 'integer',
    ];

    /**
     * Trả về thời lượng dạng H:i:s
     */
    public function getDurationFormattedAttribute(): string
    {
        return gmdate('H:i:s', $this->duration);
    }

    // Relationships
    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->where('is_deleted', false);
    }

    public function watchHistories(): HasMany
    {
        return $this->hasMany(WatchHistory::class);
    }
}

