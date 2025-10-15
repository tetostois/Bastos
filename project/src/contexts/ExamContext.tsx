import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Exam, Answer, Question } from '../types';
import { mapCertificationToBackendSlug, mapModuleToBackendSlug } from '../utils/mapping';
import apiRequest from '../config/api';

interface ExamContextType {
  // État de l'examen
  currentExam: Exam | null;
  currentAnswers: Answer[];
  timeRemaining: number;
  isExamActive: boolean;
  currentQuestionIndex: number;
  completedExams: string[];
  questionTimeRemaining: number;
  examStartTime: Date | null;
  moduleStartTime: Date | null;
  autoSaveInterval: NodeJS.Timeout | null;
  
  // Fonctions de gestion de l'examen
  startExam: (examId: string) => void;
  startModule: (certificationId: string, moduleId: string) => void;
  submitAnswer: (questionId: string, answer: string | number) => void;
  submitExam: () => Promise<boolean>;
  setCurrentQuestionIndex: (index: number) => void;
  setTimeRemaining: (time: number) => void;
  endExam: () => void;
  submitModule: () => Promise<boolean>;
  checkExamExpiration: () => boolean;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // État principal de l'examen
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExamActive, setIsExamActive] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [completedExams, setCompletedExams] = useState<string[]>([]);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number>(0);
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);
  const [moduleStartTime, setModuleStartTime] = useState<Date | null>(null);
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Fonction pour démarrer un module spécifique (récupération réelle depuis l'API)
  const startModule = async (certificationId: string, moduleId: string) => {
    try {
      // Normaliser les identifiants pour correspondre aux slugs backend
      const certSlug = mapCertificationToBackendSlug(certificationId);
      const moduleSlug = mapModuleToBackendSlug(moduleId);

      // Récupération des questions publiées pour une certification et un module
      // On supporte les deux formats de réponse: { data: [] } ou []
      const endpoint = `/candidate/questions?certification_type=${encodeURIComponent(certSlug)}&module=${encodeURIComponent(moduleSlug)}`;
      console.log('[Exam] startModule params:', { certificationId, moduleId });
      console.log('[Exam] mapped slugs:', { certSlug, moduleSlug });

      let data: any = await apiRequest<any>(endpoint, 'GET');
      let rawList: any[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.questions)
          ? data.questions
          : Array.isArray(data)
            ? data
            : [];

      // Fallback 1: réessayer avec les identifiants d'origine s'il n'y a aucun résultat
      if (!rawList.length) {
        const endpointFallback = `/candidate/questions?certification=${encodeURIComponent(certificationId)}&module=${encodeURIComponent(moduleId)}`;
        console.warn('[Exam] Aucune question avec slugs. Nouvelle tentative avec ids UI:', { endpointFallback });
        data = await apiRequest<any>(endpointFallback, 'GET');
        rawList = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.questions)
            ? data.questions
            : Array.isArray(data)
              ? data
              : [];
      }

      if (!rawList.length) {
        console.warn('[Exam] Toujours aucun résultat.', { endpoint, certificationId, moduleId, certSlug, moduleSlug, response: data });
        alert("Aucune question disponible pour ce module. Veuillez réessayer plus tard.");
        return;
      }

      // Mapping backend -> frontend Question
      const mappedQuestions: Question[] = rawList.map((raw: any) => {
        const isQcm = String(raw.question_type || raw.type || '').toLowerCase() === 'qcm' || String(raw.question_type || '').toLowerCase() === 'multiple-choice';
        return {
          id: String(raw.id ?? ''),
          text: String(raw.question_text ?? raw.text ?? ''),
          type: isQcm ? 'multiple-choice' : 'text',
          options: isQcm && Array.isArray(raw.answer_options)
            ? raw.answer_options.map((o: any) => String(o.text ?? o.label ?? ''))
            : undefined,
          points: Number(raw.points ?? 1),
          category: String(raw.module ?? raw.category ?? moduleId)
        } as Question;
      });

      // Créer l'examen avec les questions récupérées
      const exam: Exam = {
        id: `exam-${certSlug}-${moduleSlug}`,
        title: `Module ${moduleId}`,
        description: `Examen du module ${moduleId} pour ${certificationId}`,
        moduleName: `Module ${moduleId}`,
        duration: 3 * 24 * 60, // 3 jours en minutes
        isActive: true,
        price: 0,
        questions: mappedQuestions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Ajouter les propriétés nécessaires pour la soumission
        certificationType: certSlug,
        moduleId: moduleSlug,
        timeLimit: 3 * 24 * 60 * 60, // 3 jours en secondes
        totalQuestions: mappedQuestions.length
      };

      // Vérifier si l'examen a déjà été commencé
      const existingAnswers = localStorage.getItem(`exam-answers-${exam.id}`);
      const existingStartTime = localStorage.getItem(`exam-start-time-${exam.id}`);
      const existingModuleStartTime = localStorage.getItem(`module-start-time-${exam.id}`);
      
      if (existingAnswers) {
        const parsedAnswers = JSON.parse(existingAnswers);
        setCurrentAnswers(parsedAnswers);
        console.log('[Exam] Réponses existantes chargées:', parsedAnswers);
      } else {
      setCurrentAnswers([]);
      }

      // Définir les temps de début
      const now = new Date();
      if (!existingStartTime) {
        setExamStartTime(now);
        localStorage.setItem(`exam-start-time-${exam.id}`, now.toISOString());
      } else {
        setExamStartTime(new Date(existingStartTime));
      }

      if (!existingModuleStartTime) {
        setModuleStartTime(now);
        localStorage.setItem(`module-start-time-${exam.id}`, now.toISOString());
      } else {
        setModuleStartTime(new Date(existingModuleStartTime));
      }

      setCurrentExam(exam);
      setCurrentQuestionIndex(0);
      setTimeRemaining(exam.timeLimit || 0);
      setIsExamActive(true);
      
      // Démarrer la sauvegarde automatique
      startAutoSave();
      
      // Démarrer le chronomètre pour la première question
      if (mappedQuestions.length > 0) {
        setQuestionTimeRemaining(mappedQuestions[0].timeLimit || 60);
        // Le useEffect se chargera de démarrer le chronomètre
        console.log(`[Exam] Module démarré avec ${mappedQuestions.length} questions`);
      }
    } catch (error) {
      console.error('[Exam] Erreur lors du chargement des questions:', error);
      alert("Impossible de charger les questions de ce module. Veuillez réessayer.");
    }
  };

  // Fonction pour démarrer un examen complet (fallback vers la même logique en utilisant examId comme moduleId)
  const startExam = async (examId: string) => {
    // Par défaut, tenter de charger via l'endpoint candidat sans certification explicite
    try {
      const endpoint = `/candidate/questions?exam_id=${encodeURIComponent(examId)}`;
      const data: any = await apiRequest<any>(endpoint, 'GET');
      const rawList: any[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.questions)
          ? data.questions
          : Array.isArray(data)
            ? data
            : [];

      if (!rawList.length) {
        alert("Aucune question disponible pour cet examen. Veuillez réessayer plus tard.");
        return;
      }

      const mappedQuestions: Question[] = rawList.map((raw: any) => {
        const isQcm = String(raw.question_type || raw.type || '').toLowerCase() === 'qcm' || String(raw.question_type || '').toLowerCase() === 'multiple-choice';
        return {
          id: String(raw.id ?? ''),
          text: String(raw.question_text ?? raw.text ?? ''),
          type: isQcm ? 'multiple-choice' : 'text',
          options: isQcm && Array.isArray(raw.answer_options)
            ? raw.answer_options.map((o: any) => String(o.text ?? o.label ?? ''))
            : undefined,
          points: Number(raw.points ?? 1),
          category: String(raw.module ?? raw.category ?? 'général')
        } as Question;
      });

      const totalSeconds = rawList.reduce((sum: number, raw: any) => sum + Number(raw.time_limit ?? 60), 0);
      const durationMinutes = Math.max(1, Math.ceil(totalSeconds / 60));

      const builtExam: Exam = {
        id: examId,
        title: 'Examen de certification',
        description: 'Examen de certification',
        moduleName: rawList?.[0]?.module ? String(rawList[0].module) : 'Examen',
        duration: durationMinutes,
        isActive: true,
        price: 0,
        questions: mappedQuestions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCurrentExam(builtExam);
      setCurrentAnswers([]);
      setCurrentQuestionIndex(0);
      setTimeRemaining(totalSeconds);
      setIsExamActive(true);
    } catch (e) {
      console.error('[Exam] Erreur lors du chargement de l\'examen:', e);
      alert("Impossible de charger l'examen. Veuillez réessayer.");
    }
  };

  // Fonction pour soumettre une réponse
  const submitAnswer = (questionId: string, answer: string | number) => {
    setCurrentAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { questionId, value: answer };
        return updated;
      }
      return [...prev, { questionId, value: answer }];
    });
  };

  // Fonction pour soumettre l'examen
  const submitExam = async (): Promise<boolean> => {
    if (!currentExam) return false;
    
    try {
      // Préparer les données pour la soumission
      const examId = `exam-${currentExam.certificationType}-${currentExam.moduleId}`;
      const answers = currentAnswers.reduce((acc, answer) => {
        acc[answer.questionId] = answer.value;
        return acc;
      }, {} as Record<string, string | number>);
      
      console.log('Soumission de l\'examen:', examId);
      console.log('Réponses soumises:', answers);
      
      // Soumettre l'examen via l'API
      const response = await apiRequest('/candidate/exam-submissions/submit', 'POST', {
        exam_id: examId,
        answers: answers,
        certification_type: currentExam.certificationType,
        module_id: currentExam.moduleId
      });
      
      if ((response as any).success) {
        console.log('Examen soumis avec succès:', response);
        console.log(`Score: ${(response as any).score}/${(response as any).max_score} (${(response as any).percentage}%)`);
        
        // Marquer l'examen comme terminé
        setCompletedExams(prev => [...prev, currentExam.id]);
        
        // Le déverrouillage du module suivant est géré automatiquement par le backend
        console.log('Module suivant déverrouillé automatiquement');
        
        // Déclencher un événement pour recharger la progression des modules
        console.log('🎯 [ExamContext] Déclenchement de l\'événement examSubmitted...');
        console.log('🎯 [ExamContext] Détails de l\'événement:', {
          certificationType: currentExam.certificationType,
          moduleId: currentExam.moduleId,
          score: (response as any).score,
          maxScore: (response as any).max_score
        });
        
        const event = new CustomEvent('examSubmitted', { 
          detail: { 
            certificationType: currentExam.certificationType,
            moduleId: currentExam.moduleId,
            score: (response as any).score,
            maxScore: (response as any).max_score
          } 
        });
        
        window.dispatchEvent(event);
        console.log('🎯 [ExamContext] Événement examSubmitted déclenché');
      } else {
        throw new Error((response as any).message || 'Erreur lors de la soumission');
      }
      
      // Réinitialiser l'état
      setCurrentExam(null);
      setCurrentAnswers([]);
      setIsExamActive(false);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'examen:', error);
      return false;
    }
  };

  // Fonction pour terminer l'examen
  const endExam = () => {
    // Nettoyer les intervalles
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
      setAutoSaveInterval(null);
    }
    
    setCurrentExam(null);
    setCurrentAnswers([]);
    setCurrentQuestionIndex(0);
    setTimeRemaining(0);
    setQuestionTimeRemaining(0);
    setIsExamActive(false);
    setExamStartTime(null);
    setModuleStartTime(null);
  };

  // Fonction pour démarrer le chronomètre d'une question
  const startQuestionTimer = () => {
    if (!currentExam || currentExam.questions.length === 0) return;
    
    const currentQuestion = currentExam.questions[currentQuestionIndex];
    if (currentQuestion && currentQuestion.timeLimit) {
      setQuestionTimeRemaining(currentQuestion.timeLimit);
      
      // Nettoyer l'ancien timer s'il existe
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
      
      const timer = setInterval(() => {
        setQuestionTimeRemaining(prev => {
          if (prev <= 1) {
            // Temps écoulé pour cette question
            handleQuestionTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setAutoSaveInterval(timer);
      console.log(`[Exam] Chronomètre démarré pour la question ${currentQuestionIndex + 1}: ${currentQuestion.timeLimit}s`);
    }
  };

  // Fonction pour gérer l'expiration du temps d'une question
  const handleQuestionTimeout = () => {
    if (!currentExam) return;
    
    const currentQuestion = currentExam.questions[currentQuestionIndex];
    if (currentQuestion) {
      console.log(`[Exam] Temps écoulé pour la question ${currentQuestionIndex + 1}`);
      
      // Sauvegarder une réponse vide pour cette question
      submitAnswer(currentQuestion.id, '');
      
      // Passer à la question suivante ou soumettre le module
      if (currentQuestionIndex < currentExam.questions.length - 1) {
        console.log(`[Exam] Passage à la question ${currentQuestionIndex + 2}`);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        // Le useEffect se chargera de redémarrer le chronomètre
      } else {
        // Dernière question, soumettre le module
        console.log('[Exam] Dernière question terminée, soumission du module');
        submitModule();
      }
    }
  };

  // Fonction pour soumettre un module (pas tout l'examen)
  const submitModule = async (): Promise<boolean> => {
    if (!currentExam) return false;
    
    try {
      // Sauvegarder les réponses en local
      localStorage.setItem(`exam-answers-${currentExam.id}`, JSON.stringify(currentAnswers));
      
      // Marquer le module comme terminé
      const completedModules = JSON.parse(localStorage.getItem('completed-modules') || '[]');
      if (!completedModules.includes(currentExam.moduleId)) {
        completedModules.push(currentExam.moduleId);
        localStorage.setItem('completed-modules', JSON.stringify(completedModules));
        setCompletedExams(completedModules);
      }
      
      // Déclencher l'événement pour recharger la progression des modules
      console.log('🎯 [ExamContext] Déclenchement de l\'événement examSubmitted pour le module...');
      
      // Extraire le type de certification de l'exam_id
      const certMatch = currentExam.id.match(/^exam-(.*?)-/);
      const certificationType = certMatch ? certMatch[1] : 'unknown';
      
      const event = new CustomEvent('examSubmitted', { 
        detail: { 
          moduleId: currentExam.moduleId,
          certificationType: certificationType,
          isModuleSubmission: true
        } 
      });
      
      window.dispatchEvent(event);
      console.log('🎯 [ExamContext] Événement examSubmitted déclenché pour le module');
      
      // Nettoyer l'état du module
      setCurrentExam(null);
      setCurrentAnswers([]);
      setCurrentQuestionIndex(0);
      setQuestionTimeRemaining(0);
      setIsExamActive(false);
      setModuleStartTime(null);
      
      // Nettoyer les intervalles
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        setAutoSaveInterval(null);
      }
      
      alert('Module soumis avec succès ! Vous pouvez maintenant passer au module suivant.');
      return true;
    } catch (error) {
      console.error('Erreur lors de la soumission du module:', error);
      return false;
    }
  };

  // Fonction pour démarrer la sauvegarde automatique
  const startAutoSave = () => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
    }
    
    const interval = setInterval(() => {
      if (currentExam && currentAnswers.length > 0) {
        localStorage.setItem(`exam-answers-${currentExam.id}`, JSON.stringify(currentAnswers));
        console.log('[Exam] Sauvegarde automatique effectuée');
      }
    }, 30000); // Sauvegarde toutes les 30 secondes
    
    setAutoSaveInterval(interval);
  };

  // Fonction pour vérifier l'expiration de l'examen (3 jours)
  const checkExamExpiration = (): boolean => {
    if (!examStartTime) return false;
    
    const now = new Date();
    const examDuration = 3 * 24 * 60 * 60 * 1000; // 3 jours en millisecondes
    const timeElapsed = now.getTime() - examStartTime.getTime();
    
    if (timeElapsed >= examDuration) {
      // L'examen a expiré, soumettre automatiquement
      if (currentExam) {
        submitExam();
      }
      return true;
    }
    
    return false;
  };

  // Vérifier l'expiration de l'examen toutes les minutes
  React.useEffect(() => {
    if (isExamActive && examStartTime) {
      const checkInterval = setInterval(() => {
        if (checkExamExpiration()) {
          clearInterval(checkInterval);
        }
      }, 60000); // Vérifier toutes les minutes
      
      return () => clearInterval(checkInterval);
    }
  }, [isExamActive, examStartTime]);

  // Démarrer le chronomètre de la question quand l'index change
  React.useEffect(() => {
    if (isExamActive && currentExam && currentExam.questions.length > 0) {
      startQuestionTimer();
    }
  }, [currentQuestionIndex, isExamActive, currentExam]);

  // Valeur du contexte
  const value = {
    currentExam,
    currentAnswers,
    timeRemaining,
    isExamActive,
    currentQuestionIndex,
    completedExams,
    questionTimeRemaining,
    examStartTime,
    moduleStartTime,
    autoSaveInterval,
    startExam,
    startModule,
    submitAnswer,
    submitExam,
    setCurrentQuestionIndex,
    setTimeRemaining,
    endExam,
    submitModule,
    checkExamExpiration
  };

  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam doit être utilisé à l\'intérieur d\'un ExamProvider');
  }
  return context;
};
