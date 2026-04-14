<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Actor;
use Illuminate\Pagination\LengthAwarePaginator;
use Symfony\Component\HttpFoundation\Response;

class ActorService
{
    /**
     * ham list se tra ve danh sach cac dien vien, co the loc theo ten va sap xep theo ten, ngay tao hoac so luong phim tham gia
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
     * danh sach cac dien vien da bi xoa mem, co the loc theo ten va sap xep theo ten, ngay xoa hoac so luong phim tham gia
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
     * ham findOrFail se tra ve chi tiet dien vien theo id, neu khong tim thay se nem ApiException, co the bao gom cac dien vien da bi xoa mem neu tham so $withTrashed la true
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
     * ham create se tao moi mot dien vien, tra ve doi tuong Actor vua duoc tao
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
     * ham update se cap nhat thong tin cua mot dien vien, tra ve doi tuong Actor sau khi da duoc cap nhat. Neu mot truong khong duoc truyen vao trong $data thi se giu nguyen gia tri cu
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
     * ham delete se xoa mem mot dien vien, neu thanh cong se tra ve null, neu khong tim thay dien vien se nem ApiException
     */
    public function delete(Actor $actor): void
    {
        $actor->delete();
    }

    /**
     * ham restore se phuc hoi mot dien vien da bi xoa mem, neu thanh cong se tra ve doi tuong Actor sau khi da duoc phuc hoi, neu khong tim thay dien vien da bi xoa mem se nem ApiException
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

