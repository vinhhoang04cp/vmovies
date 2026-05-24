<?php

use App\Http\Controllers\Admin\ActorController as AdminActorController;
use App\Http\Controllers\Admin\CommentController as AdminCommentController;
use App\Http\Controllers\Admin\CountryController as AdminCountryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DirectorController as AdminDirectorController;
use App\Http\Controllers\Admin\EpisodeController as AdminEpisodeController;
use App\Http\Controllers\Admin\GenreController as AdminGenreController;
use App\Http\Controllers\Admin\MovieController as AdminMovieController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\ViewerController;
use Illuminate\Support\Facades\Route;

// ═══════════════════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════════════════

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->name('login')->middleware('throttle:5,1');
    Route::post('register', [AuthController::class, 'register'])->name('register')->middleware('throttle:5,1');
    Route::post('refresh', [AuthController::class, 'refresh'])->name('refresh');
});

Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::get('me', [AuthController::class, 'me'])->name('auth.me');
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
});

// ═══════════════════════════════════════════════════════
//  PUBLIC ROUTES (viewers - no auth required)
// ═══════════════════════════════════════════════════════

Route::prefix('movies')->group(function () {
    Route::get('/', [MovieController::class, 'index']);
    Route::get('/{movie}', [MovieController::class, 'show']);
    Route::get('/{movie}/episodes', [MovieController::class, 'episodes']);
    Route::get('/{movie}/episodes/{episode}', [MovieController::class, 'showEpisode']);
    // Public: Bình luận cho phim (không cần đăng nhập để xem)
    Route::get('/{movie}/comments', [ViewerController::class, 'getMovieComments']);
    // Public: Đánh giá cho phim
    Route::get('/{movie}/ratings', [ViewerController::class, 'getMovieRatings']);
});

Route::get('/genres', [GenreController::class, 'index']);
Route::get('/countries', [CountryController::class, 'index']);

// ═══════════════════════════════════════════════════════
//  VIEWER ROUTES (authenticated users - any role)
// ═══════════════════════════════════════════════════════

Route::middleware('auth:sanctum')->group(function () {
    // Bookmark
    Route::get('/bookmarks', [ViewerController::class, 'getBookmarks']);
    Route::post('/bookmarks', [ViewerController::class, 'addBookmark']);
    Route::delete('/bookmarks/{movieId}', [ViewerController::class, 'removeBookmark']);
    Route::get('/bookmarks/check/{movieId}', [ViewerController::class, 'checkBookmark']);

    // Comment (gửi/xóa yêu cầu đăng nhập)
    Route::post('/movies/{movie}/comments', [ViewerController::class, 'postComment']);
    Route::delete('/comments/{comment}', [ViewerController::class, 'deleteComment']);

    // Rating (gửi/xem rating cá nhân yêu cầu đăng nhập)
    Route::post('/movies/{movie}/ratings', [ViewerController::class, 'rateMovie']);
    Route::get('/movies/{movie}/ratings/mine', [ViewerController::class, 'getMyRating']);
});

// ═══════════════════════════════════════════════════════
//  ADMIN ROUTES (requires auth + admin role)
// ═══════════════════════════════════════════════════════

