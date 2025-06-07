import api from '../config/api';

export interface AdminStats {
  totalUsers: number;
  totalAgents: number;
  totalRequests: number;
  totalDocuments: number;
  revenue: number;
  pendingRequests: number;
  processingRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  trends: {
    users: { value: number; isPositive: boolean };
    agents: { value: number; isPositive: boolean };
    requests: { value: number; isPositive: boolean };
    revenue: { value: number; isPositive: boolean };
  };
}

export interface Payment {
  id: string;
  user: string;
  amount: number;
  date: string;
  status: string;
}

class AdminService {
  async getStats(): Promise<AdminStats> {
    const response = await api.get('/admin/stats');
    return response.data.data;
  }

  async getRecentPayments(): Promise<Payment[]> {
    const response = await api.get('/admin/payments/recent');
    return response.data.data;
  }
}

export default new AdminService(); 