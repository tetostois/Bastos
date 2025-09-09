import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  FileText, 
  CreditCard, 
  Award, 
  TrendingUp, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  UserPlus,
  Mail,
  Download,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'examiner' | 'candidate';
  isActive: boolean;
  createdAt: string;
  profession?: string;
  specialization?: string;
  experience?: string;
}

interface Examiner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  isActive: boolean;
  assignedExams: number;
}

interface ExamSubmissionItem {
  id: string;
  candidateName: string;
  candidateEmail: string;
  submittedAt: string;
  status: 'draft' | 'submitted' | 'under_review' | 'graded';
  assignedTo?: string;
  score?: number;
}

interface Payment {
  id: string;
  candidateName: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

interface Certificate {
  id: string;
  candidateName: string;
  score: number;
  issuedAt: string;
  downloadUrl: string;
}

type QuestionType = 'qcm' | 'free_text';

type CertificationType = 
  | 'initiation_pratique_generale'
  | 'cadre_manager_professionnel'
  | 'rentabilite_entrepreneuriale'
  | 'chef_dirigeant_entreprise_africaine'
  | 'investisseur_entreprises_africaines'
  | 'ingenieries_specifiques';

type ModuleType = 'leadership' | 'competences_professionnelles' | 'entrepreneuriat';

interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface ExamQuestion {
  id: string;
  certificationType: CertificationType;
  module: ModuleType;
  questionType: QuestionType;
  questionText: string;
  referenceAnswer: string;
  instructions: string;
  points: number;
  timeLimit: number; // en secondes
  isRequired: boolean;
  answerOptions?: AnswerOption[];
  createdAt: string;
  updatedAt: string;
  isPublished?: boolean;
  publishedAt?: string;
}

interface ExamSubmissionData {
  id: string;
  examId: string;
  candidateId: string;
  candidateName: string;
  answers: {
    questionId: string;
    answer: string | string[];
    submittedAt: string;
    score?: number;
    feedback?: string;
  }[];
  status: 'draft' | 'submitted' | 'under_review' | 'graded';
  startedAt: string;
  submittedAt?: string;
  gradedAt?: string;
  totalScore?: number;
  examinerId?: string;
}

interface ExamAssignment {
  id: string;
  examId: string;
  examinerId: string;
  assignedAt: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  submissionId?: string;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showExaminerModal, setShowExaminerModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedExaminer, setSelectedExaminer] = useState<Examiner | null>(null);

