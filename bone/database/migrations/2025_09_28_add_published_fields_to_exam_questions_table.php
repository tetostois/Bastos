<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('exam_questions', function (Blueprint $table) {
            $table->boolean('is_published')->default(false)->after('answer_options');
            $table->timestamp('published_at')->nullable()->after('is_published');
        });
    }

    public function down()
    {
        Schema::table('exam_questions', function (Blueprint $table) {
            $table->dropColumn(['is_published', 'published_at']);
        });
    }
};
