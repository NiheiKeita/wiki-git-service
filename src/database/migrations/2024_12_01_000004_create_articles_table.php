<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('articles', function (Blueprint $table) {
      $table->id();
      $table->foreignId('repository_id')->constrained()->onDelete('cascade');
      $table->foreignId('branch_id')->constrained()->onDelete('cascade');
      $table->string('title');
      $table->text('content');
      $table->string('slug')->unique();
      $table->json('tags')->nullable();
      $table->boolean('is_published')->default(false);
      $table->timestamps();

      $table->index(['repository_id', 'branch_id']);
      $table->index(['slug', 'is_published']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('articles');
  }
};
