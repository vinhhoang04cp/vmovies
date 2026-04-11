<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Director\StoreDirectorRequest;
use App\Http\Requests\Director\UpdateDirectorRequest;
use App\Http\Resources\DirectorResource;
use App\Services\DirectorService;
use App\Traits\HasJsonResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DirectorController extends Controller
{
    use HasJsonResponse;

    public function __construct(private DirectorService $directorService) {}

    /**
     * GET /api/admin/directors
     * Danh sách đạo diễn (pagination + search + sort).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $directors = $this->directorService->list($request->query());
            return $this->successResponse(
                DirectorResource::collection($directors)->response()->getData(true),
                'Danh sách đạo diễn.'
            );
        } catch (\Exception $e) {
            Log::error('Admin list directors error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy danh sách đạo diễn.', 500);
        }
    }

    /**
     * GET /api/admin/directors/trashed
     * Danh sách đạo diễn đã xóa mềm.
     */
    public function trashed(Request $request): JsonResponse
    {
        try {
            $directors = $this->directorService->listTrashed($request->query());
            return $this->successResponse(
                DirectorResource::collection($directors)->response()->getData(true),
                'Danh sách đạo diễn đã xóa.'
            );
        } catch (\Exception $e) {
            Log::error('Admin list trashed directors error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy danh sách đạo diễn đã xóa.', 500);
        }
    }

    /**
     * POST /api/admin/directors
     * Tạo đạo diễn mới.
     */
    public function store(StoreDirectorRequest $request): JsonResponse
    {
        try {
            $director = $this->directorService->create($request->validated());
            return $this->createdResponse(new DirectorResource($director), 'Tạo đạo diễn thành công.');
        } catch (\Exception $e) {
            Log::error('Admin store director error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi tạo đạo diễn.', 500);
        }
    }

    /**
     * GET /api/admin/directors/{id}
     * Chi tiết đạo diễn.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $director = $this->directorService->findOrFail($id, withTrashed: true);
            return $this->successResponse(new DirectorResource($director), 'Chi tiết đạo diễn.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin show director error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy đạo diễn.', 500);
        }
    }

    /**
     * PUT /api/admin/directors/{id}
     * Cập nhật đạo diễn.
     */
    public function update(UpdateDirectorRequest $request, int $id): JsonResponse
    {
        try {
            $director = $this->directorService->findOrFail($id);
            $director = $this->directorService->update($director, $request->validated());
            return $this->successResponse(new DirectorResource($director), 'Cập nhật đạo diễn thành công.');
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error('Admin update director error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi cập nhật đạo diễn.', 500);
        }
    }

    /**
     * DELETE /api/admin/directors/{id}
     * Xóa mềm đạo diễn.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $director = $this->directorService->findOrFail($id);
            $this->directorService->delete($director);
            return $this->successResponse(null, 'Xóa đạo diễn thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin delete director error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi xóa đạo diễn.', 500);
        }
    }

    /**
     * POST /api/admin/directors/{id}/restore
     * Khôi phục đạo diễn đã xóa mềm.
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $director = $this->directorService->restore($id);
            return $this->successResponse(new DirectorResource($director), 'Khôi phục đạo diễn thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin restore director error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi khôi phục đạo diễn.', 500);
        }
    }
}

