<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;

class CommentPolicy
{
    /**
     * Determine if a comment can be deleted.
     * Allowed: Owner of the comment OR user with comment.delete permission (admin/moderator).
     */
    public function delete(User $user, Comment $comment): bool
    {
        if ($user->id === $comment->user_id) {
            return true;
        }

        return $user->hasPermission('comment.delete');
    }

    /**
     * Determine if a comment can be approved.
     */
    public function approve(User $user, Comment $comment): bool
    {
        return $user->hasPermission('comment.approve');
    }
}
