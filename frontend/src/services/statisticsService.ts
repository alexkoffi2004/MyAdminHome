import api from '../config/api';

export interface CitizenStats {
  totalRequests: number;
  pendingRequests: number;
  processingRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  trends: {
    requests: { value: number; isPositive: boolean };
    completed: { value: number; isPositive: boolean };
  };
}

export interface Payment {
  id: string;
  documentType: string;
  amount: number;
  date: string;
  status: 'success' | 'failed';
}

export interface AgentStats {
  pendingRequests: number;
  processingRequests: number;
  completedToday: number;
  rejectedToday: number;
  trends: {
    pending: { value: number; isPositive: boolean };
    processing: { value: number; isPositive: boolean };
    completed: { value: number; isPositive: boolean };
    rejected: { value: number; isPositive: boolean };
  };
}

export interface PendingRequest {
  id: string;
  name: string;
  type: string;
  date: string;
  status: 'normal' | 'urgent';
}

export interface AgentAlerts {
  overdue: number;
  urgent: number;
}

export interface AgentPendingRequestsResponse {
  requests: PendingRequest[];
  alerts: AgentAlerts;
}

const statisticsService = {
  getCitizenStats: async (): Promise<CitizenStats> => {
    try {
    const response = await api.get('/citizen/statistics');
    return response.data.data;
    } catch (error) {
      console.error('Error fetching citizen stats:', error);
      throw error;
    }
  },

  getCitizenRecentPayments: async (): Promise<Payment[]> => {
    try {
    const response = await api.get('/citizen/statistics/payments');
    return response.data.data;
    } catch (error) {
      console.error('Error fetching recent payments:', error);
      throw error;
    }
  },

  getAgentStats: async (): Promise<AgentStats> => {
    try {
    const response = await api.get('/agent/statistics');
    return response.data.data;
    } catch (error) {
      console.error('Error fetching agent stats:', error);
      throw error;
    }
  },

  getAgentPendingRequests: async (): Promise<{ requests: PendingRequest[]; alerts: AgentAlerts }> => {
    try {
    const response = await api.get('/agent/statistics/pending-requests');
    return response.data.data;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  }
};

export default statisticsService; 