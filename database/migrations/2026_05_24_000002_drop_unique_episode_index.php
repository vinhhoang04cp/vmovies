<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('episodes', function (Blueprint $table) {
            $table->dropUnique(['movie_id', 'episode_number']);
            // Standard index instead of unique to maintain performance when querying by movie_id and episode_number
            $table->index(['movie_id', 'episode_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('episodes', function (Blueprint $table) {
            $table->dropIndex(['movie_id', 'episode_number']);
            $table->unique(['movie_id', 'episode_number']);
        });
    }
};
