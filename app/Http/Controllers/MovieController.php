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

class MovieController extends Controller
{
    use HasJsonResponse;

    public function __construct(
        private MovieService   $movieService,
        private EpisodeService $episodeService,
    ) {}

    /**
     * GET /api/movies
     * Danh sách phim công khai (không cần đăng nhập).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $movies = $this->movieService->list($request->query());
            return $this->successResponse(
                MovieResource::collection($movies)->response()->getData(true),
                'Danh sách phim.'
            );
        } catch (\Exception $e) {
            Log::error('Public list movies error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy danh sách phim.', 500);
        }
    }

    /**
     * GET /api/movies/{movie}
     * Chi tiết phim công khai.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $movie = $this->movieService->findOrFail($id);
            return $this->successResponse(new MovieResource($movie), 'Chi tiết phim.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Public show movie error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy thông tin phim.', 500);
        }
    }

    /**
     * GET /api/movies/{movie}/episodes
     * Danh sách tập phim công khai.
     */
    public function episodes(Request $request, int $movieId): JsonResponse
    {
        try {
            $movie    = $this->movieService->findOrFail($movieId);
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
     * GET /api/movies/{movie}/episodes/{episode}
     * Chi tiết tập phim công khai.
     */
    public function showEpisode(int $movieId, int $episodeId): JsonResponse
    {
        try {
            $this->movieService->findOrFail($movieId);
            $episode = $this->episodeService->findOrFail($episodeId);

            // Đảm bảo tập phim thuộc đúng bộ phim
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

