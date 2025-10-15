import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, CreditCard, FileText, BookOpen, AlertCircle, Download, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useExam } from '../contexts/ExamContext';
import { CertificationSelector } from '../components/certification/CertificationSelector';
import { ModuleProgress } from '../components/certification/ModuleProgress';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PaymentForm } from '../components/payment/PaymentForm';
import { Input } from '../components/ui/Input';
import { getCertificationById } from '../components/data/certifications';
import { CandidateService, CorrectionDetails } from '../services/candidateService';
import ExamInformation from '../components/ExamInformation';


export const CandidateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { startModule, isExamActive } = useExam();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(user?.hasPaid || false);
  const [showExamInstructions, setShowExamInstructions] = useState(false);
  const [showExamInformation, setShowExamInformation] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showCertificationSelector, setShowCertificationSelector] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState(user?.selectedCertification);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'full' | 'per-module'>('full');
  const [selectedModuleForPayment, setSelectedModuleForPayment] = useState<string>('');
  const [resultsView, setResultsView] = useState<'results' | 'correction'>('results');
  const [corrections, setCorrections] = useState<CorrectionDetails[]>([]);
  const [loadingCorrections, setLoadingCorrections] = useState(false);
  const moduleProgressRef = useRef<HTMLDivElement | null>(null);
  
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profession: user?.profession || '',
    selectedCertification: user?.selectedCertification || ''
  });
  
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: ''
  });


  if (!user) return null;

  const currentCertification = selectedCertification ? getCertificationById(selectedCertification) : null;

  const handlePaymentSuccess = () => {
    setPaymentCompleted(true);
    setShowPayment(false);
    // Mise à jour persistante du statut utilisateur
    updateUser({ hasPaid: true });
    // Afficher la page d'information sur l'examen
    setShowExamInformation(true);
  };

  const handleCertificationSelect = (certification: any) => {
    setSelectedCertification(certification.id);
    updateUser({ selectedCertification: certification.id });
    setShowCertificationSelector(false);
  };

  const handleExamInformationContinue = () => {
    setShowExamInformation(false);
    // Marquer que l'utilisateur a vu la page d'information
    if (user?.id) {
      localStorage.setItem(`exam-info-seen-${user.id}`, 'true');
    }
    // L'utilisateur peut maintenant accéder aux modules
  };

  const handleExamInformationBack = () => {
    setShowExamInformation(false);
    setShowPayment(true);
  };


  const handleStartModuleWithPayment = (moduleId: string) => {
    if (!currentCertification) return;
    
    if (!paymentCompleted) {
      setSelectedPaymentType('per-module');
      setSelectedModuleForPayment(moduleId);
      setShowPayment(true);
      return;
    }
    
    // Le module sera démarré directement par ModuleProgress
  };
  
  const handleContinueModule = (moduleId: string) => {
    if (!currentCertification) return;
    
    // Démarrer le module
    startModule(currentCertification.id, moduleId);
    
    // Mettre à jour l'état de l'utilisateur pour refléter le module en cours
    updateUser({ currentModule: moduleId });
    
    // Rediriger vers la page d'examen
    navigate('/exam');
  };

  const handlePaymentTypeSelect = (type: 'full' | 'per-module') => {
    setSelectedPaymentType(type);
    if (type === 'per-module') {
      // Redirect to per-module payment page
      navigate('/module-payment');
      return;
    }
    setShowPayment(true);
  };

  const saveProfile = () => {
    // Simulation de la sauvegarde
    console.log('Profil mis à jour:', profileForm);
    alert('Profil mis à jour avec succès !');
    setShowProfileModal(false);
  };
  
  const sendSupportMessage = () => {
    if (!supportForm.subject || !supportForm.message) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    console.log('Message de support envoyé:', supportForm);
    alert('Votre message a été envoyé au support !');
    setSupportForm({ subject: '', message: '' });
    setShowSupportModal(false);
  };

  // Charger les corrections
  const loadCorrections = async () => {
    if (user?.score === undefined) return;
    
    try {
      setLoadingCorrections(true);
      const response = await CandidateService.getCorrections();
      
      if (response.success) {
        // Aplatir toutes les corrections de toutes les soumissions
        const allCorrections: CorrectionDetails[] = [];
        response.corrections.forEach((submission: any) => {
          allCorrections.push(...submission.questions);
        });
        setCorrections(allCorrections);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des corrections:', error);
    } finally {
      setLoadingCorrections(false);
    }
  };

  // Charger les corrections quand l'utilisateur a un score
  useEffect(() => {
    if (user?.score !== undefined) {
      loadCorrections();
    }
  }, [user?.score]);

  // Réinitialiser la vue à "results" quand les corrections changent
  useEffect(() => {
    if (corrections.length === 0) {
      setResultsView('results');
    }
  }, [corrections]);

  const steps = [
    {
      id: 'payment',
      title: 'Paiement',
      description: 'Régler les frais d\'examen',
      completed: paymentCompleted,
      current: !paymentCompleted
    },
    {
      id: 'exam',
      title: 'Modules',
      description: 'Compléter les 3 modules',
      completed: user.examTaken || false,
      current: paymentCompleted && !user.examTaken && !isExamActive
    },
    {
      id: 'correction',
      title: 'Correction',
      description: 'Attendre l\'évaluation',
      completed: user.score !== undefined,
      current: user.examTaken === true && user.score === undefined
    },
    {
      id: 'certificate',
      title: 'Certification',
      description: 'Récupérer l\'attestation',
      completed: user.certificate !== undefined,
      current: user.score !== undefined && user.certificate === undefined
    }
  ];

  // Initialiser le sélecteur de certification au chargement
  useEffect(() => {
    if (user && !user.selectedCertification) {
      setShowCertificationSelector(true);
    }
  }, [user]);

  // Synchroniser les états locaux avec les données utilisateur
  useEffect(() => {
    if (user) {
      console.log('🔄 [CandidateDashboard] Synchronisation des états utilisateur:', {
        hasPaid: user.hasPaid,
        selectedCertification: user.selectedCertification,
        currentModule: user.currentModule
      });
      setPaymentCompleted(user.hasPaid || false);
      setSelectedCertification(user.selectedCertification);
      
      // IMPORTANT: Ne jamais réafficher le sélecteur de certification une fois qu'elle est choisie
      // Même si l'utilisateur se reconnecte, s'il a déjà une certification, ne pas réafficher le sélecteur
      if (user.selectedCertification) {
        setShowCertificationSelector(false);
      }
    }
  }, [user]);

  // Afficher la page d'information sur l'examen si l'utilisateur a payé mais n'a pas encore vu cette page
  useEffect(() => {
    if (user?.hasPaid && user?.selectedCertification && !showExamInformation) {
      // Vérifier si l'utilisateur a déjà vu la page d'information
      const hasSeenExamInfo = localStorage.getItem(`exam-info-seen-${user.id}`);
      if (!hasSeenExamInfo) {
        setShowExamInformation(true);
      }
    }
  }, [user?.hasPaid, user?.selectedCertification, user?.id, showExamInformation]);

  // Après paiement et certification choisie, amener l'utilisateur directement aux modules
  useEffect(() => {
    if (paymentCompleted && currentCertification && moduleProgressRef.current) {
      // Petit délai pour laisser le DOM se peindre
      setTimeout(() => {
        moduleProgressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [paymentCompleted, currentCertification]);

  if (isExamActive) {
    // L'interface d'examen sera affichée par App.tsx
    return null;
  }

  // Afficher le sélecteur de certification UNIQUEMENT si aucune n'est sélectionnée
  // Une fois qu'une certification est choisie, on ne revient JAMAIS à cette interface
  console.log('🎯 [CandidateDashboard] État des conditions:', {
    showCertificationSelector,
    paymentCompleted,
    selectedCertification,
    currentCertification: !!currentCertification,
    userHasPaid: user?.hasPaid,
    userSelectedCert: user?.selectedCertification
  });

  // SEULEMENT si l'utilisateur n'a JAMAIS choisi de certification
  if (!user?.selectedCertification) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CertificationSelector
            onSelect={handleCertificationSelect}
            selectedCertification={selectedCertification}
          />
        </div>
      </div>
    );
  }

  // Afficher la page d'information sur l'examen après le paiement
  if (showExamInformation && user?.hasPaid) {
    return (
      <ExamInformation
        certification={user.selectedCertification || ''}
        onContinue={handleExamInformationContinue}
        onBack={handleExamInformationBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue, {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600 mt-2">
            {currentCertification ? 
              `Progression: ${currentCertification.name}` : 
              'Suivez votre progression vers la certification'
            }
          </p>
        </div>

        {/* Progress Steps */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Votre Progression</h2>
          
          <div className="relative">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    step.completed 
                      ? 'bg-green-600 text-white'
                      : step.current
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <span className="font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="max-w-xs">
                    <p className="font-medium text-sm text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Progress Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-300 -z-10">
              <div 
                className="h-full bg-green-600 transition-all duration-500"
                style={{
                  width: `${(steps.filter(s => s.completed).length / (steps.length - 1)) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </Card>

        {/* Certification Progress */}
        {currentCertification && paymentCompleted && (
          <div ref={moduleProgressRef}>
          <ModuleProgress
            certification={currentCertification}
            completedModules={user.completedModules || []}
            unlockedModules={(user as any).unlockedModules || []}
            currentModule={user.currentModule}
            onStartModuleWithPayment={handleStartModuleWithPayment}
            onContinueModule={handleContinueModule}
            examStartDate={user.examStartDate}
            hasPaid={paymentCompleted}
          />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interface de paiement - UNIQUEMENT si l'utilisateur n'a JAMAIS payé */}
            {!user?.hasPaid && (
              <Card>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Paiement requis
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Pour accéder aux modules, vous devez d'abord régler les frais de certification.
                    </p>
                    {currentCertification && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-900 font-medium">Certification :</span>
                          <span className="text-sm text-blue-700">{currentCertification.name}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-900 font-medium">Modules :</span>
                          <span className="text-blue-700">{currentCertification.modules.length} modules</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-blue-900 font-medium">Montant à payer :</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'XAF',
                              minimumFractionDigits: 0
                            }).format(currentCertification.price)}
                          </span>
                        </div>
                        {currentCertification.pricePerModule && (
                          <div className="border-t border-blue-200 pt-3">
                            <p className="text-blue-800 text-sm mb-2">Options de paiement :</p>
                            <div className="space-y-2">
                              <button
                                onClick={() => handlePaymentTypeSelect('full')}
                                className="w-full text-left p-2 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-blue-900">Certification complète</span>
                                  <span className="text-blue-600">{new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'XAF',
                                    minimumFractionDigits: 0
                                  }).format(currentCertification.price)}</span>
                                </div>
                                <p className="text-xs text-blue-700">Accès à tous les modules</p>
                              </button>
                              <button
                                onClick={() => handlePaymentTypeSelect('per-module')}
                                className="w-full text-left p-2 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-blue-900">Paiement par module</span>
                                  <span className="text-blue-600">{new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'XAF',
                                    minimumFractionDigits: 0
                                  }).format(currentCertification.pricePerModule)}</span>
                                </div>
                                <p className="text-xs text-blue-700">Payez module par module</p>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <Button onClick={() => handlePaymentTypeSelect('full')}>
                      Procéder au paiement
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {paymentCompleted && !user.examTaken && !isExamActive && currentCertification && (
              <Card>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Prêt pour les modules
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Votre paiement a été confirmé. Vous pouvez maintenant commencer les modules de certification.
                    </p>
                    {user?.currentModule && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Vous avez laissé le module en cours: <strong>{user.currentModule}</strong>
                        </p>
                        <div className="mt-2">
                          <Button onClick={() => handleContinueModule(user.currentModule as string)} className="bg-blue-600 hover:bg-blue-700">
                            Continuer là où vous vous êtes arrêté
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Important :</span>
                      </div>
                      <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                        <li>• Chaque module dure 60 minutes (20 questions)</li>
                        <li>• Vous avez 3 jours pour terminer tous les modules</li>
                        <li>• Assurez-vous d'avoir une connexion internet stable</li>
                        <li>• Préparez un environnement calme et sans distractions</li>
                      </ul>
                    </div>
                    <div className="flex space-x-3">
                      <Button onClick={() => handleStartModuleWithPayment(currentCertification.modules[0].id)}>
                        <Play className="h-4 w-4 mr-2" />
                        Commencer le premier module
                      </Button>
                      <Button onClick={() => setShowExamInstructions(true)} variant="secondary">
                        Voir les instructions
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {user.examTaken && !user.score && (
              <Card>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Modules soumis
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Vos modules ont été soumis avec succès et sont en cours de correction par nos examinateurs.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        <Clock className="h-4 w-4 inline mr-2" />
                        Délai de correction : 48-72 heures
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {user.score !== undefined && (
              <Card>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Résultats disponibles
                      </h3>
                      {corrections.length > 0 && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant={resultsView === 'results' ? 'primary' : 'secondary'}
                            onClick={() => setResultsView('results')}
                          >
                            Résultats
                          </Button>
                          <Button
                            size="sm"
                            variant={resultsView === 'correction' ? 'primary' : 'secondary'}
                            onClick={() => setResultsView('correction')}
                          >
                            Correction
                          </Button>
                        </div>
                      )}
                    </div>

                    {resultsView === 'results' && (
                      <>
                        <p className="text-gray-600 mb-4">
                          Félicitations ! Vos modules ont été corrigés et votre certificat est prêt.
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-green-800 font-medium">Score obtenu :</span>
                            <span className="text-2xl font-bold text-green-600">{user.score}/100</span>
                          </div>
                          <p className="text-green-700 text-sm">
                            {user.score >= 70 ? 'Certification réussie !' : 'Score insuffisant pour la certification'}
                          </p>
                        </div>
                        {user.score >= 70 && (
                          <Button className="flex items-center space-x-2">
                            <Download className="h-4 w-4" />
                            <span>Télécharger le certificat</span>
                          </Button>
                        )}
                      </>
                    )}

                    {resultsView === 'correction' && corrections.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-gray-600 mb-4">
                          Voici les commentaires détaillés de l'examinateur pour chaque question :
                        </p>
                        
                        {loadingCorrections ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Chargement des corrections...</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {corrections.map((correction, index) => (
                              <div key={correction.question_id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                                  <span className="text-sm text-gray-500">
                                    {correction.score}/{correction.max_score} points
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  <strong>Votre réponse :</strong> "{correction.candidate_answer}"
                                </p>
                                {correction.feedback && (
                                  <div className={`border rounded p-3 ${
                                    correction.score === correction.max_score 
                                      ? 'bg-green-50 border-green-200' 
                                      : 'bg-blue-50 border-blue-200'
                                  }`}>
                                    <p className={`text-sm ${
                                      correction.score === correction.max_score 
                                        ? 'text-green-800' 
                                        : 'text-blue-800'
                                    }`}>
                                      <strong>Commentaire de l'examinateur :</strong> {correction.feedback}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Note :</strong> Ces commentaires vous aideront à comprendre vos points forts et les domaines à améliorer. 
                            Continuez à développer vos compétences !
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Message quand il n'y a pas encore de corrections */}
                    {user.score !== undefined && corrections.length === 0 && !loadingCorrections && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                          <div>
                            <p className="text-sm text-yellow-800 font-medium">
                              Corrections en cours
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              L'examinateur est en train de corriger votre copie. Les commentaires détaillés apparaîtront ici une fois la correction terminée.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Certification</h3>
                {/* Bouton "Changer" masqué une fois qu'une certification est choisie */}
                {!user?.selectedCertification && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowCertificationSelector(true)}
                  >
                    Changer
                  </Button>
                )}
              </div>
              {currentCertification && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 text-sm mb-1">
                    {currentCertification.name}
                  </h4>
                  <p className="text-xs text-blue-700">
                    {currentCertification.modules.length} modules • {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XAF',
                      minimumFractionDigits: 0
                    }).format(currentCertification.price)}
                  </p>
                </div>
              )}
              
              <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium">Profil</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowProfileModal(true)}
                >
                  Modifier
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email :</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Téléphone :</span>
                  <span className="font-medium">{user.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Profession :</span>
                  <span className="font-medium">{user.profession}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Statut :</span>
                  <span className={`font-medium ${
                    user.score !== undefined ? 'text-green-600' :
                    user.examTaken ? 'text-blue-600' :
                    paymentCompleted ? 'text-orange-600' : 'text-gray-600'
                  }`}>
                    {user.score !== undefined ? 'Certifié' :
                     user.examTaken ? 'En correction' :
                     paymentCompleted ? 'Prêt pour modules' : 'En attente de paiement'}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Support</h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowSupportModal(true)}
                >
                  Contacter
                </Button>
              </div>
              <h3 className="font-semibold text-gray-900 mb-4">Détails des modules</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Durée par module :</span>
                  <span className="font-medium">60 minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Questions par module :</span>
                  <span className="font-medium">20 questions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Score minimum :</span>
                  <span className="font-medium">70/100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Format :</span>
                  <span className="font-medium">QCM + Texte libre</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Prix :</span>
                  <span className="font-medium">
                    {currentCertification ? 
                      new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XAF',
                        minimumFractionDigits: 0
                      }).format(currentCertification.price) : 'Non défini'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Modifier mon profil</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                />
                <Input
                  label="Nom"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                />
                <Input
                  label="Téléphone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                />
                <Input
                  label="Profession"
                  value={profileForm.profession}
                  onChange={(e) => setProfileForm({...profileForm, profession: e.target.value})}
                />
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button variant="secondary" onClick={() => setShowProfileModal(false)} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={saveProfile} className="flex-1">
                  Sauvegarder
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Contacter le support</h3>
              <button 
                onClick={() => setShowSupportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <select
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un sujet</option>
                    <option value="payment">Problème de paiement</option>
                    <option value="exam">Question sur l'examen</option>
                    <option value="technical">Problème technique</option>
                    <option value="certificate">Certificat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={supportForm.message}
                    onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Décrivez votre problème ou votre question..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button variant="secondary" onClick={() => setShowSupportModal(false)} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={sendSupportMessage} className="flex-1">
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-1">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Paiement de l'examen</h3>
              <button 
                onClick={() => setShowPayment(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <PaymentForm 
                amount={
                  selectedPaymentType === 'full' 
                    ? (currentCertification?.price || 50000)
                    : (currentCertification?.pricePerModule || 25000)
                }
                certificationType={selectedCertification || ''}
                paymentType={selectedPaymentType}
                moduleId={selectedModuleForPayment}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* Module Instructions Modal */}
      {showExamInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Instructions des modules</h3>
              <button 
                onClick={() => setShowExamInstructions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Règles importantes :</h4>
                <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
                  <li>Chaque module dure exactement 60 minutes et ne peut pas être interrompu</li>
                  <li>Chaque module contient 20 questions variées</li>
                  <li>Vous pouvez naviguer entre les questions et modifier vos réponses</li>
                  <li>La soumission est automatique à la fin du temps imparti</li>
                  <li>Vous avez 3 jours pour terminer tous les modules</li>
                  <li>Assurez-vous d'avoir une connexion internet stable</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Conseils :</h4>
                <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
                  <li>Lisez attentivement chaque question avant de répondre</li>
                  <li>Gérez votre temps efficacement</li>
                  <li>Complétez les modules dans l'ordre (Leadership → Compétences → Entrepreneuriat)</li>
                  <li>Pour les questions ouvertes, donnez des exemples concrets</li>
                  <li>Vérifiez vos réponses avant la soumission finale</li>
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowExamInstructions(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={() => currentCertification && handleStartModuleWithPayment(currentCertification.modules[0].id)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Commencer les modules
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};