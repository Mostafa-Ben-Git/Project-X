<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::create('followers', function (Blueprint $table) {
      $table->uuid('id')->primary();
      $table->uuid('follower_id');
      $table->uuid('following_id');
      $table->timestamps();

      // Ensure that a user cannot follow the same user more than once
      $table->unique(['follower_id', 'following_id']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('followers');
  }
};
