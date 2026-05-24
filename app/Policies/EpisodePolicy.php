<?php

namespace App\Policies;

use App\Models\Episode;
use App\Models\User;

class EpisodePolicy
{
    public function create(User $user): bool
    {
        return $user->hasPermission('episode.create');
    }

    public function update(User $user, Episode $episode): bool
    {
        return $user->hasPermission('episode.update');
    }

    public function delete(User $user, Episode $episode): bool
    {
        return $user->hasPermission('episode.delete');
    }
}
