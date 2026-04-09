<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Tài khoản Admin
        User::factory()->admin()->create([
            'name'  => 'Admin',
            'email' => 'admin@vmovies.com',
        ]);

        // 50 user thường
        User::factory(50)->create();

        // 5 user bị ban
        User::factory(5)->banned()->create();
    }
}

