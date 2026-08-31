<?php

use App\Events\UserStatusBroadcast;
use App\Models\User;

test('online status is shown by default to other viewers', function () {
    $viewer = User::factory()->create();
    $target = User::factory()->create(['show_online_status' => true, 'status' => 'online']);

    $response = $this->actingAs($viewer, 'sanctum')->getJson("/api/profiles/{$target->username}");
    $json = $response->json();

    expect($response->status())->toBe(200)
        ->and($json['status'])->toBe('online')
        ->and($json['last_active_at'])->not->toBeNull()
        ->and($json['show_online_status'])->toBeTrue();
});

test('disabled online status hides presence from other viewers', function () {
    $viewer = User::factory()->create();
    $hidden = User::factory()->create([
        'show_online_status' => false,
        'status' => 'online',
        'last_active_at' => now(),
    ]);

    $response = $this->actingAs($viewer, 'sanctum')->getJson("/api/profiles/{$hidden->username}");
    $json = $response->json();

    expect($response->status())->toBe(200)
        ->and($json['status'])->toBe('offline')
        ->and($json['last_active_at'])->toBeNull();
});

test('users always see their own real status even when hidden', function () {
    $self = User::factory()->create([
        'show_online_status' => false,
        'status' => 'online',
        'last_active_at' => now(),
    ]);

    $response = $this->actingAs($self, 'sanctum')->getJson('/api/user');
    $json = $response->json();

    expect($response->status())->toBe(200)
        ->and($json['status'])->toBe('online')
        ->and($json['last_active_at'])->not->toBeNull();
});

test('the toggle persists through profile update', function () {
    $user = User::factory()->create(['show_online_status' => true]);

    $this->actingAs($user, 'sanctum')
        ->putJson("/api/users/{$user->id}", ['show_online_status' => false])
        ->assertOk();

    expect($user->fresh()->show_online_status)->toBeFalse();

    $this->actingAs($user, 'sanctum')
        ->putJson("/api/users/{$user->id}", ['is_private' => true])
        ->assertOk();

    expect($user->fresh()->is_private)->toBeTrue();
});

test('status broadcasts are masked for hidden users', function () {
    $hidden = User::factory()->create([
        'show_online_status' => false,
        'status' => 'online',
        'last_active_at' => now(),
    ]);

    $payload = (new UserStatusBroadcast($hidden))->broadcastWith();

    expect($payload['status'])->toBe('offline')
        ->and($payload['last_active_at'])->toBeNull();
});

test('status broadcasts are unmasked when enabled', function () {
    $visible = User::factory()->create([
        'show_online_status' => true,
        'status' => 'away',
        'last_active_at' => now(),
    ]);

    $payload = (new UserStatusBroadcast($visible))->broadcastWith();

    expect($payload['status'])->toBe('away')
        ->and($payload['last_active_at'])->not->toBeNull();
});
