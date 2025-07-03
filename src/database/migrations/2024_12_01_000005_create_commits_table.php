<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('commits', function (Blueprint $table) {
      $table->id();
      $table->foreignId('repository_id')->constrained()->onDelete('cascade');
      $table->foreignId('branch_id')->constrained()->onDelete('cascade');
      $table->foreignId('article_id')->constrained()->onDelete('cascade');
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->string('hash')->unique();
      $table->string('message');
      $table->text('content_before')->nullable();
      $table->text('content_after');
      $table->json('changes')->nullable();
      $table->timestamps();

      $table->index(['repository_id', 'branch_id']);
      $table->index(['article_id', 'created_at']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('commits');
  }
};
