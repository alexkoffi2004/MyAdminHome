import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  ChevronDown,
  Eye
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getRequests, Request } from '../../services/requestService';
import toast from 'react-hot-toast';


// Status badge helper
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="success">Terminée</Badge>;
    case 'pending':
      return <Badge variant="warning">En attente</Badge>;
    case 'processing':
      return <Badge variant="primary">En cours</Badge>;
    case 'rejected':
      return <Badge variant="danger">Rejetée</Badge>;
    default:
      return <Badge>Inconnu</Badge>;
  }
};

// Document type helper
const getDocumentTypeTitle = (type: string) => {
  switch (type) {
    case 'birth_certificate':
      return 'Acte de naissance';
    case 'death_certificate':
      return 'Certificat de décès';
    case 'birth_declaration':
      return 'Déclaration de naissance';
    case 'identity_document':
      return 'Document d\'identité';
    default:
      return type;
  }
};

const Requests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load requests data
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        console.log('Chargement initial des demandes...');
        const data = await getRequests();
        console.log('Demandes chargées:', data);
        setRequests(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Une erreur est survenue lors du chargement des demandes';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    // Écouter les mises à jour de statut en temps réel
    // console.log('Configuration de l\'écouteur Socket.IO...');
    // socket.on('connect', () => {
    //   console.log('Socket.IO connecté');
    // });

    // socket.on('disconnect', () => {
    //   console.log('Socket.IO déconnecté');
    // });

    // socket.on('request_status_updated', (updatedRequest: Request) => {
    //   console.log('Mise à jour de statut reçue:', updatedRequest);
    //   setRequests(prevRequests => {
    //     console.log('Anciennes demandes:', prevRequests);
    //     const newRequests = prevRequests.map(request => 
    //       request._id === updatedRequest._id ? updatedRequest : request
    //     );
    //     console.log('Nouvelles demandes:', newRequests);
    //     return newRequests;
    //   });
    // });

    // Nettoyer les écouteurs lors du démontage du composant
    return () => {
      console.log('Nettoyage des écouteurs Socket.IO');
      // socket.off('request_status_updated');
    };
  }, []);

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDocumentTypeTitle(request.documentType).toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.commune.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">Erreur</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{error}</p>
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
            Consultez et suivez l'état de vos demandes.
          </p>
        </div>
        <Link to="/citizen/new-request">
          <Button>
            Nouvelle demande
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-neutral-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400"
              placeholder="Rechercher une demande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="block w-full rounded-lg border border-neutral-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée</option>
              <option value="rejetee">Rejetée</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className="h-5 w-5 text-neutral-400" />
            </div>
          </div>
        </div>
      </Card>

      {/* Requests Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Référence
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Commune
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
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Aucune demande trouvée
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">
                      {request.reference || request._id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900 dark:text-white">
                      {getDocumentTypeTitle(request.documentType)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900 dark:text-white">
                      {request.commune.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900 dark:text-white">
                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true, locale: fr })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900 dark:text-white">
                      <Link 
                        to={`/citizen/requests/${request._id}`}
                        className="inline-flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Voir détails
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

export default Requests; 