<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MarkStaleUsersOffline extends Command
{
    protected $signature = 'users:mark-offline {--minutes=5 : Minutes of inactivity before marking offline}';

    protected $description = 'Set status to offline for users inactive for longer than the threshold';

    public function handle(): int
    {
        $threshold = now()->subMinutes((int) $this->option('minutes'));

        $count = User::where('status', '!=', 'offline')
            ->where('status', '!=', 'hidden')
            ->where(function ($q) use ($threshold) {
                $q->whereNull('last_active_at')
                  ->orWhere('last_active_at', '<', $threshold);
            })
            ->update(['status' => 'offline']);

        if ($count > 0) {
            $this->info("Marked {$count} user(s) as offline.");
        }

        return Command::SUCCESS;
    }
}
