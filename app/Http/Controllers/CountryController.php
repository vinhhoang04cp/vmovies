<?php

namespace App\Http\Controllers;

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
     * GET /api/countries
     * Danh sách quốc gia công khai (không cần đăng nhập).
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
            Log::error('Public list countries error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy danh sách quốc gia.', 500);
        }
    }
}
