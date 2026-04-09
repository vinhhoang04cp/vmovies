<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ActorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'      => fake()->name(),
            'bio'       => fake()->optional()->paragraph(),
            'image_url' => null,
        ];
    }
}

