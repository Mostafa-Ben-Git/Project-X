<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('notifications', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->foreignId('from_user_id')->nullable()->constrained('users')->onDelete('set null');
      $table->string('type'); // follow, like, comment, message
      $table->text('content')->nullable();
      $table->foreignId('post_id')->nullable()->constrained('posts')->onDelete('cascade');
      $table->foreignId('message_id')->nullable()->constrained('messages')->onDelete('cascade');
      $table->timestamp('read_at')->nullable();
      $table->timestamps();

      $table->index('user_id');
      $table->index(['user_id', 'read_at']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('notifications');
  }
};
