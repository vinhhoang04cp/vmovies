<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Country;
use Illuminate\Pagination\LengthAwarePaginator;
use Symfony\Component\HttpFoundation\Response;

class CountryService
{
    /**
     * ham list se tra ve danh sach cac quoc gia, co the loc theo ten va ma quoc gia, sap xep theo ten, ma quoc gia, ngay tao hoac so luong phim tham gia
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Country::withCount('movies');

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('code', 'like', "%{$filters['search']}%");
            });
        }

        $sortBy = in_array($filters['sort_by'] ?? '', ['name', 'code', 'created_at', 'movies_count'])
            ? $filters['sort_by']
            : 'name';
        $sortDir = ($filters['sort_dir'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->paginate($perPage);
    }

    /**
     * danh sach cac quoc gia da bi xoa mem, co the loc theo ten va ma quoc gia, sap xep theo ten, ma quoc gia, ngay xoa hoac so luong phim tham gia
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
     * ham findOrFail se tra ve chi tiet quoc gia theo id, neu khong tim thay se nem ApiException, co the bao gom cac quoc gia da bi xoa mem neu tham so $withTrashed la true
     */
    public function findOrFail(int $id, bool $withTrashed = false): Country
    {
        $query = Country::withCount('movies');

        if ($withTrashed) {
            $query->withTrashed();
        }

        $country = $query->find($id);

        if (! $country) {
            throw new ApiException('Không tìm thấy quốc gia.', Response::HTTP_NOT_FOUND, 'NOT_FOUND');
        }

        return $country;
    }

    /**
     * ham create se tao moi mot quoc gia, tra ve doi tuong Country vua duoc tao
     */
    public function create(array $data): Country
    {
        $this->checkDuplicateCode($data['code']);

        return Country::create([
            'name' => $data['name'],
            'code' => strtoupper($data['code']),
            'flag_url' => $data['flag_url'] ?? null,
        ]);
    }

    /**
     * ham update se cap nhat thong tin cua mot quoc gia, tra ve doi tuong Country sau khi da duoc cap nhat. Neu mot truong khong duoc truyen vao trong $data thi se giu nguyen gia tri cu
     */
    public function update(Country $country, array $data): Country
    {
        if (! empty($data['code']) && strtoupper($data['code']) !== $country->code) {
            $this->checkDuplicateCode($data['code'], $country->id);
        }

        $country->update([
            'name' => $data['name'] ?? $country->name,
            'code' => isset($data['code']) ? strtoupper($data['code']) : $country->code,
            'flag_url' => array_key_exists('flag_url', $data) ? $data['flag_url'] : $country->flag_url,
        ]);

        return $country->fresh();
    }

    /**
     * ham delete se xoa mem mot quoc gia, neu thanh cong se tra ve null, neu khong tim thay quoc gia se nem ApiException
     */
    public function delete(Country $country): void
    {
        $country->delete();
    }

    /**
     * ham restore se phuc hoi mot quoc gia da bi xoa mem, neu thanh cong se tra ve doi tuong Country sau khi da duoc phuc hoi, neu khong tim thay quoc gia da bi xoa mem se nem ApiException
     */
    public function restore(int $id): Country
    {
        $country = Country::onlyTrashed()->find($id);

        if (! $country) {
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
        // Kiểm tra xem đã có quốc gia nào khác sử dụng mã code này chưa (bỏ qua chính nó khi cập nhật)
        $query = Country::where('code', strtoupper($code));

        // Nếu đang cập nhật, bỏ qua bản ghi hiện tại
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
