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
  X
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

interface ExamSubmission {
  id: string;
  candidateName: string;
  candidateEmail: string;
  submittedAt: string;
  status: 'pending' | 'assigned' | 'corrected';
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

  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([
    {
      id: '1',
      candidateName: 'Marie Dubois',
      candidateEmail: 'marie.dubois@email.com',
      submittedAt: '2024-01-15T14:30:00Z',
      status: 'pending'
    },
    {
      id: '2',
      candidateName: 'Paul Nkomo',
      candidateEmail: 'paul.nkomo@email.com',
      submittedAt: '2024-01-14T10:15:00Z',
      status: 'assigned',
      assignedTo: 'Dr. Jean Kamga'
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

  const [certificates] = useState<Certificate[]>([
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
    phone: '',
    specialization: '',
    experience: ''
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalExaminers: examiners.length,
    activeExaminers: examiners.filter(e => e.isActive).length,
    pendingExams: examSubmissions.filter(e => e.status === 'pending').length,
    completedExams: examSubmissions.filter(e => e.status === 'corrected').length,
    totalPayments: payments.reduce((sum, p) => sum + p.amount, 0),
    completedPayments: payments.filter(p => p.status === 'completed').length,
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
        experience: examiner.experience
      });
    } else {
      setExaminerForm({
        firstName: '',
        lastName: '',
        email: '',
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
    alert(`Email envoyé à ${examiner.firstName} ${examiner.lastName}`);
  };

  // Exam Functions
  const assignExaminer = (submissionId: string, examinerId: string) => {
    const examiner = examiners.find(e => e.id === examinerId);
    const updatedSubmissions = examSubmissions.map(s => 
      s.id === submissionId ? { 
        ...s, 
        status: 'assigned' as const, 
        assignedTo: examiner ? `${examiner.firstName} ${examiner.lastName}` : undefined 
      } : s
    );
    setExamSubmissions(updatedSubmissions);
    console.log('Examen assigné:', { submissionId, examinerId });
  };

  // Certificate Functions
  const downloadCertificate = (certificate: Certificate) => {
    console.log('Téléchargement du certificat:', certificate.downloadUrl);
    alert(`Téléchargement du certificat de ${certificate.candidateName}`);
  };

  const sendCertificateByEmail = (certificate: Certificate) => {
    console.log('Certificat envoyé par email:', certificate.candidateName);
    alert(`Certificat envoyé par email à ${certificate.candidateName}`);
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
    { id: 'settings', label: 'Paramètres', icon: Settings }
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
                      {examSubmissions.map((submission) => (
                        <tr key={submission.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{submission.candidateName}</p>
                              <p className="text-sm text-gray-500">{submission.candidateEmail}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {formatDate(submission.submittedAt)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              submission.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                              submission.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {submission.status === 'pending' ? 'En attente' :
                               submission.status === 'assigned' ? 'Assigné' : 'Corrigé'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {submission.assignedTo || '-'}
                          </td>
                          <td className="py-3 px-4">
                            {submission.status === 'pending' && (
                              <select
                                onChange={(e) => assignExaminer(submission.id, e.target.value)}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                                defaultValue=""
                              >
                                <option value="">Assigner à...</option>
                                {examiners.filter(e => e.isActive).map((examiner) => (
                                  <option key={examiner.id} value={examiner.id}>
                                    {examiner.firstName} {examiner.lastName}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
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