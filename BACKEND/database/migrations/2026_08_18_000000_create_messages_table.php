<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('messages', function (Blueprint $table) {
      $table->uuid("id")->primary();
      $table->uuid('sender_id');
      $table->uuid('receiver_id');
      $table->text('content');
      $table->timestamp('read_at')->nullable();
      $table->timestamps();

      $table->index(['sender_id', 'receiver_id']);
      $table->index(['receiver_id', 'sender_id']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('messages');
  }
};
