<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Country;
use Illuminate\Pagination\LengthAwarePaginator;
use Symfony\Component\HttpFoundation\Response;

class CountryService
{
    /**
     * Danh sách quốc gia với pagination + filter.
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Country::withCount('movies');

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('code', 'like', "%{$filters['search']}%");
            });
        }

        $sortBy  = in_array($filters['sort_by'] ?? '', ['name', 'code', 'created_at', 'movies_count'])
            ? $filters['sort_by']
            : 'name';
        $sortDir = ($filters['sort_dir'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->paginate($perPage);
    }

    /**
     * Danh sách quốc gia đã xóa mềm (admin only).
     */
    public function listTrashed(array $filters = []): LengthAwarePaginator
    {
        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return Country::onlyTrashed()
            ->withCount('movies')
            ->orderBy('deleted_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Lấy chi tiết một quốc gia.
     */
    public function findOrFail(int $id, bool $withTrashed = false): Country
    {
        $query = Country::withCount('movies');

        if ($withTrashed) {
            $query->withTrashed();
        }

        $country = $query->find($id);

        if (!$country) {
            throw new ApiException('Không tìm thấy quốc gia.', Response::HTTP_NOT_FOUND, 'NOT_FOUND');
        }

        return $country;
    }

    /**
     * Tạo quốc gia mới.
     */
    public function create(array $data): Country
    {
        $this->checkDuplicateCode($data['code']);

        return Country::create([
            'name'     => $data['name'],
            'code'     => strtoupper($data['code']),
            'flag_url' => $data['flag_url'] ?? null,
        ]);
    }

    /**
     * Cập nhật quốc gia.
     */
    public function update(Country $country, array $data): Country
    {
        if (!empty($data['code']) && strtoupper($data['code']) !== $country->code) {
            $this->checkDuplicateCode($data['code'], $country->id);
        }

        $country->update([
            'name'     => $data['name'] ?? $country->name,
            'code'     => isset($data['code']) ? strtoupper($data['code']) : $country->code,
            'flag_url' => array_key_exists('flag_url', $data) ? $data['flag_url'] : $country->flag_url,
        ]);

        return $country->fresh();
    }

    /**
     * Xóa mềm quốc gia.
     */
    public function delete(Country $country): void
    {
        $country->delete();
    }

    /**
     * Khôi phục quốc gia đã xóa mềm.
     */
    public function restore(int $id): Country
    {
        $country = Country::onlyTrashed()->find($id);

        if (!$country) {
            throw new ApiException('Không tìm thấy quốc gia đã xóa.', Response::HTTP_NOT_FOUND, 'NOT_FOUND');
        }

        $country->restore();

        /** @var Country $country */
        $country = $country->fresh();

        return $country;
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private function checkDuplicateCode(string $code, ?int $excludeId = null): void
    {
        $query = Country::where('code', strtoupper($code));

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        if ($query->exists()) {
            throw new ApiException(
                "Mã quốc gia '{$code}' đã tồn tại.",
                Response::HTTP_CONFLICT,
                'CODE_EXISTS'
            );
        }
    }
}

