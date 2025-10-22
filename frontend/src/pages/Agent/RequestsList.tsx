import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpDown,
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

// Types
type RequestStatus = 'pending' | 'processing' | 'completed' | 'rejected';

interface Request {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  documentType: {
    _id: string;
    name: string;
    price: number;
  };
  createdAt: string;
  status: RequestStatus;
  isUrgent: boolean;
}

const RequestsList = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [sortField, setSortField] = useState<keyof Request>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      console.log('User:', user);

      const response = await axios.get('http://localhost:5000/api/requests/agent/requests', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Réponse de l\'API:', response.data);
      setRequests(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests
    .filter(request => {
      const fullName = `${request.user.firstName} ${request.user.lastName}`.toLowerCase();
      const matchesSearch = 
        request._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fullName.includes(searchTerm.toLowerCase()) ||
        request.documentType.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  const getStatusBadge = (status: RequestStatus) => {
    const statusConfig = {
      pending: { color: 'warning', icon: Clock, text: 'En attente' },
      processing: { color: 'primary', icon: Clock, text: 'En cours' },
      completed: { color: 'success', icon: CheckCircle, text: 'Validé' },
      rejected: { color: 'error', icon: XCircle, text: 'Rejeté' },
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center rounded-full bg-${config.color}-100 px-2.5 py-0.5 text-xs font-medium text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
        <config.icon className="mr-1 h-3 w-3" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Liste des demandes</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Gérez toutes les demandes de documents administratifs
        </p>
      </div>

      <Card>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher une demande..."
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'all')}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En cours</option>
              <option value="completed">Validées</option>
              <option value="rejected">Rejetées</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead>
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 cursor-pointer"
                  onClick={() => {
                    setSortField('_id');
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1">
                    ID
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 cursor-pointer"
                  onClick={() => {
                    setSortField('user');
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1">
                    Demandeur
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Type</th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400 cursor-pointer"
                  onClick={() => {
                    setSortField('createdAt');
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Chargement des demandes...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Aucune demande trouvée
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-neutral-900 dark:text-white">
                      {request._id}
                      {request.isUrgent && (
                        <span className="ml-2 inline-flex rounded-full bg-error-100 px-2 text-xs font-semibold leading-5 text-error-800 dark:bg-error-900/30 dark:text-error-400">
                          Urgent
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-900 dark:text-white">
                      {`${request.user.firstName} ${request.user.lastName}`}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                      {request.documentType.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {request.status === 'pending' && (
                        <Link to={`/agent/process/${request._id}`}>
                          <Button size="sm">
                            Traiter
                          </Button>
                        </Link>
                      )}
                      {request.status === 'processing' && (
                        <Link to={`/agent/process/${request._id}`}>
                          <Button size="sm" variant="outline">
                            Continuer
                          </Button>
                        </Link>
                      )}
                      {['completed', 'rejected'].includes(request.status) && (
                        <Link to={`/agent/process/${request._id}`}>
                          <Button size="sm" variant="ghost">
                            Voir détails
                          </Button>
                        </Link>
                      )}
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

export default RequestsList; 