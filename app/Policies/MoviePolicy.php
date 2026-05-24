<?php

namespace App\Policies;

use App\Models\Movie;
use App\Models\User;

class MoviePolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Movie $movie): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('movie.create');
    }

    public function update(User $user, Movie $movie): bool
    {
        return $user->hasPermission('movie.update');
    }

    public function delete(User $user, Movie $movie): bool
    {
        return $user->hasPermission('movie.delete');
    }

    public function restore(User $user, Movie $movie): bool
    {
        return $user->hasPermission('movie.restore');
    }
}
