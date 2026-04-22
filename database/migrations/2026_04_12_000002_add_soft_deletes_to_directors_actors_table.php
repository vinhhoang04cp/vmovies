<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('directors', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('actors', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('directors', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('actors', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
