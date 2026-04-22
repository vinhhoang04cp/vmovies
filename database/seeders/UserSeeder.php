<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Get roles
        $adminRole = Role::where('name', 'admin')->first();
        $editorRole = Role::where('name', 'editor')->first();
        $moderatorRole = Role::where('name', 'moderator')->first();
        $userRole = Role::where('name', 'user')->first();

        // Tài khoản Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@vmovies.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'status' => 'active',
            ]
        );
        if ($adminRole) {
            $admin->role_id = $adminRole->id;
            $admin->save();
        }

        // Tài khoản Editor
        $editor = User::firstOrCreate(
            ['email' => 'editor@vmovies.com'],
            [
                'name' => 'Editor',
                'password' => Hash::make('password'),
                'status' => 'active',
            ]
        );
        if ($editorRole) {
            $editor->role_id = $editorRole->id;
            $editor->save();
        }

        // Tài khoản Moderator
        $moderator = User::firstOrCreate(
            ['email' => 'moderator@vmovies.com'],
            [
                'name' => 'Moderator',
                'password' => Hash::make('password'),
                'status' => 'active',
            ]
        );
        if ($moderatorRole) {
            $moderator->role_id = $moderatorRole->id;
            $moderator->save();
        }

        // Tài khoản User
        $user = User::firstOrCreate(
            ['email' => 'user@vmovies.com'],
            [
                'name' => 'User',
                'password' => Hash::make('password'),
                'status' => 'active',
            ]
        );
        if ($userRole) {
            $user->role_id = $userRole->id;
            $user->save();
        }

        // 50 user thường (chỉ tạo nếu số lượng user dưới 100)
        if (User::count() < 100) {
            User::factory(50)->create()->each(function ($user) use ($userRole) {
                if ($userRole) {
                    $user->role_id = $userRole->id;
                    $user->save();
                }
            });
        }

        // 5 user bị ban (chỉ tạo nếu số lượng user dưới 110)
        if (User::count() < 110) {
            User::factory(5)->banned()->create()->each(function ($user) use ($userRole) {
                if ($userRole) {
                    $user->role_id = $userRole->id;
                    $user->save();
                }
            });
        }
    }
}
