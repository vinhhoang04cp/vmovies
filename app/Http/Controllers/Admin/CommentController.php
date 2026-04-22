<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Services\CommentService;
use App\Traits\HasJsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    use HasJsonResponse;

    public function __construct(private readonly CommentService $commentService) {}

    /**
     * GET /api/admin/comments
     * List all non-deleted comments with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $comments = $this->commentService->list($request->only([
            'search', 'is_approved', 'movie_id', 'user_id', 'sort_dir', 'per_page',
        ]));

        return $this->successResponse(
            CommentResource::collection($comments)->response()->getData(true),
            'Lấy danh sách bình luận thành công.'
        );
    }

    /**
     * GET /api/admin/comments/pending
     * List comments pending approval.
     */
    public function pending(Request $request): JsonResponse
    {
        $comments = $this->commentService->listPending($request->only([
            'search', 'movie_id', 'user_id', 'sort_dir', 'per_page',
        ]));

        return $this->successResponse(
            CommentResource::collection($comments)->response()->getData(true),
            'Lấy danh sách bình luận chờ duyệt thành công.'
        );
    }

    /**
     * GET /api/admin/comments/{comment}
     */
    public function show(int $comment): JsonResponse
    {
        try {
            $found = $this->commentService->findOrFail($comment);

            return $this->successResponse(new CommentResource($found), 'Lấy chi tiết bình luận thành công.');
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Bình luận không tồn tại.');
        }
    }

    /**
     * PATCH /api/admin/comments/{comment}/approve
     */
    public function approve(int $comment): JsonResponse
    {
        try {
            $found = $this->commentService->findOrFail($comment);

            if ($found->is_deleted) {
                return $this->errorResponse('Không thể duyệt bình luận đã bị xóa.', 409, null, 'COMMENT_DELETED');
            }

            if ($found->is_approved) {
                return $this->errorResponse('Bình luận đã được duyệt rồi.', 409, null, 'ALREADY_APPROVED');
            }

            $approved = $this->commentService->approve($found);

            return $this->successResponse(new CommentResource($approved), 'Duyệt bình luận thành công.');
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Bình luận không tồn tại.');
        }
    }

    /**
     * DELETE /api/admin/comments/{comment}
     */
    public function destroy(int $comment): JsonResponse
    {
        try {
            $found = $this->commentService->findOrFail($comment);

            if ($found->is_deleted) {
                return $this->errorResponse('Bình luận đã bị xóa rồi.', 409, null, 'ALREADY_DELETED');
            }

            $this->commentService->delete($found);

            return $this->successResponse(null, 'Xóa bình luận thành công.');
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Bình luận không tồn tại.');
        }
    }
}
