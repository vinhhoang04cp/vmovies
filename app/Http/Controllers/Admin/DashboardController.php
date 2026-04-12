<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use App\Traits\HasJsonResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    use HasJsonResponse;

    public function __construct(private readonly DashboardService $dashboardService) {}

    /**
     * GET /api/admin/dashboard
     * Tổng quan hệ thống: counts, new this week/month, pending actions,
     * top movies, recent comments & users.
     */
    public function index(): JsonResponse
    {
        try {
            $data = $this->dashboardService->overview();
            return $this->successResponse($data, 'Dữ liệu dashboard tổng quan.');
        } catch (\Exception $e) {
            Log::error('Dashboard overview error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy dữ liệu dashboard.', 500);
        }
    }

    /**
     * GET /api/admin/stats/movies
     * Thống kê chi tiết về phim: phân loại theo type/status/genre/quốc gia/năm,
     * top phim xem nhiều nhất, top phim được đánh giá cao nhất, v.v.
     */
    public function movieStats(): JsonResponse
    {
        try {
            $data = $this->dashboardService->movieStats();
            return $this->successResponse($data, 'Thống kê phim.');
        } catch (\Exception $e) {
            Log::error('Movie stats error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy thống kê phim.', 500);
        }
    }

    /**
     * GET /api/admin/stats/users
     * Thống kê người dùng: theo trạng thái/role, tăng trưởng theo tháng,
     * top commenters, top bookmarkers.
     */
    public function userStats(): JsonResponse
    {
        try {
            $data = $this->dashboardService->userStats();
            return $this->successResponse($data, 'Thống kê người dùng.');
        } catch (\Exception $e) {
            Log::error('User stats error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy thống kê người dùng.', 500);
        }
    }

    /**
     * GET /api/admin/stats/comments
     * Thống kê bình luận: overview, theo trạng thái, tăng trưởng theo tháng,
     * phim được bình luận nhiều nhất, pending comments gần đây.
     */
    public function commentStats(): JsonResponse
    {
        try {
            $data = $this->dashboardService->commentStats();
            return $this->successResponse($data, 'Thống kê bình luận.');
        } catch (\Exception $e) {
            Log::error('Comment stats error', ['exception' => $e->getMessage()]);
            return $this->errorResponse('Lỗi khi lấy thống kê bình luận.', 500);
        }
    }
}

