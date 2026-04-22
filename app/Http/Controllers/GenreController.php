<?php

namespace App\Http\Controllers;

use App\Http\Resources\GenreResource;
use App\Services\GenreService;
use App\Traits\HasJsonResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Class GenreController
 * Controller xử lý các yêu cầu liên quan đến Thể loại phim (Genre) dành cho Client.
 */
class GenreController extends Controller
{
    // Sử dụng trait HasJsonResponse để có các hàm trả về chuẩn định dạng JSON
    use HasJsonResponse;

    /**
     * Khởi tạo controller với dependency injection cho GenreService.
     * Mọi logic thao tác dữ liệu thể loại đều thông qua GenreService.
     */
    public function __construct(private GenreService $genreService) {}

    /**
     * Lấy danh sách các thể loại phim.
     * Endpoint API: GET /api/genres
     * Đây là API công khai, không yêu cầu xác thực.
     *
     * @param  Request  $request  Đối tượng request có thể chứa tham số để filter/paginate.
     * @return JsonResponse Danh sách thể loại phim.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Lấy danh sách thể loại từ service dựa vào query string truyền từ request
            $genres = $this->genreService->list($request->query());

            // Format dữ liệu bằng GenreResource và trả về JSON thành công
            return $this->successResponse(
                GenreResource::collection($genres)->response()->getData(true),
                'Danh sách thể loại.'
            );
        } catch (\Exception $e) {
            // Log lại exception nếu có lỗi để phục vụ quá trình debug
            Log::error('Public list genres error', ['exception' => $e->getMessage()]);

            // Trả về response lỗi HTTP 500
            return $this->errorResponse('Lỗi khi lấy danh sách thể loại.', 500);
        }
    }
}
