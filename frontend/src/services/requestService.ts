import api from '../config/api';

export interface Request {
  _id: string;
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
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  date: Date;
  lastUpdate: Date;
  documentUrl?: string;
  details: {
    fullName: string;
    birthDate: Date;
    birthPlace: string;
    fatherName: string;
    motherName: string;
    commune: string;
    deliveryMethod: 'download' | 'delivery';
    phoneNumber: string;
    address?: string;
  };
  timeline: {
    id: number;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    date: Date;
    description: string;
  }[];
  payment: {
    amount: number;
    status: 'pending' | 'paid' | 'failed';
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

    const response = await api.put(`/requests/${id}/process`, null, {
      headers: {
        Authorization: `Bearer ${token}`
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

    const response = await api.post(`/requests/${id}/payment`, null, {
      headers: {
        Authorization: `Bearer ${token}`
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