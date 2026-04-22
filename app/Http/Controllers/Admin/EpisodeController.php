<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Episode\BulkStoreEpisodeRequest;
use App\Http\Requests\Episode\StoreEpisodeRequest;
use App\Http\Requests\Episode\UpdateEpisodeRequest;
use App\Http\Resources\EpisodeResource;
use App\Models\Movie;
use App\Services\EpisodeService;
use App\Services\MovieService;
use App\Traits\HasJsonResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EpisodeController extends Controller
{
    use HasJsonResponse;

    public function __construct(
        private EpisodeService $episodeService,
        private MovieService $movieService,
    ) {}

    /**
     * GET /api/admin/movies/{movie}/episodes
     */
    public function index(Request $request, int $movieId): JsonResponse
    {
        try {
            $movie = $this->movieService->findOrFail($movieId);
            $episodes = $this->episodeService->listByMovie($movie, $request->query());

            return $this->successResponse(
                EpisodeResource::collection($episodes)->response()->getData(true),
                'Danh sách tập phim.'
            );
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin list episodes error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi lấy danh sách tập phim.', 500);
        }
    }

    /**
     * POST /api/admin/movies/{movie}/episodes
     */
    public function store(StoreEpisodeRequest $request, int $movieId): JsonResponse
    {
        try {
            $movie = $this->movieService->findOrFail($movieId);
            $data = $request->validated();

            // Pass uploaded file if exists
            if ($request->hasFile('video_file')) {
                $data['video_file'] = $request->file('video_file');
            }

            $episode = $this->episodeService->create($movie, $data);

            return $this->createdResponse(new EpisodeResource($episode), 'Tạo tập phim thành công.');
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Throwable $e) {
            Log::error('Admin store episode error', [
                'exception' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            $message = config('app.debug') ? $e->getMessage() : 'Lỗi khi tạo tập phim.';

            return $this->errorResponse($message, 500);
        }
    }

    /**
     * GET /api/admin/episodes/{episode}
     */
    public function show(int $id): JsonResponse
    {
        try {
            $episode = $this->episodeService->findOrFail($id);

            return $this->successResponse(new EpisodeResource($episode), 'Chi tiết tập phim.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin show episode error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi lấy tập phim.', 500);
        }
    }

    /**
     * PUT /api/admin/episodes/{episode}
     */
    public function update(UpdateEpisodeRequest $request, int $id): JsonResponse
    {
        try {
            $episode = $this->episodeService->findOrFail($id);
            $data = $request->validated();

            // Pass uploaded file if exists
            if ($request->hasFile('video_file')) {
                $data['video_file'] = $request->file('video_file');
            }

            $episode = $this->episodeService->update($episode, $data);

            return $this->successResponse(new EpisodeResource($episode), 'Cập nhật tập phim thành công.');
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Throwable $e) {
            Log::error('Admin update episode error', [
                'exception' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            $message = config('app.debug') ? $e->getMessage() : 'Lỗi khi cập nhật tập phim.';

            return $this->errorResponse($message, 500);
        }
    }

    /**
     * DELETE /api/admin/episodes/{episode}
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $episode = $this->episodeService->findOrFail($id);
            $this->episodeService->delete($episode);

            return $this->successResponse(null, 'Xóa tập phim thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin delete episode error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi xóa tập phim.', 500);
        }
    }

    /**
     * GET /api/admin/episodes/trashed
     * Danh sách tập phim đã bị xóa mềm.
     */
    public function trashed(Request $request): JsonResponse
    {
        try {
            $episodes = $this->episodeService->listTrashed($request->query());

            return $this->successResponse(
                EpisodeResource::collection($episodes)->response()->getData(true),
                'Danh sách tập phim đã xóa.'
            );
        } catch (\Exception $e) {
            Log::error('Admin list trashed episodes error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi lấy danh sách tập phim đã xóa.', 500);
        }
    }

    /**
     * POST /api/admin/episodes/{episode}/restore
     * Khôi phục tập phim đã xóa mềm.
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $episode = $this->episodeService->restore($id);

            return $this->successResponse(new EpisodeResource($episode), 'Khôi phục tập phim thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin restore episode error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi khôi phục tập phim.', 500);
        }
    }

    /**
     * POST /api/admin/episodes/bulk-create
     * Body: { "movie_id": X, "episodes": [...] }
     */
    public function bulkCreate(BulkStoreEpisodeRequest $request): JsonResponse
    {
        try {
            $movieId = $request->input('movie_id');
            $movie = $this->movieService->findOrFail($movieId);
            $episodes = $this->episodeService->bulkCreate($movie, $request->validated()['episodes']);

            return $this->createdResponse(
                EpisodeResource::collection($episodes),
                "Tạo {$episodes->count()} tập phim thành công."
            );
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error('Admin bulk create episodes error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi tạo nhiều tập phim.', 500);
        }
    }

    /**
     * PUT /api/admin/episodes/reorder
     * Body: { "movie_id": X, "episodes": [{"id": Y, "episode_number": Z}, ...] }
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'movie_id' => ['required', 'integer', 'exists:movies,id'],
            'episodes' => ['required', 'array', 'min:1'],
            'episodes.*.id' => ['required', 'integer', 'exists:episodes,id'],
            'episodes.*.episode_number' => ['required', 'integer', 'min:1'],
        ]);

        try {
            $movie = Movie::findOrFail($validated['movie_id']);
            $this->episodeService->reorder($movie, $validated['episodes']);

            return $this->successResponse(null, 'Sắp xếp lại tập phim thành công.');
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error('Admin reorder episodes error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi sắp xếp tập phim.', 500);
        }
    }
}
