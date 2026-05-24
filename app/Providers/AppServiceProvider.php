<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Vite::prefetch(concurrency: 3);

        // Register Policies
        \Illuminate\Support\Facades\Gate::policy(\App\Models\Movie::class, \App\Policies\MoviePolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\Comment::class, \App\Policies\CommentPolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\User::class, \App\Policies\UserPolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\Episode::class, \App\Policies\EpisodePolicy::class);

        // Register Dynamic Gates from Permissions Table
        if (\Illuminate\Support\Facades\Schema::hasTable('permissions')) {
            try {
                $permissions = \App\Models\Permission::all();
                foreach ($permissions as $permission) {
                    \Illuminate\Support\Facades\Gate::define($permission->name, function ($user) use ($permission) {
                        return $user->hasPermission($permission->name);
                    });
                }
            } catch (\Throwable $e) {
                // Fail silently if table not found during migration/seeding
            }
        }
    }
}
