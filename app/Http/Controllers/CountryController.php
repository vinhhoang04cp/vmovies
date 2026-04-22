<?php

namespace App\Http\Controllers;

use App\Http\Resources\CountryResource;
use App\Services\CountryService;
use App\Traits\HasJsonResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Class CountryController
 * Controller xử lý các yêu cầu liên quan đến Quốc gia (Country) dành cho người dùng (Client).
 */
class CountryController extends Controller
{
    // Sử dụng trait HasJsonResponse để cung cấp các hàm trả về JSON chuẩn hóa (successResponse, errorResponse,...)
    use HasJsonResponse;

    /**
     * Constructor injection.
     * Tiêm (inject) CountryService vào controller để xử lý logic liên quan đến database của quốc gia.
     */
    public function __construct(private CountryService $countryService) {}

    /**
     * Lấy danh sách các quốc gia.
     * Phương thức này xử lý GET request tại endpoint /api/countries.
     * Là endpoint công khai (public) nên không yêu cầu người dùng phải đăng nhập.
     *
     * @param  Request  $request  Đối tượng request chứa các query parameters (vd: page, limit, search...).
     * @return JsonResponse Trả về danh sách quốc gia dạng JSON.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Gọi service để lấy danh sách quốc gia, truyền vào các query tham số từ request (nếu có để phân trang/tìm kiếm)
            $countries = $this->countryService->list($request->query());

            // Trả về JSON thành công:
            // - CountryResource::collection(...): Chuyển đổi collection models sang định dạng dữ liệu API (Resource).
            // - response()->getData(true): Lấy dữ liệu mảng array (bao gồm cả pagination data nếu có).
            return $this->successResponse(
                CountryResource::collection($countries)->response()->getData(true),
                'Danh sách quốc gia.'
            );
        } catch (\Exception $e) {
            // Nếu có lỗi xảy ra, ghi log lỗi (error) để debug
            Log::error('Public list countries error', ['exception' => $e->getMessage()]);

            // Trả về JSON báo lỗi 500 (Internal Server Error)
            return $this->errorResponse('Lỗi khi lấy danh sách quốc gia.', 500);
        }
    }
}
