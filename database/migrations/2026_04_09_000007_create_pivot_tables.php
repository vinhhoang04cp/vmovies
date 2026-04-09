<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Phim - Thể loại
        Schema::create('movie_genre', function (Blueprint $table) {
            $table->id();
            $table->foreignId('movie_id')->constrained()->cascadeOnDelete();
            $table->foreignId('genre_id')->constrained()->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['movie_id', 'genre_id']);
        });

        // Phim - Quốc gia
        Schema::create('movie_country', function (Blueprint $table) {
            $table->id();
            $table->foreignId('movie_id')->constrained()->cascadeOnDelete();
            $table->foreignId('country_id')->constrained()->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['movie_id', 'country_id']);
        });

        // Phim - Đạo diễn
        Schema::create('movie_director', function (Blueprint $table) {
            $table->id();
            $table->foreignId('movie_id')->constrained()->cascadeOnDelete();
            $table->foreignId('director_id')->constrained()->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['movie_id', 'director_id']);
        });

        // Phim - Diễn viên
        Schema::create('movie_actor', function (Blueprint $table) {
            $table->id();
            $table->foreignId('movie_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->constrained()->cascadeOnDelete();
            $table->string('role_name')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['movie_id', 'actor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movie_actor');
        Schema::dropIfExists('movie_director');
        Schema::dropIfExists('movie_country');
        Schema::dropIfExists('movie_genre');
    }
};

