import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  MapPin,
  PlayCircle
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { RequestDetails, processRequest } from '../../services/requestService';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ProcessRequest = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: _unusedUser } = useAuth();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [anneeRegistre, setAnneeRegistre] = useState('');
  const [numeroRegistre, setNumeroRegistre] = useState('');


  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      if (!id) {
        toast.error('ID de la demande non spécifié');
        return;
      }
      const response = await api.get(`/requests/${id}`);
      setRequest(response.data.data);
    } catch (error) {
      console.error('Error fetching request details:', error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 403) {
          toast.error('Vous n\'avez pas les permissions nécessaires pour accéder à cette demande');
          navigate('/agent/requests');
        } else if (error.response?.status === 404) {
          toast.error('Demande non trouvée');
          navigate('/agent/requests');
        } else {
          toast.error(error.response?.data?.message || 'Erreur lors du chargement des détails de la demande');
        }
      } else {
        toast.error('Erreur lors du chargement des détails de la demande');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!decision || !request) return;
  
    if (decision === 'approve' && (!anneeRegistre || !numeroRegistre)) {
      toast.error('Veuillez renseigner l\'année et le numéro du registre avant d\'approuver.');
      return;
    }
  
    setProcessing(true);
    try {
      if (decision === 'approve') {
        // Nouvelle route backend dédiée à l’approbation
        const response = await api.put(`/requests/${request.id}/approve`, {
          anneeRegistre,
          numeroRegistre,
        });
        if (response.data.success) {
          toast.success('Demande approuvée et extrait généré avec succès');
          navigate('/agent/requests');
        } else {
          throw new Error(response.data.message || 'Erreur lors de l\'approbation de la demande');
        }
      }else {
        // Gestion du rejet inchangée
        const response = await api.put(`/requests/${request.id}/status`, {
          status: 'rejected',
          note: rejectionReason,
        });
  
        if (response.data.success) {
          toast.success('Demande rejetée avec succès');
          navigate('/agent/requests');
        } else {
          throw new Error(response.data.message || 'Erreur lors du traitement du rejet');
        }
      }
    } catch (error) {
      console.error('Erreur lors du traitement de la demande:', error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || 'Erreur lors du traitement');
      } else {
        toast.error('Erreur inattendue');
      }
    } finally {
      setProcessing(false);
    }
  };
  
  const handleProcessRequest = async () => {
    try {
      if (!id) {
        toast.error('ID de la demande non spécifié');
        return;
      }
      setIsProcessing(true);
      await processRequest(id);
      toast.success('Demande mise en traitement avec succès');
      fetchRequestDetails();
    } catch (error) {
      console.error('Error processing request:', error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || 'Erreur lors de la mise en traitement de la demande');
      } else {
        toast.error('Erreur lors de la mise en traitement de la demande');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-neutral-500 dark:text-neutral-400">Chargement de la demande...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-neutral-500 dark:text-neutral-400">Demande non trouvée</p>
      </div>
    );
  }

  // Convertir les données de la demande au format attendu par l'interface
  const formattedRequest = {
    id: request.id,
    name: request.details.fullName || 'Non spécifié',
    type: request.type || 'Document non spécifié',
    date: new Date(request.date).toLocaleDateString('fr-FR'),
    status: request.status,
    priority: 'normal',
    commune: request.details.commune || 'Non spécifié',
    documents: [
      { name: 'Document d\'identité', status: 'provided' },
      { name: 'Informations personnelles', status: 'provided' },
      { name: 'Informations de contact', status: 'provided' },
    ],
    notes: request.timeline?.map(event => event.description).join('\n') || '',
    history: request.timeline.map(event => ({
      date: new Date(event.date).toLocaleString('fr-FR'),
      action: event.description,
      user: 'Agent',
    })),
  };

  // Validation des données avant le rendu
  if (!request.id || !request.status) {
    console.error('Données de demande invalides:', request);
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-neutral-500 dark:text-neutral-400">Données de demande invalides</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/agent/requests')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Traitement de la demande {formattedRequest.id}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {formattedRequest.type} - {formattedRequest.name}
          </p>
        </div>
        {formattedRequest.priority === 'urgent' && (
          <span className="inline-flex rounded-full bg-error-100 px-3 py-1 text-sm font-medium text-error-800 dark:bg-error-900/30 dark:text-error-400">
            <AlertTriangle className="mr-1 h-4 w-4" />
            Urgent
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Informations de la demande">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <User className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Demandeur</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{formattedRequest.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Type de document</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{formattedRequest.type}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Date de demande</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{formattedRequest.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Commune</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{formattedRequest.commune}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Informations du citoyen">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <User className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Nom complet</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{request.details.fullName || 'Non spécifié'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Date de naissance</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {request.details.birthDate ? format(new Date(request.details.birthDate), 'dd MMMM yyyy', { locale: fr }) : 'Non spécifiée'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Lieu de naissance</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{request.details.birthPlace || 'Non spécifié'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Nom du père</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{request.details.fatherName || 'Non spécifié'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Nom de la mère</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{request.details.motherName || 'Non spécifié'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Méthode de livraison</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{request.details.deliveryMethod === 'delivery' ? 'Livraison' : 'Téléchargement'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Téléphone</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{request.details.phoneNumber || 'Non spécifié'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Adresse</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{request.details.address || 'Non spécifiée'}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Documents requis">
            <div className="space-y-4">
              {formattedRequest.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
                >
                  <span className="text-sm text-neutral-900 dark:text-white">{doc.name}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      doc.status === 'provided'
                        ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400'
                        : 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400'
                    }`}
                  >
                    {doc.status === 'provided' ? 'Fourni' : 'En attente'}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Notes">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{formattedRequest.notes}</p>
          </Card>
        </div>

        {/* Actions et historique */}
        <div className="space-y-6">
          <Card title="Actions">
            <div className="space-y-4">
              {request.status === 'pending' && (
                <Button
                  onClick={handleProcessRequest}
                  isLoading={isProcessing}
                  fullWidth
                  icon={<PlayCircle className="mr-2 h-4 w-4" />}
                >
                  Mettre en traitement
                </Button>
              )}

              {request.status === 'processing' && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      variant="primary"
                  onClick={() => setDecision('approve')}
                      disabled={isProcessing}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                      Approuver
                </Button>
                <Button
                      variant="danger"
                  onClick={() => setDecision('reject')}
                      disabled={isProcessing}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                      Rejeter
                </Button>
              </div>

              {decision === 'approve' && (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Année du registre
      </label>
      <input
        type="text"
        value={anneeRegistre}
        onChange={(e) => setAnneeRegistre(e.target.value)}
        placeholder="Ex : 2024"
        className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Numéro du registre
      </label>
      <input
        type="text"
        value={numeroRegistre}
        onChange={(e) => setNumeroRegistre(e.target.value)}
        placeholder="Ex : 4498/04"
        className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
      />
    </div>
  </div>
)}


              {decision === 'reject' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Motif du rejet
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                        className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                        rows={3}
                        placeholder="Veuillez indiquer le motif du rejet..."
                  />
                </div>
              )}

              {decision && (
                <Button
                  onClick={handleProcess}
                      isLoading={processing}
                      fullWidth
                >
                      Confirmer {decision === 'approve' ? 'l\'approbation' : 'le rejet'}
                </Button>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card title="Historique">
            <div className="space-y-4">
              {formattedRequest.history.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                    {index < formattedRequest.history.length - 1 && (
                      <div className="h-full w-0.5 bg-neutral-200 dark:bg-neutral-700"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {event.action}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {event.date} par {event.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProcessRequest; 