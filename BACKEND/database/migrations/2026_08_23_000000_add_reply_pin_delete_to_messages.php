<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('messages', function (Blueprint $table) {
      if (!Schema::hasColumn('messages', 'reply_to_id')) {
        $table->uuid('reply_to_id')->nullable()->after('receiver_id')->index();
        $table->foreign('reply_to_id')->references('id')->on('messages')->nullOnDelete();
      }
      if (!Schema::hasColumn('messages', 'is_pinned')) {
        $table->boolean('is_pinned')->default(false)->after('type')->index();
      }
      if (!Schema::hasColumn('messages', 'pinned_at')) {
        $table->timestamp('pinned_at')->nullable()->after('is_pinned');
      }
      if (!Schema::hasColumn('messages', 'pinned_by')) {
        $table->uuid('pinned_by')->nullable()->after('pinned_at');
      }
      if (!Schema::hasColumn('messages', 'deleted_at')) {
        $table->softDeletes()->after('pinned_by');
      }
    });
  }

  public function down(): void
  {
    Schema::table('messages', function (Blueprint $table) {
      if (Schema::hasColumn('messages', 'deleted_at')) {
        $table->dropColumn('deleted_at');
      }
      if (Schema::hasColumn('messages', 'pinned_by')) {
        $table->dropColumn('pinned_by');
      }
      if (Schema::hasColumn('messages', 'pinned_at')) {
        $table->dropColumn('pinned_at');
      }
      if (Schema::hasColumn('messages', 'is_pinned')) {
        $table->dropColumn('is_pinned');
      }
      if (Schema::hasColumn('messages', 'reply_to_id')) {
        try { $table->dropForeign(['reply_to_id']); } catch (\Throwable $e) {}
        $table->dropColumn('reply_to_id');
      }
    });
  }
};
