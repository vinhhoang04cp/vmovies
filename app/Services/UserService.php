<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService
{
    /**
     * List users with optional filters + pagination.
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = User::with('role')->withCount('comments');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['role'])) {
            $query->whereHas('role', fn ($q) => $q->where('name', $filters['role']));
        }

        $sortBy = in_array($filters['sort_by'] ?? '', ['name', 'email', 'created_at', 'status'])
                   ? $filters['sort_by'] : 'created_at';
        $sortDir = ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->paginate($perPage);
    }

    /**
     * Find a user or throw 404.
     */
    public function findOrFail(int $id): User
    {
        return User::with('role')->withCount('comments')->findOrFail($id);
    }

    /**
     * Update user profile fields (name, email, avatar_url, status).
     */
    public function update(User $user, array $data): User
    {
        $user->update($data);

        return $user->fresh(['role']);
    }

    /**
     * Delete a user account.
     * Guard: cannot delete yourself; cannot delete other admins.
     */
    public function delete(User $user, User $actor): void
    {
        if ($user->id === $actor->id) {
            throw new \DomainException('Không thể xóa chính tài khoản của bạn.');
        }
        if ($user->isAdmin()) {
            throw new \DomainException('Không thể xóa tài khoản admin khác.');
        }

        // Revoke all tokens before deleting
        $user->tokens()->delete();
        $user->delete();
    }

    /**
     * Ban a user.
     */
    public function ban(User $user, User $actor): User
    {
        if ($user->id === $actor->id) {
            throw new \DomainException('Không thể ban chính tài khoản của bạn.');
        }
        if ($user->isAdmin()) {
            throw new \DomainException('Không thể ban tài khoản admin.');
        }

        $user->update(['status' => 'banned']);
        // Revoke all active tokens
        $user->tokens()->delete();

        return $user->fresh();
    }

    /**
     * Unban a user.
     */
    public function unban(User $user): User
    {
        $user->update(['status' => 'active']);

        return $user->fresh();
    }
}
