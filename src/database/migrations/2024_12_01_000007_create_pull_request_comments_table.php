<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('pull_request_comments', function (Blueprint $table) {
      $table->id();
      $table->foreignId('pull_request_id')->constrained()->onDelete('cascade');
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->text('content');
      $table->integer('line_number')->nullable();
      $table->string('line_content')->nullable();
      $table->timestamps();

      $table->index(['pull_request_id', 'created_at']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('pull_request_comments');
  }
};
