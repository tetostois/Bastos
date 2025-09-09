import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Exam, Answer } from '../types';

interface ExamContextType {
  // État de l'examen
  currentExam: Exam | null;
  currentAnswers: Answer[];
  timeRemaining: number;
  isExamActive: boolean;
  currentQuestionIndex: number;
  completedExams: string[];
  
  // Fonctions de gestion de l'examen
  startExam: (examId: string) => void;
  startModule: (certificationId: string, moduleId: string) => void;
  submitAnswer: (questionId: string, answer: string | number) => void;
  submitExam: () => Promise<boolean>;
  setCurrentQuestionIndex: (index: number) => void;
  setTimeRemaining: (time: number) => void;
  endExam: () => void;
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
  
  // Fonction pour démarrer un module spécifique
  const startModule = (_certificationId: string, moduleId: string) => {
    // Dans une vraie application, on chargerait le module depuis une API
    const mockExam: Exam = {
      id: moduleId,
      title: `Module ${moduleId}`,
      description: `Description du module ${moduleId}`,
      moduleName: `Module ${moduleId}`,
      duration: 30, // en minutes
      isActive: true,
      price: 0,
      questions: [
        {
          id: 'q1',
          text: `Décrivez les points clés abordés dans ce module.`,
          type: 'text',
          points: 10,
          category: 'module'
        },
        {
          id: 'q2',
          text: `Quelles sont les compétences que vous avez acquises dans ce module ?`,
          type: 'text',
          points: 10,
          category: 'module'
        },
        {
          id: 'q3',
          text: `Comment comptez-vous appliquer ces connaissances dans votre travail ?`,
          type: 'text',
          points: 10,
          category: 'module'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCurrentExam(mockExam);
    setCurrentAnswers([]);
    setCurrentQuestionIndex(0);
    setTimeRemaining(mockExam.duration * 60);
    setIsExamActive(true);
  };

  // Fonction pour démarrer un examen
  const startExam = (examId: string) => {
    // Dans une vraie application, on chargerait l'examen depuis une API
    const mockExam: Exam = {
      id: examId,
      title: 'Examen de certification',
      description: 'Examen de certification pour valider vos compétences',
      moduleName: 'Module de test',
      duration: 30, // en minutes
      isActive: true,
      price: 0, // Gratuit pour le test
      questions: [
        {
          id: 'q1',
          text: 'Quelle est la capitale de la France ?',
          type: 'multiple-choice',
          options: ['Londres', 'Berlin', 'Paris', 'Madrid'],
          points: 1,
          category: 'général'
        },
        {
          id: 'q2',
          text: 'Décrivez votre expérience avec React.',
          type: 'text',
          points: 5,
          category: 'développement'
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCurrentExam(mockExam);
    setCurrentAnswers([]);
    setCurrentQuestionIndex(0);
    setTimeRemaining(mockExam.duration * 60); // Convertir en secondes
    setIsExamActive(true);
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
      // Ici, on enverrait les réponses au serveur
      console.log('Réponses soumises:', currentAnswers);
      
      // Marquer l'examen comme terminé
      setCompletedExams(prev => [...prev, currentExam.id]);
      
      // Déverrouiller le module suivant
      if (currentExam.id.includes('module')) {
        const currentModuleNum = parseInt(currentExam.id.replace('module', ''));
        const nextModuleId = `module${currentModuleNum + 1}`;
        
        // Dans une vraie application, on mettrait à jour le backend
        console.log(`Module suivant déverrouillé: ${nextModuleId}`);
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
    setCurrentExam(null);
    setCurrentAnswers([]);
    setCurrentQuestionIndex(0);
    setTimeRemaining(0);
    setIsExamActive(false);
  };

  // Valeur du contexte
  const value = {
    currentExam,
    currentAnswers,
    timeRemaining,
    isExamActive,
    currentQuestionIndex,
    completedExams,
    startExam,
    startModule,
    submitAnswer,
    submitExam,
    setCurrentQuestionIndex,
    setTimeRemaining,
    endExam
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
