<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;

$user = User::find(1);
$user->posts()->get();
