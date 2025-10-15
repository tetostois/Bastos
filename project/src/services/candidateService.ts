import apiRequest from '../config/api';

export interface CorrectionDetails {
  question_id: string;
  question_text: string;
  candidate_answer: string;
  score: number;
  max_score: number;
  feedback: string;
}

export interface CorrectionResponse {
  success: boolean;
  corrections: CorrectionDetails[];
}

export const CandidateService = {
  /**
   * Récupérer les corrections détaillées pour un candidat
   */
  getCorrections: async (): Promise<CorrectionResponse> => {
    return apiRequest('/candidate/corrections', 'GET');
  },

  /**
   * Récupérer les corrections pour une soumission spécifique
   */
  getSubmissionCorrections: async (submissionId: string): Promise<CorrectionResponse> => {
    return apiRequest(`/candidate/corrections/${submissionId}`, 'GET');
  },
};
