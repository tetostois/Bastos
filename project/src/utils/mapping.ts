// Mapping utilitaires entre schémas backend et frontend

import { Question } from '../types';

type BackendQuestionType = 'qcm' | 'free_text';

interface BackendQuestion {
  id: number | string;
  question_type: BackendQuestionType;
  question_text: string;
  answer_options?: string[] | null;
  points: number;
  // champs additionnels ignorés si présents
  [key: string]: unknown;
}

export function mapBackendQuestionToFrontend(q: BackendQuestion): Question {
  const type: Question['type'] = q.question_type === 'qcm' ? 'multiple-choice' : 'text';
  return {
    id: String(q.id),
    text: q.question_text,
    type,
    options: Array.isArray(q.answer_options) ? q.answer_options : undefined,
    points: Number(q.points ?? 1),
    category: 'exam',
  };
}

export function mapBackendQuestionsToFrontend(list: BackendQuestion[]): Question[] {
  return (list || []).map(mapBackendQuestionToFrontend);
}


