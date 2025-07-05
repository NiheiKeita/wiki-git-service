<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('pull_requests', function (Blueprint $table) {
      $table->id();
      $table->foreignId('repository_id')->constrained()->onDelete('cascade');
      $table->foreignId('source_branch_id')->constrained('branches')->onDelete('cascade');
      $table->foreignId('target_branch_id')->constrained('branches')->onDelete('cascade');
      $table->foreignId('article_id')->constrained()->onDelete('cascade');
      $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
      $table->string('title');
      $table->text('description')->nullable();
      $table->enum('status', ['open', 'merged', 'closed'])->default('open');
      $table->foreignId('merged_by')->nullable()->constrained('users')->onDelete('set null');
      $table->timestamp('merged_at')->nullable();
      $table->timestamps();

      $table->index(['repository_id', 'status']);
      $table->index(['source_branch_id', 'target_branch_id']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('pull_requests');
  }
};
