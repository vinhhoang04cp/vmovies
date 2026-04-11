<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Actor;
use Illuminate\Pagination\LengthAwarePaginator;
use Symfony\Component\HttpFoundation\Response;

class ActorService
{
    /**
     * Danh sách diễn viên với pagination + filter.
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Actor::withCount('movies');

        if (!empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        $sortBy  = in_array($filters['sort_by'] ?? '', ['name', 'created_at', 'movies_count'])
            ? $filters['sort_by']
            : 'name';
        $sortDir = ($filters['sort_dir'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->paginate($perPage);
    }

    /**
     * Danh sách diễn viên đã xóa mềm.
     */
    public function listTrashed(array $filters = []): LengthAwarePaginator
    {
        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return Actor::onlyTrashed()
            ->withCount('movies')
            ->orderBy('deleted_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Lấy chi tiết diễn viên.
     */
    public function findOrFail(int $id, bool $withTrashed = false): Actor
    {
        $query = Actor::withCount('movies');

        if ($withTrashed) {
            $query->withTrashed();
        }

        $actor = $query->find($id);

        if (!$actor) {
            throw new ApiException('Không tìm thấy diễn viên.', Response::HTTP_NOT_FOUND, 'NOT_FOUND');
        }

        return $actor;
    }

    /**
     * Tạo diễn viên mới.
     */
    public function create(array $data): Actor
    {
        return Actor::create([
            'name'      => $data['name'],
            'bio'       => $data['bio'] ?? null,
            'image_url' => $data['image_url'] ?? null,
        ]);
    }

    /**
     * Cập nhật diễn viên.
     */
    public function update(Actor $actor, array $data): Actor
    {
        $actor->update([
            'name'      => $data['name'] ?? $actor->name,
            'bio'       => array_key_exists('bio', $data) ? $data['bio'] : $actor->bio,
            'image_url' => array_key_exists('image_url', $data) ? $data['image_url'] : $actor->image_url,
        ]);

        return $actor->fresh();
    }

    /**
     * Xóa mềm diễn viên.
     */
    public function delete(Actor $actor): void
    {
        $actor->delete();
    }

    /**
     * Khôi phục diễn viên đã xóa mềm.
     */
    public function restore(int $id): Actor
    {
        $actor = Actor::onlyTrashed()->find($id);

        if (!$actor) {
            throw new ApiException('Không tìm thấy diễn viên đã xóa.', Response::HTTP_NOT_FOUND, 'NOT_FOUND');
        }

        $actor->restore();

        /** @var Actor $actor */
        $actor = $actor->fresh();

        return $actor;
    }
}

