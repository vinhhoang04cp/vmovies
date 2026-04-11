<?php

namespace App\Http\Requests\Genre;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGenreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name'        => ['sometimes', 'required', 'string', 'max:100'],
            'slug'        => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9\-]+$/'],
            'description' => ['nullable', 'string', 'max:500'],
            'icon_url'    => ['nullable', 'string', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => 'Tên thể loại là bắt buộc.',
            'name.max'       => 'Tên thể loại không vượt quá 100 ký tự.',
            'slug.regex'     => 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang.',
        ];
    }
}

