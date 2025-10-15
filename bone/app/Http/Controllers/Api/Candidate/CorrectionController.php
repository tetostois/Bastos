<?php

namespace App\Http\Controllers\Api\Candidate;

use App\Http\Controllers\Controller;
use App\Models\ExamSubmission;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CorrectionController extends Controller
{
    /**
     * Récupérer toutes les corrections du candidat connecté
     */
    public function index(Request $request)
    {
        $candidateId = auth()->id();
        
        try {
            // Récupérer toutes les soumissions corrigées du candidat
            $submissions = ExamSubmission::where('candidate_id', $candidateId)
                ->where('status', 'graded')
                ->with(['candidate', 'examiner'])
                ->get();

            $corrections = [];

            foreach ($submissions as $submission) {
                // Extraire la certification et le module de l'exam_id
                preg_match('/^exam-(.*?)-(.*?)$/', $submission->exam_id, $matches);
                $certificationType = $matches[1] ?? 'unknown';
                $moduleId = $matches[2] ?? 'unknown';

                // Récupérer les questions de cette soumission
                $questions = ExamQuestion::where('certification_type', $certificationType)
                    ->where('module', $moduleId)
                    ->get()
                    ->keyBy('id');

                $submissionCorrections = [];
                $examinerNotes = $submission->examiner_notes ?? [];

                foreach ($submission->answers as $questionId => $candidateAnswer) {
                    $question = $questions->get($questionId);
                    if ($question && isset($examinerNotes[$questionId])) {
                        $note = $examinerNotes[$questionId];
                        
                        $submissionCorrections[] = [
                            'question_id' => $questionId,
                            'question_text' => $question->question_text,
                            'candidate_answer' => is_array($candidateAnswer) ? implode(', ', $candidateAnswer) : $candidateAnswer,
                            'score' => $note['score'] ?? 0,
                            'max_score' => $question->points,
                            'feedback' => $note['feedback'] ?? '',
                            'submission_id' => $submission->id,
                            'module' => $moduleId,
                            'certification_type' => $certificationType,
                            'graded_at' => $submission->graded_at,
                            'examiner_name' => $submission->examiner ? 
                                $submission->examiner->first_name . ' ' . $submission->examiner->last_name : 
                                'Examinateur'
                        ];
                    }
                }

                if (!empty($submissionCorrections)) {
                    $corrections[] = [
                        'submission_id' => $submission->id,
                        'module' => $moduleId,
                        'certification_type' => $certificationType,
                        'total_score' => $submission->total_score,
                        'graded_at' => $submission->graded_at,
                        'examiner_name' => $submission->examiner ? 
                            $submission->examiner->first_name . ' ' . $submission->examiner->last_name : 
                            'Examinateur',
                        'questions' => $submissionCorrections
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'corrections' => $corrections,
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des corrections : ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des corrections',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Récupérer les corrections pour une soumission spécifique
     */
    public function show(Request $request, string $submissionId)
    {
        $candidateId = auth()->id();
        
        try {
            $submission = ExamSubmission::where('id', $submissionId)
                ->where('candidate_id', $candidateId)
                ->where('status', 'graded')
                ->with(['candidate', 'examiner'])
                ->firstOrFail();

            // Extraire la certification et le module de l'exam_id
            preg_match('/^exam-(.*?)-(.*?)$/', $submission->exam_id, $matches);
            $certificationType = $matches[1] ?? 'unknown';
            $moduleId = $matches[2] ?? 'unknown';

            // Récupérer les questions de cette soumission
            $questions = ExamQuestion::where('certification_type', $certificationType)
                ->where('module', $moduleId)
                ->get()
                ->keyBy('id');

            $corrections = [];
            $examinerNotes = $submission->examiner_notes ?? [];

            foreach ($submission->answers as $questionId => $candidateAnswer) {
                $question = $questions->get($questionId);
                if ($question && isset($examinerNotes[$questionId])) {
                    $note = $examinerNotes[$questionId];
                    
                    $corrections[] = [
                        'question_id' => $questionId,
                        'question_text' => $question->question_text,
                        'candidate_answer' => is_array($candidateAnswer) ? implode(', ', $candidateAnswer) : $candidateAnswer,
                        'score' => $note['score'] ?? 0,
                        'max_score' => $question->points,
                        'feedback' => $note['feedback'] ?? '',
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'corrections' => $corrections,
                'submission' => [
                    'id' => $submission->id,
                    'module' => $moduleId,
                    'certification_type' => $certificationType,
                    'total_score' => $submission->total_score,
                    'graded_at' => $submission->graded_at,
                    'examiner_name' => $submission->examiner ? 
                        $submission->examiner->first_name . ' ' . $submission->examiner->last_name : 
                        'Examinateur'
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des corrections de la soumission : ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des corrections',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
