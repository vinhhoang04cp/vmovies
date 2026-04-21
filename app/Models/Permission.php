<?php

// duong 
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    use HasFactory;

    // cac truong co the duoc gan gia tri khi tao moi Permission
    protected $fillable = [
        'name',
        'display_name',
        'description',
    ];

    // quan he nhieu-nhieu voi Role
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permissions');
    }
}

