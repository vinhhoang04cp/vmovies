<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Genre\StoreGenreRequest;
use App\Http\Requests\Genre\UpdateGenreRequest;
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
     * GET /api/admin/genres
     * Danh sách thể loại (có pagination, filter, sort).
     * ?search=action&sort_by=name&sort_dir=asc&per_page=15
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
            Log::error('Admin list genres error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy danh sách thể loại.', 500);
        }
    }

    /**
     * GET /api/admin/genres/trashed
     * Danh sách thể loại đã xóa mềm.
     */
    public function trashed(Request $request): JsonResponse
    {
        try {
            $genres = $this->genreService->listTrashed($request->query());
            return $this->successResponse(
                GenreResource::collection($genres)->response()->getData(true),
                'Danh sách thể loại đã xóa.'
            );
        } catch (\Exception $e) {
            Log::error('Admin list trashed genres error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy danh sách thể loại đã xóa.', 500);
        }
    }

    /**
     * POST /api/admin/genres
     * Tạo thể loại mới.
     */
    public function store(StoreGenreRequest $request): JsonResponse
    {
        try {
            $genre = $this->genreService->create($request->validated());
            return $this->createdResponse(new GenreResource($genre), 'Tạo thể loại thành công.');
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error('Admin store genre error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi tạo thể loại.', 500);
        }
    }

    /**
     * GET /api/admin/genres/{id}
     * Chi tiết thể loại (bao gồm đã xóa mềm).
     */
    public function show(int $id): JsonResponse
    {
        try {
            $genre = $this->genreService->findOrFail($id, withTrashed: true);
            return $this->successResponse(new GenreResource($genre), 'Chi tiết thể loại.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin show genre error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy thể loại.', 500);
        }
    }

    /**
     * PUT /api/admin/genres/{id}
     * Cập nhật thể loại.
     */
    public function update(UpdateGenreRequest $request, int $id): JsonResponse
    {
        try {
            $genre = $this->genreService->findOrFail($id);
            $genre = $this->genreService->update($genre, $request->validated());
            return $this->successResponse(new GenreResource($genre), 'Cập nhật thể loại thành công.');
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error('Admin update genre error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi cập nhật thể loại.', 500);
        }
    }

    /**
     * DELETE /api/admin/genres/{id}
     * Xóa mềm thể loại.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $genre = $this->genreService->findOrFail($id);
            $this->genreService->delete($genre);
            return $this->successResponse(null, 'Xóa thể loại thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin delete genre error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi xóa thể loại.', 500);
        }
    }

    /**
     * POST /api/admin/genres/{id}/restore
     * Khôi phục thể loại đã xóa mềm.
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $genre = $this->genreService->restore($id);
            return $this->successResponse(new GenreResource($genre), 'Khôi phục thể loại thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin restore genre error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi khôi phục thể loại.', 500);
        }
    }
}

