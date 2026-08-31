<?php

namespace App\Http\Controllers\Api;

use App\Events\UserStatusBroadcast;
use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use App\Support\Broadcast;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

class OAuthController extends Controller
{
    private const PROVIDERS = ['google', 'github'];

    public function redirect(string $provider): JsonResponse
    {
        abort_unless(in_array($provider, self::PROVIDERS, true), 404);

        return response()->json([
            'url' => Socialite::driver($provider)->stateless()->redirect()->getTargetUrl(),
        ]);
    }

    public function callback(Request $request, string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, self::PROVIDERS, true), 404);

        if ($request->filled('error')) {
            return $this->toFrontend(['error' => 'provider_denied']);
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('OAuth callback failed', [
                'provider' => $provider,
                'error' => $e->getMessage(),
                'code' => $request->query('code') ? substr($request->query('code'), 0, 8) . '...' : null,
            ]);

            return $this->toFrontend(['error' => 'oauth_failed', 'detail' => app()->hasDebugModeEnabled() ? substr($e->getMessage(), 0, 120) : null]);
        }

        $email = $socialUser->getEmail();
        if (! $email) {
            return $this->toFrontend(['error' => 'email_unavailable']);
        }

        $user = DB::transaction(function () use ($provider, $socialUser, $email) {
            $account = SocialAccount::query()
                ->where('provider', $provider)
                ->where('provider_id', (string) $socialUser->getId())
                ->first();

            if ($account) {
                $account->update([
                    'provider_token' => $socialUser->token ?? $account->provider_token,
                    'avatar' => $socialUser->getAvatar() ?? $account->avatar,
                ]);

                return $account->user;
            }

            // Auto-merge: same email = same account, regardless of sign-up method.
            $user = User::where('email', $email)->first();

            if (! $user) {
                [$firstName, $lastName] = $this->splitName($socialUser);

                $user = (new User)->forceFill([
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'username' => $this->uniqueUsername($socialUser->getNickname() ?: $firstName.$lastName),
                    'email' => $email,
                    'password' => null,
                    'avatar' => $socialUser->getAvatar() ?: $this->defaultAvatar($firstName, $lastName),
                    'email_verified_at' => now(),
                ]);
                $user->save();
            } else {
                $user->forceFill(['email_verified_at' => $user->email_verified_at ?? now()])->save();
            }

            $user->socialAccounts()->create([
                'provider' => $provider,
                'provider_id' => (string) $socialUser->getId(),
                'provider_token' => $socialUser->token ?? null,
                'avatar' => $socialUser->getAvatar(),
            ]);

            return $user;
        });

        $user->tokens()->delete();
        $token = $user->createToken('auth-token', ['*'], now()->addDays(30))->plainTextToken;

        $user->update(['status' => 'online', 'last_active_at' => now()]);
        Broadcast::safe(new UserStatusBroadcast($user));

        return $this->toFrontend(['token' => $token]);
    }

    private function toFrontend(array $params): RedirectResponse
    {
        $base = rtrim(config('app.frontend_url', 'http://localhost:8000'), '/');

        return redirect()->away($base.'/auth/callback?'.http_build_query($params));
    }

    private function splitName(SocialiteUser $socialUser): array
    {
        $parts = array_values(array_filter(explode(' ', trim((string) $socialUser->getName()))));

        if ($parts === []) {
            $fallback = trim((string) ($socialUser->getNickname() ?: 'User'));

            return [$fallback, ''];
        }

        return [$parts[0], implode(' ', array_slice($parts, 1))];
    }

    private function uniqueUsername(string $base): string
    {
        $slug = Str::slug(Str::lower(trim($base)), '_');
        $root = substr(preg_replace('/[^a-z0-9_]/', '', $slug) ?: 'user', 0, 14);

        do {
            $candidate = $root.random_int(1000, 9999);
        } while (User::where('username', $candidate)->exists());

        return $candidate;
    }

    private function defaultAvatar(string $firstName, string $lastName): string
    {
        return 'https://ui-avatars.com/api/?name='.urlencode(trim($firstName.' '.$lastName)).'&background=random';
    }
}
