<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('episodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('movie_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('episode_number');
            $table->string('arc_name')->nullable();
            $table->string('title')->nullable();
            $table->string('video_url');
            $table->unsignedInteger('duration')->default(0)->comment('Tính bằng giây');
            $table->unsignedBigInteger('views')->default(0);
            $table->timestamps();

            $table->index('movie_id');
            $table->unique(['movie_id', 'episode_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('episodes');
    }
};

