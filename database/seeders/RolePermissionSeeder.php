<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // Movie permissions
            ['name' => 'movie.create', 'display_name' => 'Create Movie', 'description' => 'Can create movies'],
            ['name' => 'movie.read', 'display_name' => 'Read Movie', 'description' => 'Can view movies'],
            ['name' => 'movie.update', 'display_name' => 'Update Movie', 'description' => 'Can update movies'],
            ['name' => 'movie.delete', 'display_name' => 'Delete Movie', 'description' => 'Can delete movies'],
            ['name' => 'movie.restore', 'display_name' => 'Restore Movie', 'description' => 'Can restore deleted movies'],

            // Episode permissions
            ['name' => 'episode.create', 'display_name' => 'Create Episode', 'description' => 'Can create episodes'],
            ['name' => 'episode.read', 'display_name' => 'Read Episode', 'description' => 'Can view episodes'],
            ['name' => 'episode.update', 'display_name' => 'Update Episode', 'description' => 'Can update episodes'],
            ['name' => 'episode.delete', 'display_name' => 'Delete Episode', 'description' => 'Can delete episodes'],

            // Genre permissions
            ['name' => 'genre.create', 'display_name' => 'Create Genre', 'description' => 'Can create genres'],
            ['name' => 'genre.read', 'display_name' => 'Read Genre', 'description' => 'Can view genres'],
            ['name' => 'genre.update', 'display_name' => 'Update Genre', 'description' => 'Can update genres'],
            ['name' => 'genre.delete', 'display_name' => 'Delete Genre', 'description' => 'Can delete genres'],

            // Country permissions
            ['name' => 'country.create', 'display_name' => 'Create Country', 'description' => 'Can create countries'],
            ['name' => 'country.read', 'display_name' => 'Read Country', 'description' => 'Can view countries'],
            ['name' => 'country.update', 'display_name' => 'Update Country', 'description' => 'Can update countries'],
            ['name' => 'country.delete', 'display_name' => 'Delete Country', 'description' => 'Can delete countries'],

            // Director permissions
            ['name' => 'director.create', 'display_name' => 'Create Director', 'description' => 'Can create directors'],
            ['name' => 'director.read', 'display_name' => 'Read Director', 'description' => 'Can view directors'],
            ['name' => 'director.update', 'display_name' => 'Update Director', 'description' => 'Can update directors'],
            ['name' => 'director.delete', 'display_name' => 'Delete Director', 'description' => 'Can delete directors'],

            // Actor permissions
            ['name' => 'actor.create', 'display_name' => 'Create Actor', 'description' => 'Can create actors'],
            ['name' => 'actor.read', 'display_name' => 'Read Actor', 'description' => 'Can view actors'],
            ['name' => 'actor.update', 'display_name' => 'Update Actor', 'description' => 'Can update actors'],
            ['name' => 'actor.delete', 'display_name' => 'Delete Actor', 'description' => 'Can delete actors'],

            // User permissions
            ['name' => 'user.read', 'display_name' => 'Read User', 'description' => 'Can view users'],
            ['name' => 'user.update', 'display_name' => 'Update User', 'description' => 'Can update users'],
            ['name' => 'user.delete', 'display_name' => 'Delete User', 'description' => 'Can delete users'],
            ['name' => 'user.ban', 'display_name' => 'Ban User', 'description' => 'Can ban users'],

            // Comment permissions
            ['name' => 'comment.read', 'display_name' => 'Read Comment', 'description' => 'Can view comments'],
            ['name' => 'comment.delete', 'display_name' => 'Delete Comment', 'description' => 'Can delete comments'],
            ['name' => 'comment.approve', 'display_name' => 'Approve Comment', 'description' => 'Can approve comments'],

            // Dashboard permissions
            ['name' => 'dashboard.access', 'display_name' => 'Access Dashboard', 'description' => 'Can access admin dashboard'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }

        // Create roles
        $adminRole = Role::updateOrCreate(
            ['name' => 'admin'],
            [
                'display_name' => 'Administrator',
                'description' => 'Full access to all resources',
            ]
        );

        $editorRole = Role::updateOrCreate(
            ['name' => 'editor'],
            [
                'display_name' => 'Editor',
                'description' => 'Can manage movies, episodes, and related content',
            ]
        );

        $moderatorRole = Role::updateOrCreate(
            ['name' => 'moderator'],
            [
                'display_name' => 'Moderator',
                'description' => 'Can moderate comments and users',
            ]
        );

        $userRole = Role::updateOrCreate(
            ['name' => 'user'],
            [
                'display_name' => 'User',
                'description' => 'Regular user with limited permissions',
            ]
        );

        // Attach permissions to admin role (all permissions)
        $allPermissions = Permission::all();
        $adminRole->permissions()->sync($allPermissions->pluck('id'));

        // Attach permissions to editor role
        $editorPermissions = Permission::whereIn('name', [
            'movie.create', 'movie.read', 'movie.update', 'movie.delete', 'movie.restore',
            'episode.create', 'episode.read', 'episode.update', 'episode.delete',
            'genre.read', 'genre.create', 'genre.update',
            'country.read', 'country.create', 'country.update',
            'director.read', 'director.create', 'director.update',
            'actor.read', 'actor.create', 'actor.update',
            'dashboard.access',
        ])->get();
        $editorRole->permissions()->sync($editorPermissions->pluck('id'));

        // Attach permissions to moderator role
        $moderatorPermissions = Permission::whereIn('name', [
            'comment.read', 'comment.delete', 'comment.approve',
            'user.read', 'user.ban',
            'dashboard.access',
        ])->get();
        $moderatorRole->permissions()->sync($moderatorPermissions->pluck('id'));

        // Attach permissions to user role
        $userPermissions = Permission::whereIn('name', [
            'movie.read', 'genre.read', 'country.read', 'director.read', 'actor.read',
        ])->get();
        $userRole->permissions()->sync($userPermissions->pluck('id'));
    }
}
