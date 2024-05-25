<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return  [
            'first_name' => 'required|string|max:20',
            'last_name' => 'required|string|max:20',
            'email' => 'required|email|string|unique:users,email',
            'avatar'=>'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'password' => [
                'required',
                'confirmed',
                // Password::min(4)->mixedCase()->numbers()->symbols()
                Password::default()
            ]
        ];;
    }
}
