<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('messages', function (Blueprint $table) {
      $table->text('content')->nullable()->change();
      if (!Schema::hasColumn('messages', 'image_path')) {
        $table->string('image_path')->nullable()->after('content');
      }
      if (!Schema::hasColumn('messages', 'type')) {
        $table->string('type')->default('text')->after('image_path');
      }
    });
  }

  public function down(): void
  {
    Schema::table('messages', function (Blueprint $table) {
      if (Schema::hasColumn('messages', 'image_path')) {
        $table->dropColumn('image_path');
      }
      if (Schema::hasColumn('messages', 'type')) {
        $table->dropColumn('type');
      }
    });
  }
};
