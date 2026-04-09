<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Country extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'flag_url'];

    public function movies(): BelongsToMany
    {
        return $this->belongsToMany(Movie::class, 'movie_country');
    }
}

