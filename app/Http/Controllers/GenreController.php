<?php

namespace App\Http\Controllers;

use App\Http\Resources\GenreResource;
use App\Services\GenreService;
use App\Traits\HasJsonResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GenreController extends Controller
{
    use HasJsonResponse;

    public function __construct(private GenreService $genreService) {}

    /**
     * GET /api/genres
     * Danh sách thể loại công khai (không cần đăng nhập).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $genres = $this->genreService->list($request->query());
            return $this->successResponse(
                GenreResource::collection($genres)->response()->getData(true),
                'Danh sách thể loại.'
            );
        } catch (\Exception $e) {
            Log::error('Public list genres error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy danh sách thể loại.', 500);
        }
    }
}
