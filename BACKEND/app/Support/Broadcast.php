<?php

namespace App\Support;

use Illuminate\Support\Facades\Log;

class Broadcast
{
    /**
     * Dispatch a broadcastable event, swallowing connection errors so a
     * down WebSocket server never breaks the underlying API request.
     */
    public static function safe($event)
    {
        try {
            broadcast($event);
        } catch (\Throwable $e) {
            Log::debug('broadcast skip: ' . $e->getMessage());
        }
    }
}
