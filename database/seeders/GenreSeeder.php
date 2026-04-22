<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        $genres = [
            ['name' => 'Hành động',    'slug' => 'hanh-dong'],
            ['name' => 'Hài hước',     'slug' => 'hai-huoc'],
            ['name' => 'Tình cảm',     'slug' => 'tinh-cam'],
            ['name' => 'Kinh dị',      'slug' => 'kinh-di'],
            ['name' => 'Viễn tưởng',   'slug' => 'vien-tuong'],
            ['name' => 'Hoạt hình',    'slug' => 'hoat-hinh'],
            ['name' => 'Phiêu lưu',    'slug' => 'phieu-luu'],
            ['name' => 'Tâm lý',       'slug' => 'tam-ly'],
            ['name' => 'Chiến tranh',  'slug' => 'chien-tranh'],
            ['name' => 'Lịch sử',      'slug' => 'lich-su'],
            ['name' => 'Thể thao',     'slug' => 'the-thao'],
            ['name' => 'Âm nhạc',      'slug' => 'am-nhac'],
            ['name' => 'Gia đình',     'slug' => 'gia-dinh'],
            ['name' => 'Trinh thám',   'slug' => 'trinh-tham'],
            ['name' => 'Siêu anh hùng', 'slug' => 'sieu-anh-hung'],
        ];

        foreach ($genres as $genre) {
            Genre::firstOrCreate(['slug' => $genre['slug']], [
                'name' => $genre['name'],
                'slug' => $genre['slug'],
                'description' => null,
                'icon_url' => null,
            ]);
        }
    }
}
