<?php

namespace Database\Factories;

use App\Models\Movie;
use Illuminate\Database\Eloquent\Factories\Factory;

class EpisodeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'movie_id'       => Movie::factory(),
            'episode_number' => fake()->numberBetween(1, 100),
            'arc_name'       => fake()->optional(0.4)->randomElement([
                'Arc Đông Hải', 'Arc Alabasta', 'Arc Skypiea',
                'Arc Water 7', 'Arc Marineford', 'Arc Wano',
            ]),
            'title'          => 'Tập ' . fake()->numberBetween(1, 1000),
            'video_url'      => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'duration'       => fake()->numberBetween(1200, 2700), // 20-45 phút
            'views'          => fake()->numberBetween(0, 500000),
        ];
    }
}

