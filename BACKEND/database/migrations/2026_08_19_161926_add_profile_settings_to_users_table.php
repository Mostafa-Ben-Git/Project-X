<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('users', function (Blueprint $table) {
      $table->string('phone')->nullable()->after('email');
      $table->string('website')->nullable()->after('phone');
      $table->string('location')->nullable()->after('website');
      $table->boolean('is_private')->default(false)->after('location');
      $table->string('language')->default('en')->after('is_private');
      $table->string('status')->default('online')->after('language');
    });
  }

  public function down(): void
  {
    Schema::table('users', function (Blueprint $table) {
      $table->dropColumn(['phone', 'website', 'location', 'is_private', 'language', 'status']);
    });
  }
};
