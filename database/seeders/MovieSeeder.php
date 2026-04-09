<?php

namespace Database\Seeders;

use App\Models\Actor;
use App\Models\Country;
use App\Models\Director;
use App\Models\Genre;
use App\Models\Movie;
use App\Models\Episode;
use App\Models\Rating;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MovieSeeder extends Seeder
{
    public function run(): void
    {
        $genres    = Genre::all();
        $countries = Country::all();
        $directors = Director::factory(20)->create();
        $actors    = Actor::factory(50)->create();
        $users     = User::where('is_admin', false)->get();

        // -----------------------------------------------
        // 1. Phim lẻ (movie) - 20 bộ
        // -----------------------------------------------
        Movie::factory(20)->movie()->create()->each(function (Movie $movie) use ($genres, $countries, $directors, $actors, $users) {
            // Gắn thể loại, quốc gia, đạo diễn, diễn viên
            $movie->genres()->attach($genres->random(rand(1, 3))->pluck('id'));
            $movie->countries()->attach($countries->random(rand(1, 2))->pluck('id'));
            $movie->directors()->attach($directors->random(rand(1, 2))->pluck('id'));
            $movie->actors()->attach(
                $actors->random(rand(3, 8))->pluck('id')->mapWithKeys(fn ($id) => [
                    $id => ['role_name' => fake()->optional(0.6)->jobTitle()],
                ])
            );

            // Thêm 1 tập duy nhất cho phim lẻ
            Episode::create([
                'movie_id'       => $movie->id,
                'episode_number' => 1,
                'arc_name'       => null,
                'title'          => $movie->title,
                'video_url'      => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'duration'       => rand(4800, 9000), // 80-150 phút
                'views'          => rand(100, 100000),
            ]);

            // Sinh ratings & comments
            $this->seedInteractions($movie, $users);
        });

        // -----------------------------------------------
        // 2. Phim bộ thông thường - 10 series
        // -----------------------------------------------
        Movie::factory(10)->series()->create()->each(function (Movie $movie) use ($genres, $countries, $directors, $actors, $users) {
            $movie->genres()->attach($genres->random(rand(1, 3))->pluck('id'));
            $movie->countries()->attach($countries->random(rand(1, 2))->pluck('id'));
            $movie->directors()->attach($directors->random(1)->pluck('id'));
            $movie->actors()->attach(
                $actors->random(rand(5, 10))->pluck('id')->mapWithKeys(fn ($id) => [
                    $id => ['role_name' => fake()->optional(0.6)->jobTitle()],
                ])
            );

            // 12-24 tập
            $totalEps = rand(12, 24);
            for ($i = 1; $i <= $totalEps; $i++) {
                Episode::create([
                    'movie_id'       => $movie->id,
                    'episode_number' => $i,
                    'arc_name'       => null,
                    'title'          => "Tập $i",
                    'video_url'      => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    'duration'       => rand(1200, 2700),
                    'views'          => rand(100, 500000),
                ]);
            }

            $this->seedInteractions($movie, $users);
        });

        // -----------------------------------------------
        // 3. Anime dài tập (One Piece style) - 1 series đặc biệt
        // -----------------------------------------------
        $anime = Movie::create([
            'title'          => 'Vua Hải Tặc',
            'original_title' => 'One Piece',
            'slug'           => 'vua-hai-tac-one-piece',
            'poster_url'     => 'https://placehold.co/300x450/1a1a2e/ffffff?text=One+Piece',
            'banner_url'     => 'https://placehold.co/1280x720/1a1a2e/ffffff?text=One+Piece+Banner',
            'trailer_url'    => 'https://www.youtube.com/watch?v=MCf3RXeRe74',
            'summary'        => 'Câu chuyện về Monkey D. Luffy trên hành trình tìm kho báu One Piece để trở thành Vua Hải Tặc.',
            'release_year'   => 1999,
            'status'         => 'ongoing',
            'type'           => 'series',
            'view_count'     => 5000000,
            'average_rating' => 4.8,
        ]);

        $anime->genres()->attach($genres->whereIn('slug', ['hanh-dong', 'phieu-luu', 'hai-huoc'])->pluck('id'));
        $anime->countries()->attach($countries->where('code', 'JP')->pluck('id'));

        $arcs = [
            ['name' => 'Arc Đông Hải',    'eps' => 61],
            ['name' => 'Arc Alabasta',    'eps' => 71],
            ['name' => 'Arc Skypiea',     'eps' => 43],
            ['name' => 'Arc Water 7',     'eps' => 119],
            ['name' => 'Arc Thriller Bark','eps' => 45],
            ['name' => 'Arc Marineford',  'eps' => 33],
            ['name' => 'Arc Haki',        'eps' => 91],
            ['name' => 'Arc Dressrosa',   'eps' => 118],
            ['name' => 'Arc Whole Cake',  'eps' => 95],
            ['name' => 'Arc Wano',        'eps' => 149],
        ];

        $epNumber = 1;
        foreach ($arcs as $arc) {
            for ($i = 1; $i <= $arc['eps']; $i++) {
                Episode::create([
                    'movie_id'       => $anime->id,
                    'episode_number' => $epNumber++,
                    'arc_name'       => $arc['name'],
                    'title'          => "Tập $epNumber - " . $arc['name'],
                    'video_url'      => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    'duration'       => rand(1200, 1560), // ~20-26 phút
                    'views'          => rand(10000, 2000000),
                ]);
            }
        }

        $this->seedInteractions($anime, $users);
    }

    /**
     * Sinh ratings và comments cho một bộ phim
     */
    private function seedInteractions(Movie $movie, $users): void
    {
        if ($users->isEmpty()) return;

        $ratingUsers = $users->random(min(rand(5, 15), $users->count()));
        foreach ($ratingUsers as $user) {
            Rating::firstOrCreate(
                ['user_id' => $user->id, 'movie_id' => $movie->id],
                ['score' => rand(1, 5), 'review_text' => fake()->optional(0.4)->paragraph()]
            );
        }

        $movie->recalculateRating();

        $commentUsers = $users->random(min(rand(3, 10), $users->count()));
        foreach ($commentUsers as $user) {
            Comment::create([
                'user_id'     => $user->id,
                'movie_id'    => $movie->id,
                'episode_id'  => null,
                'content'     => fake()->paragraph(),
                'is_approved' => true,
                'is_deleted'  => false,
            ]);
        }
    }
}

