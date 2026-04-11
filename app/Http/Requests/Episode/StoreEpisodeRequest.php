<?php

namespace App\Http\Requests\Episode;

use Illuminate\Foundation\Http\FormRequest;

class StoreEpisodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'episode_number' => ['required', 'integer', 'min:1'],
            'arc_name'       => ['nullable', 'string', 'max:255'],
            'title'          => ['nullable', 'string', 'max:255'],
            'video_url'      => ['required', 'string', 'max:2048'],
            'duration'       => ['nullable', 'integer', 'min:1'],
            'views'          => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'episode_number.required' => 'Số tập là bắt buộc.',
            'episode_number.min'      => 'Số tập phải lớn hơn 0.',
            'video_url.required'      => 'Link video là bắt buộc.',
            'duration.min'            => 'Thời lượng phải lớn hơn 0.',
        ];
    }
}

