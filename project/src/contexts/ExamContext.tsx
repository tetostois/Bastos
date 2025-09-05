import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Exam, Question, ExamSubmission, Answer, CertificationModule, CertificationType } from '../types';
import { getCertificationById } from '../components/data/certifications';


// Questions par catégorie pour générer les modules dynamiquement
const questionsByCategory = {
  leadership: [
    {
      id: 'lead-1',
      text: 'Qu\'est-ce qui caractérise le mieux un leader transformationnel ?',
      type: 'multiple-choice' as const,
      options: [
        'Il se concentre uniquement sur les résultats financiers',
        'Il inspire et motive ses équipes vers une vision commune',
        'Il évite de prendre des risques',
        'Il délègue toutes ses responsabilités'
      ],
      correctAnswer: 1,
      points: 5,
      category: 'leadership' as const
    },
    {
      id: 'lead-2',
      text: 'Comment un leader doit-il réagir face à un conflit dans son équipe ?',
      type: 'multiple-choice' as const,
      options: [
        'Ignorer le conflit en espérant qu\'il se résolve seul',
        'Prendre parti pour l\'un des membres',
        'Faciliter la communication entre les parties pour trouver une solution',
        'Licencier tous les membres impliqués'
      ],
      correctAnswer: 2,
      points: 5,
      category: 'leadership' as const
    },
    {
      id: 'lead-3',
      text: 'Décrivez votre approche pour développer les compétences de leadership de votre équipe.',
      type: 'text' as const,
      points: 10,
      category: 'leadership' as const
    }
    // ... plus de questions leadership
  ],
  competences: [
    {
      id: 'comp-1',
      text: 'Quelle est l\'importance de la communication dans le management ?',
      type: 'multiple-choice' as const,
      options: [
        'Elle n\'est pas importante si les résultats sont bons',
        'Elle permet d\'établir la confiance et l\'alignement',
        'Elle ralentit les processus de décision',
        'Elle crée de la confusion'
      ],
      correctAnswer: 1,
      points: 5,
      category: 'competences' as const
    },
    {
      id: 'comp-2',
      text: 'Comment gérez-vous les priorités multiples dans votre travail ?',
      type: 'text' as const,
      points: 10,
      category: 'competences' as const
    }
    // ... plus de questions compétences
  ],
  entrepreneuriat: [
    {
      id: 'entr-1',
      text: 'Quel est le principal défi de l\'entrepreneuriat en Afrique ?',
      type: 'multiple-choice' as const,
      options: [
        'Le manque de financement',
        'L\'absence de marché',
        'Le manque d\'infrastructure et d\'écosystème',
        'La concurrence internationale'
      ],
      correctAnswer: 2,
      points: 5,
      category: 'entrepreneuriat' as const
    },
    {
      id: 'entr-2',
      text: 'Décrivez une stratégie pour développer un business en contexte africain.',
      type: 'text' as const,
      points: 10,
      category: 'entrepreneuriat' as const
    }
    // ... plus de questions entrepreneuriat
  ]
};
interface ExamContextType {
  currentModule: CertificationModule | null;
  currentAnswers: Answer[];
  timeRemaining: number;
  isExamActive: boolean;
  currentCertification: CertificationType | null;
  completedModules: string[];
  currentModuleIndex: number;
  startModule: (certificationType: string, moduleId: string) => void;
  submitAnswer: (questionId: string, answer: string | number) => void;
  submitModule: () => Promise<boolean>;
  setTimeRemaining: (time: number) => void;
  endExam: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);


export const ExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentModule, setCurrentModule] = useState<CertificationModule | null>(null);
  const [currentCertification, setCurrentCertification] = useState<CertificationType | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExamActive, setIsExamActive] = useState(false);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  const generateModuleQuestions = (category: 'leadership' | 'competences' | 'entrepreneuriat'): Question[] => {
    const categoryQuestions = questionsByCategory[category];
    // Pour la démo, on prend les premières questions disponibles
    // Dans un vrai système, on ferait une sélection aléatoire ou basée sur des critères
    return categoryQuestions.slice(0, Math.min(20, categoryQuestions.length));
  };

  const startModule = (certificationType: string, moduleId: string) => {
    const certification = getCertificationById(certificationType);
    if (!certification) return;
    
    setCurrentCertification(certification);
    const module = certification.modules.find(m => m.id === moduleId);
    if (!module) return;

    const moduleIndex = certification.modules.findIndex(m => m.id === moduleId);
    setCurrentModuleIndex(moduleIndex);

    // Générer les questions pour ce module basé sur sa catégorie
    let category: 'leadership' | 'competences' | 'entrepreneuriat' = 'leadership';
    if (module.name.toLowerCase().includes('compétences')) {
      category = 'competences';
    } else if (module.name.toLowerCase().includes('entrepreneuriat')) {
      category = 'entrepreneuriat';
    }

    const moduleWithQuestions: CertificationModule = {
      ...module,
      questions: generateModuleQuestions(category)
    };

    setCurrentModule(moduleWithQuestions);
    setCurrentAnswers([]);
    setTimeRemaining(module.duration * 60); // Convert to seconds
    setIsExamActive(true);
  };

  const submitAnswer = (questionId: string, answer: string | number) => {
    setCurrentAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionId, value: answer };
        return updated;
      }
      return [...prev, { questionId, value: answer }];
    });
  };

  const submitModule = async (): Promise<boolean> => {
    if (!currentModule) return false;
    
    // Simulation de la soumission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Ajouter le module aux modules complétés
    setCompletedModules(prev => [...prev, currentModule.id]);
    
    const submission: ExamSubmission = {
      id: Date.now().toString(),
      candidateId: '3', // Mock candidate ID
      examId: currentModule.id,
      certificationType: currentCertification?.id || 'mock-cert',
      moduleId: currentModule.id,
      answers: currentAnswers,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    console.log('Module submitted:', submission);
    
    setCurrentAnswers([]);
    
    // Vérifier s'il y a d'autres modules
    if (currentCertification && currentModuleIndex < currentCertification.modules.length - 1) {
      // Il y a encore des modules à faire
      setIsExamActive(false);
      setCurrentModule(null);
      setTimeRemaining(0);
    } else {
      // Tous les modules sont terminés
      setIsExamActive(false);
      setCurrentModule(null);
      setCurrentCertification(null);
      setTimeRemaining(0);
      setCurrentModuleIndex(0);
    }
    
    return true;
  };

  const endExam = () => {
    setIsExamActive(false);
    setCurrentModule(null);
    setCurrentCertification(null);
    setCurrentAnswers([]);
    setTimeRemaining(0);
    setCurrentModuleIndex(0);
  };

  const value: ExamContextType = {
    currentModule,
    currentCertification,
    currentAnswers,
    timeRemaining,
    isExamActive,
    completedModules,
    currentModuleIndex,
    startModule,
    submitAnswer,
    submitModule,
    setTimeRemaining,
    endExam,
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
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
