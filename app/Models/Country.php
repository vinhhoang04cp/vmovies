<?php

// linh 
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Country extends Model
{
    
    use HasFactory, SoftDeletes;
    
    // cac truong co the duoc gan gia tri khi tao moi hoac cap nhat
    protected $fillable = ['name', 'code', 'flag_url'];

    public function movies(): BelongsToMany
    {
        return $this->belongsToMany(Movie::class, 'movie_country');
    }
}

