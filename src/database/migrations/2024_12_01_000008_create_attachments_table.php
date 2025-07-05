<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('attachments', function (Blueprint $table) {
      $table->id();
      $table->foreignId('repository_id')->constrained()->onDelete('cascade');
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->string('filename');
      $table->string('original_filename');
      $table->string('mime_type');
      $table->bigInteger('file_size');
      $table->string('file_path');
      $table->timestamps();

      $table->index(['repository_id', 'created_at']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('attachments');
  }
};
