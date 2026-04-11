<?php

namespace App\Http\Requests\Episode;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEpisodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'episode_number' => ['sometimes', 'required', 'integer', 'min:1'],
            'arc_name'       => ['nullable', 'string', 'max:255'],
            'title'          => ['nullable', 'string', 'max:255'],
            'video_url'      => ['sometimes', 'required', 'string', 'max:2048'],
            'duration'       => ['nullable', 'integer', 'min:1'],
            'views'          => ['nullable', 'integer', 'min:0'],
        ];
    }
}

