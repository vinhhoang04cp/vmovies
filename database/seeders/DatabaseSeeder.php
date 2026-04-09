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
            UserSeeder::class,    // 1. Users trước
            GenreSeeder::class,   // 2. Thể loại
            CountrySeeder::class, // 3. Quốc gia
            MovieSeeder::class,   // 4. Phim + Episodes + Ratings + Comments (dùng Users/Genres/Countries)
        ]);
    }
}
