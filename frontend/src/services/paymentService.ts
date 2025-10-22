import api from '../config/api';

export interface Payment {
  id: string;
  requestId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  method: 'card' | 'cash' | 'transfer' | 'mobile_money' | 'bank_transfer';
  reference: string;
  user?: string;
}

class PaymentService {
  async getAll(params?: { status?: string; search?: string }): Promise<Payment[]> {
    const response = await api.get('/admin/payments', { params });
    return response.data.data;
  }

  async getRecent(): Promise<Payment[]> {
    const response = await api.get('/admin/payments/recent');
    return response.data.data;
  }
}

export default new PaymentService();
