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
        Schema::table('pull_request_comments', function (Blueprint $table) {
            $table->string('article_slug')->nullable()->after('line_content');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pull_request_comments', function (Blueprint $table) {
            $table->dropColumn('article_slug');
        });
    }
};