Route::middleware(['auth:sanctum', 'permission:dashboard.access'])->prefix('admin')->group(function () {

    // ── Movies ──────────────────────────────────────────
    Route::prefix('movies')->group(function () {
        Route::get('/', [AdminMovieController::class, 'index'])->middleware('permission:movie.read');
        Route::get('/trashed', [AdminMovieController::class, 'trashed'])->middleware('permission:movie.read');
        Route::post('/', [AdminMovieController::class, 'store'])->middleware('permission:movie.create');
        Route::get('/{movie}', [AdminMovieController::class, 'show'])->middleware('permission:movie.read');
        Route::put('/{movie}', [AdminMovieController::class, 'update'])->middleware('permission:movie.update');
        Route::delete('/{movie}', [AdminMovieController::class, 'destroy'])->middleware('permission:movie.delete');
        Route::post('/{movie}/restore', [AdminMovieController::class, 'restore'])->middleware('permission:movie.restore');

        Route::get('/{movie}/episodes', [AdminEpisodeController::class, 'index'])->middleware('permission:episode.read');
        Route::post('/{movie}/episodes', [AdminEpisodeController::class, 'store'])->middleware('permission:episode.create');

        Route::post('/{movie}/genres/{genre}', [AdminMovieController::class, 'attachGenre'])->middleware('permission:movie.update');
        Route::delete('/{movie}/genres/{genre}', [AdminMovieController::class, 'detachGenre'])->middleware('permission:movie.update');
        Route::post('/{movie}/countries/{country}', [AdminMovieController::class, 'attachCountry'])->middleware('permission:movie.update');
        Route::delete('/{movie}/countries/{country}', [AdminMovieController::class, 'detachCountry'])->middleware('permission:movie.update');
        Route::post('/{movie}/directors/{director}', [AdminMovieController::class, 'attachDirector'])->middleware('permission:movie.update');
        Route::delete('/{movie}/directors/{director}', [AdminMovieController::class, 'detachDirector'])->middleware('permission:movie.update');
        Route::post('/{movie}/actors/{actor}', [AdminMovieController::class, 'attachActor'])->middleware('permission:movie.update');
        Route::delete('/{movie}/actors/{actor}', [AdminMovieController::class, 'detachActor'])->middleware('permission:movie.update');
    });

    // ── Episodes (standalone) ───────────────────────────
    Route::prefix('episodes')->group(function () {
        Route::get('/trashed', [AdminEpisodeController::class, 'trashed'])->middleware('permission:episode.read');
        Route::post('/bulk-create', [AdminEpisodeController::class, 'bulkCreate'])->middleware('permission:episode.create');
        Route::put('/reorder', [AdminEpisodeController::class, 'reorder'])->middleware('permission:episode.update');
        Route::get('/{episode}', [AdminEpisodeController::class, 'show'])->middleware('permission:episode.read');
        Route::put('/{episode}', [AdminEpisodeController::class, 'update'])->middleware('permission:episode.update');
        Route::delete('/{episode}', [AdminEpisodeController::class, 'destroy'])->middleware('permission:episode.delete');
        Route::post('/{episode}/restore', [AdminEpisodeController::class, 'restore'])->middleware('permission:episode.update');
    });

    // ── Genres ──────────────────────────────────────────
    Route::prefix('genres')->group(function () {
        Route::get('/', [AdminGenreController::class, 'index'])->middleware('permission:genre.read');
        Route::get('/trashed', [AdminGenreController::class, 'trashed'])->middleware('permission:genre.read');
        Route::post('/', [AdminGenreController::class, 'store'])->middleware('permission:genre.create');
        Route::get('/{genre}', [AdminGenreController::class, 'show'])->middleware('permission:genre.read');
        Route::put('/{genre}', [AdminGenreController::class, 'update'])->middleware('permission:genre.update');
        Route::delete('/{genre}', [AdminGenreController::class, 'destroy'])->middleware('permission:genre.delete');
        Route::post('/{genre}/restore', [AdminGenreController::class, 'restore'])->middleware('permission:genre.update');
    });

    // ── Countries ────────────────────────────────────────
    Route::prefix('countries')->group(function () {
        Route::get('/', [AdminCountryController::class, 'index'])->middleware('permission:country.read');
        Route::get('/trashed', [AdminCountryController::class, 'trashed'])->middleware('permission:country.read');
        Route::post('/', [AdminCountryController::class, 'store'])->middleware('permission:country.create');
        Route::get('/{country}', [AdminCountryController::class, 'show'])->middleware('permission:country.read');
        Route::put('/{country}', [AdminCountryController::class, 'update'])->middleware('permission:country.update');
        Route::delete('/{country}', [AdminCountryController::class, 'destroy'])->middleware('permission:country.delete');
        Route::post('/{country}/restore', [AdminCountryController::class, 'restore'])->middleware('permission:country.update');
    });

    // ── Directors ────────────────────────────────────────
    Route::prefix('directors')->group(function () {
        Route::get('/', [AdminDirectorController::class, 'index'])->middleware('permission:director.read');
        Route::get('/trashed', [AdminDirectorController::class, 'trashed'])->middleware('permission:director.read');
        Route::post('/', [AdminDirectorController::class, 'store'])->middleware('permission:director.create');
        Route::get('/{director}', [AdminDirectorController::class, 'show'])->middleware('permission:director.read');
        Route::put('/{director}', [AdminDirectorController::class, 'update'])->middleware('permission:director.update');
        Route::delete('/{director}', [AdminDirectorController::class, 'destroy'])->middleware('permission:director.delete');
        Route::post('/{director}/restore', [AdminDirectorController::class, 'restore'])->middleware('permission:director.create');
    });

    // ── Actors ───────────────────────────────────────────
    Route::prefix('actors')->group(function () {
        Route::get('/', [AdminActorController::class, 'index'])->middleware('permission:actor.read');
        Route::get('/trashed', [AdminActorController::class, 'trashed'])->middleware('permission:actor.read');
        Route::post('/', [AdminActorController::class, 'store'])->middleware('permission:actor.create');
        Route::get('/{actor}', [AdminActorController::class, 'show'])->middleware('permission:actor.read');
        Route::put('/{actor}', [AdminActorController::class, 'update'])->middleware('permission:actor.update');
        Route::delete('/{actor}', [AdminActorController::class, 'destroy'])->middleware('permission:actor.delete');
        Route::post('/{actor}/restore', [AdminActorController::class, 'restore'])->middleware('permission:actor.create');
    });

    // ── Users ─────────────────────────────────────────────
    Route::prefix('users')->group(function () {
        Route::get('/', [AdminUserController::class, 'index'])->middleware('permission:user.read');
        Route::get('/{user}', [AdminUserController::class, 'show'])->middleware('permission:user.read');
        Route::put('/{user}', [AdminUserController::class, 'update'])->middleware('permission:user.update');
        Route::delete('/{user}', [AdminUserController::class, 'destroy'])->middleware('permission:user.delete');
        Route::patch('/{user}/ban', [AdminUserController::class, 'ban'])->middleware('permission:user.ban');
        Route::patch('/{user}/unban', [AdminUserController::class, 'unban'])->middleware('permission:user.ban');
    });

    // ── Comments ──────────────────────────────────────────
    Route::prefix('comments')->group(function () {
        Route::get('/', [AdminCommentController::class, 'index'])->middleware('permission:comment.read');
        Route::get('/pending', [AdminCommentController::class, 'pending'])->middleware('permission:comment.read');
        Route::get('/{comment}', [AdminCommentController::class, 'show'])->middleware('permission:comment.read');
        Route::patch('/{comment}/approve', [AdminCommentController::class, 'approve'])->middleware('permission:comment.approve');
        Route::delete('/{comment}', [AdminCommentController::class, 'destroy'])->middleware('permission:comment.delete');
    });

    // ── Dashboard & Stats ─────────────────────────────────
    Route::get('dashboard', [DashboardController::class, 'index'])->middleware('permission:dashboard.access');
    Route::prefix('stats')->group(function () {
        Route::get('movies', [DashboardController::class, 'movieStats'])->middleware('permission:dashboard.access');
        Route::get('users', [DashboardController::class, 'userStats'])->middleware('permission:dashboard.access');
        Route::get('comments', [DashboardController::class, 'commentStats'])->middleware('permission:dashboard.access');
    });
});
