<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\Admin\MovieController as AdminMovieController;
use App\Http\Controllers\Admin\EpisodeController as AdminEpisodeController;
use App\Http\Controllers\Admin\GenreController as AdminGenreController;
use App\Http\Controllers\Admin\CountryController as AdminCountryController;
use App\Http\Controllers\Admin\DirectorController as AdminDirectorController;
use App\Http\Controllers\Admin\ActorController as AdminActorController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\CommentController as AdminCommentController;
use App\Http\Controllers\Admin\DashboardController;
use Illuminate\Support\Facades\Route;

// ═══════════════════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════════════════

Route::prefix('auth')->group(function () {
    Route::post('login',    [AuthController::class, 'login'])->name('login');
    Route::post('register', [AuthController::class, 'register'])->name('register');
});

Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::get('me',       [AuthController::class, 'me'])->name('auth.me');
    Route::post('logout',  [AuthController::class, 'logout'])->name('logout');
    Route::post('refresh', [AuthController::class, 'refresh'])->name('refresh');
});

// ═══════════════════════════════════════════════════════
//  PUBLIC ROUTES (viewers - no auth required)
// ═══════════════════════════════════════════════════════

Route::prefix('movies')->group(function () {
    Route::get('/',                           [MovieController::class, 'index']);
    Route::get('/{movie}',                    [MovieController::class, 'show']);
    Route::get('/{movie}/episodes',           [MovieController::class, 'episodes']);
    Route::get('/{movie}/episodes/{episode}', [MovieController::class, 'showEpisode']);
});

