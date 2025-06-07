import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Search,
  Filter,
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';

// Types
interface HistoryEntry {
  id: string;
  requestId: string;
  requestType: string;
  action: 'created' | 'updated' | 'approved' | 'rejected';
  date: string;
  user: string;
  details: string;
}

// Mock data
const mockHistory: HistoryEntry[] = [
  {
    id: 'HIST-001',
    requestId: 'REQ-2023-001',
    requestType: 'Acte de naissance',
    action: 'created',
    date: '2024-03-20 09:00',
    user: 'Marie Koffi',
    details: 'Demande créée',
  },
  {
    id: 'HIST-002',
    requestId: 'REQ-2023-001',
    requestType: 'Acte de naissance',
    action: 'updated',
    date: '2024-03-20 09:30',
    user: 'Marie Koffi',
    details: 'Documents reçus',
  },
  {
    id: 'HIST-003',
    requestId: 'REQ-2023-002',
    requestType: 'Certificat de nationalité',
    action: 'approved',
    date: '2024-03-19 14:20',
    user: 'Konan Kouadio',
    details: 'Demande approuvée',
  },
  {
    id: 'HIST-004',
    requestId: 'REQ-2023-003',
    requestType: 'Acte de mariage',
    action: 'rejected',
    date: '2024-03-18 11:15',
    user: 'Aya Brou',
    details: 'Documents incomplets',
  },
];

const History = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<HistoryEntry['action'] | 'all'>('all');

  useEffect(() => {
    // Simuler un chargement depuis l'API
    setTimeout(() => {
      setHistory(mockHistory);
      setLoading(false);
    }, 800);
  }, []);

  const filteredHistory = history
    .filter(entry => {
      const matchesSearch = 
        entry.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.requestType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAction = actionFilter === 'all' || entry.action === actionFilter;
      
      return matchesSearch && matchesAction;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getActionBadge = (action: HistoryEntry['action']) => {
    const actionConfig = {
      created: { color: 'primary', icon: FileText, text: 'Créé' },
      updated: { color: 'warning', icon: Clock, text: 'Mis à jour' },
      approved: { color: 'success', icon: CheckCircle, text: 'Approuvé' },
      rejected: { color: 'error', icon: XCircle, text: 'Rejeté' },
    };

    const config = actionConfig[action];
    return (
      <span className={`inline-flex items-center rounded-full bg-${config.color}-100 px-2.5 py-0.5 text-xs font-medium text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
        <config.icon className="mr-1 h-3 w-3" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Historique des actions</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Consultez l'historique des actions effectuées sur les demandes
        </p>
      </div>

      <Card>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher dans l'historique..."
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as HistoryEntry['action'] | 'all')}
            >
              <option value="all">Toutes les actions</option>
              <option value="created">Création</option>
              <option value="updated">Mise à jour</option>
              <option value="approved">Approbation</option>
              <option value="rejected">Rejet</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  ID Demande
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Utilisateur
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Détails
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Chargement de l'historique...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Aucune action trouvée
                  </td>
                </tr>
              ) : (
                filteredHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                      {entry.date}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-neutral-900 dark:text-white">
                      <Link
                        to={`/agent/process/${entry.requestId}`}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        {entry.requestId}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                      {entry.requestType}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {getActionBadge(entry.action)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                      {entry.user}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                      {entry.details}
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

export default History; 