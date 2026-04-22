<?php

namespace App\Services;

use App\Models\Actor;
use App\Models\Bookmark;
use App\Models\Comment;
use App\Models\Country;
use App\Models\Director;
use App\Models\Episode;
use App\Models\Genre;
use App\Models\Movie;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    // ══════════════════════════════════════════
    //  DASHBOARD OVERVIEW
    // ══════════════════════════════════════════

    public function overview(): array
    {
        $now = Carbon::now();
        $weekAgo = $now->copy()->subWeek();
        $monthAgo = $now->copy()->subMonth();

        return [
            'totals' => $this->totals(),
            'new_this_week' => $this->newThisWeek($weekAgo),
            'new_this_month' => $this->newThisMonth($monthAgo),
            'pending_actions' => $this->pendingActions(),
            'top_movies' => $this->topMoviesByViews(5),
            'recent_movies' => $this->recentMovies(5),
            'recent_comments' => $this->recentComments(5),
            'recent_users' => $this->recentUsers(5),
        ];
    }

    private function totals(): array
    {
        return [
            'movies' => Movie::count(),
            'episodes' => Episode::count(),
            'users' => User::count(),
            'comments' => Comment::where('is_deleted', false)->count(),
            'genres' => Genre::count(),
            'countries' => Country::count(),
            'directors' => Director::count(),
            'actors' => Actor::count(),
            'ratings' => Rating::count(),
            'bookmarks' => Bookmark::count(),
        ];
    }

    private function newThisWeek(Carbon $weekAgo): array
    {
        return [
            'movies' => Movie::where('created_at', '>=', $weekAgo)->count(),
            'users' => User::where('created_at', '>=', $weekAgo)->count(),
            'comments' => Comment::where('created_at', '>=', $weekAgo)->where('is_deleted', false)->count(),
        ];
    }

    private function newThisMonth(Carbon $monthAgo): array
    {
        return [
            'movies' => Movie::where('created_at', '>=', $monthAgo)->count(),
            'users' => User::where('created_at', '>=', $monthAgo)->count(),
            'comments' => Comment::where('created_at', '>=', $monthAgo)->where('is_deleted', false)->count(),
        ];
    }

    private function pendingActions(): array
    {
        return [
            'pending_comments' => Comment::where('is_approved', false)->where('is_deleted', false)->count(),
            'banned_users' => User::where('status', 'banned')->count(),
            'trashed_movies' => Movie::onlyTrashed()->count(),
            'trashed_episodes' => Episode::onlyTrashed()->count(),
        ];
    }

    private function topMoviesByViews(int $limit): array
    {
        return Movie::select('id', 'title', 'slug', 'poster_url', 'type', 'status', 'view_count', 'average_rating')
            ->orderByDesc('view_count')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    private function recentMovies(int $limit): array
    {
        return Movie::select('id', 'title', 'slug', 'poster_url', 'type', 'status', 'created_at')
            ->latest()
            ->limit($limit)
            ->get()
            ->toArray();
    }

    private function recentComments(int $limit): array
    {
        return Comment::with(['user:id,name,avatar_url', 'movie:id,title,slug'])
            ->where('is_deleted', false)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'content' => mb_substr($c->content, 0, 80).(mb_strlen($c->content) > 80 ? '...' : ''),
                'is_approved' => $c->is_approved,
                'user' => $c->user ? ['id' => $c->user->id, 'name' => $c->user->name] : null,
                'movie' => $c->movie ? ['id' => $c->movie->id, 'title' => $c->movie->title] : null,
                'created_at' => $c->created_at,
            ])
            ->toArray();
    }

    private function recentUsers(int $limit): array
    {
        return User::with('role:id,name,display_name')
            ->select('id', 'name', 'email', 'status', 'avatar_url', 'role_id', 'created_at')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'status' => $u->status,
                'role' => $u->role?->name,
                'created_at' => $u->created_at,
            ])
            ->toArray();
    }

    // ══════════════════════════════════════════
    //  MOVIE STATS
    // ══════════════════════════════════════════

    public function movieStats(): array
    {
        return [
            'overview' => $this->movieOverview(),
            'by_type' => $this->moviesByType(),
            'by_status' => $this->moviesByStatus(),
            'by_genre' => $this->moviesByGenre(),
            'by_country' => $this->moviesByCountry(),
            'by_release_year' => $this->moviesByYear(),
            'top_viewed' => $this->topMoviesByViews(10),
            'top_rated' => $this->topMoviesByRating(10),
            'most_commented' => $this->mostCommentedMovies(10),
            'most_bookmarked' => $this->mostBookmarkedMovies(10),
        ];
    }

    private function movieOverview(): array
    {
        return [
            'total' => Movie::count(),
            'active' => Movie::whereNull('deleted_at')->count(),
            'trashed' => Movie::onlyTrashed()->count(),
            'total_episodes' => Episode::count(),
            'total_views' => (int) Movie::sum('view_count'),
            'avg_rating' => round((float) Movie::avg('average_rating'), 2),
            'total_ratings' => Rating::count(),
            'total_bookmarks' => Bookmark::count(),
        ];
    }

    private function moviesByType(): array
    {
        return Movie::select('type', DB::raw('count(*) as total'))
            ->groupBy('type')
            ->pluck('total', 'type')
            ->toArray();
    }

    private function moviesByStatus(): array
    {
        return Movie::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();
    }

    private function moviesByGenre(): array
    {
        return Genre::withCount('movies')
            ->orderByDesc('movies_count')
            ->get(['id', 'name', 'movies_count'])
            ->toArray();
    }

    private function moviesByCountry(): array
    {
        return Country::withCount('movies')
            ->orderByDesc('movies_count')
            ->get(['id', 'name', 'code', 'movies_count'])
            ->toArray();
    }

    private function moviesByYear(): array
    {
        return Movie::select('release_year', DB::raw('count(*) as total'))
            ->whereNotNull('release_year')
            ->groupBy('release_year')
            ->orderByDesc('release_year')
            ->limit(20)
            ->pluck('total', 'release_year')
            ->toArray();
    }

    private function topMoviesByRating(int $limit): array
    {
        return Movie::select('id', 'title', 'slug', 'poster_url', 'type', 'average_rating', 'view_count')
            ->where('average_rating', '>', 0)
            ->orderByDesc('average_rating')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    private function mostCommentedMovies(int $limit): array
    {
        return Movie::withCount(['comments' => fn ($q) => $q->where('is_deleted', false)])
            ->orderByDesc('comments_count')
            ->limit($limit)
            ->get(['id', 'title', 'slug', 'poster_url', 'type', 'comments_count'])
            ->toArray();
    }

    private function mostBookmarkedMovies(int $limit): array
    {
        return Movie::withCount('bookmarks')
            ->orderByDesc('bookmarks_count')
            ->limit($limit)
            ->get(['id', 'title', 'slug', 'poster_url', 'type', 'bookmarks_count'])
            ->toArray();
    }

    // ══════════════════════════════════════════
    //  USER STATS
    // ══════════════════════════════════════════

    public function userStats(): array
    {
        return [
            'overview' => $this->userOverview(),
            'by_status' => $this->usersByStatus(),
            'by_role' => $this->usersByRole(),
            'growth_by_month' => $this->userGrowthByMonth(),
            'top_commenters' => $this->topCommenters(10),
            'top_bookmarkers' => $this->topBookmarkers(10),
            'top_raters' => $this->topRaters(10),
        ];
    }

    private function userOverview(): array
    {
        $now = Carbon::now();
        $weekAgo = $now->copy()->subWeek();
        $monthAgo = $now->copy()->subMonth();

        return [
            'total' => User::count(),
            'active' => User::where('status', 'active')->count(),
            'banned' => User::where('status', 'banned')->count(),
            'new_this_week' => User::where('created_at', '>=', $weekAgo)->count(),
            'new_this_month' => User::where('created_at', '>=', $monthAgo)->count(),
        ];
    }

    private function usersByStatus(): array
    {
        return User::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();
    }

    private function usersByRole(): array
    {
        return User::join('roles', 'users.role_id', '=', 'roles.id')
            ->select('roles.name as role', 'roles.display_name', DB::raw('count(users.id) as total'))
            ->groupBy('roles.id', 'roles.name', 'roles.display_name')
            ->get()
            ->toArray();
    }

    private function userGrowthByMonth(): array
    {
        return User::select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('count(*) as total')
        )
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => [
            'period' => sprintf('%d-%02d', $row->year, $row->month),
            'total' => $row->total,
        ])
            ->toArray();
    }

    private function topCommenters(int $limit): array
    {
        return User::withCount(['comments' => fn ($q) => $q->where('is_deleted', false)])
            ->orderByDesc('comments_count')
            ->having('comments_count', '>', 0)
            ->limit($limit)
            ->get(['id', 'name', 'email', 'status', 'comments_count'])
            ->toArray();
    }

    private function topBookmarkers(int $limit): array
    {
        return User::withCount('bookmarks')
            ->orderByDesc('bookmarks_count')
            ->having('bookmarks_count', '>', 0)
            ->limit($limit)
            ->get(['id', 'name', 'email', 'status', 'bookmarks_count'])
            ->toArray();
    }

    private function topRaters(int $limit): array
    {
        return User::withCount('ratings')
            ->orderByDesc('ratings_count')
            ->having('ratings_count', '>', 0)
            ->limit($limit)
            ->get(['id', 'name', 'email', 'status', 'ratings_count'])
            ->toArray();
    }

    // ══════════════════════════════════════════
    //  COMMENT STATS
    // ══════════════════════════════════════════

    public function commentStats(): array
    {
        return [
            'overview' => $this->commentOverview(),
            'by_status' => $this->commentsByStatus(),
            'growth_by_month' => $this->commentGrowthByMonth(),
            'top_movies' => $this->mostCommentedMovies(10),
            'top_commenters' => $this->topCommenters(10),
            'recent_pending' => $this->recentPendingComments(10),
        ];
    }

    private function commentOverview(): array
    {
        $now = Carbon::now();
        $weekAgo = $now->copy()->subWeek();
        $monthAgo = $now->copy()->subMonth();

        $total = Comment::count();
        $approved = Comment::where('is_approved', true)->where('is_deleted', false)->count();
        $pending = Comment::where('is_approved', false)->where('is_deleted', false)->count();
        $deleted = Comment::where('is_deleted', true)->count();

        return [
            'total' => $total,
            'approved' => $approved,
            'pending' => $pending,
            'deleted' => $deleted,
            'approval_rate' => $total > 0 ? round(($approved / $total) * 100, 1) : 0,
            'new_this_week' => Comment::where('created_at', '>=', $weekAgo)->where('is_deleted', false)->count(),
            'new_this_month' => Comment::where('created_at', '>=', $monthAgo)->where('is_deleted', false)->count(),
        ];
    }

    private function commentsByStatus(): array
    {
        return [
            'approved' => Comment::where('is_approved', true)->where('is_deleted', false)->count(),
            'pending' => Comment::where('is_approved', false)->where('is_deleted', false)->count(),
            'deleted' => Comment::where('is_deleted', true)->count(),
        ];
    }

    private function commentGrowthByMonth(): array
    {
        return Comment::select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('count(*) as total'),
            DB::raw('SUM(CASE WHEN is_approved = 1 THEN 1 ELSE 0 END) as approved')
        )
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->where('is_deleted', false)
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => [
            'period' => sprintf('%d-%02d', $row->year, $row->month),
            'total' => $row->total,
            'approved' => $row->approved,
        ])
            ->toArray();
    }

    private function recentPendingComments(int $limit): array
    {
        return Comment::with(['user:id,name', 'movie:id,title'])
            ->where('is_approved', false)
            ->where('is_deleted', false)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'content' => mb_substr($c->content, 0, 100).(mb_strlen($c->content) > 100 ? '...' : ''),
                'user' => $c->user ? ['id' => $c->user->id, 'name' => $c->user->name] : null,
                'movie' => $c->movie ? ['id' => $c->movie->id, 'title' => $c->movie->title] : null,
                'created_at' => $c->created_at,
            ])
            ->toArray();
    }
}
