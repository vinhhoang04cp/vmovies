<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class MovieFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->sentence(3, false);

        return [
            'title'          => rtrim($title, '.'),
            'original_title' => fake()->optional()->sentence(3, false),
            'slug'           => Str::slug($title) . '-' . fake()->unique()->numberBetween(1, 99999),
            'poster_url'     => 'https://placehold.co/300x450/1a1a2e/ffffff?text=Poster',
            'banner_url'     => 'https://placehold.co/1280x720/1a1a2e/ffffff?text=Banner',
            'trailer_url'    => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'summary'        => fake()->paragraphs(2, true),
            'release_year'   => fake()->numberBetween(2000, 2026),
            'status'         => fake()->randomElement(['ongoing', 'completed']),
            'type'           => fake()->randomElement(['movie', 'series']),
            'view_count'     => fake()->numberBetween(0, 1000000),
            'average_rating' => 0,
        ];
    }

    public function movie(): static
    {
        return $this->state(fn (array $attributes) => ['type' => 'movie', 'status' => 'completed']);
    }

    public function series(): static
    {
        return $this->state(fn (array $attributes) => ['type' => 'series']);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'completed']);
    }

    public function ongoing(): static
    {
        return $this->state(fn (array $attributes) => ['status' => 'ongoing']);
    }
}

