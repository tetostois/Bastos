<?php

namespace App\Http\Controllers\Api\Candidate;

use App\Http\Controllers\Controller;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'certification' => 'required|string',
            'module' => 'required|string',
        ]);

        $questions = ExamQuestion::query()
            ->where('certification_type', $validated['certification'])
            ->where('module', $validated['module'])
            ->where('is_published', true)
            ->orderBy('created_at')
            ->get()
            ->map(function ($question) {
                return [
                    'id' => $question->id,
                    'question_type' => $question->question_type,
                    'question_text' => $question->question_text,
                    'instructions' => $question->instructions,
                    'points' => $question->points,
                    'time_limit' => $question->time_limit,
                    'is_required' => $question->is_required,
                    'answer_options' => $question->answer_options,
                    'created_at' => $question->created_at,
                    'updated_at' => $question->updated_at,
                ];
            });

        return response()->json([
            'questions' => $questions,
            'total' => $questions->count(),
        ]);
    }
}
