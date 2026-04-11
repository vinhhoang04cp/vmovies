<?php

namespace App\Http\Requests\Director;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDirectorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name'      => ['sometimes', 'required', 'string', 'max:150'],
            'bio'       => ['nullable', 'string', 'max:2000'],
            'image_url' => ['nullable', 'string', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên đạo diễn là bắt buộc.',
        ];
    }
}

