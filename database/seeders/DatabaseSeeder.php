<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class, // 1. Roles & Permissions first
            UserSeeder::class,    // 2. Users
            GenreSeeder::class,   // 3. Genres
            CountrySeeder::class, // 4. Countries
            MovieSeeder::class,   // 5. Movies + Episodes + Ratings + Comments
        ]);
    }
}
