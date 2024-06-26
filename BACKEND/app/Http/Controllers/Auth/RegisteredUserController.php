<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
  /**
   * Handle an incoming registration request.
   *
   * @throws \Illuminate\Validation\ValidationException
   */
  public function store(RegisterRequest $request): Response
  {


    $data = $request->validated();

    if ($request->hasFile('avatar')) {
      $avatarName =  time() . '.' . $request->avatar->extension();

      $request->avatar->move(public_path('images/avatars/'), $avatarName);

      $data['avatar'] = asset('images/avatars/' . $avatarName);
    } else {
      $data['avatar'] = 'https://ui-avatars.com/api/?name=' . urlencode($data["first_name"] . ' ' . $data["last_name"]) . '&background=random';
    }

    // return response($data, 200);

    $user = User::create($data);

    event(new Registered($user));

    Auth::login($user);

    return response()->noContent();
  }
}
