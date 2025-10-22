import { useState, useEffect } from 'react';
import { 
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import paymentService, { Payment } from '../../services/paymentService';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const PaymentTracking = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Payment['status'] | 'all'>('all');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      setPayments(data);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredPayments = payments;

  const getStatusBadge = (status: Payment['status']) => {
    const statusConfig = {
      pending: { color: 'warning', icon: Clock, text: 'En attente' },
      completed: { color: 'success', icon: CheckCircle, text: 'Complété' },
      failed: { color: 'error', icon: XCircle, text: 'Échoué' },
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center rounded-full bg-${config.color}-100 px-2.5 py-0.5 text-xs font-medium text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`}>
        <config.icon className="mr-1 h-3 w-3" />
        {config.text}
      </span>
    );
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Suivi des paiements
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Gérez et suivez les paiements des demandes
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>

      <Card>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher un paiement..."
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Payment['status'] | 'all')}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="completed">Complétés</option>
              <option value="failed">Échoués</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Demande
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Montant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Méthode
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Référence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Chargement des paiements...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Aucun paiement trouvé
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-neutral-900 dark:text-white">
                      {payment.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                      {payment.requestId}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-neutral-900 dark:text-white">
                      {formatAmount(payment.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {payment.method === 'card' ? 'Carte' : 
                         payment.method === 'cash' ? 'Espèces' : 
                         payment.method === 'mobile_money' ? 'Mobile Money' :
                         payment.method === 'bank_transfer' ? 'Virement bancaire' : 'Virement'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                      {formatDate(payment.date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                      {payment.reference}
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

export default PaymentTracking; 