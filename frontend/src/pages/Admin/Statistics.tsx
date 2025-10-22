import { useState, useEffect } from 'react';
import { 
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { useAuth } from '../../contexts/AuthContext';
import adminService, { AdminStats, Activity } from '../../services/adminService';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);
};

const getStatusConfig = (status: string) => {
  const configs: Record<string, { color: string; icon: any; text: string }> = {
    pending: { color: 'warning', icon: Clock, text: 'En attente' },
    processing: { color: 'primary', icon: TrendingUp, text: 'En traitement' },
    completed: { color: 'success', icon: CheckCircle, text: 'Complété' },
    rejected: { color: 'error', icon: XCircle, text: 'Rejeté' },
  };
  return configs[status] || { color: 'neutral', icon: AlertTriangle, text: status };
};

const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
};

const Statistics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, activitiesData] = await Promise.all([
          adminService.getStats(),
          adminService.getRecentActivity()
        ]);
        setStats(statsData);
        setActivities(activitiesData);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-error-500" />
          <h3 className="mt-2 text-lg font-medium text-neutral-900 dark:text-white">Erreur</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Statistiques
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Vue d'ensemble des performances du système
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array(4).fill(0).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-24" />
            </Card>
          ))
        ) : stats ? (
          <>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Utilisateurs actifs
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-white">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center">
                    {stats.trends.users.isPositive ? (
                      <ArrowUp className="h-4 w-4 text-success-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-error-500" />
                    )}
                    <span className={`ml-1 text-sm font-medium ${
                      stats.trends.users.isPositive ? 'text-success-500' : 'text-error-500'
                    }`}>
                      {stats.trends.users.value}%
                    </span>
                    <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                      vs mois dernier
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-primary-100 p-3 dark:bg-primary-900/30">
                  <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Demandes traitées
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-white">
                    {stats.completedRequests.toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center">
                    {stats.trends.requests.isPositive ? (
                      <ArrowUp className="h-4 w-4 text-success-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-error-500" />
                    )}
                    <span className={`ml-1 text-sm font-medium ${
                      stats.trends.requests.isPositive ? 'text-success-500' : 'text-error-500'
                    }`}>
                      {stats.trends.requests.value}%
                    </span>
                    <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                      vs mois dernier
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-success-100 p-3 dark:bg-success-900/30">
                  <FileText className="h-6 w-6 text-success-600 dark:text-success-400" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Revenus totaux
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-white">
                    {formatCurrency(stats.revenue)}
                  </p>
                  <div className="mt-2 flex items-center">
                    {stats.trends.revenue.isPositive ? (
                      <ArrowUp className="h-4 w-4 text-success-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-error-500" />
                    )}
                    <span className={`ml-1 text-sm font-medium ${
                      stats.trends.revenue.isPositive ? 'text-success-500' : 'text-error-500'
                    }`}>
                      {stats.trends.revenue.value}%
                    </span>
                    <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                      vs mois dernier
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-warning-100 p-3 dark:bg-warning-900/30">
                  <DollarSign className="h-6 w-6 text-warning-600 dark:text-warning-400" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Total demandes
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-white">
                    {stats.totalRequests.toLocaleString()}
                  </p>
                  <div className="mt-2 flex items-center">
                    {stats.trends.requests.isPositive ? (
                      <ArrowUp className="h-4 w-4 text-success-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-error-500" />
                    )}
                    <span className={`ml-1 text-sm font-medium ${
                      stats.trends.requests.isPositive ? 'text-success-500' : 'text-error-500'
                    }`}>
                      {stats.trends.requests.value}%
                    </span>
                    <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                      vs mois dernier
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-error-100 p-3 dark:bg-error-900/30">
                  <TrendingUp className="h-6 w-6 text-error-600 dark:text-error-400" />
                </div>
              </div>
            </Card>
          </>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Activité récente">
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
              </div>
            ) : activities.length > 0 ? (
              activities.slice(0, 5).map((activity) => {
                const statusConfig = getStatusConfig(activity.status);
                return (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`rounded-full bg-${statusConfig.color}-100 p-2 dark:bg-${statusConfig.color}-900/30`}>
                        <statusConfig.icon className={`h-4 w-4 text-${statusConfig.color}-600 dark:text-${statusConfig.color}-400`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {activity.description}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {getTimeAgo(activity.timestamp)} • {activity.user}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full bg-${statusConfig.color}-100 px-2.5 py-0.5 text-xs font-medium text-${statusConfig.color}-800 dark:bg-${statusConfig.color}-900/30 dark:text-${statusConfig.color}-400`}>
                      {statusConfig.text}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                Aucune activité récente
              </div>
            )}
          </div>
        </Card>

        <Card title="Performance">
          <div className="h-64">
            {/* Placeholder for chart */}
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-neutral-200 dark:border-neutral-700">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Graphique de performance à venir
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Statistics; 