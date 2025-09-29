// Configuration de l'API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Fonction utilitaire pour les appels API
const apiRequest = async <T>(
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  headers: HeadersInit = {}
): Promise<T> => {
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const responseData = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      // Créer une erreur avec plus de détails
      const error = new Error(responseData.message || 'Une erreur est survenue');
      // Ajouter les données de la réponse à l'erreur
      (error as any).response = {
        data: responseData,
        status: response.status,
        statusText: response.statusText
      };
      throw error;
    }

    return responseData;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

export default apiRequest;
