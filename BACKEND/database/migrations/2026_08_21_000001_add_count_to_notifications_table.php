<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('notifications', function (Blueprint $table) {
      $table->unsignedInteger('count')->default(1)->after('message_id');
    });
  }

  public function down(): void
  {
    Schema::table('notifications', function (Blueprint $table) {
      $table->dropColumn('count');
    });
  }
};
