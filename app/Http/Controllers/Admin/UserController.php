<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use App\Traits\HasJsonResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use HasJsonResponse;

    public function __construct(private readonly UserService $userService) {}

    /**
     * GET /api/admin/users
     * List users with search, status filter, pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $users = $this->userService->list($request->only([
            'search', 'status', 'role', 'sort_by', 'sort_dir', 'per_page',
        ]));

        return $this->successResponse(
            UserResource::collection($users)->response()->getData(true),
            'Lấy danh sách người dùng thành công.'
        );
    }

    /**
     * GET /api/admin/users/{user}
     */
    public function show(int $user): JsonResponse
    {
        try {
            $found = $this->userService->findOrFail($user);
            return $this->successResponse(new UserResource($found), 'Lấy chi tiết người dùng thành công.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Người dùng không tồn tại.');
        }
    }

    /**
     * PUT /api/admin/users/{user}
     */
    public function update(UpdateUserRequest $request, int $user): JsonResponse
    {
        try {
            $found   = $this->userService->findOrFail($user);
            $updated = $this->userService->update($found, $request->validated());
            return $this->successResponse(new UserResource($updated), 'Cập nhật người dùng thành công.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Người dùng không tồn tại.');
        }
    }

    /**
     * DELETE /api/admin/users/{user}
     */
    public function destroy(Request $request, int $user): JsonResponse
    {
        try {
            $found = $this->userService->findOrFail($user);
            $this->userService->delete($found, $request->user());
            return $this->successResponse(null, 'Xóa người dùng thành công.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Người dùng không tồn tại.');
        } catch (\DomainException $e) {
            return $this->errorResponse($e->getMessage(), 403, null, 'FORBIDDEN');
        }
    }

    /**
     * PATCH /api/admin/users/{user}/ban
     */
    public function ban(Request $request, int $user): JsonResponse
    {
        try {
            $found  = $this->userService->findOrFail($user);

            if ($found->isBanned()) {
                return $this->errorResponse('Người dùng đã bị ban rồi.', 409, null, 'ALREADY_BANNED');
            }

            $banned = $this->userService->ban($found, $request->user());
            return $this->successResponse(new UserResource($banned), 'Ban người dùng thành công.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Người dùng không tồn tại.');
        } catch (\DomainException $e) {
            return $this->errorResponse($e->getMessage(), 403, null, 'FORBIDDEN');
        }
    }

    /**
     * PATCH /api/admin/users/{user}/unban
     */
    public function unban(int $user): JsonResponse
    {
        try {
            $found = $this->userService->findOrFail($user);

            if (!$found->isBanned()) {
                return $this->errorResponse('Người dùng chưa bị ban.', 409, null, 'NOT_BANNED');
            }

            $unbanned = $this->userService->unban($found);
            return $this->successResponse(new UserResource($unbanned), 'Unban người dùng thành công.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Người dùng không tồn tại.');
        }
    }
}

