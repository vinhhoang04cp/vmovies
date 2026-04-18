<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WatchHistory extends Model
{
    protected $table = 'watch_history';

    // cac truong co the duoc gan gia tri khi tao moi WatchHistory
    protected $fillable = [
        'user_id',
        'movie_id',
        'episode_id',
        'current_timestamp',
        'watched_at',
    ];

    // cast current_timestamp thanh integer va watched_at thanh datetime
    protected $casts = [
        'current_timestamp' => 'integer',
        'watched_at'        => 'datetime',
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

    public function episode(): BelongsTo
    {
        return $this->belongsTo(Episode::class);
    }
}

