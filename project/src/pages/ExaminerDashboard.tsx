import React, { useState } from 'react';
import { FileText, Clock, CheckCircle, User, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface Submission {
  id: string;
  candidateName: string;
  candidateEmail: string;
  submittedAt: string;
  status: 'pending' | 'corrected';
  score?: number;
  answers: { questionId: string; question: string; answer: string; points: number }[];
}

export const ExaminerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialization: user?.specialization || '',
    experience: user?.experience || ''
  });
  
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: ''
  });

  // Mock submissions data
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: '1',
      candidateName: 'Marie Candidate',
      candidateEmail: 'marie.candidate@email.com',
      submittedAt: '2024-01-15T14:30:00Z',
      status: 'pending',
      answers: [
        {
          questionId: '1',
          question: 'Qu\'est-ce qui caractérise le mieux un leader transformationnel ?',
          answer: 'Il inspire et motive ses équipes vers une vision commune',
          points: 10
        },
        {
          questionId: '2',
          question: 'Comment un leader doit-il réagir face à un conflit dans son équipe ?',
          answer: 'Faciliter la communication entre les parties pour trouver une solution',
          points: 10
        },
        {
          questionId: '3',
          question: 'Décrivez votre approche pour développer les compétences de votre équipe.',
          answer: 'Mon approche pour développer les compétences de mon équipe se base sur plusieurs piliers. D\'abord, j\'identifie les forces et faiblesses individuelles par des évaluations régulières. Ensuite, je crée des plans de développement personnalisés avec des objectifs SMART. J\'encourage la formation continue et le mentorat entre pairs. Je délègue progressivement des responsabilités plus importantes pour favoriser l\'apprentissage par l\'expérience. Enfin, je maintiens un feedback constructif constant et je reconnais les progrès pour maintenir la motivation.',
          points: 20
        },
        {
          questionId: '4',
          question: 'Quelle est l\'importance de la communication dans le leadership ?',
          answer: 'Elle permet d\'établir la confiance et l\'alignement',
          points: 10
        },
        {
          questionId: '5',
          question: 'Comment évalueriez-vous le succès d\'une initiative de leadership que vous avez menée ?',
          answer: 'Pour évaluer le succès d\'une initiative de leadership, j\'utilise plusieurs indicateurs. Par exemple, lors de la réorganisation de mon équipe l\'année dernière, j\'ai mesuré : 1) L\'engagement des employés via des sondages (amélioration de 25%), 2) La productivité (augmentation de 15%), 3) Le taux de rétention (réduction du turnover de 30%), 4) Les feedbacks clients (satisfaction en hausse de 20%). J\'ai aussi évalué les objectifs qualitatifs comme l\'amélioration de la collaboration inter-équipes et le développement des compétences individuelles. Cette approche multi-dimensionnelle m\'a permis de valider l\'efficacité de mon leadership et d\'identifier les axes d\'amélioration.',
          points: 25
        }
      ]
    },
    {
      id: '2',
      candidateName: 'Jean Dupont',
      candidateEmail: 'jean.dupont@email.com',
      submittedAt: '2024-01-14T10:15:00Z',
      status: 'corrected',
      score: 78,
      answers: [
        {
          questionId: '1',
          question: 'Qu\'est-ce qui caractérise le mieux un leader transformationnel ?',
          answer: 'Il se concentre uniquement sur les résultats financiers',
          points: 0
        },
        {
          questionId: '2',
          question: 'Comment un leader doit-il réagir face à un conflit dans son équipe ?',
          answer: 'Faciliter la communication entre les parties pour trouver une solution',
          points: 10
        }
      ]
    }
  ]);

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const correctedSubmissions = submissions.filter(s => s.status === 'corrected');

  const handleScoreChange = (questionId: string, score: number) => {
    setScores(prev => ({ ...prev, [questionId]: score }));
  };

  const handleFeedbackChange = (questionId: string, text: string) => {
    setFeedback(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSubmitCorrection = () => {
    if (!selectedSubmission) return;

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    setSubmissions(prev => prev.map(submission => 
      submission.id === selectedSubmission.id 
        ? { ...submission, status: 'corrected' as const, score: totalScore }
        : submission
    ));

    setSelectedSubmission(null);
    setScores({});
    setFeedback({});
  };
  
  const saveProfile = () => {
    console.log('Profil examinateur mis à jour:', profileForm);
    alert('Profil mis à jour avec succès !');
    setShowProfileModal(false);
  };
  
  const sendSupportMessage = () => {
    if (!supportForm.subject || !supportForm.message) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    console.log('Message de support envoyé:', supportForm);
    alert('Votre message a été envoyé à l\'administration !');
    setSupportForm({ subject: '', message: '' });
    setShowSupportModal(false);
  };
  
  const exportCorrections = () => {
    console.log('Export des corrections...');
    alert('Export des corrections en cours...');
  };
  
  // Filtrer les soumissions
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Examinateur
          </h1>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowStatsModal(true)}
              >
                Mes statistiques
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowProfileModal(true)}
              >
                Mon profil
              </Button>
              <Button
                variant="secondary"
                onClick={exportCorrections}
              >
                Exporter
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowSupportModal(true)}
              >
                Support
              </Button>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            Gérez les corrections des examens qui vous sont attribués
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">En attente</h3>
                <p className="text-2xl font-bold text-orange-600">{pendingSubmissions.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Corrigés</h3>
                <p className="text-2xl font-bold text-green-600">{correctedSubmissions.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total</h3>
                <p className="text-2xl font-bold text-blue-600">{submissions.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 mb-4">Corrections en attente</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="pending">En attente</option>
                    <option value="corrected">Corrigés</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                {filteredSubmissions.filter(s => s.status === 'pending').map(submission => (
                  <div
                    key={submission.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSubmission?.id === submission.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {submission.candidateName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(submission.submittedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredSubmissions.filter(s => s.status === 'pending').length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Aucune correction en attente
                  </p>
                )}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Récemment corrigés</h3>
              <div className="space-y-3">
                {filteredSubmissions.filter(s => s.status === 'corrected').slice(0, 5).map(submission => (
                  <div
                    key={submission.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {submission.candidateName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(submission.submittedAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold text-green-600">
                          {submission.score}/100
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Correction Interface */}
          <div className="lg:col-span-2">
            {selectedSubmission ? (
              <Card>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Correction de l'examen
                    </h3>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      En cours
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Candidat :</span>
                      <span className="ml-2 font-medium">{selectedSubmission.candidateName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email :</span>
                      <span className="ml-2 font-medium">{selectedSubmission.candidateEmail}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Soumis le :</span>
                      <span className="ml-2 font-medium">{formatDate(selectedSubmission.submittedAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Questions :</span>
                      <span className="ml-2 font-medium">{selectedSubmission.answers.length}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mb-6">
                  {selectedSubmission.answers.map((answer, index) => (
                    <div key={answer.questionId} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Question {index + 1} ({answer.points} points)
                        </h4>
                        <p className="text-gray-700 text-sm mb-3">{answer.question}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-800 mb-2">Réponse du candidat :</h5>
                        <div className="bg-gray-50 p-3 rounded border">
                          <p className="text-gray-900">{answer.answer}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Score attribué
                          </label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="0"
                              max={answer.points}
                              value={scores[answer.questionId] || ''}
                              onChange={(e) => handleScoreChange(answer.questionId, parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                            <span className="text-gray-600">/ {answer.points}</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Commentaire (optionnel)
                          </label>
                          <Input
                            value={feedback[answer.questionId] || ''}
                            onChange={(e) => handleFeedbackChange(answer.questionId, e.target.value)}
                            placeholder="Commentaire sur la réponse..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-medium text-gray-900">Score total :</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {Object.values(scores).reduce((sum, score) => sum + score, 0)} / 75
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedSubmission(null)}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSubmitCorrection}
                      disabled={selectedSubmission.answers.some(answer => scores[answer.questionId] === undefined)}
                      className="flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Valider la correction</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun examen sélectionné
                </h3>
                <p className="text-gray-600">
                  Sélectionnez un examen en attente de correction pour commencer
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Mes Statistiques</h3>
              <button 
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{submissions.length}</div>
                  <div className="text-sm text-gray-600">Examens assignés</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{correctedSubmissions.length}</div>
                  <div className="text-sm text-gray-600">Examens corrigés</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{pendingSubmissions.length}</div>
                  <div className="text-sm text-gray-600">En attente</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">24h</div>
                  <div className="text-sm text-gray-600">Temps moyen</div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button onClick={() => setShowStatsModal(false)} className="w-full">
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Mon Profil</h3>
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
                  label="Spécialisation"
                  value={profileForm.specialization}
                  onChange={(e) => setProfileForm({...profileForm, specialization: e.target.value})}
                />
                <Input
                  label="Expérience"
                  value={profileForm.experience}
                  onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})}
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
              <h3 className="text-lg font-semibold">Contacter l'Administration</h3>
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
                    <option value="technical">Problème technique</option>
                    <option value="exam">Question sur un examen</option>
                    <option value="schedule">Planification</option>
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
    </div>
  );
};