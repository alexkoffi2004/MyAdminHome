import axios from 'axios';
import { API_URL } from '../config';

const documentService = {
  generateDocument: async (requestId: string) => {
    try {
      const response = await axios.post(`${API_URL}/requests/${requestId}/generate-document`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error generating document:', error.response?.data || error.message);
      throw error;
    }
  },

  downloadDocument: async (requestId: string) => {
    try {
      const response = await axios.get(`${API_URL}/requests/${requestId}/document`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error downloading document:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default documentService; 