// ═══════════════════════════════════════════════════════
//  ADMIN ROUTES (requires auth + admin role)
// ═══════════════════════════════════════════════════════

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // ── Movies ──────────────────────────────────────────
    Route::prefix('movies')->group(function () {
        Route::get('/',            [AdminMovieController::class, 'index']);
        Route::get('/trashed',     [AdminMovieController::class, 'trashed']);
        Route::post('/',           [AdminMovieController::class, 'store']);
        Route::get('/{movie}',     [AdminMovieController::class, 'show']);
        Route::put('/{movie}',     [AdminMovieController::class, 'update']);
        Route::delete('/{movie}',  [AdminMovieController::class, 'destroy']);
        Route::post('/{movie}/restore', [AdminMovieController::class, 'restore']);

        Route::get('/{movie}/episodes',  [AdminEpisodeController::class, 'index']);
        Route::post('/{movie}/episodes', [AdminEpisodeController::class, 'store']);

        Route::post('/{movie}/genres/{genre}',        [AdminMovieController::class, 'attachGenre']);
        Route::delete('/{movie}/genres/{genre}',      [AdminMovieController::class, 'detachGenre']);
        Route::post('/{movie}/countries/{country}',   [AdminMovieController::class, 'attachCountry']);
        Route::delete('/{movie}/countries/{country}', [AdminMovieController::class, 'detachCountry']);
        Route::post('/{movie}/directors/{director}',  [AdminMovieController::class, 'attachDirector']);
        Route::delete('/{movie}/directors/{director}',[AdminMovieController::class, 'detachDirector']);
        Route::post('/{movie}/actors/{actor}',        [AdminMovieController::class, 'attachActor']);
        Route::delete('/{movie}/actors/{actor}',      [AdminMovieController::class, 'detachActor']);
    });

    // ── Episodes (standalone) ───────────────────────────
    Route::prefix('episodes')->group(function () {
        Route::get('/trashed',            [AdminEpisodeController::class, 'trashed']);
        Route::post('/bulk-create',       [AdminEpisodeController::class, 'bulkCreate']);
        Route::put('/reorder',            [AdminEpisodeController::class, 'reorder']);
        Route::get('/{episode}',          [AdminEpisodeController::class, 'show']);
        Route::put('/{episode}',          [AdminEpisodeController::class, 'update']);
        Route::delete('/{episode}',       [AdminEpisodeController::class, 'destroy']);
        Route::post('/{episode}/restore', [AdminEpisodeController::class, 'restore']);
    });

    // ── Genres ──────────────────────────────────────────
    Route::prefix('genres')->group(function () {
        Route::get('/',                 [AdminGenreController::class, 'index']);
        Route::get('/trashed',          [AdminGenreController::class, 'trashed']);
        Route::post('/',                [AdminGenreController::class, 'store']);
        Route::get('/{genre}',          [AdminGenreController::class, 'show']);
        Route::put('/{genre}',          [AdminGenreController::class, 'update']);
        Route::delete('/{genre}',       [AdminGenreController::class, 'destroy']);
        Route::post('/{genre}/restore', [AdminGenreController::class, 'restore']);
    });

    // ── Countries ────────────────────────────────────────
    Route::prefix('countries')->group(function () {
        Route::get('/',                   [AdminCountryController::class, 'index']);
        Route::get('/trashed',            [AdminCountryController::class, 'trashed']);
        Route::post('/',                  [AdminCountryController::class, 'store']);
        Route::get('/{country}',          [AdminCountryController::class, 'show']);
        Route::put('/{country}',          [AdminCountryController::class, 'update']);
        Route::delete('/{country}',       [AdminCountryController::class, 'destroy']);
        Route::post('/{country}/restore', [AdminCountryController::class, 'restore']);
    });

    // ── Directors ────────────────────────────────────────
    Route::prefix('directors')->group(function () {
        Route::get('/',                    [AdminDirectorController::class, 'index']);
        Route::get('/trashed',             [AdminDirectorController::class, 'trashed']);
        Route::post('/',                   [AdminDirectorController::class, 'store']);
        Route::get('/{director}',          [AdminDirectorController::class, 'show']);
        Route::put('/{director}',          [AdminDirectorController::class, 'update']);
        Route::delete('/{director}',       [AdminDirectorController::class, 'destroy']);
        Route::post('/{director}/restore', [AdminDirectorController::class, 'restore']);
    });

    // ── Actors ───────────────────────────────────────────
    Route::prefix('actors')->group(function () {
        Route::get('/',                 [AdminActorController::class, 'index']);
        Route::get('/trashed',          [AdminActorController::class, 'trashed']);
        Route::post('/',                [AdminActorController::class, 'store']);
        Route::get('/{actor}',          [AdminActorController::class, 'show']);
        Route::put('/{actor}',          [AdminActorController::class, 'update']);
        Route::delete('/{actor}',       [AdminActorController::class, 'destroy']);
        Route::post('/{actor}/restore', [AdminActorController::class, 'restore']);
    });

    // ── Users ─────────────────────────────────────────────
    Route::prefix('users')->group(function () {
        Route::get('/',                    [AdminUserController::class, 'index']);
        Route::get('/{user}',              [AdminUserController::class, 'show']);
        Route::put('/{user}',              [AdminUserController::class, 'update']);
        Route::delete('/{user}',           [AdminUserController::class, 'destroy']);
        Route::patch('/{user}/ban',        [AdminUserController::class, 'ban']);
        Route::patch('/{user}/unban',      [AdminUserController::class, 'unban']);
    });

    // ── Comments ──────────────────────────────────────────
    Route::prefix('comments')->group(function () {
        Route::get('/',                       [AdminCommentController::class, 'index']);
        Route::get('/pending',                [AdminCommentController::class, 'pending']);
        Route::get('/{comment}',              [AdminCommentController::class, 'show']);
        Route::patch('/{comment}/approve',    [AdminCommentController::class, 'approve']);
        Route::delete('/{comment}',           [AdminCommentController::class, 'destroy']);
    });

    // ── Dashboard & Stats ─────────────────────────────────
    Route::get('dashboard',        [DashboardController::class, 'index']);
    Route::prefix('stats')->group(function () {
        Route::get('movies',   [DashboardController::class, 'movieStats']);
        Route::get('users',    [DashboardController::class, 'userStats']);
        Route::get('comments', [DashboardController::class, 'commentStats']);
    });
});

