<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization handled in controller (profile ownership check)
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id ?? $this->user()?->id;

        return [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:255|unique:users,username,'.$userId,
            'email' => 'sometimes|email|max:255|unique:users,email,'.$userId,
            'bio' => 'nullable|string|max:500',
            'date_de_naissance' => 'nullable|date|before:today',
            'statut' => 'nullable|string|max:255',
            'genre' => 'nullable|string|max:50',
            'adresse' => 'nullable|string|max:255',
            'ville_origine' => 'nullable|string|max:255',
            'ville_habituelle' => 'nullable|string|max:255',
            'situation_amoureuse' => 'nullable|string|max:255',
            'interets' => 'nullable|string|max:500',
            'education' => 'nullable|string|max:255',
            'liens_sociaux' => 'nullable|array',
            'is_private' => 'sometimes|boolean',
            'show_online_status' => 'sometimes|boolean',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'username.unique' => 'This username is already taken.',
            'email.unique' => 'This email address is already in use.',
            'email.email' => 'Please provide a valid email address.',
            'avatar.image' => 'Avatar must be an image file.',
            'avatar.mimes' => 'Avatar must be jpeg, png, jpg, gif, or webp.',
            'avatar.max' => 'Avatar must be less than 5MB.',
            'cover_image.image' => 'Cover image must be an image file.',
            'cover_image.mimes' => 'Cover image must be jpeg, png, jpg, gif, or webp.',
            'cover_image.max' => 'Cover image must be less than 5MB.',
            'date_de_naissance.before' => 'Date of birth must be in the past.',
        ];
    }
}
