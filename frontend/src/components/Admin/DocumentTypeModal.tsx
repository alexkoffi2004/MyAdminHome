import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Button from '../UI/Button';
import { DocumentType, CreateDocumentTypeDto } from '../../services/documentTypeService';

interface DocumentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDocumentTypeDto) => Promise<void>;
  documentType?: DocumentType | null;
  mode: 'create' | 'edit';
}

const DocumentTypeModal = ({ isOpen, onClose, onSubmit, documentType, mode }: DocumentTypeModalProps) => {
  const [formData, setFormData] = useState<CreateDocumentTypeDto>({
    name: '',
    description: '',
    category: 'Acte',
    requiredFields: [],
    price: 0,
    processingTime: 7,
    status: 'active'
  });
  const [newField, setNewField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (documentType && mode === 'edit') {
      setFormData({
        name: documentType.name,
        description: documentType.description,
        category: documentType.category,
        requiredFields: documentType.requiredFields || [],
        price: documentType.price || 0,
        processingTime: documentType.processingTime || 7,
        status: documentType.status
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'Acte',
        requiredFields: [],
        price: 0,
        processingTime: 7,
        status: 'active'
      });
    }
    setError(null);
  }, [documentType, mode, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'processingTime' ? Number(value) : value
    }));
  };

  const handleAddField = () => {
    if (newField.trim() && !formData.requiredFields.includes(newField.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredFields: [...prev.requiredFields, newField.trim()]
      }));
      setNewField('');
    }
  };

  const handleRemoveField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      requiredFields: prev.requiredFields.filter(f => f !== field)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-neutral-900 shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {mode === 'create' ? 'Nouveau type de document' : 'Modifier le type de document'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-900/30 dark:text-error-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Nom */}
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Nom du document <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                placeholder="Ex: Acte de naissance"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description <span className="text-error-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                placeholder="Description du document"
                required
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Catégorie <span className="text-error-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                required
              >
                <option value="Acte">Acte</option>
                <option value="Certificat">Certificat</option>
                <option value="Attestation">Attestation</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            {/* Prix et Délai */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Prix (FCFA)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Délai (jours)
                </label>
                <input
                  type="number"
                  name="processingTime"
                  value={formData.processingTime}
                  onChange={handleChange}
                  min="1"
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            {/* Statut */}
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>

            {/* Champs requis */}
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Champs requis
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newField}
                  onChange={(e) => setNewField(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddField())}
                  className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  placeholder="Ajouter un champ"
                />
                <Button type="button" onClick={handleAddField} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.requiredFields.map((field, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-400"
                  >
                    {field}
                    <button
                      type="button"
                      onClick={() => handleRemoveField(field)}
                      className="rounded-full hover:bg-primary-200 dark:hover:bg-primary-800"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Modifier'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentTypeModal;
