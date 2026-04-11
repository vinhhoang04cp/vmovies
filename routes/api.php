<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\Admin\MovieController as AdminMovieController;
use App\Http\Controllers\Admin\EpisodeController as AdminEpisodeController;
use Illuminate\Support\Facades\Route;

// ═══════════════════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════════════════

// Public auth routes (no authentication required)
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->name('login');
    Route::post('register', [AuthController::class, 'register'])->name('register');
});

// Protected auth routes (authentication required)
Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::get('me', [AuthController::class, 'me'])->name('auth.me');
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('refresh', [AuthController::class, 'refresh'])->name('refresh');
});

// ═══════════════════════════════════════════════════════
//  PUBLIC ROUTES (viewers - no auth required)
// ═══════════════════════════════════════════════════════

Route::prefix('movies')->group(function () {
    Route::get('/', [MovieController::class, 'index']);
    Route::get('/{movie}', [MovieController::class, 'show']);
    Route::get('/{movie}/episodes', [MovieController::class, 'episodes']);
    Route::get('/{movie}/episodes/{episode}', [MovieController::class, 'showEpisode']);
});

// ═══════════════════════════════════════════════════════
//  ADMIN ROUTES (requires auth + admin role)
// ═══════════════════════════════════════════════════════

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // ── Movies ──────────────────────────────────────────
    Route::prefix('movies')->group(function () {
        Route::get('/',          [AdminMovieController::class, 'index']);
        Route::get('/trashed',   [AdminMovieController::class, 'trashed']);
        Route::post('/',         [AdminMovieController::class, 'store']);
        Route::get('/{movie}',   [AdminMovieController::class, 'show']);
        Route::put('/{movie}',   [AdminMovieController::class, 'update']);
        Route::delete('/{movie}',[AdminMovieController::class, 'destroy']);
        Route::post('/{movie}/restore', [AdminMovieController::class, 'restore']);

        // Episodes nested under movie
        Route::get('/{movie}/episodes',  [AdminEpisodeController::class, 'index']);
        Route::post('/{movie}/episodes', [AdminEpisodeController::class, 'store']);

        // Pivot: Genres
        Route::post('/{movie}/genres/{genre}',     [AdminMovieController::class, 'attachGenre']);
        Route::delete('/{movie}/genres/{genre}',   [AdminMovieController::class, 'detachGenre']);

        // Pivot: Countries
        Route::post('/{movie}/countries/{country}',   [AdminMovieController::class, 'attachCountry']);
        Route::delete('/{movie}/countries/{country}', [AdminMovieController::class, 'detachCountry']);

        // Pivot: Directors
        Route::post('/{movie}/directors/{director}',   [AdminMovieController::class, 'attachDirector']);
        Route::delete('/{movie}/directors/{director}', [AdminMovieController::class, 'detachDirector']);

        // Pivot: Actors
        Route::post('/{movie}/actors/{actor}',   [AdminMovieController::class, 'attachActor']);
        Route::delete('/{movie}/actors/{actor}', [AdminMovieController::class, 'detachActor']);
    });

    // ── Episodes (standalone) ───────────────────────────
    Route::prefix('episodes')->group(function () {
        Route::post('/bulk-create', [AdminEpisodeController::class, 'bulkCreate']);
        Route::put('/reorder',      [AdminEpisodeController::class, 'reorder']);
        Route::get('/{episode}',    [AdminEpisodeController::class, 'show']);
        Route::put('/{episode}',    [AdminEpisodeController::class, 'update']);
        Route::delete('/{episode}', [AdminEpisodeController::class, 'destroy']);
    });
});

