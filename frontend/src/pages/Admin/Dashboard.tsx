import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Users, 
  FileText, 
  CreditCard, 
  User,
  ArrowUp,
  ArrowDown,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Zap,
  Settings,
  FileCheck,
} from 'lucide-react';
import { Card, CardStat } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import adminService, { AdminStats, Payment } from '../../services/adminService';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsData, paymentsData] = await Promise.all([
          adminService.getStats(),
          adminService.getRecentPayments()
        ]);
        setStats(statsData);
        setRecentPayments(paymentsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
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
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Tableau de bord administrateur</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Vue d'ensemble du système et statistiques clés
        </p>
      </div>
      
      {/* Stats row 1 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <CardStat
          title="Total des utilisateurs"
          value={!isLoading && stats ? stats.totalUsers.toLocaleString() : '-'}
          icon={<Users size={20} />}
          trend={{ value: 8, isPositive: true }}
        />
        <CardStat
          title="Total des agents"
          value={!isLoading && stats ? stats.totalAgents.toLocaleString() : '-'}
          icon={<User size={20} />}
          trend={{ value: 2, isPositive: true }}
        />
        <CardStat
          title="Total des demandes"
          value={!isLoading && stats ? stats.totalRequests.toLocaleString() : '-'}
          icon={<FileText size={20} />}
          trend={{ value: 12, isPositive: true }}
        />
        <CardStat
          title="Revenus totaux"
          value={!isLoading && stats ? formatCurrency(stats.revenue) : '-'}
          icon={<CreditCard size={20} />}
          trend={{ value: 14, isPositive: true }}
        />
      </div>
      
      {/* Status indicators */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="border-l-4 border-l-warning-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">En attente</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                {!isLoading && stats ? stats.pendingRequests : '-'}
              </p>
            </div>
            <div className="rounded-full bg-warning-100 p-2 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400">
              <Clock size={20} />
            </div>
          </div>
        </Card>
        
        <Card className="border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">En traitement</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                {!isLoading && stats ? stats.processingRequests : '-'}
              </p>
            </div>
            <div className="rounded-full bg-primary-100 p-2 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <FileCheck size={20} />
            </div>
          </div>
        </Card>
        
        <Card className="border-l-4 border-l-success-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Approuvées</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                {!isLoading && stats ? stats.completedRequests : '-'}
              </p>
            </div>
            <div className="rounded-full bg-success-100 p-2 text-success-600 dark:bg-success-900/30 dark:text-success-400">
              <CheckCircle size={20} />
            </div>
          </div>
        </Card>
        
        <Card className="border-l-4 border-l-error-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Rejetées</p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                {!isLoading && stats ? stats.rejectedRequests : '-'}
              </p>
            </div>
            <div className="rounded-full bg-error-100 p-2 text-error-600 dark:bg-error-900/30 dark:text-error-400">
              <XCircle size={20} />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart placeholder */}
        <Card 
          title="Vue d'ensemble des activités" 
          subtitle="Derniers 30 jours"
          className="lg:col-span-2"
        >
          <div className="h-80 w-full rounded-md bg-neutral-100 dark:bg-neutral-800">
            {/* Chart will be added here */}
          </div>
        </Card>
        
        {/* Recent payments */}
        <Card 
          title="Paiements récents" 
          subtitle="Derniers paiements"
          action={
            <Link to="/admin/payments">
              <Button variant="ghost" size="sm">
                Voir tout
              </Button>
            </Link>
          }
        >
          <div className="space-y-4">
            {!isLoading && recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">{payment.user}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{payment.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className={`text-sm ${
                    payment.status === 'paid' 
                      ? 'text-success-500' 
                      : payment.status === 'pending'
                      ? 'text-warning-500'
                      : 'text-error-500'
                  }`}>
                    {payment.status === 'paid' 
                      ? 'Payé' 
                      : payment.status === 'pending'
                      ? 'En attente'
                      : 'Échoué'}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;