<?php

namespace App\Http\Requests\Movie;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMovieRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $movieId = $this->route('movie');

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'original_title' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('movies', 'slug')->ignore($movieId)],
            'poster_url' => ['nullable', 'string', 'max:2048'],
            'banner_url' => ['nullable', 'string', 'max:2048'],
            'trailer_url' => ['nullable', 'string', 'max:2048'],
            'summary' => ['nullable', 'string'],
            'release_year' => ['nullable', 'integer', 'min:1900', 'max:'.(date('Y') + 1)],
            'status' => ['nullable', Rule::in(['ongoing', 'completed'])],
            'type' => ['sometimes', 'required', Rule::in(['movie', 'series'])],
            'genres' => ['nullable', 'array'],
            'genres.*' => ['integer', 'exists:genres,id'],
            'countries' => ['nullable', 'array'],
            'countries.*' => ['integer', 'exists:countries,id'],
            'directors' => ['nullable', 'array'],
            'directors.*' => ['integer', 'exists:directors,id'],
            'actors' => ['nullable', 'array'],
            'actors.*.id' => ['required', 'integer', 'exists:actors,id'],
            'actors.*.role_name' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Tên phim là bắt buộc.',
            'type.in' => 'Loại phim phải là movie hoặc series.',
            'status.in' => 'Trạng thái phải là ongoing hoặc completed.',
            'slug.unique' => 'Slug đã tồn tại, vui lòng dùng slug khác.',
            'release_year.min' => 'Năm phát hành không hợp lệ.',
            'genres.*.exists' => 'Thể loại không tồn tại.',
            'countries.*.exists' => 'Quốc gia không tồn tại.',
            'directors.*.exists' => 'Đạo diễn không tồn tại.',
            'actors.*.id.exists' => 'Diễn viên không tồn tại.',
        ];
    }
}
