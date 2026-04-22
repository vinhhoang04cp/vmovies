<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Director;
use Illuminate\Pagination\LengthAwarePaginator;
use Symfony\Component\HttpFoundation\Response;

class DirectorService
{
    /**
     * ham list se tra ve danh sach cac dao dien, co the loc theo ten va sap xep theo ten, ngay tao hoac so
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Director::withCount('movies');

        if (! empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        $sortBy = in_array($filters['sort_by'] ?? '', ['name', 'created_at', 'movies_count'])
            ? $filters['sort_by']
            : 'name';
        $sortDir = ($filters['sort_dir'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->paginate($perPage);
    }

    /**
     *  danh sach cac dao dien da bi xoa mem, co the loc theo ten va sap xep theo ten, ngay xoa hoac so luong phim tham gia
     */
    public function listTrashed(array $filters = []): LengthAwarePaginator
    {
        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return Director::onlyTrashed()
            ->withCount('movies')
            ->orderBy('deleted_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Lấy chi tiết đạo diễn.
     */
    public function findOrFail(int $id, bool $withTrashed = false): Director
    {
        $query = Director::withCount('movies');

        if ($withTrashed) {
            $query->withTrashed();
        }

        $director = $query->find($id);

        if (! $director) {
            throw new ApiException('Không tìm thấy đạo diễn.', Response::HTTP_NOT_FOUND, 'NOT_FOUND');
        }

        return $director;
    }

    /**
     * Tạo đạo diễn mới.
     */
    public function create(array $data): Director
    {
        return Director::create([
            'name' => $data['name'],
            'bio' => $data['bio'] ?? null,
            'image_url' => $data['image_url'] ?? null,
        ]);
    }

    /**
     * Cập nhật đạo diễn.
     */
    public function update(Director $director, array $data): Director
    {
        $director->update([
            'name' => $data['name'] ?? $director->name,
            'bio' => array_key_exists('bio', $data) ? $data['bio'] : $director->bio,
            'image_url' => array_key_exists('image_url', $data) ? $data['image_url'] : $director->image_url,
        ]);

        return $director->fresh();
    }

    /**
     * Xóa mềm đạo diễn.
     */
    public function delete(Director $director): void
    {
        $director->delete();
    }

    /**
     * Khôi phục đạo diễn đã xóa mềm.
     */
    public function restore(int $id): Director
    {
        $director = Director::onlyTrashed()->find($id);

        if (! $director) {
            throw new ApiException('Không tìm thấy đạo diễn đã xóa.', Response::HTTP_NOT_FOUND, 'NOT_FOUND');
        }

        $director->restore();

        /** @var Director $director */
        $director = $director->fresh();

        return $director;
    }
}
