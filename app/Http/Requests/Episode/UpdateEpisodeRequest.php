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
            'video_url'      => ['nullable', 'string', 'max:2048'],
            'video_file'     => ['nullable', 'file', 'mimes:mp4,mov,avi,mkv,flv,wmv,webm', 'max:20971520'], // 20GB max
            'duration'       => ['nullable', 'integer', 'min:1'],
            'views'          => ['nullable', 'integer', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Nếu có file upload nhưng không có video_url, hãy set video_url tạm thời
        if ($this->hasFile('video_file') && !$this->filled('video_url')) {
            $this->merge(['video_url' => 'pending']);
        }
    }
}

