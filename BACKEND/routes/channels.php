<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user is authorized to listen on the
| channel.
|
*/

Broadcast::channel('user.{id}', function ($user, $id) {
    // Only the owner of the account can join their private channel.
    // IDs are UUID strings now, so compare as strings (casting to int would
    // break authorization because every UUID cast to int becomes 0).
    return (string) $user->id === (string) $id;
});

// Presence channel — all authenticated users join, everyone sees who's online.
Broadcast::channel('online-users', function ($user) {
    return [
        'id' => $user->id,
        'username' => $user->username,
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'avatar' => $user->avatar,
        'status' => $user->status,
    ];
});
