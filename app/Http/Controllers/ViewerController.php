<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use App\Models\Comment;
use App\Models\Rating;
use App\Models\Movie;
use App\Traits\HasJsonResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * ViewerController - Xử lý các tương tác của người xem (viewer) đã đăng nhập.
 * Bao gồm: Bookmark, Comment, Rating.
 */
class ViewerController extends Controller
{
    use HasJsonResponse;

    // ══════════════════════════════════════════════
    //  BOOKMARK
    // ══════════════════════════════════════════════

    /** Lấy danh sách bookmark của user */
    public function getBookmarks(Request $request): JsonResponse
    {
        try {
            $bookmarks = Bookmark::where('user_id', $request->user()->id)
                ->with('movie')
                ->orderBy('bookmarked_at', 'desc')
                ->paginate($request->query('per_page', 20));

            return $this->successResponse($bookmarks, 'Danh sách phim yêu thích.');
        } catch (\Exception $e) {
            Log::error('Get bookmarks error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy danh sách bookmark.', 500);
        }
    }

    /** Thêm phim vào bookmark */
    public function addBookmark(Request $request): JsonResponse
    {
        try {
            $request->validate(['movie_id' => 'required|exists:movies,id']);

            $existing = Bookmark::where('user_id', $request->user()->id)
                ->where('movie_id', $request->movie_id)
                ->first();

            if ($existing) {
                return $this->successResponse($existing, 'Phim đã có trong danh sách yêu thích.');
            }

            $bookmark = Bookmark::create([
                'user_id' => $request->user()->id,
                'movie_id' => $request->movie_id,
                'bookmarked_at' => now(),
            ]);

            return $this->createdResponse($bookmark, 'Đã thêm vào danh sách yêu thích.');
        } catch (\Exception $e) {
            Log::error('Add bookmark error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi thêm bookmark.', 500);
        }
    }

    /** Xóa phim khỏi bookmark */
    public function removeBookmark(Request $request, int $movieId): JsonResponse
    {
        try {
            $deleted = Bookmark::where('user_id', $request->user()->id)
                ->where('movie_id', $movieId)
                ->delete();

            if ($deleted) {
                return $this->successResponse(null, 'Đã xóa khỏi danh sách yêu thích.');
            }

            return $this->notFoundResponse('Không tìm thấy bookmark.');
        } catch (\Exception $e) {
            Log::error('Remove bookmark error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi xóa bookmark.', 500);
        }
    }

    /** Kiểm tra phim đã bookmark chưa */
    public function checkBookmark(Request $request, int $movieId): JsonResponse
    {
        $bookmarked = Bookmark::where('user_id', $request->user()->id)
            ->where('movie_id', $movieId)
            ->exists();

        return $this->successResponse(['bookmarked' => $bookmarked]);
    }

    // ══════════════════════════════════════════════
    //  COMMENT
    // ══════════════════════════════════════════════

    /** Lấy danh sách bình luận cho phim (public - không cần auth) */
    public function getMovieComments(Request $request, int $movieId): JsonResponse
    {
        try {
            $query = Comment::where('movie_id', $movieId)
                ->where('is_approved', true)
                ->where('is_deleted', false)
                ->with('user:id,name,role')
                ->orderBy('created_at', 'desc');

            if ($request->query('episode_id')) {
                $query->where('episode_id', $request->query('episode_id'));
            }

            $comments = $query->paginate($request->query('per_page', 10));

            return $this->successResponse($comments, 'Danh sách bình luận.');
        } catch (\Exception $e) {
            Log::error('Get comments error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi tải bình luận.', 500);
        }
    }

    /** Gửi bình luận */
    public function postComment(Request $request, int $movieId): JsonResponse
    {
        try {
            $request->validate([
                'content' => 'required|string|max:1000',
                'episode_id' => 'nullable|exists:episodes,id',
            ]);

            $comment = Comment::create([
                'user_id' => $request->user()->id,
                'movie_id' => $movieId,
                'episode_id' => $request->episode_id,
                'content' => $request->content,
                'is_approved' => true, // Tự động duyệt (có thể thay đổi logic sau)
                'is_deleted' => false,
            ]);

            $comment->load('user:id,name,role');

            return $this->createdResponse($comment, 'Bình luận đã được gửi.');
        } catch (\Exception $e) {
            Log::error('Post comment error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi gửi bình luận.', 500);
        }
    }

    /** Xóa bình luận (chỉ chủ bình luận) */
    public function deleteComment(Request $request, int $commentId): JsonResponse
    {
        try {
            $comment = Comment::find($commentId);

            if (!$comment || $comment->is_deleted) {
                return $this->notFoundResponse('Không tìm thấy bình luận.');
            }

            if (!\Illuminate\Support\Facades\Gate::allows('delete', $comment)) {
                return $this->errorResponse('Bạn không có quyền xóa bình luận này.', 403, null, 'FORBIDDEN');
            }

            $comment->update(['is_deleted' => true]);

            return $this->successResponse(null, 'Đã xóa bình luận.');
        } catch (\Exception $e) {
            Log::error('Delete comment error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi xóa bình luận.', 500);
        }
    }

    // ══════════════════════════════════════════════
    //  RATING
    // ══════════════════════════════════════════════

    /** Lấy danh sách đánh giá cho phim */
    public function getMovieRatings(Request $request, int $movieId): JsonResponse
    {
        try {
            $ratings = Rating::where('movie_id', $movieId)
                ->with('user:id,name')
                ->orderBy('created_at', 'desc')
                ->paginate($request->query('per_page', 10));

            return $this->successResponse($ratings, 'Danh sách đánh giá.');
        } catch (\Exception $e) {
            Log::error('Get ratings error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi tải đánh giá.', 500);
        }
    }

    /** Gửi hoặc cập nhật đánh giá */
    public function rateMovie(Request $request, int $movieId): JsonResponse
    {
        try {
            $request->validate([
                'score' => 'required|integer|min:1|max:10',
                'review_text' => 'nullable|string|max:500',
            ]);

            $rating = Rating::updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'movie_id' => $movieId,
                ],
                [
                    'score' => $request->score,
                    'review_text' => $request->review_text ?? '',
                ]
            );

            // Cập nhật điểm trung bình của phim
            $avgRating = Rating::where('movie_id', $movieId)->avg('score');
            Movie::where('id', $movieId)->update(['average_rating' => round($avgRating, 1)]);

            return $this->successResponse($rating, 'Đánh giá đã được ghi nhận.');
        } catch (\Exception $e) {
            Log::error('Rate movie error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi gửi đánh giá.', 500);
        }
    }

    /** Lấy đánh giá của user hiện tại */
    public function getMyRating(Request $request, int $movieId): JsonResponse
    {
        $rating = Rating::where('user_id', $request->user()->id)
            ->where('movie_id', $movieId)
            ->first();

        return $this->successResponse($rating);
    }
}
