<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\PostViewController;
use Illuminate\Console\Command;

class FlushPostViewBuffers extends Command
{
  protected $signature = 'views:flush-buffers';
  protected $description = 'Flush Redis-buffered post view counts (no-op if Redis not configured)';

  public function handle(): int
  {
    $flushed = PostViewController::flushBuffers();
    $this->info("Flushed {$flushed} buffered views.");
    return self::SUCCESS;
  }
}
