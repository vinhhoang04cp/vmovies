<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// React SPA routes - Serve React app for all routes (except API)
Route::get('{any}', function () {
    return view('app');
})->where('any', '.*');

require __DIR__.'/auth.php';


