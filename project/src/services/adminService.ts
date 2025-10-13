import apiRequest from '../config/api';

export interface ExamSubmission {
  id: string;
  exam_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  answers: Record<string, any>;
  status: 'draft' | 'submitted' | 'under_review' | 'graded';
  started_at: string;
  submitted_at?: string;
  graded_at?: string;
  total_score: number;
  examiner_id?: string;
  examiner_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Examiner {
  id: string;
  name: string;
  email: string;
  specialization: string;
  assigned_count: number;
  is_available: boolean;
}

export interface AdminStats {
  total_submissions: number;
  submitted: number;
  under_review: number;
  graded: number;
  pending_assignment: number;
}

export class AdminService {
  /**
   * Récupérer toutes les soumissions d'examens
   */
  static async getExamSubmissions(filters?: {
    status?: string;
    certification_type?: string;
    module?: string;
    examiner_id?: string;
  }): Promise<{ success: boolean; submissions: ExamSubmission[]; pagination?: any }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.certification_type) params.append('certification_type', filters.certification_type);
    if (filters?.module) params.append('module', filters.module);
    if (filters?.examiner_id) params.append('examiner_id', filters.examiner_id);

    const queryString = params.toString();
    const endpoint = `/admin/exam-submissions${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint, 'GET');
  }

  /**
   * Récupérer une soumission spécifique
   */
  static async getExamSubmission(id: string): Promise<{ success: boolean; submission: ExamSubmission; questions?: any[] }> {
    return apiRequest(`/admin/exam-submissions/${id}`, 'GET');
  }

  /**
   * Assigner un examinateur à une soumission
   */
  static async assignExaminer(submissionId: string, examinerId: string): Promise<{ success: boolean; message: string; submission: ExamSubmission }> {
    return apiRequest(`/admin/exam-submissions/${submissionId}/assign`, 'POST', {
      examiner_id: examinerId
    });
  }

  /**
   * Récupérer les statistiques des soumissions
   */
  static async getSubmissionStats(): Promise<{ success: boolean; stats: AdminStats }> {
    return apiRequest('/admin/exam-submissions-stats', 'GET');
  }

  /**
   * Récupérer les examinateurs disponibles
   */
  static async getAvailableExaminers(): Promise<{ success: boolean; examiners: Examiner[] }> {
    return apiRequest('/admin/available-examiners', 'GET');
  }

  /**
   * Récupérer tous les utilisateurs
   */
  static async getUsers(role?: string): Promise<{ success: boolean; users: any[] }> {
    const params = role ? `?role=${role}` : '';
    return apiRequest(`/admin/users${params}`, 'GET');
  }
}

