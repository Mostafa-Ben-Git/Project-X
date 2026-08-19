<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\TokenLoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class TokenAuthController extends Controller
{
    /**
     * Authenticate user and return personal access token.
     */
    public function login(TokenLoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Revoke old tokens for clean session
        $user->tokens()->delete();

        // "Remember me" = long-lived token, otherwise a short one.
        $remember = $request->boolean('remember');
        $expiry = $remember ? now()->addDays(30) : now()->addDay();

        // Create new token
        $token = $user->createToken('auth-token', ['*'], $expiry)->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Revoke current access token (logout).
     */
    public function logout(Request $request): Response
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request): UserResource
    {
        $user = $request->user();
        $user->update(['last_active_at' => now()]);
        $user->loadCount(['followers', 'followings', 'posts']);
        return new UserResource($user);
    }
}
