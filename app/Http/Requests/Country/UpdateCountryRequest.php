<?php

namespace App\Http\Requests\Country;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCountryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'code' => ['sometimes', 'required', 'string', 'max:5', 'regex:/^[A-Za-z]+$/'],
            'flag_url' => ['nullable', 'string', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên quốc gia là bắt buộc.',
            'code.required' => 'Mã quốc gia là bắt buộc.',
            'code.max' => 'Mã quốc gia không vượt quá 5 ký tự.',
            'code.regex' => 'Mã quốc gia chỉ được chứa chữ cái.',
        ];
    }
}
