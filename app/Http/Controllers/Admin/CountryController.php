<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Country\StoreCountryRequest;
use App\Http\Requests\Country\UpdateCountryRequest;
use App\Http\Resources\CountryResource;
use App\Services\CountryService;
use App\Traits\HasJsonResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CountryController extends Controller
{
    use HasJsonResponse;

    public function __construct(private CountryService $countryService) {}

    /**
     * GET /api/admin/countries
     * Danh sách quốc gia (có pagination, filter, sort).
     * ?search=japan&sort_by=name&sort_dir=asc&per_page=15
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $countries = $this->countryService->list($request->query());
            return $this->successResponse(
                CountryResource::collection($countries)->response()->getData(true),
                'Danh sách quốc gia.'
            );
        } catch (\Exception $e) {
            Log::error('Admin list countries error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy danh sách quốc gia.', 500);
        }
    }

    /**
     * GET /api/admin/countries/trashed
     * Danh sách quốc gia đã xóa mềm.
     */
    public function trashed(Request $request): JsonResponse
    {
        try {
            $countries = $this->countryService->listTrashed($request->query());
            return $this->successResponse(
                CountryResource::collection($countries)->response()->getData(true),
                'Danh sách quốc gia đã xóa.'
            );
        } catch (\Exception $e) {
            Log::error('Admin list trashed countries error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy danh sách quốc gia đã xóa.', 500);
        }
    }

    /**
     * POST /api/admin/countries
     * Tạo quốc gia mới.
     */
    public function store(StoreCountryRequest $request): JsonResponse
    {
        try {
            $country = $this->countryService->create($request->validated());
            return $this->createdResponse(new CountryResource($country), 'Tạo quốc gia thành công.');
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error('Admin store country error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi tạo quốc gia.', 500);
        }
    }

    /**
     * GET /api/admin/countries/{id}
     * Chi tiết quốc gia (bao gồm đã xóa mềm).
     */
    public function show(int $id): JsonResponse
    {
        try {
            $country = $this->countryService->findOrFail($id, withTrashed: true);
            return $this->successResponse(new CountryResource($country), 'Chi tiết quốc gia.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin show country error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy quốc gia.', 500);
        }
    }

    /**
     * PUT /api/admin/countries/{id}
     * Cập nhật quốc gia.
     */
    public function update(UpdateCountryRequest $request, int $id): JsonResponse
    {
        try {
            $country = $this->countryService->findOrFail($id);
            $country = $this->countryService->update($country, $request->validated());
            return $this->successResponse(new CountryResource($country), 'Cập nhật quốc gia thành công.');
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error('Admin update country error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi cập nhật quốc gia.', 500);
        }
    }

    /**
     * DELETE /api/admin/countries/{id}
     * Xóa mềm quốc gia.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $country = $this->countryService->findOrFail($id);
            $this->countryService->delete($country);
            return $this->successResponse(null, 'Xóa quốc gia thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin delete country error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi xóa quốc gia.', 500);
        }
    }

    /**
     * POST /api/admin/countries/{id}/restore
     * Khôi phục quốc gia đã xóa mềm.
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $country = $this->countryService->restore($id);
            return $this->successResponse(new CountryResource($country), 'Khôi phục quốc gia thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin restore country error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi khôi phục quốc gia.', 500);
        }
    }
}

