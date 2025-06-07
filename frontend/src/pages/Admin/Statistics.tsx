import { useState, useEffect } from 'react';
import { 
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { useAuth } from '../../contexts/AuthContext';

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
}

const mockStats: StatCard[] = [
  {
    title: 'Utilisateurs actifs',
    value: '1,234',
    change: 12.5,
    icon: Users,
    color: 'primary',
  },
  {
    title: 'Demandes traitées',
    value: '856',
    change: 8.2,
    icon: FileText,
    color: 'success',
  },
  {
    title: 'Revenus totaux',
    value: '4,500,000 FCFA',
    change: -2.4,
    icon: DollarSign,
    color: 'warning',
  },
  {
    title: 'Taux de satisfaction',
    value: '94%',
    change: 3.1,
    icon: TrendingUp,
    color: 'error',
  },
];

const Statistics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 800);
  }, []);

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
        ) : (
          stats.map((stat, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {stat.title}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-white">
                    {stat.value}
                  </p>
                  <div className="mt-2 flex items-center">
                    {stat.change > 0 ? (
                      <ArrowUp className="h-4 w-4 text-success-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-error-500" />
                    )}
                    <span className={`ml-1 text-sm font-medium ${
                      stat.change > 0 ? 'text-success-500' : 'text-error-500'
                    }`}>
                      {Math.abs(stat.change)}%
                    </span>
                    <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                      vs mois dernier
                    </span>
                  </div>
                </div>
                <div className={`rounded-lg bg-${stat.color}-100 p-3 dark:bg-${stat.color}-900/30`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Activité récente">
          <div className="space-y-4">
            {Array(5).fill(0).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-neutral-100 p-2 dark:bg-neutral-800">
                    <Calendar className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      Nouvelle demande #{1000 + index}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Il y a {index + 1} heures
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                  En attente
                </span>
              </div>
            ))}
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