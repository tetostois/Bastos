import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fonctions de gestion de session
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

const setSession = (token: string, user: any) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  // Mettre à jour l'en-tête d'autorisation pour les requêtes futures
  if (token) {
    // Cette partie sera utilisée par apiRequest
    // Pas besoin de configurer manuellement les en-têtes ici
  }
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Normalise les champs utilisateur du backend (snake_case) vers camelCase
  const normalizeUser = (raw: any): User => {
    if (!raw) return null as unknown as User;
    // role can be a string or an object like { roleName, ... }
    let roleVal: string = 'candidate';
    if (typeof raw.role === 'string') {
      roleVal = raw.role;
    } else if (raw.role && typeof raw.role === 'object') {
      roleVal = raw.role.roleName ?? raw.role.name ?? String(raw.role?.id ?? 'candidate');
    } else if (raw.role) {
      roleVal = String(raw.role);
    }

    return {
      id: String(raw.id ?? raw.uuid ?? ''),
      firstName: raw.firstName ?? raw.first_name ?? '',
      lastName: raw.lastName ?? raw.last_name ?? '',
      email: raw.email ?? '',
      phone: raw.phone ?? '',
      role: (roleVal ?? 'candidate') as User['role'],
      isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
      address: raw.address ?? '',
      birthDate: raw.birthDate ?? raw.date_of_birth ?? '',
      birthPlace: raw.birthPlace ?? raw.place_of_birth ?? '',
      city: raw.city ?? '',
      country: raw.country ?? '',
      profession: raw.profession ?? '',
      createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
      // champs facultatifs connus dans l'app
      specialization: raw.specialization ?? undefined,
      experience: raw.experience ?? undefined,
      // champs de progression
      hasPaid: Boolean(raw.hasPaid ?? raw.has_paid ?? false),
      examTaken: Boolean(raw.examTaken ?? raw.exam_taken ?? false),
      score: raw.score ?? undefined,
      certificate: raw.certificate ?? undefined,
      selectedCertification: raw.selectedCertification ?? raw.selected_certification ?? undefined,
      completedModules: raw.completedModules ?? raw.completed_modules ?? undefined,
      unlockedModules: raw.unlockedModules ?? raw.unlocked_modules ?? undefined,
      currentModule: raw.currentModule ?? raw.current_module ?? undefined,
      examStartDate: raw.examStartDate ?? raw.exam_start_date ?? undefined,
    } as User;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) return false;
      const data = await res.json();
      const normalized = normalizeUser(data.user);
      setSession(data.access_token, normalized);
      setUser(normalized);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } finally {
      clearSession();
      setUser(null);
    }
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        birthDate: userData.birthDate,
        birthPlace: userData.birthPlace,
        city: userData.city,
        country: userData.country,
        profession: userData.profession,
        password: password,
        confirmPassword: password
      };
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        try {
          const err = await res.json();
          console.error('Register error:', err);
          if (err && typeof window !== 'undefined') {
            sessionStorage.setItem('lastRegisterErrors', JSON.stringify(err));
          }
        } catch {
          const txt = await res.text().catch(() => '');
          if (txt) console.error('Register error (text):', txt);
        }
        return false;
      }
      const data = await res.json();
      const normalized = normalizeUser(data.user);
      setSession(data.access_token, normalized);
      setUser(normalized);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer l'utilisateur du localStorage au chargement et optionnellement valider auprès de l'API
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(normalizeUser(parsed));
      } catch {
        setUser(null);
      }
    }
    // Optionnel: valider le token et rafraîchir le profil
    const token = getToken();
    if (token) {
      fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => {
          if (!r.ok) {
            console.error('[Auth] /auth/me returned', r.status, r.statusText);
            return null;
          }
          return r.json();
        })
        .then(u => { if (u) {
          console.log('🔄 [AuthContext] Données API /auth/me:', u);
          const normalized = normalizeUser(u);
          console.log('🔄 [AuthContext] Données normalisées:', normalized);
          
          // Préserver les données de progression existantes si l'API ne les retourne pas
          const existingUser = localStorage.getItem('user');
          if (existingUser) {
            try {
              const existing = JSON.parse(existingUser);
              console.log('🔄 [AuthContext] Données existantes localStorage:', existing);
              
              const merged = {
                ...normalized,
                // PRIORITÉ AUX DONNÉES LOCALES pour les champs de progression
                // Si l'API retourne des valeurs vides, garder les données locales
                hasPaid: existing.hasPaid || normalized.hasPaid || false,
                selectedCertification: existing.selectedCertification || normalized.selectedCertification,
                currentModule: existing.currentModule || normalized.currentModule,
                completedModules: existing.completedModules || normalized.completedModules,
                unlockedModules: existing.unlockedModules || normalized.unlockedModules,
                examTaken: existing.examTaken || normalized.examTaken || false,
                score: existing.score || normalized.score,
                certificate: existing.certificate || normalized.certificate,
                examStartDate: existing.examStartDate || normalized.examStartDate,
              };
              
              console.log('🔄 [AuthContext] Données fusionnées:', merged);
              setUser(merged);
              localStorage.setItem('user', JSON.stringify(merged));
            } catch {
              setUser(normalized);
              localStorage.setItem('user', JSON.stringify(normalized));
            }
          } else {
            setUser(normalized);
            localStorage.setItem('user', JSON.stringify(normalized));
          }
        } })
        .catch(err => {
          console.error('[Auth] Error fetching /auth/me', err);
        });
    }
  }, []);

  const updateUser = (updates: Partial<User>) => {
    console.log('🔄 [AuthContext] Mise à jour utilisateur:', updates);
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...updates } as User;
      console.log('💾 [AuthContext] Sauvegarde utilisateur:', next);
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    getToken: (): string => getToken() || '',
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
