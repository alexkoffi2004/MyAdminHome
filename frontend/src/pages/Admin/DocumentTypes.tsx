import { useState, useEffect } from 'react';
import { 
  Search,
  Plus,
  Edit2,
  Trash2,
  FileText,
  FileType,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import documentTypeService, { DocumentType, CreateDocumentTypeDto } from '../../services/documentTypeService';
import DocumentTypeModal from '../../components/Admin/DocumentTypeModal';

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const DocumentTypes = () => {
  const { user } = useAuth();
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Acte' | 'Certificat' | 'Attestation' | 'Autre' | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentTypeService.getAll({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: searchTerm || undefined
      });
      setDocumentTypes(data);
    } catch (err: any) {
      console.error('Error fetching document types:', err);
      setError('Erreur lors du chargement des types de documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, [categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocumentTypes();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenCreateModal = () => {
    setSelectedDocType(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (docType: DocumentType) => {
    setSelectedDocType(docType);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDocType(null);
  };

  const handleSubmit = async (data: CreateDocumentTypeDto) => {
    if (modalMode === 'create') {
      await documentTypeService.create(data);
    } else if (selectedDocType) {
      await documentTypeService.update(selectedDocType._id, data);
    }
    await fetchDocumentTypes();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce type de document ?')) {
      try {
        await documentTypeService.delete(id);
        await fetchDocumentTypes();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const filteredDocuments = documentTypes;

  const getCategoryBadge = (category: DocumentType['category']) => {
    const categoryConfig = {
      Acte: { color: 'primary', icon: FileText, text: 'Acte' },
      Certificat: { color: 'warning', icon: FileType, text: 'Certificat' },
      Attestation: { color: 'success', icon: FileText, text: 'Attestation' },
      Autre: { color: 'neutral', icon: FileText, text: 'Autre' },
    };

    const config = categoryConfig[category];
    return (
      <span className={`inline-flex items-center rounded-full bg-${config.color}-100 px-2.5 py-0.5 text-xs font-medium text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
        <config.icon className="mr-1 h-3 w-3" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Types de documents
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Gérez les types de documents et leurs champs requis
          </p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau type
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-error-50 p-4 text-sm text-error-600 dark:bg-error-900/30 dark:text-error-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        </div>
      )}

      <Card>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher un type de document..."
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as DocumentType['category'] | 'all')}
            >
              <option value="all">Toutes les catégories</option>
              <option value="Acte">Actes</option>
              <option value="Certificat">Certificats</option>
              <option value="Attestation">Attestations</option>
              <option value="Autre">Autres</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Champs requis
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Dernière mise à jour
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Chargement des types de documents...
                  </td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Aucun type de document trouvé
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-neutral-900 dark:text-white">
                      {doc.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                      {doc.description}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {getCategoryBadge(doc.category)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                      <div className="flex flex-wrap gap-1">
                        {doc.requiredFields.map((field, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(doc.updatedAt)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(doc)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <DocumentTypeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        documentType={selectedDocType}
        mode={modalMode}
      />
    </div>
  );
};

export default DocumentTypes; 