// Script de diagnostic pour comprendre le problème de progression utilisateur
// À exécuter dans la console du navigateur sur votre application

console.log('🔍 DIAGNOSTIC DE PROGRESSION UTILISATEUR');
console.log('=====================================');

// 1. Vérifier les données dans localStorage
console.log('\n1️⃣ DONNÉES DANS LOCALSTORAGE:');
const userData = localStorage.getItem('user');
const tokenData = localStorage.getItem('token');

console.log('Token:', tokenData ? '✅ Présent' : '❌ Absent');
console.log('User data:', userData ? '✅ Présent' : '❌ Absent');

if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log('Données utilisateur:');
    console.log('  - ID:', user.id);
    console.log('  - Nom:', user.firstName, user.lastName);
    console.log('  - Email:', user.email);
    console.log('  - Certification sélectionnée:', user.selectedCertification || 'AUCUNE');
    console.log('  - A payé:', user.hasPaid ? '✅ OUI' : '❌ NON');
    console.log('  - Module actuel:', user.currentModule || 'AUCUN');
    console.log('  - Modules complétés:', user.completedModules || []);
    console.log('  - Modules déverrouillés:', user.unlockedModules || []);
  } catch (error) {
    console.error('❌ Erreur parsing user data:', error);
  }
}

// 2. Simuler l'appel API /auth/me
console.log('\n2️⃣ SIMULATION APPEL API /auth/me:');
if (tokenData) {
  fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${tokenData}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Status API:', response.status);
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`API Error: ${response.status}`);
    }
  })
  .then(apiUser => {
    console.log('Données API:');
    console.log('  - Certification sélectionnée:', apiUser.selected_certification || 'AUCUNE');
    console.log('  - A payé:', apiUser.has_paid ? '✅ OUI' : '❌ NON');
    console.log('  - Module actuel:', apiUser.current_module || 'AUCUN');
    
    // 3. Comparer les données
    console.log('\n3️⃣ COMPARAISON DES DONNÉES:');
    if (userData) {
      const localUser = JSON.parse(userData);
      
      const certificationMatch = localUser.selectedCertification === apiUser.selected_certification;
      const paymentMatch = localUser.hasPaid === apiUser.has_paid;
      const moduleMatch = localUser.currentModule === apiUser.current_module;
      
      console.log('Certification:', certificationMatch ? '✅ Identique' : '❌ Différent');
      console.log('Paiement:', paymentMatch ? '✅ Identique' : '❌ Différent');
      console.log('Module:', moduleMatch ? '✅ Identique' : '❌ Différent');
      
      if (!certificationMatch || !paymentMatch || !moduleMatch) {
        console.log('\n🚨 PROBLÈME DÉTECTÉ:');
        console.log('Les données locales et API ne correspondent pas !');
        console.log('Cela explique pourquoi l\'utilisateur revoit le sélecteur de certification.');
      }
    }
  })
  .catch(error => {
    console.error('❌ Erreur API:', error);
    console.log('💡 Vérifiez que votre serveur Laravel est démarré sur le port 8000');
  });
} else {
  console.log('❌ Pas de token, impossible de tester l\'API');
}

// 4. Logique d'affichage attendue
console.log('\n4️⃣ LOGIQUE D\'AFFICHAGE ATTENDUE:');
if (userData) {
  const user = JSON.parse(userData);
  
  if (!user.selectedCertification) {
    console.log('📋 L\'utilisateur devrait voir: SÉLECTEUR DE CERTIFICATION');
  } else if (!user.hasPaid) {
    console.log('💳 L\'utilisateur devrait voir: FORMULAIRE DE PAIEMENT');
  } else {
    console.log('📚 L\'utilisateur devrait voir: MODULES DE CERTIFICATION');
  }
}

// 5. Actions de test
console.log('\n5️⃣ ACTIONS DE TEST DISPONIBLES:');
console.log('Exécutez ces fonctions pour tester:');
console.log('  - setTestUser() : Créer un utilisateur de test');
console.log('  - setCertification() : Ajouter une certification');
console.log('  - setPayment() : Marquer comme payé');
console.log('  - clearData() : Effacer toutes les données');

// Fonctions de test
window.setTestUser = function() {
  const testUser = {
    id: '1',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'candidate',
    hasPaid: false,
    selectedCertification: null,
    currentModule: null,
    completedModules: [],
    unlockedModules: [],
    examTaken: false
  };
  localStorage.setItem('user', JSON.stringify(testUser));
  console.log('✅ Utilisateur de test créé');
  location.reload();
};

window.setCertification = function() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  user.selectedCertification = 'certification_initiation_pratique_generale';
  localStorage.setItem('user', JSON.stringify(user));
  console.log('✅ Certification ajoutée');
  location.reload();
};

window.setPayment = function() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  user.hasPaid = true;
  user.examStartDate = new Date().toISOString();
  localStorage.setItem('user', JSON.stringify(user));
  console.log('✅ Paiement marqué comme effectué');
  location.reload();
};

window.clearData = function() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  console.log('✅ Données effacées');
  location.reload();
};

console.log('\n🎯 DIAGNOSTIC TERMINÉ');
console.log('Exécutez les fonctions de test pour reproduire le problème !');
