import api from '../config/axiosConfig';

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
  const response = await api.get('/requests');
  return response.data.data;
};

export const getRequestDetails = async (id: string): Promise<RequestDetails> => {
  const response = await api.get(`/requests/${id}`);
  return response.data;
};

export const processRequest = async (id: string): Promise<RequestDetails> => {
  const response = await api.put(`/requests/${id}/process`);
  return response.data.data;
};

export const initializePayment = async (id: string): Promise<{ clientSecret: string }> => {
  const response = await api.post(`/requests/${id}/payment`);
  return response.data;
};

export const updatePaymentStatus = async (requestId: string, paymentIntent: string, status: 'succeeded' | 'failed') => {
  try {
    const response = await api.post(`/requests/${requestId}/payment-status`, {
      paymentIntent,
      status
    });
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}; 