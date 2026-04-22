<?php

namespace App\Http\Controllers;

use App\Exceptions\ApiException;
use App\Http\Resources\EpisodeResource;
use App\Http\Resources\MovieResource;
use App\Services\EpisodeService;
use App\Services\MovieService;
use App\Traits\HasJsonResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Class MovieController
 * Xử lý các nghiệp vụ hiển thị danh sách phim, chi tiết phim và tập phim cho người dùng cuối (Client).
 */
class MovieController extends Controller
{
    // Cung cấp các helper methods (successResponse, errorResponse, notFoundResponse) để chuẩn hóa output API.
    use HasJsonResponse;

    /**
     * Khởi tạo MovieController.
     * Tiêm MovieService và EpisodeService để xử lý các logic phức tạp về phim và tập phim.
     */
    public function __construct(
        private MovieService $movieService,
        private EpisodeService $episodeService,
    ) {}

    /**
     * Lấy danh sách phim hiển thị công khai.
     * Endpoint API: GET /api/movies
     *
     * @param  Request  $request  Đối tượng request (có thể chứa filters, pagination,...).
     * @return JsonResponse Danh sách phim trả về định dạng chuẩn.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Lấy danh sách phim từ logic trong service, đưa vào các param search/filter từ request
            $movies = $this->movieService->list($request->query());

            // Resource biến đổi model Eloquent thành array để encode JSON
            return $this->successResponse(
                MovieResource::collection($movies)->response()->getData(true),
                'Danh sách phim.'
            );
        } catch (\Exception $e) {
            // Bắt và log lại ngoại lệ chưa xử lý
            Log::error('Public list movies error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi lấy danh sách phim.', 500);
        }
    }

    /**
     * Lấy chi tiết thông tin của 1 bộ phim cụ thể.
     * Endpoint API: GET /api/movies/{movie}
     *
     * @param  int  $id  ID của bộ phim cần lấy thông tin.
     * @return JsonResponse Chi tiết phim được bọc trong class MovieResource.
     */
    public function show(int $id): JsonResponse
    {
        try {
            // Gọi service tìm phim theo id. Nếu không tìm thấy, service có thể throw ApiException
            $movie = $this->movieService->findOrFail($id);

            return $this->successResponse(new MovieResource($movie), 'Chi tiết phim.');
        } catch (ApiException $e) {
            // Custom Exception cho API (Ví dụ không tìm thấy phim) -> trả về lỗi HTTP 404
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Public show movie error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi lấy thông tin phim.', 500);
        }
    }

    /**
     * Lấy danh sách các tập phim của một bộ phim cụ thể.
     * Endpoint API: GET /api/movies/{movie}/episodes
     *
     * @param  Request  $request  Request params.
     * @param  int  $movieId  ID của bộ phim.
     * @return JsonResponse Danh sách các tập phim.
     */
    public function episodes(Request $request, int $movieId): JsonResponse
    {
        try {
            // Đầu tiên xác thực phim có tồn tại hay không
            $movie = $this->movieService->findOrFail($movieId);
            // Sau đó truyền model phim vào EpisodeService để lấy list các tập của phim này
            $episodes = $this->episodeService->listByMovie($movie, $request->query());

            return $this->successResponse(
                EpisodeResource::collection($episodes)->response()->getData(true),
                'Danh sách tập phim.'
            );
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Public list episodes error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi lấy danh sách tập phim.', 500);
        }
    }

    /**
     * Xem thông tin chi tiết một tập phim cụ thể.
     * Endpoint API: GET /api/movies/{movie}/episodes/{episode}
     *
     * @param  int  $movieId  ID của phim.
     * @param  int  $episodeId  ID của tập phim.
     * @return JsonResponse Chi tiết tập phim.
     */
    public function showEpisode(int $movieId, int $episodeId): JsonResponse
    {
        try {
            // Xác thực bộ phim tồn tại
            $this->movieService->findOrFail($movieId);
            // Lấy thông tin tập phim
            $episode = $this->episodeService->findOrFail($episodeId);

            // Kiểm tra bảo mật & toàn vẹn dữ liệu:
            // Đảm bảo tập phim ($episodeId) thực sự thuộc về bộ phim ($movieId).
            if ($episode->movie_id !== $movieId) {
                return $this->notFoundResponse('Tập phim không thuộc bộ phim này.');
            }

            return $this->successResponse(new EpisodeResource($episode), 'Chi tiết tập phim.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Public show episode error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi lấy tập phim.', 500);
        }
    }
}
