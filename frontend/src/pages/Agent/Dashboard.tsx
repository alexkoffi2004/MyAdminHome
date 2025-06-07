import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users,
  CreditCard,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Card, CardStat } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import statisticsService, { 
  AgentStats, 
  PendingRequest, 
  AgentAlerts 
} from '../../services/statisticsService';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [alerts, setAlerts] = useState<AgentAlerts | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, pendingData] = await Promise.all([
        statisticsService.getAgentStats(),
        statisticsService.getAgentPendingRequests()
      ]);
      setStats(statsData);
      setPendingRequests(pendingData.requests);
      setAlerts(pendingData.alerts);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-md bg-error-50 p-4 dark:bg-error-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-error-500" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-error-800 dark:text-error-400">
                Erreur
              </h3>
              <div className="mt-2 text-sm text-error-700 dark:text-error-300">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button onClick={fetchData} variant="outline" size="sm">
                  Réessayer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-4">
        <div className="rounded-md bg-warning-50 p-4 dark:bg-warning-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-warning-500" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-warning-800 dark:text-warning-400">
                Aucune donnée disponible
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Tableau de bord</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Bienvenue, {user?.firstName} {user?.lastName} | {user?.commune}
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardStat
          title="Demandes en attente"
          value={stats.pendingRequests}
          icon={<Clock size={20} />}
          trend={stats.trends.pending}
          className="border-l-4 border-l-warning-500"
        />
        <CardStat
          title="En cours de traitement"
          value={stats.processingRequests}
          icon={<FileText size={20} />}
          trend={stats.trends.processing}
          className="border-l-4 border-l-primary-500"
        />
        <CardStat
          title="Validées aujourd'hui"
          value={stats.completedToday}
          icon={<CheckCircle size={20} />}
          trend={stats.trends.completed}
          className="border-l-4 border-l-success-500"
        />
        <CardStat
          title="Rejetées aujourd'hui"
          value={stats.rejectedToday}
          icon={<XCircle size={20} />}
          trend={stats.trends.rejected}
          className="border-l-4 border-l-error-500"
        />
      </div>
      
      {/* Main Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pending Requests */}
        <Card 
          title="Demandes à traiter" 
          subtitle="Requêtes en attente de traitement"
          headerAction={
            <Link to="/agent/requests">
              <Button variant="ghost" size="sm">
                Voir tout
              </Button>
            </Link>
          }
          className="lg:col-span-2"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Demandeur</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Soumis</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {pendingRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-neutral-900 dark:text-white">
                      {request.id}
                      {request.status === 'urgent' && (
                        <span className="ml-2 inline-flex rounded-full bg-error-100 px-2 text-xs font-semibold leading-5 text-error-800 dark:bg-error-900/30 dark:text-error-400">
                          Urgent
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-900 dark:text-white">{request.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">{request.type}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">{request.date}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <Link to={`/agent/process/${request.id}`}>
                        <Button size="sm">
                          Traiter
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        
        {/* Alerts */}
        <Card title="Alertes" className="flex flex-col">
          <div className="flex-1">
            <div className="space-y-4">
              {alerts?.overdueRequests > 0 && (
                <div className="rounded-md bg-warning-50 p-4 dark:bg-warning-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-warning-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-warning-800 dark:text-warning-400">Demandes en attente</h3>
                      <div className="mt-2 text-sm text-warning-700 dark:text-warning-300">
                        <p>{alerts.overdueRequests} demandes sont en attente depuis plus de 48h</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {alerts?.urgentRequests > 0 && (
                <div className="rounded-md bg-error-50 p-4 dark:bg-error-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-error-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-error-800 dark:text-error-400">Demandes urgentes</h3>
                      <div className="mt-2 text-sm text-error-700 dark:text-error-300">
                        <p>{alerts.urgentRequests} demandes urgentes en attente</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AgentDashboard;