import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";
import statisticsService from "../../services/statisticsService";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../utils/formatters";

interface Statistics {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        console.log('🔄 Chargement des statistiques...');
        const data = await statisticsService.getCitizenStats();
        console.log('📊 Données reçues:', data);
        setStatistics(data);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des statistiques");
        console.error("❌ Error fetching statistics:", err);
        console.error("❌ Error response:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Bonjour, {user?.firstName}
        </h1>
        <Link
          to="/citizen/new-request"
          className="btn btn-primary"
        >
          Nouvelle demande
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Requests Card */}
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Total des demandes
              </p>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                {statistics?.totalRequests || 0}
              </h3>
            </div>
            <div className="p-2 bg-primary-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary-500" />
            </div>
          </div>
        </div>

        {/* Pending Requests Card */}
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Demandes en attente
              </p>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                {statistics?.pendingRequests || 0}
              </h3>
            </div>
            <div className="p-2 bg-warning-50 rounded-lg">
              <TrendingDown className="h-6 w-6 text-warning-500" />
            </div>
          </div>
        </div>

        {/* Completed Requests Card */}
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Demandes complétées
              </p>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                {statistics?.completedRequests || 0}
              </h3>
            </div>
            <div className="p-2 bg-success-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success-500" />
            </div>
          </div>
        </div>

        {/* Total Payments Card */}
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Total des paiements
              </p>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                {formatCurrency(statistics?.totalPayments || 0)}
              </h3>
            </div>
            <div className="p-2 bg-primary-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary-500" />
            </div>
          </div>
        </div>

        {/* Pending Payments Card */}
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Paiements en attente
              </p>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                {formatCurrency(statistics?.pendingPayments || 0)}
              </h3>
            </div>
            <div className="p-2 bg-warning-50 rounded-lg">
              <TrendingDown className="h-6 w-6 text-warning-500" />
            </div>
          </div>
        </div>

        {/* Completed Payments Card */}
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Paiements complétés
              </p>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                {formatCurrency(statistics?.completedPayments || 0)}
              </h3>
            </div>
            <div className="p-2 bg-success-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
