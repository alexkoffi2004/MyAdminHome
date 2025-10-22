import api from '../config/api';

export interface Request {
  _id: string;
  reference: string;
  documentType: 'birth_certificate' | 'death_certificate' | 'birth_declaration' | 'identity_document';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  commune: {
    name: string;
  };
}

export interface RequestDetails {
  id: string;
  reference: string;
  type: string | { _id: string; name: string; price: number; processingTime?: string };
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  date: Date;
  lastUpdate: Date;
  documentUrl?: string;
  price: number;
  details: {
    // Anciennes données (compatibilité)
    fullName?: string;
    birthDate?: Date;
    birthPlace?: string;
    fatherName?: string;
    motherName?: string;
    
    // Nouvelles données - Enfant
    childLastName?: string;
    childFirstName?: string;
    childBirthDate?: Date;
    childBirthPlace?: string;
    childBirthTime?: string;
    childMaternity?: string;
    childGender?: 'M' | 'F';
    
    // Nouvelles données - Parents
    fatherFullName?: string;
    fatherNationality?: string;
    fatherProfession?: string;
    fatherAddress?: string;
    motherFullName?: string;
    motherNationality?: string;
    motherProfession?: string;
    motherAddress?: string;
    
    // Autres
    commune: string;
    deliveryMethod: 'download' | 'delivery' | 'pickup';
    phoneNumber?: string;
    address?: string;
  };
  documents?: {
    birthCertificate?: string;
    fatherIdCard?: string;
    motherIdCard?: string;
    familyBook?: string;
    marriageCertificate?: string;
  };
  timeline: {
    id: number;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    date: Date;
    description: string;
  }[];
  payment: {
    amount: number;
    status: 'pending' | 'paid' | 'completed' | 'failed';
    date: Date;
    reference: string;
  };
}

export const getRequests = async (): Promise<Request[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await api.get('/requests', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching requests:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/citizen/login';
    }
    throw error;
  }
};

export const getRequestDetails = async (id: string): Promise<RequestDetails> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await api.get(`/requests/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching request details:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/citizen/login';
    }
    throw error;
  }
};

export const processRequest = async (id: string): Promise<RequestDetails> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await api.put(`/requests/${id}/process`, {
      status: 'processing',
      processedAt: new Date().toISOString()
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error processing request:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/citizen/login';
    }
    throw error;
  }
};

export const initializePayment = async (id: string): Promise<{ clientSecret: string }> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Non authentifié');
    }

    // D'abord récupérer les détails de la demande pour obtenir le montant
    const requestDetails = await getRequestDetails(id);
    
    const response = await api.post(`/requests/${id}/payment`, {
      requestId: id,
      amount: requestDetails.price,
      currency: 'xof'
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error initializing payment:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/citizen/login';
    }
    throw error;
  }
};

export const updatePaymentStatus = async (requestId: string, paymentIntent: string, status: 'succeeded' | 'failed') => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await api.post(`/requests/${requestId}/payment-status`, {
      paymentIntent,
      status
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating payment status:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/citizen/login';
    }
    throw error;
  }
}; 