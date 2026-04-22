<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Movie\StoreMovieRequest;
use App\Http\Requests\Movie\UpdateMovieRequest;
use App\Http\Resources\MovieResource;
use App\Models\Actor;
use App\Models\Country;
use App\Models\Director;
use App\Models\Genre;
use App\Models\Movie;
use App\Services\MovieService;
use App\Traits\HasJsonResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MovieController extends Controller
{
    use HasJsonResponse;

    public function __construct(private MovieService $movieService) {}

    /**
     * GET /api/admin/movies
     * Danh sách phim (admin: thấy cả trashed).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $movies = $this->movieService->list($request->query());

            return $this->successResponse(
                MovieResource::collection($movies)->response()->getData(true),
                'Danh sách phim'
            );
        } catch (\Exception $e) {
            Log::error('Admin list movies error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi lấy danh sách phim.', 500);
        }
    }

    /**
     * GET /api/admin/movies/trashed
     * Danh sách phim đã bị xóa mềm.
     */
    public function trashed(Request $request): JsonResponse
    {
        try {
            $movies = $this->movieService->listTrashed($request->query());

            return $this->successResponse(
                MovieResource::collection($movies)->response()->getData(true),
                'Danh sách phim đã xóa'
            );
        } catch (\Exception $e) {
            Log::error('Admin list trashed movies error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi lấy danh sách phim đã xóa.', 500);
        }
    }

    /**
     * POST /api/admin/movies
     * Tạo phim mới.
     */
    public function store(StoreMovieRequest $request): JsonResponse
    {
        try {
            $movie = $this->movieService->create($request->validated());

            return $this->createdResponse(new MovieResource($movie), 'Tạo phim thành công.');
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error('Admin store movie error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi tạo phim.', 500);
        }
    }

    /**
     * GET /api/admin/movies/{movie}
     * Chi tiết phim.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $movie = $this->movieService->findOrFail($id, withTrashed: true);

            return $this->successResponse(new MovieResource($movie), 'Chi tiết phim.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin show movie error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi lấy thông tin phim.', 500);
        }
    }

    /**
     * PUT /api/admin/movies/{movie}
     * Cập nhật phim.
     */
    public function update(UpdateMovieRequest $request, int $id): JsonResponse
    {
        try {
            $movie = $this->movieService->findOrFail($id);
            $movie = $this->movieService->update($movie, $request->validated());

            return $this->successResponse(new MovieResource($movie), 'Cập nhật phim thành công.');
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error('Admin update movie error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi cập nhật phim.', 500);
        }
    }

    /**
     * DELETE /api/admin/movies/{movie}
     * Xóa mềm phim.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $movie = $this->movieService->findOrFail($id);
            $this->movieService->delete($movie);

            return $this->successResponse(null, 'Xóa phim thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin delete movie error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi xóa phim.', 500);
        }
    }

    /**
     * POST /api/admin/movies/{movie}/restore
     * Khôi phục phim đã xóa mềm.
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $movie = $this->movieService->restore($id);

            return $this->successResponse(new MovieResource($movie), 'Khôi phục phim thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin restore movie error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi khôi phục phim.', 500);
        }
    }

    // ─── Pivot: Genres ────────────────────────────────────────────────────────

    /**
     * POST /api/admin/movies/{movie}/genres/{genre}
     */
    public function attachGenre(Request $request, int $movieId, int $genreId): JsonResponse
    {
        try {
            $movie = $this->movieService->findOrFail($movieId);

            if (! Genre::find($genreId)) {
                return $this->notFoundResponse('Không tìm thấy thể loại.');
            }

            $this->movieService->attachGenre($movie, $genreId);

            return $this->successResponse(null, 'Gắn thể loại thành công.');
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error('Admin attach genre error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi gắn thể loại.', 500);
        }
    }

    /**
     * DELETE /api/admin/movies/{movie}/genres/{genre}
     */
    public function detachGenre(int $movieId, int $genreId): JsonResponse
    {
        try {
            $movie = $this->movieService->findOrFail($movieId);
            $this->movieService->detachGenre($movie, $genreId);

            return $this->successResponse(null, 'Gỡ thể loại thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin detach genre error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi gỡ thể loại.', 500);
        }
    }

    // ─── Pivot: Countries ─────────────────────────────────────────────────────

    /**
     * POST /api/admin/movies/{movie}/countries/{country}
     */
    public function attachCountry(Request $request, int $movieId, int $countryId): JsonResponse
    {
        try {
            $movie = $this->movieService->findOrFail($movieId);

            if (! Country::find($countryId)) {
                return $this->notFoundResponse('Không tìm thấy quốc gia.');
            }

            $this->movieService->attachCountry($movie, $countryId);

            return $this->successResponse(null, 'Gắn quốc gia thành công.');
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error('Admin attach country error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi gắn quốc gia.', 500);
        }
    }

    /**
     * DELETE /api/admin/movies/{movie}/countries/{country}
     */
    public function detachCountry(int $movieId, int $countryId): JsonResponse
    {
        try {
            $movie = $this->movieService->findOrFail($movieId);
            $this->movieService->detachCountry($movie, $countryId);

            return $this->successResponse(null, 'Gỡ quốc gia thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin detach country error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi gỡ quốc gia.', 500);
        }
    }

    // ─── Pivot: Directors ─────────────────────────────────────────────────────

    /**
     * POST /api/admin/movies/{movie}/directors/{director}
     */
    public function attachDirector(Request $request, int $movieId, int $directorId): JsonResponse
    {
        try {
            $movie = $this->movieService->findOrFail($movieId);

            if (! Director::find($directorId)) {
                return $this->notFoundResponse('Không tìm thấy đạo diễn.');
            }

            $this->movieService->attachDirector($movie, $directorId);

            return $this->successResponse(null, 'Gắn đạo diễn thành công.');
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error('Admin attach director error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi gắn đạo diễn.', 500);
        }
    }

    /**
     * DELETE /api/admin/movies/{movie}/directors/{director}
     */
    public function detachDirector(int $movieId, int $directorId): JsonResponse
    {
        try {
            $movie = $this->movieService->findOrFail($movieId);
            $this->movieService->detachDirector($movie, $directorId);

            return $this->successResponse(null, 'Gỡ đạo diễn thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin detach director error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi gỡ đạo diễn.', 500);
        }
    }

    // ─── Pivot: Actors ────────────────────────────────────────────────────────

    /**
     * POST /api/admin/movies/{movie}/actors/{actor}
     * Body: { "role_name": "..." } (optional)
     */
    public function attachActor(Request $request, int $movieId, int $actorId): JsonResponse
    {
        try {
            $movie = $this->movieService->findOrFail($movieId);

            if (! Actor::find($actorId)) {
                return $this->notFoundResponse('Không tìm thấy diễn viên.');
            }

            $roleName = $request->input('role_name');
            $this->movieService->attachActor($movie, $actorId, $roleName);

            return $this->successResponse(null, 'Gắn diễn viên thành công.');
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error('Admin attach actor error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi gắn diễn viên.', 500);
        }
    }

    /**
     * DELETE /api/admin/movies/{movie}/actors/{actor}
     */
    public function detachActor(int $movieId, int $actorId): JsonResponse
    {
        try {
            $movie = $this->movieService->findOrFail($movieId);
            $this->movieService->detachActor($movie, $actorId);

            return $this->successResponse(null, 'Gỡ diễn viên thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin detach actor error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi gỡ diễn viên.', 500);
        }
    }
}
