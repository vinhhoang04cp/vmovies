<?php

namespace Database\Seeders;

use App\Models\Country;
use Illuminate\Database\Seeder;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        $countries = [
            ['name' => 'Mỹ',          'code' => 'US'],
            ['name' => 'Hàn Quốc',    'code' => 'KR'],
            ['name' => 'Nhật Bản',    'code' => 'JP'],
            ['name' => 'Trung Quốc',  'code' => 'CN'],
            ['name' => 'Việt Nam',    'code' => 'VN'],
            ['name' => 'Anh',         'code' => 'GB'],
            ['name' => 'Pháp',        'code' => 'FR'],
            ['name' => 'Đức',         'code' => 'DE'],
            ['name' => 'Thái Lan',    'code' => 'TH'],
            ['name' => 'Ấn Độ',       'code' => 'IN'],
            ['name' => 'Úc',          'code' => 'AU'],
            ['name' => 'Canada',      'code' => 'CA'],
            ['name' => 'Tây Ban Nha', 'code' => 'ES'],
            ['name' => 'Ý',           'code' => 'IT'],
            ['name' => 'Hồng Kông',   'code' => 'HK'],
            ['name' => 'Đài Loan',    'code' => 'TW'],
        ];

        foreach ($countries as $country) {
            Country::firstOrCreate(['code' => $country['code']], [
                'name'     => $country['name'],
                'code'     => $country['code'],
                'flag_url' => null,
            ]);
        }
    }
}

