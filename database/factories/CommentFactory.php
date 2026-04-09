<?php

namespace Database\Factories;

use App\Models\Episode;
use App\Models\Movie;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'movie_id'    => Movie::factory(),
            'episode_id'  => null,
            'content'     => fake()->paragraph(),
            'is_approved' => true,
            'is_deleted'  => false,
        ];
    }
}

