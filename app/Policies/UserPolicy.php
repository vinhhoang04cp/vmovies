<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine if target user can be deleted.
     */
    public function delete(User $user, User $targetUser): bool
    {
        if ($user->id === $targetUser->id) {
            return false;
        }

        if ($targetUser->isAdmin()) {
            return false;
        }

        return $user->hasPermission('user.delete');
    }

    /**
     * Determine if target user can be banned.
     */
    public function ban(User $user, User $targetUser): bool
    {
        if ($user->id === $targetUser->id) {
            return false;
        }

        if ($targetUser->isAdmin()) {
            return false;
        }

        return $user->hasPermission('user.ban');
    }
}