  // Mock data
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      firstName: 'Marie',
      lastName: 'Dubois',
      email: 'marie.dubois@email.com',
      phone: '+237123456789',
      role: 'candidate',
      isActive: true,
      createdAt: '2024-01-15',
      profession: 'Manager'
    },
    {
      id: '2',
      firstName: 'Jean',
      lastName: 'Kamga',
      email: 'jean.kamga@email.com',
      phone: '+237123456790',
      role: 'examiner',
      isActive: true,
      createdAt: '2024-01-10',
      specialization: 'Leadership',
      experience: '5 ans'
    },
    {
      id: '3',
      firstName: 'Paul',
      lastName: 'Nkomo',
      email: 'paul.nkomo@email.com',
      phone: '+237123456791',
      role: 'candidate',
      isActive: false,
      createdAt: '2024-01-12',
      profession: 'Ingénieur'
    }
  ]);

  const [examiners, setExaminers] = useState<Examiner[]>([
    {
      id: '1',
      firstName: 'Dr. Jean',
      lastName: 'Kamga',
      email: 'jean.kamga@email.com',
      phone: '+237123456790',
      specialization: 'Leadership & Management',
      experience: '5 ans d\'expérience',
      isActive: true,
      assignedExams: 3
    },
    {
      id: '2',
      firstName: 'Prof. Marie',
      lastName: 'Tchinda',
      email: 'marie.tchinda@email.com',
      phone: '+237123456792',
      specialization: 'Psychologie Organisationnelle',
      experience: '8 ans d\'expérience',
      isActive: true,
      assignedExams: 2
    }
  ]);

  // Exam submissions state - initialized only once
  const [examSubmissionsState, setExamSubmissionsState] = useState<ExamSubmissionData[]>(() => [
    {
      id: '1',
      examId: 'exam-initiation_pratique_generale-leadership',
      candidateId: '1',
      candidateName: 'Marie Dubois',
      answers: [],
      status: 'submitted',
      startedAt: '2024-01-15T14:30:00Z',
      submittedAt: '2024-01-15T15:30:00Z',
      totalScore: 0
    },
    {
      id: '2',
      examId: 'exam-initiation_pratique_generale-leadership',
      candidateId: '2',
      candidateName: 'Paul Nkomo',
      answers: [],
      status: 'under_review',
      startedAt: '2024-01-16T10:15:00Z',
      submittedAt: '2024-01-16T11:30:00Z',
      totalScore: 0,
      examinerId: '1'
    },
    {
      id: '3',
      examId: 'exam-initiation_pratique_generale-leadership',
      candidateId: '3',
      candidateName: 'Sophie Martin',
      answers: [
        {
          questionId: '1',
          answer: 'Réponse à la question 1',
          submittedAt: '2024-01-17T14:20:00Z',
          score: 15,
          feedback: 'Bonne réponse, mais pourrait être plus détaillée.'
        }
      ],
      status: 'graded',
      startedAt: '2024-01-17T13:00:00Z',
      submittedAt: '2024-01-17T14:20:00Z',
      gradedAt: '2024-01-17T16:45:00Z',
      totalScore: 15,
      examinerId: '1'
    }
  ]);

  // Exam assignments state - tracks examiner assignments to submissions
  const [examAssignmentsState, setExamAssignmentsState] = useState<ExamAssignment[]>([
    {
      id: '1',
      examId: 'exam-initiation_pratique_generale-leadership',
      examinerId: '1',
      assignedAt: '2024-01-10T09:00:00Z',
      status: 'completed',
      completedAt: '2024-01-12T15:30:00Z',
      submissionId: '3' // Matches the graded submission
    },
    {
      id: '2',
      examId: 'exam-initiation_pratique_generale-leadership',
      examinerId: '2',
      assignedAt: '2024-01-11T10:00:00Z',
      status: 'in_progress',
      submissionId: '2' // Matches the under_review submission
    }
  ]);

  const [payments] = useState<Payment[]>([
    {
      id: '1',
      candidateName: 'Marie Dubois',
      amount: 50000,
      method: 'Orange Money',
      status: 'completed',
      date: '2024-01-15'
    },
    {
      id: '2',
      candidateName: 'Paul Nkomo',
      amount: 50000,
      method: 'PayPal',
      status: 'completed',
      date: '2024-01-14'
    }
  ]);

  // État pour la gestion des questions d'examen
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<ExamQuestion>>({
    questionType: 'qcm',
    isRequired: true,
    points: 1,
    timeLimit: 60,
    answerOptions: [
      { id: '1', text: '', isCorrect: false },
      { id: '2', text: '', isCorrect: false }
    ]
  });
  const [selectedCertification, setSelectedCertification] = useState<CertificationType>('initiation_pratique_generale');
  const [selectedModule, setSelectedModule] = useState<ModuleType>('leadership');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<{
    certificationType: CertificationType;
    module: ModuleType;
  } | null>(null);
  
  const [currentExamSubmission, setCurrentExamSubmission] = useState<ExamSubmissionData | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [grades, setGrades] = useState<Record<string, { score: number; feedback: string }>>({});

  // Fonction pour publier un examen
  const publishExam = (certificationType: CertificationType, module: ModuleType) => {
    const now = new Date().toISOString();
    
    // Marquer les questions comme publiées
    const updatedQuestions = questions.map(q => ({
      ...q,
      isPublished: q.certificationType === certificationType && q.module === module ? true : q.isPublished,
      publishedAt: q.certificationType === certificationType && q.module === module ? now : q.publishedAt
    }));
    
    setQuestions(updatedQuestions);
    
    // Créer une nouvelle soumission d'examen pour chaque candidat
    const candidates = users.filter(u => u.role === 'candidate');
    const examQuestions = questions.filter(
      q => q.certificationType === certificationType && q.module === module && q.isPublished
    );
    
    if (examQuestions.length === 0) {
      alert('Aucune question n\'est disponible pour cet examen.');
      return;
    }
    
    const newSubmissions: ExamSubmissionData[] = candidates.map(candidate => ({
      id: `sub-${Date.now()}-${candidate.id}`,
      examId: `exam-${certificationType}-${module}`,
      candidateId: candidate.id,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      answers: examQuestions.map(q => ({
        questionId: q.id,
        answer: '',
        submittedAt: '',
        score: 0
      })),
      status: 'draft',
      startedAt: now,
      totalScore: 0
    }));
    
    setExamSubmissionsState(prev => [...prev, ...newSubmissions]);
    
    // Assigner les examens aux examinateurs
    const activeExaminers = examiners.filter(e => e.isActive);
    if (activeExaminers.length === 0) {
      alert('Aucun examinateur actif disponible pour la correction.');
      return;
    }
    
    const newAssignments = newSubmissions.map((submission, index) => ({
      id: `assign-${Date.now()}-${index}`,
      examId: submission.examId,
      submissionId: submission.id,
      examinerId: activeExaminers[index % activeExaminers.length].id,
      assignedAt: now,
      status: 'pending' as const,
      completedAt: undefined
    }));
    
    setExamAssignmentsState(prev => [...prev, ...newAssignments]);
    
    // Mettre à jour le compteur d'examens assignés pour les examinateurs
    const updatedExaminers = examiners.map((examiner, index) => ({
      ...examiner,
      assignedExams: examiner.assignedExams + 
        newAssignments.filter(a => a.examinerId === examiner.id).length
    }));
    
    setExaminers(updatedExaminers);
    
    alert(`Examen publié avec succès pour ${candidates.length} candidats.`);
  };
  
  // Fonction pour récupérer les soumissions d'un examinateur
  const getExaminerSubmissions = (examinerId: string) => {
    return examSubmissionsState
      .filter((submission: ExamSubmissionData) => 
        submission.examinerId === examinerId && 
        (submission.status === 'under_review' || submission.status === 'graded')
      )
      .map((submission: ExamSubmissionData) => {
        const candidate = users.find((u: User) => u.id === submission.candidateId);
        const examQuestions = questions.filter(
          (q: ExamQuestion) => q.certificationType === selectedExam?.certificationType && 
                             q.module === selectedExam?.module
        );
        const assignment = examAssignmentsState.find((a: ExamAssignment) => a.submissionId === submission.id);
        
        return {
          ...submission,
          candidate,
          questions: examQuestions,
          assignmentId: assignment?.id
        };
      });
  };
  
  // Fonction pour soumettre une correction
  const submitGrading = (submissionId: string, grades: Record<string, { score: number; feedback: string }>) => {
    const now = new Date().toISOString();
    
    // Update submission with grades
    setExamSubmissionsState((prev: ExamSubmissionData[]) => 
      prev.map((submission: ExamSubmissionData) => {
        if (submission.id === submissionId) {
          // Update examiner's assigned exams count if this submission has an examiner
          if (submission.examinerId) {
            setExaminers(prev =>
              prev.map(e =>
                e.id === submission.examinerId && e.assignedExams > 0
                  ? { ...e, assignedExams: e.assignedExams - 1 }
                  : e
              )
            );
          }
          
          // Calculate total score from grades
          const totalScore = Object.values(grades).reduce((sum, { score }) => sum + score, 0);
          
          // Generate certificate if score is sufficient (70% or higher)
          if (totalScore >= 70) {
            const candidate = users.find(u => u.id === submission.candidateId);
            if (candidate) {
              const newCertificate: Certificate = {
                id: `cert-${Date.now()}`,
                candidateName: `${candidate.firstName} ${candidate.lastName}`,
                certificationType: selectedExam?.certificationType || 'initiation_pratique_generale',
                module: selectedExam?.module || 'leadership',
                score: totalScore,
                issuedAt: now,
                downloadUrl: `/certificates/${candidate.id}-${Date.now()}.pdf`
              };
              setCertificates(prev => [...prev, newCertificate]);
            }
          }
          
          // Return updated submission with proper typing
          const updatedSubmission: ExamSubmissionData = {
            ...submission,
            status: 'graded',
            gradedAt: now,
            totalScore,
            answers: submission.answers.map(answer => {
              const grade = grades[answer.questionId];
              return {
                ...answer,
                score: grade?.score,
                feedback: grade?.feedback || ''
              };
            })
          };
          
          return updatedSubmission;
        }
        return submission;
      })
    );
    
    alert('Correction soumise avec succès.');
  };

  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: '1',
      candidateName: 'Marie Dubois',
      score: 85,
      issuedAt: '2024-01-16',
      downloadUrl: '/certificates/marie-dubois.pdf'
    }
  ]);

  // User form state
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'candidate' as 'admin' | 'examiner' | 'candidate',
    profession: '',
    specialization: '',
    experience: ''
  });

  // Examiner form state
  const [examinerForm, setExaminerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    experience: ''
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u: User) => u.isActive).length,
    totalExaminers: examiners.length,
    activeExaminers: examiners.filter((e: Examiner) => e.isActive).length,
    pendingExams: examSubmissionsState.filter((e: ExamSubmissionData) => e.status === 'submitted').length,
    completedExams: examSubmissionsState.filter((e: ExamSubmissionData) => e.status === 'graded').length,
    totalPayments: payments.reduce((sum: number, p: Payment) => sum + p.amount, 0),
    completedPayments: payments.filter((p: Payment) => p.status === 'completed').length,
    totalCertificates: certificates.length
  };

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) || 
      (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesStatus;
  });

  // User Modal Functions
  const openUserModal = (mode: 'create' | 'edit' | 'view', user?: User) => {
    setModalMode(mode);
    setSelectedUser(user || null);
    if (user) {
      setUserForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profession: user.profession || '',
        specialization: user.specialization || '',
        experience: user.experience || ''
      });
    } else {
      setUserForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'candidate',
        profession: '',
        specialization: '',
        experience: ''
      });
    }
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const saveUser = () => {
    if (modalMode === 'create') {
      const newUser: User = {
        id: Date.now().toString(),
        ...userForm,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
      console.log('Nouvel utilisateur créé:', newUser);
    } else if (modalMode === 'edit' && selectedUser) {
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id ? { ...u, ...userForm } : u
      );
      setUsers(updatedUsers);
      console.log('Utilisateur modifié:', { ...selectedUser, ...userForm });
    }
    closeUserModal();
  };

  const deleteUser = (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(u => u.id !== userId));
      console.log('Utilisateur supprimé:', userId);
    }
  };

  const toggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    );
    setUsers(updatedUsers);
    console.log('Statut utilisateur modifié:', userId);
  };

  // Examiner Modal Functions
  const openExaminerModal = (mode: 'create' | 'edit', examiner?: Examiner) => {
    setModalMode(mode);
    setSelectedExaminer(examiner || null);
    if (examiner) {
      setExaminerForm({
        firstName: examiner.firstName,
        lastName: examiner.lastName,
        email: examiner.email,
        phone: examiner.phone,
        specialization: examiner.specialization,
        experience: examiner.experience,
        password: '' // Ne pas afficher le mot de passe existant pour des raisons de sécurité
      });
    } else {
      setExaminerForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        specialization: '',
        experience: ''
      });
    }
    setShowExaminerModal(true);
  };

  const closeExaminerModal = () => {
    setShowExaminerModal(false);
    setSelectedExaminer(null);
  };

  const saveExaminer = () => {
    if (modalMode === 'create') {
      const newExaminer: Examiner = {
        id: Date.now().toString(),
        ...examinerForm,
        isActive: true,
        assignedExams: 0
      };
      setExaminers([...examiners, newExaminer]);
      console.log('Nouvel examinateur créé:', newExaminer);
    } else if (modalMode === 'edit' && selectedExaminer) {
      const updatedExaminers = examiners.map(e => 
        e.id === selectedExaminer.id ? { ...e, ...examinerForm } : e
      );
      setExaminers(updatedExaminers);
      console.log('Examinateur modifié:', { ...selectedExaminer, ...examinerForm });
    }
    closeExaminerModal();
  };

  const toggleExaminerStatus = (examinerId: string) => {
    const updatedExaminers = examiners.map(e => 
      e.id === examinerId ? { ...e, isActive: !e.isActive } : e
    );
    setExaminers(updatedExaminers);
    console.log('Statut examinateur modifié:', examinerId);
  };

  const sendEmailToExaminer = (examiner: Examiner) => {
    console.log('Email envoyé à:', examiner.email);
  };

  // Fonction pour assigner un examinateur à une soumission
  const assignExaminer = (submissionId: string, examinerId: string) => {
    const submission = examSubmissionsState.find(s => s.id === submissionId);
    if (!submission) return;
    
    // Vérification que l'examId est défini
    if (!submission.examId) {
      console.error('Impossible d\'assigner un examinateur : examId est indéfini pour la soumission', submissionId);
      return;
    }

    // Mettre à jour l'état des soumissions pour refléter l'assignation
    setExamSubmissionsState(prev => 
      prev.map(s => 
        s.id === submissionId 
          ? { ...s, examinerId, status: 'under_review' as const }
          : s
      )
    );

    // Mettre à jour ou créer l'assignation d'examen
    setExamAssignmentsState(prev => {
      const existingAssignment = prev.find(a => a.submissionId === submissionId);
      
      if (existingAssignment) {
        return prev.map(assignment => 
          assignment.id === existingAssignment.id
            ? { 
                ...assignment, 
                examinerId,
                status: 'in_progress' as const,
                assignedAt: new Date().toISOString()
              }
            : assignment
        );
      } else {
        const newAssignment: ExamAssignment = {
          id: `assign-${Date.now()}`,
          examId: submission.examId, // Maintenant garanti d'être défini grâce à la vérification plus haut
          examinerId,
          assignedAt: new Date().toISOString(),
          status: 'in_progress',
          submissionId
        };
        return [...prev, newAssignment];
      }
    });

    // Mettre à jour le compteur d'examens assignés de l'examinateur
    setExaminers(prev => 
      prev.map(e => 
        e.id === examinerId 
          ? { ...e, assignedExams: (e.assignedExams || 0) + 1 }
          : e
      )
    );
    
    alert('Examinateur assigné avec succès.');
  };

  const downloadCertificate = (certificate: Certificate) => {
    console.log('Téléchargement du certificat:', certificate.downloadUrl);
    alert(`Téléchargement du certificat de ${certificate.candidateName}`);
  };

  const sendCertificateByEmail = (certificate: Certificate) => {
    console.log('Certificat envoyé par email:', certificate.candidateName);
    alert(`Certificat envoyé par email à ${certificate.candidateName}`);
  };

  // Fonctions pour la gestion des questions d'examen
  const handleQuestionChange = (field: keyof ExamQuestion, value: any) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnswerOptionChange = (id: string, field: keyof AnswerOption, value: any) => {
    setCurrentQuestion(prev => ({
      ...prev,
      answerOptions: prev.answerOptions?.map(option => 
        option.id === id ? { ...option, [field]: value } : option
      )
    }));
  };

  const addAnswerOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      answerOptions: [
        ...(prev.answerOptions || []),
        { id: Date.now().toString(), text: '', isCorrect: false }
      ]
    }));
  };

  const removeAnswerOption = (id: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      answerOptions: prev.answerOptions?.filter(option => option.id !== id)
    }));
  };

  const saveQuestion = () => {
    if (!currentQuestion.questionText || !currentQuestion.referenceAnswer) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const now = new Date().toISOString();
    const newQuestion: ExamQuestion = {
      id: Date.now().toString(),
      certificationType: selectedCertification,
      module: selectedModule,
      questionType: currentQuestion.questionType || 'qcm',
      questionText: currentQuestion.questionText || '',
      referenceAnswer: currentQuestion.referenceAnswer || '',
      instructions: currentQuestion.instructions || '',
      points: currentQuestion.points || 1,
      timeLimit: currentQuestion.timeLimit || 60,
      isRequired: currentQuestion.isRequired !== false,
      answerOptions: currentQuestion.questionType === 'qcm' ? currentQuestion.answerOptions : undefined,
      createdAt: now,
      updatedAt: now
    };

    setQuestions(prev => [...prev, newQuestion]);
    
    // Réinitialiser le formulaire
    setCurrentQuestion({
      questionType: 'qcm',
      isRequired: true,
      points: 1,
      timeLimit: 60,
      answerOptions: [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false }
      ]
    });
  };

  const deleteQuestion = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  const certificationLabels: Record<CertificationType, string> = {
    initiation_pratique_generale: 'Certification d\'Initiation Pratique Générale',
    cadre_manager_professionnel: 'Certification Cadre, Manager et Professionnel d\'entreprise',
    rentabilite_entrepreneuriale: 'Certification en Rentabilité Entrepreneuriale',
    chef_dirigeant_entreprise_africaine: 'Certification Chef ou Dirigeant d\'Entreprise Locale Africaine',
    investisseur_entreprises_africaines: 'Certification Investisseur en Entreprises Africaines',
    ingenieries_specifiques: 'Certifications en Ingénieries Spécifiques'
  };

  const moduleLabels: Record<ModuleType, string> = {
    leadership: 'Module Leadership',
    competences_professionnelles: 'Module Compétences Professionnelles',
    entrepreneuriat: 'Module Entrepreneuriat'
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!user || user.role !== 'admin') return null;

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'examiners', label: 'Examinateurs', icon: UserCheck },
    { id: 'exams', label: 'Examens', icon: FileText },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'certificates', label: 'Certificats', icon: Award },
    { id: 'analytics', label: 'Analytiques', icon: TrendingUp },
    { id: 'settings', label: 'Paramètres', icon: Settings },
    { id: 'exam-questions', label: 'Questions d\'examen', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold">Leadership Admin</h2>
          <p className="text-gray-400 text-sm">Panneau d'administration</p>
        </div>
        
        <nav className="mt-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-800 transition-colors ${
                  activeSection === item.id ? 'bg-gray-800 border-r-2 border-blue-500' : ''
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.firstName} {user.lastName}
              </span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Utilisateurs</h3>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                      <p className="text-sm text-gray-500">{stats.activeUsers} actifs</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Examinateurs</h3>
                      <p className="text-2xl font-bold text-green-600">{stats.totalExaminers}</p>
                      <p className="text-sm text-gray-500">{stats.activeExaminers} actifs</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <FileText className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Examens</h3>
                      <p className="text-2xl font-bold text-orange-600">{stats.pendingExams}</p>
                      <p className="text-sm text-gray-500">en attente</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Revenus</h3>
                      <p className="text-2xl font-bold text-purple-600">{formatPrice(stats.totalPayments)}</p>
                      <p className="text-sm text-gray-500">{stats.completedPayments} paiements</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <UserPlus className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Nouvel utilisateur inscrit</p>
                        <p className="text-xs text-gray-500">Marie Dubois - il y a 2h</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Paiement confirmé</p>
                        <p className="text-xs text-gray-500">Paul Nkomo - il y a 4h</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">Examen soumis</p>
                        <p className="text-xs text-gray-500">Jean Kamga - il y a 6h</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
                  <div className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      variant="secondary"
                      onClick={() => openUserModal('create')}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Créer un utilisateur
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="secondary"
                      onClick={() => openExaminerModal('create')}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Ajouter un examinateur
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="secondary"
                      onClick={() => setActiveSection('exams')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Gérer les examens
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="space-y-6">
              {/* Header with Search and Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un utilisateur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs</option>
                    <option value="inactive">Inactifs</option>
                  </select>
                </div>
                <Button onClick={() => openUserModal('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel utilisateur
                </Button>
              </div>

              {/* Users Table */}
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Utilisateur</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Rôle</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date création</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-500">{user.phone}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'examiner' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : user.role === 'examiner' ? 'Examinateur' : 'Candidat'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{formatDate(user.createdAt)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openUserModal('view', user)}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Voir"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openUserModal('edit', user)}
                                className="p-1 text-gray-400 hover:text-green-600"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => toggleUserStatus(user.id)}
                                className={`p-1 ${user.isActive ? 'text-gray-400 hover:text-red-600' : 'text-gray-400 hover:text-green-600'}`}
                                title={user.isActive ? 'Désactiver' : 'Activer'}
                              >
                                {user.isActive ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'examiners' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Gestion des Examinateurs</h2>
                <Button onClick={() => openExaminerModal('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel examinateur
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {examiners.map((examiner) => (
                  <Card key={examiner.id}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {examiner.firstName} {examiner.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{examiner.email}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        examiner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {examiner.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm"><span className="font-medium">Spécialisation:</span> {examiner.specialization}</p>
                      <p className="text-sm"><span className="font-medium">Expérience:</span> {examiner.experience}</p>
                      <p className="text-sm"><span className="font-medium">Examens assignés:</span> {examiner.assignedExams}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openExaminerModal('edit', examiner)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => sendEmailToExaminer(examiner)}
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={examiner.isActive ? "danger" : "success"}
                        onClick={() => toggleExaminerStatus(examiner.id)}
                      >
                        {examiner.isActive ? <AlertCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'exam-questions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestion des questions d'examen</h2>
                <Button
                  onClick={() => setShowPublishModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!selectedExam || questions.filter(
                    q => q.certificationType === selectedExam?.certificationType && 
                         q.module === selectedExam?.module
                  ).length === 0}
                >
                  Publier l'examen
                </Button>
              </div>

              {/* Sélection de la certification et du module */}
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Contexte de la question</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certification
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedCertification}
                      onChange={(e) => setSelectedCertification(e.target.value as CertificationType)}
                    >
                      {Object.entries(certificationLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Module
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(e.target.value as ModuleType)}
                    >
                      {Object.entries(moduleLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>

              {/* Formulaire de création de question */}
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Nouvelle question</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de question
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          checked={currentQuestion.questionType === 'qcm'}
                          onChange={() => handleQuestionChange('questionType', 'qcm')}
                        />
                        <span className="ml-2">QCM</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          checked={currentQuestion.questionType === 'free_text'}
                          onChange={() => handleQuestionChange('questionType', 'free_text')}
                        />
                        <span className="ml-2">Question libre</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      value={currentQuestion.questionText || ''}
                      onChange={(e) => handleQuestionChange('questionText', e.target.value)}
                      placeholder="Écrivez votre question ici..."
                    />
                  </div>

                  {currentQuestion.questionType === 'qcm' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options de réponse
                      </label>
                      <div className="space-y-2 mb-2">
                        {currentQuestion.answerOptions?.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={(e) => 
                                handleAnswerOptionChange(option.id, 'isCorrect', e.target.checked)
                              }
                              className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <input
                              type="text"
                              className="flex-1 p-2 border border-gray-300 rounded-md"
                              value={option.text}
                              onChange={(e) => 
                                handleAnswerOptionChange(option.id, 'text', e.target.value)
                              }
                              placeholder="Texte de l'option"
                            />
                            <button
                              type="button"
                              onClick={() => removeAnswerOption(option.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addAnswerOption}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Ajouter une option
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Réponse de référence <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      value={currentQuestion.referenceAnswer || ''}
                      onChange={(e) => handleQuestionChange('referenceAnswer', e.target.value)}
                      placeholder="Réponse attendue..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions supplémentaires
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={2}
                      value={currentQuestion.instructions || ''}
                      onChange={(e) => handleQuestionChange('instructions', e.target.value)}
                      placeholder="Instructions pour l'examinateur..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Points
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={currentQuestion.points || 1}
                        onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durée (secondes)
                      </label>
                      <input
                        type="number"
                        min="10"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={currentQuestion.timeLimit || 60}
                        onChange={(e) => handleQuestionChange('timeLimit', parseInt(e.target.value) || 60)}
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600"
                          checked={currentQuestion.isRequired !== false}
                          onChange={(e) => handleQuestionChange('isRequired', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700">Question obligatoire</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={saveQuestion}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Enregistrer la question
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Liste des questions existantes */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Questions existantes</h3>
                
                {questions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucune question n'a été créée pour le moment.</p>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <div key={question.id} className="border-b border-gray-200 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{question.questionText}</h4>
                            <div className="text-sm text-gray-500 mt-1">
                              {certificationLabels[question.certificationType]} • {moduleLabels[question.module]}
                              {question.questionType === 'qcm' && ` • ${question.answerOptions?.length} options`}
                              {question.questionType === 'free_text' && ' • Réponse libre'}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {question.points} point{question.points > 1 ? 's' : ''} • {question.timeLimit} secondes • 
                              {question.isRequired ? ' Obligatoire' : ' Facultative'}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                // Mettre à jour avec la question existante
                                setCurrentQuestion({
                                  ...question,
                                  answerOptions: question.answerOptions?.length ? question.answerOptions : [
                                    { id: '1', text: '', isCorrect: false },
                                    { id: '2', text: '', isCorrect: false }
                                  ]
                                });
                                // Supprimer l'ancienne version
                                setQuestions(prev => prev.filter(q => q.id !== question.id));
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => deleteQuestion(question.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeSection === 'exams' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Gestion des Examens</h2>
              
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Soumissions d'examens</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Candidat</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date soumission</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Assigné à</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examSubmissionsState.map((submission) => {
                        const candidate = users.find(u => u.id === submission.candidateId);
                        return (
                          <tr key={submission.id} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-gray-900">{submission.candidateName}</p>
                                <p className="text-sm text-gray-500">
                                  {candidate?.email || 'Email non disponible'}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {formatDate(submission.submittedAt)}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                submission.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                submission.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {submission.status === 'draft' ? 'Brouillon' :
                                 submission.status === 'submitted' ? 'Soumis' :
                                 submission.status === 'under_review' ? 'En correction' :
                                 submission.status === 'graded' ? 'Corrigé' : 'Inconnu'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {submission.examinerId 
                                ? examiners.find(e => e.id === submission.examinerId)?.firstName + ' ' + 
                                  examiners.find(e => e.id === submission.examinerId)?.lastName
                                : '-'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2 items-center">
                                <button 
                                  className="text-blue-600 hover:text-blue-800"
                                  onClick={() => {
                                    setCurrentExamSubmission(submission);
                                    setShowSubmissionModal(true);
                                  }}
                                  title="Voir les détails"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                
                                {submission.status === 'submitted' && (
                                  <select
                                    value={submission.examinerId || ''}
                                    onChange={(e) => {
                                      const examinerId = e.target.value;
                                      if (examinerId) {
                                        assignExaminer(submission.id, examinerId);
                                      }
                                    }}
                                    className="text-xs border rounded p-1"
                                    title="Assigner un examinateur"
                                    defaultValue=""
                                  >
                                    <option value="">Assigner...</option>
                                    {examiners
                                      .filter(e => e.isActive)
                                      .map(examiner => (
                                        <option key={examiner.id} value={examiner.id}>
                                          {examiner.firstName[0]}. {examiner.lastName}
                                        </option>
                                      ))}
                                  </select>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Modal de soumission d'examen */}
          {showSubmissionModal && currentExamSubmission && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Soumission de {currentExamSubmission.candidateName}
                    </h3>
                    <button 
                      onClick={() => setShowSubmissionModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {currentExamSubmission.answers.map((answer, index) => {
                      const question = questions.find(q => q.id === answer.questionId);
                      if (!question) return null;
                      
                      return (
                        <div key={answer.questionId} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">
                            Question {index + 1}: {question.questionText}
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="font-medium text-sm text-gray-700 mb-1">Réponse du candidat:</p>
                            <p className="whitespace-pre-wrap">
                              {Array.isArray(answer.answer) 
                                ? answer.answer.join(', ')
                                : answer.answer || 'Aucune réponse fournie'}
                            </p>
                          </div>
                          {answer.score !== undefined && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">
                                Note: {answer.score} / 20
                              </p>
                              {answer.feedback && (
                                <div className="mt-1 text-sm text-gray-600">
                                  <p className="font-medium">Commentaire:</p>
                                  <p>{answer.feedback}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowSubmissionModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Fermer
                    </button>
                    {currentExamSubmission.status !== 'graded' && (
                      <button
                        onClick={() => {
                          setShowSubmissionModal(false);
                          setShowGradingModal(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                      >
                        {currentExamSubmission.status === 'under_review' 
                          ? 'Continuer la correction' 
                          : 'Commencer la correction'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de correction */}
          {showGradingModal && currentExamSubmission && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Correction de {currentExamSubmission.candidateName}
                    </h3>
                    <button 
                      onClick={() => {
                        setShowGradingModal(false);
                        setGrades({});
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    submitGrading(currentExamSubmission.id, grades);
                    setShowGradingModal(false);
                    setGrades({});
                  }}>
                    <div className="space-y-6">
                      {currentExamSubmission.answers.map((answer, index) => {
                        const question = questions.find(q => q.id === answer.questionId);
                        if (!question) return null;
                        
                        return (
                          <div key={answer.questionId} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">
                              Question {index + 1}: {question.questionText}
                            </h4>
                            <div className="bg-gray-50 p-3 rounded-md mb-3">
                              <p className="font-medium text-sm text-gray-700 mb-1">Réponse du candidat:</p>
                              <p className="whitespace-pre-wrap">
                                {Array.isArray(answer.answer) 
                                  ? answer.answer.join(', ')
                                  : answer.answer || 'Aucune réponse fournie'}
                              </p>
                            </div>
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Note (sur 20)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.5"
                                value={grades[answer.questionId]?.score ?? ''}
                                onChange={(e) => {
                                  const score = parseFloat(e.target.value);
                                  setGrades(prev => ({
                                    ...prev,
                                    [answer.questionId]: {
                                      ...prev[answer.questionId],
                                      score: isNaN(score) ? 0 : Math.min(20, Math.max(0, score))
                                    }
                                  }));
                                }}
                                className="w-20 p-1 border rounded-md"
                                required
                              />
                            </div>
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Commentaire
                              </label>
                              <textarea
                                value={grades[answer.questionId]?.feedback ?? ''}
                                onChange={(e) => {
                                  setGrades(prev => ({
                                    ...prev,
                                    [answer.questionId]: {
                                      ...prev[answer.questionId],
                                      feedback: e.target.value
                                    }
                                  }));
                                }}
                                rows={3}
                                className="w-full p-2 border rounded-md"
                                placeholder="Commentaires sur la réponse..."
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowGradingModal(false);
                          setGrades({});
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                      >
                        Enregistrer la correction
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Historique des Paiements</h2>
              
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Candidat</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Montant</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Méthode</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-900">{payment.candidateName}</td>
                          <td className="py-3 px-4 text-gray-900">{formatPrice(payment.amount)}</td>
                          <td className="py-3 px-4 text-gray-900 capitalize">{payment.method}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status === 'completed' ? 'Complété' :
                               payment.status === 'pending' ? 'En attente' : 'Échoué'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{formatDate(payment.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'certificates' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Gestion des Certificats</h2>
              
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Candidat</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Score</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date émission</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificates.map((certificate) => (
                        <tr key={certificate.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-900">{certificate.candidateName}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-green-600">{certificate.score}/100</span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{formatDate(certificate.issuedAt)}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => downloadCertificate(certificate)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Télécharger
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => sendCertificateByEmail(certificate)}
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                Envoyer
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Analytiques et Rapports</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-2">Taux de réussite</h3>
                  <p className="text-3xl font-bold text-green-600">85%</p>
                  <p className="text-sm text-gray-500">Score moyen: 78/100</p>
                </Card>
                
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-2">Revenus mensuels</h3>
                  <p className="text-3xl font-bold text-blue-600">{formatPrice(150000)}</p>
                  <p className="text-sm text-gray-500">+12% ce mois</p>
                </Card>
                
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-2">Temps moyen correction</h3>
                  <p className="text-3xl font-bold text-orange-600">24h</p>
                  <p className="text-sm text-gray-500">Objectif: 48h</p>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Paramètres</h2>
              
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration de l'examen</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée de l'examen (minutes)
                    </label>
                    <Input type="number" defaultValue="60" className="w-32" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix de l'examen (FCFA)
                    </label>
                    <Input type="number" defaultValue="50000" className="w-32" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Score minimum pour certification
                    </label>
                    <Input type="number" defaultValue="70" className="w-32" />
                  </div>
                  <Button>Sauvegarder les paramètres</Button>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">
                {modalMode === 'create' ? 'Nouvel utilisateur' : 
                 modalMode === 'edit' ? 'Modifier utilisateur' : 'Détails utilisateur'}
              </h3>
              <button onClick={closeUserModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  value={userForm.firstName}
                  onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                  disabled={modalMode === 'view'}
                />
                <Input
                  label="Nom"
                  value={userForm.lastName}
                  onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                  disabled={modalMode === 'view'}
                />
                <Input
                  label="Email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  disabled={modalMode === 'view'}
                />
                <Input
                  label="Téléphone"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                  disabled={modalMode === 'view'}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value as any})}
                    disabled={modalMode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="candidate">Candidat</option>
                    <option value="examiner">Examinateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <Input
                  label="Profession"
                  value={userForm.profession}
                  onChange={(e) => setUserForm({...userForm, profession: e.target.value})}
                  disabled={modalMode === 'view'}
                />
                {userForm.role === 'examiner' && (
                  <>
                    <Input
                      label="Spécialisation"
                      value={userForm.specialization}
                      onChange={(e) => setUserForm({...userForm, specialization: e.target.value})}
                      disabled={modalMode === 'view'}
                    />
                    <Input
                      label="Expérience"
                      value={userForm.experience}
                      onChange={(e) => setUserForm({...userForm, experience: e.target.value})}
                      disabled={modalMode === 'view'}
                    />
                  </>
                )}
              </div>
              
              {modalMode !== 'view' && (
                <div className="flex space-x-3 mt-6">
                  <Button variant="secondary" onClick={closeUserModal} className="flex-1">
                    Annuler
                  </Button>
                  <Button onClick={saveUser} className="flex-1">
                    {modalMode === 'create' ? 'Créer' : 'Sauvegarder'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Examiner Modal */}
      {showExaminerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">
                {modalMode === 'create' ? 'Nouvel examinateur' : 'Modifier examinateur'}
              </h3>
              <button onClick={closeExaminerModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <Input
                  label="Prénom"
                  value={examinerForm.firstName}
                  onChange={(e) => setExaminerForm({...examinerForm, firstName: e.target.value})}
                />
                <Input
                  label="Nom"
                  value={examinerForm.lastName}
                  onChange={(e) => setExaminerForm({...examinerForm, lastName: e.target.value})}
                />
                <Input
                  label="Email"
                  type="email"
                  value={examinerForm.email}
                  onChange={(e) => setExaminerForm({...examinerForm, email: e.target.value})}
                />
                <Input
                  label="Mot de passe"
                  type="password"
                  value={examinerForm.password}
                  onChange={(e) => setExaminerForm({...examinerForm, password: e.target.value})}
                  placeholder="Créez un mot de passe sécurisé"
                />
                <Input
                  label="Téléphone"
                  value={examinerForm.phone}
                  onChange={(e) => setExaminerForm({...examinerForm, phone: e.target.value})}
                />
                <Input
                  label="Spécialisation"
                  value={examinerForm.specialization}
                  onChange={(e) => setExaminerForm({...examinerForm, specialization: e.target.value})}
                />
                <Input
                  label="Expérience"
                  value={examinerForm.experience}
                  onChange={(e) => setExaminerForm({...examinerForm, experience: e.target.value})}
                />
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button variant="secondary" onClick={closeExaminerModal} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={saveExaminer} className="flex-1">
                  {modalMode === 'create' ? 'Créer' : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};