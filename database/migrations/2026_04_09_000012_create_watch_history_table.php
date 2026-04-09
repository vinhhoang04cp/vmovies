<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('watch_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('movie_id')->constrained()->cascadeOnDelete();
            $table->foreignId('episode_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('current_timestamp')->default(0)->comment('Mốc thời gian dừng (giây)');
            $table->timestamp('watched_at')->useCurrent()->useCurrentOnUpdate();
            $table->timestamps();

            $table->unique(['user_id', 'episode_id']);
            $table->index('user_id');
            $table->index(['user_id', 'movie_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('watch_history');
    }
};

