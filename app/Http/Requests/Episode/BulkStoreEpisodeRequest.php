<?php

namespace App\Http\Requests\Episode;

use Illuminate\Foundation\Http\FormRequest;

class BulkStoreEpisodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'movie_id'                     => ['required', 'integer', 'exists:movies,id'],
            'episodes'                     => ['required', 'array', 'min:1'],
            'episodes.*.episode_number'    => ['required', 'integer', 'min:1'],
            'episodes.*.arc_name'          => ['nullable', 'string', 'max:255'],
            'episodes.*.title'             => ['nullable', 'string', 'max:255'],
            'episodes.*.video_url'         => ['required', 'string', 'max:2048'],
            'episodes.*.duration'          => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'episodes.required'                  => 'Danh sách tập phim là bắt buộc.',
            'episodes.*.episode_number.required' => 'Số tập là bắt buộc.',
            'episodes.*.video_url.required'      => 'Link video là bắt buộc.',
        ];
    }
}

