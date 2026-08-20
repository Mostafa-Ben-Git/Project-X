<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ServeAll extends Command
{
    protected $signature = 'serve:all {--port=8000 : API port} {--reverb-port=8080 : Reverb port}';

    protected $description = 'Start API server, Reverb WebSocket, and scheduler in this window';

    public function handle(): int
    {
        $port = $this->option('port');
        $reverbPort = $this->option('reverb-port');
        $php = PHP_BINARY;
        $artisan = base_path('artisan');

        $this->info('');
        $this->info('  Project-X — Starting all services...');
        $this->info("  API       → http://localhost:{$port}");
        $this->info("  Reverb    → ws://localhost:{$reverbPort}");
        $this->info("  Scheduler → every minute");
        $this->info('  Press Ctrl+C to stop.');
        $this->info('');

        $cmds = [
            [$php, $artisan, 'serve', "--port={$port}"],
            [$php, $artisan, 'reverb:start', "--port={$reverbPort}"],
            [$php, $artisan, 'schedule:work'],
        ];

        $procs = [];
        foreach ($cmds as $cmd) {
            $procs[] = popen(implode(' ', array_map('escapeshellarg', $cmd)) . ' 2>&1', 'r');
        }

        while (true) {
            $running = false;
            foreach ($procs as $i => $proc) {
                if (feof($proc)) {
                    pclose($proc);
                    $procs[$i] = null;
                    continue;
                }
                $running = true;
                $line = fgets($proc, 1024);
                if ($line !== false && trim($line) !== '') {
                    $label = ['API', 'Reverb', 'Scheduler'][$i] ?? '?';
                    $this->line("<fg=gray>[{$label}]</> " . trim($line));
                }
            }

            if (!$running) {
                break;
            }

            usleep(100000);
        }

        $this->info('All services stopped.');
        return Command::SUCCESS;
    }
}
