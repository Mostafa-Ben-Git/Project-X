<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    // Add counter cache to posts (efficient read path — no COUNT queries on feed)
    Schema::table('posts', function (Blueprint $table) {
      if (!Schema::hasColumn('posts', 'views_count')) {
        $table->unsignedBigInteger('views_count')->default(0)->after('parent_id');
        $table->index('views_count');
      }
    });

    // Deduplication + audit for views (per-user unique, IP fallback for guests)
    if (!Schema::hasTable('post_views')) {
      Schema::create('post_views', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->uuid('post_id')->index();
        $table->uuid('user_id')->nullable()->index();
        $table->string('ip_hash', 64)->nullable()->index();
        $table->timestamps();

        $table->foreign('post_id')->references('id')->on('posts')->cascadeOnDelete();
        // Unique per post per user (null user_id rows use ip_hash, not constrained here)
        $table->unique(['post_id', 'user_id']);
        $table->index(['post_id', 'created_at']);
      });
    }

    // Bookmarks (Like-parity, efficient toggle + paginated fetch)
    if (!Schema::hasTable('bookmarks')) {
      Schema::create('bookmarks', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->uuid('user_id')->index();
        $table->uuid('post_id')->index();
        $table->timestamps();

        $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        $table->foreign('post_id')->references('id')->on('posts')->cascadeOnDelete();
        $table->unique(['user_id', 'post_id']);
        $table->index(['user_id', 'created_at']);
      });
    }
  }

  public function down(): void
  {
    Schema::dropIfExists('bookmarks');
    Schema::dropIfExists('post_views');
    Schema::table('posts', function (Blueprint $table) {
      if (Schema::hasColumn('posts', 'views_count')) {
        $table->dropColumn('views_count');
      }
    });
  }
};
