<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'content' => 'nullable|string|max:10000',
      'parent_id' => 'nullable|integer|exists:posts,id',
      'images' => 'nullable|array|max:5',
      'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
    ];
  }

  public function messages(): array
  {
    return [
      'content.max' => 'Post content must not exceed 10,000 characters.',
      'images.max' => 'You can upload a maximum of 5 images.',
      'images.*.image' => 'Each file must be an image.',
      'images.*.mimes' => 'Images must be jpeg, png, jpg, gif, or webp.',
      'images.*.max' => 'Each image must be less than 5MB.',
    ];
  }
}
