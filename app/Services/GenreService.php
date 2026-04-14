<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Genre;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class GenreService
{
    /**
        * ham list se tra ve danh sach cac the loai, co the loc theo ten va sap xep theo ten, ngay tao hoac so luong phim tham gia
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Genre::withCount('movies');

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
     * Danh sách thể loại đã xóa mềm (admin only).
     */
    public function listTrashed(array $filters = []): LengthAwarePaginator
    {
        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return Genre::onlyTrashed()
            ->withCount('movies')
            ->orderBy('deleted_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Lấy chi tiết một thể loại.
     */
    public function findOrFail(int $id, bool $withTrashed = false): Genre
    {
        $query = Genre::withCount('movies');

        if ($withTrashed) {
            $query->withTrashed();
        }

        $genre = $query->find($id);

        if (!$genre) {
            throw new ApiException('Không tìm thấy thể loại.', Response::HTTP_NOT_FOUND, 'NOT_FOUND');
        }

        return $genre;
    }

    /**
     * Tạo thể loại mới.
     */
    public function create(array $data): Genre
    {
        $slug = $data['slug'] ?? Str::slug($data['name']) . '-' . time();

        $this->checkDuplicateSlug($slug);

        return Genre::create([
            'name'        => $data['name'],
            'slug'        => $slug,
            'description' => $data['description'] ?? null,
            'icon_url'    => $data['icon_url'] ?? null,
        ]);
    }

    /**
     * Cập nhật thể loại.
     */
    public function update(Genre $genre, array $data): Genre
    {
        if (!empty($data['slug']) && $data['slug'] !== $genre->slug) {
            $this->checkDuplicateSlug($data['slug'], $genre->id);
        }

        $genre->update([
            'name'        => $data['name'] ?? $genre->name,
            'slug'        => $data['slug'] ?? $genre->slug,
            'description' => array_key_exists('description', $data) ? $data['description'] : $genre->description,
            'icon_url'    => array_key_exists('icon_url', $data) ? $data['icon_url'] : $genre->icon_url,
        ]);

        return $genre->fresh();
    }

    /**
     * Xóa mềm thể loại.
     */
    public function delete(Genre $genre): void
    {
        $genre->delete();
    }

    /**
     * Khôi phục thể loại đã xóa mềm.
     */
    public function restore(int $id): Genre
    {
        $genre = Genre::onlyTrashed()->find($id);

        if (!$genre) {
            throw new ApiException('Không tìm thấy thể loại đã xóa.', Response::HTTP_NOT_FOUND, 'NOT_FOUND');
        }

        $genre->restore();

        /** @var Genre $genre */
        $genre = $genre->fresh();

        return $genre;
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private function checkDuplicateSlug(string $slug, ?int $excludeId = null): void
    {
        $query = Genre::where('slug', $slug);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            throw new ApiException(
                "Slug '{$slug}' đã tồn tại.",
                Response::HTTP_CONFLICT,
                'SLUG_EXISTS'
            );
        }
    }
}

