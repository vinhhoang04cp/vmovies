<?php

namespace App\Services;

use App\Models\Comment;
use Illuminate\Pagination\LengthAwarePaginator;

class CommentService
{
    /**
     * List all comments (not hard-deleted) with optional filters.
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Comment::with(['user', 'movie', 'episode'])
            ->where('is_deleted', false);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('content', 'like', "%{$search}%");
        }

        if (isset($filters['is_approved'])) {
            $query->where('is_approved', (bool) $filters['is_approved']);
        }

        if (! empty($filters['movie_id'])) {
            $query->where('movie_id', $filters['movie_id']);
        }

        if (! empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        $sortDir = ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $query->orderBy('created_at', $sortDir);

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->paginate($perPage);
    }

    /**
     * List pending (not yet approved) comments.
     */
    public function listPending(array $filters = []): LengthAwarePaginator
    {
        $filters['is_approved'] = 0;

        return $this->list($filters);
    }

    /**
     * Find comment or throw 404.
     */
    public function findOrFail(int $id): Comment
    {
        return Comment::with(['user', 'movie', 'episode'])->findOrFail($id);
    }

    /**
     * Approve a comment.
     */
    public function approve(Comment $comment): Comment
    {
        $comment->update(['is_approved' => true]);

        return $comment->fresh(['user', 'movie', 'episode']);
    }

    /**
     * Soft-delete a comment (flag is_deleted = true).
     */
    public function delete(Comment $comment): void
    {
        $comment->update(['is_deleted' => true, 'is_approved' => false]);
    }
}
