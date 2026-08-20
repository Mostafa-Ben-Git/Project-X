<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ServeAll extends Command
{
    protected $signature = 'serve:all {--port=8000 : API port} {--reverb-port=8080 : Reverb WebSocket port}';

    protected $description = 'Start API server, Reverb WebSocket, and scheduler in one command';

    public function handle(): int
    {
        $port = $this->option('port');
        $reverbPort = $this->option('reverb-port');
        $php = PHP_BINARY;
        $artisan = base_path('artisan');

        $this->info('');
        $this->info('╔══════════════════════════════════════╗');
        $this->info('║       Project-X — Starting All       ║');
        $this->info('╚══════════════════════════════════════╝');
        $this->info('');
        $this->info("  API server    → http://localhost:{$port}");
        $this->info("  Reverb        → ws://localhost:{$reverbPort}");
        $this->info("  Scheduler     → every minute");
        $this->info('  Frontend      → http://localhost:5173');
        $this->info('');
        $this->info('  Press Ctrl+C to stop all servers.');
        $this->info('');

        // Build a single shell command that starts all three in background
        $cmd = sprintf(
            'start "API" cmd /c "%s %s serve --host=localhost --port=%d > nul 2>&1" && ' .
            'start "Reverb" cmd /c "%s %s reverb:start --port=%d > nul 2>&1" && ' .
            'start "Scheduler" cmd /c "%s %s schedule:work > nul 2>&1"',
            $php, $artisan, $port,
            $php, $artisan, $reverbPort,
            $php, $artisan
        );

        exec($cmd);

        // Wait for Ctrl+C
        $this->info('All 3 backend processes started as separate windows.');
        $this->info('Close the spawned windows or press Ctrl+C here to stop.');

        // Keep alive until interrupted
        try {
            while (true) {
                sleep(5);
            }
        } catch (\Throwable $e) {
            // Ctrl+C
        }

        $this->info('Stopped.');
        return Command::SUCCESS;
    }
}
