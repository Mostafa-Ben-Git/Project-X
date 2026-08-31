<?php

use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

function mockSocialUser(array $attrs): SocialiteUser
{
    $user = new SocialiteUser;

    $user->id = $attrs['id'] ?? '123456';
    $user->nickname = $attrs['nickname'] ?? null;
    $user->name = array_key_exists('name', $attrs) ? $attrs['name'] : 'Ada Lovelace';
    $user->email = array_key_exists('email', $attrs) ? $attrs['email'] : 'ada@example.test';
    $user->avatar = $attrs['avatar'] ?? 'https://provider.example/avatar.png';
    $user->token = $attrs['token'] ?? 'provider-token';

    return $user;
}

function fakeDriver(string $provider, SocialiteUser $socialUser, ?Throwable $throw = null): void
{
    $mock = Mockery::mock();
    $mock->shouldReceive('stateless')->andReturnSelf();

    if ($throw) {
        $mock->shouldReceive('user')->andThrow($throw);
    } else {
        $mock->shouldReceive('user')->andReturn($socialUser);
        $mock->shouldReceive('redirect')->andReturnSelf();
        $mock->shouldReceive('getTargetUrl')->andReturn("https://{$provider}.example.com/oauth/authorize?client_id=x");
    }

    Socialite::shouldReceive('driver')->with($provider)->andReturn($mock);
}

test('oauth redirect returns a provider url', function () {
    fakeDriver('github', mockSocialUser([]));

    $response = $this->getJson('/api/auth/github/redirect');

    $response->assertOk()
        ->assertJsonStructure(['url']);
});

test('unknown provider is not routable', function () {
    $this->getJson('/api/auth/twitter/redirect')->assertNotFound();
});

test('callback creates user and social account then redirects with token', function () {
    config()->set('app.frontend_url', 'http://localhost:3000');

    fakeDriver('github', mockSocialUser([
        'id' => 'gh-1',
        'nickname' => 'ada-lovelace',
        'email' => 'ada@example.test',
    ]));

    $response = $this->get('/api/auth/github/callback');

    $user = User::where('email', 'ada@example.test')->first();

    expect($user)->not->toBeNull()
        ->and($user->password)->toBeNull()
        ->and($user->email_verified_at)->not->toBeNull()
        ->and(preg_match('/^[a-z0-9_]{5,20}$/', $user->username))->toBe(1);

    expect(SocialAccount::where('provider', 'github')->where('provider_id', 'gh-1')->exists())->toBeTrue();

    $location = $response->headers->get('Location');
    expect($response->status())->toBe(302)
        ->and($location)->toStartWith('http://localhost:3000/auth/callback?')
        ->and($location)->toContain('token=');
});

test('callback merges into existing account with the same email', function () {
    config()->set('app.frontend_url', 'http://localhost:3000');

    $existing = User::factory()->create([
        'email' => 'merge@example.test',
        'password' => Hash::make('secret1234'),
    ]);

    fakeDriver('google', mockSocialUser([
        'id' => 'g-777',
        'name' => 'Grace Hopper',
        'email' => 'merge@example.test',
    ]));

    $response = $this->get('/api/auth/google/callback');
    $response->assertRedirect();

    $fresh = $existing->fresh();

    expect(User::where('email', 'merge@example.test')->count())->toBe(1)
        ->and($fresh->id)->toBe($existing->id)
        ->and(Hash::check('secret1234', $fresh->password))->toBeTrue()
        ->and($fresh->socialAccounts()->where('provider', 'google')->exists())->toBeTrue();
});

test('second login reuses the same social account and issues fresh token only', function () {
    config()->set('app.frontend_url', 'http://localhost:3000');

    fakeDriver('google', mockSocialUser(['id' => 'g-42', 'email' => 'twice@example.test']));
    $this->get('/api/auth/google/callback');

    $firstUser = User::where('email', 'twice@example.test')->first();

    fakeDriver('google', mockSocialUser(['id' => 'g-42', 'email' => 'twice@example.test']));
    $this->get('/api/auth/google/callback');

    expect(User::where('email', 'twice@example.test')->count())->toBe(1)
        ->and(SocialAccount::where('provider_id', 'g-42')->count())->toBe(1)
        ->and($firstUser->tokens()->count())->toBe(1);
});

test('callback without email redirects to frontend with error', function () {
    config()->set('app.frontend_url', 'http://localhost:3000');

    fakeDriver('github', mockSocialUser(['email' => null]));

    $response = $this->get('/api/auth/github/callback');

    expect($response->status())->toBe(302)
        ->and($response->headers->get('Location'))->toContain('error=email_unavailable');

    expect(User::count())->toBe(0);
});

test('callback with provider error redirects to frontend with error', function () {
    config()->set('app.frontend_url', 'http://localhost:3000');

    $response = $this->get('/api/auth/github/callback?error=access_denied');

    expect($response->status())->toBe(302)
        ->and($response->headers->get('Location'))->toContain('error=provider_denied');
});
