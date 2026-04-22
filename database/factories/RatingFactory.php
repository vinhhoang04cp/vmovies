<?php

namespace Database\Factories;

use App\Models\Movie;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RatingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'movie_id' => Movie::factory(),
            'score' => fake()->numberBetween(1, 5),
            'review_text' => fake()->optional(0.4)->paragraph(),
            'helpful_count' => fake()->numberBetween(0, 100),
        ];
    }
}
