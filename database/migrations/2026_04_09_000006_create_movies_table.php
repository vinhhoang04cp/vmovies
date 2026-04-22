<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('original_title')->nullable();
            $table->string('slug')->unique();
            $table->string('poster_url')->nullable();
            $table->string('banner_url')->nullable();
            $table->string('trailer_url')->nullable();
            $table->text('summary')->nullable();
            $table->year('release_year')->nullable();
            $table->enum('status', ['ongoing', 'completed'])->default('ongoing');
            $table->enum('type', ['movie', 'series'])->default('movie');
            $table->unsignedBigInteger('view_count')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->timestamps();

            $table->index('type');
            $table->index('status');
            $table->index('release_year');
            $table->index('view_count');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movies');
    }
};
