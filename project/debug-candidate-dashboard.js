// Script de debug pour le CandidateDashboard
// À exécuter dans la console du navigateur

console.log('🔍 [DEBUG] Début du debug CandidateDashboard');

// 1. Vérifier les données utilisateur dans localStorage
const userData = localStorage.getItem('user');
const token = localStorage.getItem('token');

console.log('📊 [DEBUG] Données localStorage:', {
    user: userData ? JSON.parse(userData) : null,
    token: token
});

// 2. Vérifier si l'utilisateur a les bonnes données
if (userData) {
    const user = JSON.parse(userData);
    console.log('👤 [DEBUG] Utilisateur actuel:', {
        hasPaid: user.hasPaid,
        selectedCertification: user.selectedCertification,
        currentModule: user.currentModule,
        completedModules: user.completedModules,
        unlockedModules: user.unlockedModules
    });

    // 3. Tester la logique d'affichage
    const shouldShowCertificationSelector = !user.selectedCertification;
    const shouldShowPayment = !user.hasPaid;
    const shouldShowModules = user.hasPaid && user.selectedCertification;

    console.log('🎯 [DEBUG] Logique d'affichage:', {
        shouldShowCertificationSelector,
        shouldShowPayment,
        shouldShowModules,
        currentCertification: user.selectedCertification ? 'Oui' : 'Non'
    });

    // 4. Recommandations
    if (shouldShowCertificationSelector) {
        console.log('⚠️ [DEBUG] L\'utilisateur devrait voir le sélecteur de certification');
    }
    if (shouldShowPayment) {
        console.log('⚠️ [DEBUG] L\'utilisateur devrait voir l\'interface de paiement');
    }
    if (shouldShowModules) {
        console.log('✅ [DEBUG] L\'utilisateur devrait voir les modules directement');
    }
} else {
    console.log('❌ [DEBUG] Aucun utilisateur trouvé dans localStorage');
}

// 5. Fonction pour créer un utilisateur de test
window.createTestUser = function() {
    const testUser = {
        id: "test-user-123",
        firstName: "Test",
        lastName: "Candidat",
        email: "test@example.com",
        phone: "123456789",
        role: "candidate",
        isActive: true,
        address: "Test Address",
        birthDate: "1990-01-01",
        birthPlace: "Test City",
        city: "Test City",
        country: "Test Country",
        profession: "Test Profession",
        createdAt: new Date().toISOString(),
        hasPaid: true,
        selectedCertification: "initiation-pratique",
        currentModule: "leadership-init",
        completedModules: [],
        unlockedModules: ["leadership-init"],
        examTaken: false,
        score: undefined,
        certificate: undefined
    };

    localStorage.setItem('user', JSON.stringify(testUser));
    localStorage.setItem('token', 'test-token-123');
    
    console.log('✅ [DEBUG] Utilisateur de test créé. Rechargez la page pour voir les changements.');
    return testUser;
};

// 6. Fonction pour effacer les données
window.clearUserData = function() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('🗑️ [DEBUG] Données utilisateur effacées');
};

console.log('🛠️ [DEBUG] Fonctions disponibles:');
console.log('- createTestUser() : Créer un utilisateur de test avec progression');
console.log('- clearUserData() : Effacer toutes les données utilisateur');

