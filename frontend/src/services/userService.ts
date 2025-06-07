import api from '../config/api';

export interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'agent' | 'citizen';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

class UserService {
  async getUsers(): Promise<UserData[]> {
    const response = await api.get('/admin/users');
    return response.data.data;
  }

  async updateUser(id: string, data: Partial<UserData>): Promise<UserData> {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data.data;
  }

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  }
}

export default new UserService(); 