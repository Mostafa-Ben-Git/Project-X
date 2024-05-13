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
        Schema::table('users', function (Blueprint $table) {
            $table->date('date_de_naissance')->nullable();
            $table->string('cover_image')->nullable()->after('avatar');
            $table->text('bio')->nullable();
            $table->timestamp('derniere_connexion')->nullable();
            $table->enum('statut', ['en ligne', 'hors ligne'])->default('hors ligne');
            $table->enum('genre', ['masculin', 'féminin', 'autre'])->nullable();
            $table->string('adresse')->nullable();
            $table->string('ville origine')->nullable();
            $table->string('ville habituelle')->nullable();
            $table->string('Situation amoureuse')->nullable();
            $table->text('interets')->nullable();
            $table->string('education')->nullable();
            $table->json('liens_sociaux')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['date_de_naissance', 'cover_image', 'bio',
             'derniere_connexion', 'statut', 'genre', 'adresse', 'ville_origine', 'ville_habituelle', 
            'situation_amoureuse', 'interets', 'education', 'liens_sociaux']);
        });
    }
};
