import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter, ArrowRight } from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import RequestStatusBadge, { RequestStatus } from '../../components/UI/RequestStatusBadge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getRequests, Request } from '../../services/requestService';
import toast from 'react-hot-toast';

// Filter options
const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'processing', label: 'En cours' },
  { value: 'completed', label: 'Terminée' },
  { value: 'rejected', label: 'Rejetée' }
];

const documentTypes = [
  { value: 'all', label: 'Tous les types' },
  { value: 'birth_certificate', label: 'Acte de naissance' },
  { value: 'marriage_certificate', label: 'Acte de mariage' },
  { value: 'death_certificate', label: 'Acte de décès' },
  { value: 'nationality_certificate', label: 'Certificat de nationalité' },
  { value: 'residence_certificate', label: 'Certificat de résidence' },
  { value: 'criminal_record', label: 'Casier judiciaire' }
];

// Map API status to RequestStatusBadge status
const mapApiStatusToBadgeStatus = (status: string): RequestStatus => {
  switch (status) {
    case 'pending':
      return 'pending';
    case 'processing':
      return 'processing';
    case 'completed':
      return 'completed';
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
  }
};

const RequestTracking = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchRequests = async () => {
    try {
      const data = await getRequests();
      setRequests(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Une erreur est survenue lors du chargement des demandes';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Charger les demandes au montage du composant
  useEffect(() => {
    fetchRequests();

    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(fetchRequests, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Filter requests based on search term and filters
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.documentType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Helper function to get document type label
  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Suivi des demandes</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Consultez et suivez l'état de vos demandes
          </p>
        </div>
        <Link to="/citizen/new-request">
          <Button icon={<FileText size={18} />}>
            Nouvelle demande
          </Button>
        </Link>
      </div>
      
      {/* Filters */}
      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            placeholder="Rechercher une demande..."
            icon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            icon={<Filter size={18} />}
          />
          
          <Select
            options={documentTypes}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            icon={<FileText size={18} />}
          />
        </div>
      </Card>
      
      {/* Requests List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Référence
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-700 dark:bg-transparent">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Aucune demande ne correspond à vos critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">
                      {request._id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900 dark:text-white">
                      {getDocumentTypeLabel(request.documentType)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                      {format(new Date(request.createdAt), 'dd/MM/yyyy', { locale: fr })}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <RequestStatusBadge status={mapApiStatusToBadgeStatus(request.status)} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Link 
                        to={`/citizen/requests/${request._id}`}
                      className="inline-flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      <span>Détails</span>
                      <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RequestTracking;