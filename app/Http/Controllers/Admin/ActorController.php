<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Actor\StoreActorRequest;
use App\Http\Requests\Actor\UpdateActorRequest;
use App\Http\Resources\ActorResource;
use App\Services\ActorService;
use App\Traits\HasJsonResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ActorController extends Controller
{
    use HasJsonResponse;

    public function __construct(private ActorService $actorService) {}

    /**
     * GET /api/admin/actors
     * Danh sách diễn viên (pagination + search + sort).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $actors = $this->actorService->list($request->query());

            return $this->successResponse(
                ActorResource::collection($actors)->response()->getData(true),
                'Danh sách diễn viên.'
            );
        } catch (\Exception $e) {
            Log::error('Admin list actors error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi lấy danh sách diễn viên.', 500);
        }
    }

    /**
     * GET /api/admin/actors/trashed
     * Danh sách diễn viên đã xóa mềm.
     */
    public function trashed(Request $request): JsonResponse
    {
        try {
            $actors = $this->actorService->listTrashed($request->query());

            return $this->successResponse(
                ActorResource::collection($actors)->response()->getData(true),
                'Danh sách diễn viên đã xóa.'
            );
        } catch (\Exception $e) {
            Log::error('Admin list trashed actors error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi lấy danh sách diễn viên đã xóa.', 500);
        }
    }

    /**
     * POST /api/admin/actors
     * Tạo diễn viên mới.
     */
    public function store(StoreActorRequest $request): JsonResponse
    {
        try {
            $actor = $this->actorService->create($request->validated());

            return $this->createdResponse(new ActorResource($actor), 'Tạo diễn viên thành công.');
        } catch (\Exception $e) {
            Log::error('Admin store actor error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi tạo diễn viên.', 500);
        }
    }

    /**
     * GET /api/admin/actors/{id}
     * Chi tiết diễn viên.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $actor = $this->actorService->findOrFail($id, withTrashed: true);

            return $this->successResponse(new ActorResource($actor), 'Chi tiết diễn viên.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin show actor error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi lấy diễn viên.', 500);
        }
    }

    /**
     * PUT /api/admin/actors/{id}
     * Cập nhật diễn viên.
     */
    public function update(UpdateActorRequest $request, int $id): JsonResponse
    {
        try {
            $actor = $this->actorService->findOrFail($id);
            $actor = $this->actorService->update($actor, $request->validated());

            return $this->successResponse(new ActorResource($actor), 'Cập nhật diễn viên thành công.');
        } catch (ApiException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error('Admin update actor error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi cập nhật diễn viên.', 500);
        }
    }

    /**
     * DELETE /api/admin/actors/{id}
     * Xóa mềm diễn viên.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $actor = $this->actorService->findOrFail($id);
            $this->actorService->delete($actor);

            return $this->successResponse(null, 'Xóa diễn viên thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin delete actor error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi xóa diễn viên.', 500);
        }
    }

    /**
     * POST /api/admin/actors/{id}/restore
     * Khôi phục diễn viên đã xóa mềm.
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $actor = $this->actorService->restore($id);

            return $this->successResponse(new ActorResource($actor), 'Khôi phục diễn viên thành công.');
        } catch (ApiException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            Log::error('Admin restore actor error', ['exception' => $e->getMessage()]);

            return $this->errorResponse('Lỗi khi khôi phục diễn viên.', 500);
        }
    }
}
