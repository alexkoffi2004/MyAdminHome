import api from '../config/api';

export interface DocumentType {
  _id: string;
  name: string;
  description: string;
  category: 'Acte' | 'Certificat' | 'Attestation' | 'Autre';
  requiredFields: string[];
  price?: number;
  processingTime?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentTypeDto {
  name: string;
  description: string;
  category: 'Acte' | 'Certificat' | 'Attestation' | 'Autre';
  requiredFields: string[];
  price?: number;
  processingTime?: number;
  status?: 'active' | 'inactive';
}

export interface UpdateDocumentTypeDto extends Partial<CreateDocumentTypeDto> {}

class DocumentTypeService {
  async getAll(params?: { category?: string; status?: string; search?: string }): Promise<DocumentType[]> {
    const response = await api.get('/admin/document-types', { params });
    return response.data.data;
  }

  async getAllPublic(params?: { category?: string; status?: string; search?: string }): Promise<DocumentType[]> {
    const response = await api.get('/document-types', { params });
    return response.data.data;
  }

  async getById(id: string): Promise<DocumentType> {
    const response = await api.get(`/admin/document-types/${id}`);
    return response.data.data;
  }

  async create(data: CreateDocumentTypeDto): Promise<DocumentType> {
    const response = await api.post('/admin/document-types', data);
    return response.data.data;
  }

  async update(id: string, data: UpdateDocumentTypeDto): Promise<DocumentType> {
    const response = await api.put(`/admin/document-types/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/admin/document-types/${id}`);
  }

  async toggleStatus(id: string): Promise<DocumentType> {
    const response = await api.patch(`/admin/document-types/${id}/toggle-status`);
    return response.data.data;
  }
}

export default new DocumentTypeService();
