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
  MapPin
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { RequestDetails } from '../../services/requestService';
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

  const handleApproveForPayment = async () => {
    if (!request) return;
    
    setProcessing(true);
    try {
      // Mettre en traitement pour permettre le paiement
      const response = await api.put(`/requests/${request.id}/status`, {
        status: 'processing',
        note: 'Demande approuvée pour paiement',
      });
      
      if (response.data.success) {
        toast.success('Demande approuvée. Le citoyen peut maintenant procéder au paiement.');
        navigate('/agent/requests');
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || 'Erreur lors de l\'approbation');
      } else {
        toast.error('Erreur inattendue');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!request || !rejectionReason.trim()) {
      toast.error('Veuillez fournir un motif de rejet');
      return;
    }
    
    setProcessing(true);
    try {
      const response = await api.put(`/requests/${request.id}/status`, {
        status: 'rejected',
        note: rejectionReason,
      });
      
      if (response.data.success) {
        toast.success('Demande rejetée avec succès');
        navigate('/agent/requests');
      } else {
        throw new Error(response.data.message || 'Erreur lors du rejet');
      }
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || 'Erreur lors du rejet');
      } else {
        toast.error('Erreur inattendue');
      }
    } finally {
      setProcessing(false);
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
        // Nouvelle route backend dédiée à l'approbation finale (après paiement)
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
      } else {
        // Gestion du rejet après paiement
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
  const documentTypeName = typeof request.type === 'string' 
    ? request.type 
    : request.type?.name || 'Document non spécifié';

  const formattedRequest = {
    id: request.id,
    name: request.details.fullName || 'Non spécifié',
    type: documentTypeName,
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

          {/* Informations de l'enfant */}
          <Card title="Informations de l'enfant">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <User className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Nom</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {request.details.childLastName || request.details.fullName || 'Non spécifié'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Prénom(s)</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {request.details.childFirstName || 'Non spécifié'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Date de naissance</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {request.details.childBirthDate 
                      ? format(new Date(request.details.childBirthDate), 'dd MMMM yyyy', { locale: fr })
                      : request.details.birthDate 
                        ? format(new Date(request.details.birthDate), 'dd MMMM yyyy', { locale: fr })
                        : 'Non spécifiée'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Heure de naissance</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {request.details.childBirthTime || 'Non spécifiée'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Lieu de naissance</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {request.details.childBirthPlace || request.details.birthPlace || 'Non spécifié'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Maternité</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {request.details.childMaternity || 'Non spécifiée'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Sexe</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {request.details.childGender === 'M' ? 'Masculin' : request.details.childGender === 'F' ? 'Féminin' : 'Non spécifié'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Informations des parents */}
          <Card title="Informations des parents">
            <div className="space-y-6">
              {/* Père */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">Père</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <User className="mt-1 h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Nom et prénom(s)</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {request.details.fatherFullName || request.details.fatherName || 'Non spécifié'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-1 h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Nationalité</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {request.details.fatherNationality || 'Non spécifiée'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="mt-1 h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Profession</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {request.details.fatherProfession || 'Non spécifiée'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-1 h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Domicile</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {request.details.fatherAddress || 'Non spécifié'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mère */}
              <div className="border-t border-neutral-200 pt-4 dark:border-neutral-700">
                <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">Mère</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <User className="mt-1 h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Nom et prénom(s)</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {request.details.motherFullName || request.details.motherName || 'Non spécifié'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-1 h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Nationalité</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {request.details.motherNationality || 'Non spécifiée'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="mt-1 h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Profession</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {request.details.motherProfession || 'Non spécifiée'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-1 h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Domicile</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {request.details.motherAddress || 'Non spécifié'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Informations de livraison */}
          <Card title="Informations de livraison">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <FileText className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Méthode de livraison</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {request.details.deliveryMethod === 'delivery' 
                      ? 'Livraison à domicile' 
                      : request.details.deliveryMethod === 'pickup'
                        ? 'Retrait sur place'
                        : 'Téléchargement'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="mt-1 h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Téléphone</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {request.details.phoneNumber || 'Non spécifié'}
                  </p>
                </div>
              </div>
              {request.details.deliveryMethod === 'delivery' && (
                <div className="flex items-start gap-2 sm:col-span-2">
                  <MapPin className="mt-1 h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">Adresse de livraison</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {request.details.address || 'Non spécifiée'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Documents fournis par le citoyen */}
          <Card title="Documents fournis">
            <div className="space-y-4">
              {request.documents?.birthCertificate && (
                <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary-500" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Certificat de naissance</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Document obligatoire</p>
                    </div>
                  </div>
                  <a
                    href={request.documents.birthCertificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
                  >
                    <FileText className="h-4 w-4" />
                    Voir
                  </a>
                </div>
              )}

              {request.documents?.fatherIdCard && (
                <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary-500" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Pièce d'identité du père</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Document obligatoire</p>
                    </div>
                  </div>
                  <a
                    href={request.documents.fatherIdCard}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
                  >
                    <FileText className="h-4 w-4" />
                    Voir
                  </a>
                </div>
              )}

              {request.documents?.motherIdCard && (
                <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary-500" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Pièce d'identité de la mère</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Document obligatoire</p>
                    </div>
                  </div>
                  <a
                    href={request.documents.motherIdCard}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
                  >
                    <FileText className="h-4 w-4" />
                    Voir
                  </a>
                </div>
              )}

              {request.documents?.familyBook && (
                <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Livret de famille</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Document optionnel</p>
                    </div>
                  </div>
                  <a
                    href={request.documents.familyBook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
                  >
                    <FileText className="h-4 w-4" />
                    Voir
                  </a>
                </div>
              )}

              {request.documents?.marriageCertificate && (
                <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Acte de mariage</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Document optionnel</p>
                    </div>
                  </div>
                  <a
                    href={request.documents.marriageCertificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
                  >
                    <FileText className="h-4 w-4" />
                    Voir
                  </a>
                </div>
              )}

              {!request.documents?.birthCertificate && 
               !request.documents?.fatherIdCard && 
               !request.documents?.motherIdCard && 
               !request.documents?.familyBook && 
               !request.documents?.marriageCertificate && (
                <div className="rounded-lg bg-warning-50 p-4 text-center dark:bg-warning-900/20">
                  <AlertTriangle className="mx-auto h-8 w-8 text-warning-600 dark:text-warning-400" />
                  <p className="mt-2 text-sm text-warning-700 dark:text-warning-300">
                    Aucun document n'a encore été fourni
                  </p>
                </div>
              )}
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
                <>
                  <div className="rounded-lg bg-warning-50 p-4 dark:bg-warning-900/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
                      <div>
                        <h4 className="text-sm font-medium text-warning-800 dark:text-warning-200">
                          Vérification initiale
                        </h4>
                        <p className="mt-1 text-sm text-warning-700 dark:text-warning-300">
                          Vérifiez les informations de la demande avant de l'approuver pour paiement ou de la rejeter.
                        </p>
                      </div>
                    </div>
                  </div>

                  {!decision && (
                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        onClick={() => setDecision('approve')}
                        fullWidth
                        icon={<CheckCircle className="mr-2 h-4 w-4" />}
                      >
                        Approuver pour paiement
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => setDecision('reject')}
                        fullWidth
                        icon={<XCircle className="mr-2 h-4 w-4" />}
                      >
                        Rejeter
                      </Button>
                    </div>
                  )}

                  {decision === 'approve' && (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-success-50 p-4 dark:bg-success-900/20">
                        <p className="text-sm text-success-700 dark:text-success-300">
                          La demande sera mise en traitement et le citoyen pourra procéder au paiement.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="primary"
                          onClick={handleApproveForPayment}
                          isLoading={processing}
                          fullWidth
                        >
                          Confirmer l'approbation
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setDecision(null)}
                          disabled={processing}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}

                  {decision === 'reject' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Motif du rejet *
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Expliquez pourquoi cette demande est rejetée..."
                          rows={4}
                          className="block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="danger"
                          onClick={handleReject}
                          isLoading={processing}
                          disabled={!rejectionReason.trim()}
                          fullWidth
                        >
                          Confirmer le rejet
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setDecision(null);
                            setRejectionReason('');
                          }}
                          disabled={processing}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {request.status === 'processing' && (
                <div className="space-y-4">
                  {/* Vérifier si le paiement a été effectué */}
                  {(request.payment?.status === 'paid' || request.payment?.status === 'completed') && (
                    <div className="rounded-lg bg-success-50 p-4 dark:bg-success-900/20">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
                        <div>
                          <h4 className="text-sm font-medium text-success-800 dark:text-success-200">
                            Paiement effectué
                          </h4>
                          <p className="mt-1 text-sm text-success-700 dark:text-success-300">
                            Le citoyen a effectué le paiement. Vous devez maintenant générer le document.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Si paiement non effectué, afficher un avertissement */}
                  {request.payment?.status === 'pending' && (
                    <div className="rounded-lg bg-warning-50 p-4 dark:bg-warning-900/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
                        <div>
                          <h4 className="text-sm font-medium text-warning-800 dark:text-warning-200">
                            En attente de paiement
                          </h4>
                          <p className="mt-1 text-sm text-warning-700 dark:text-warning-300">
                            Le citoyen n'a pas encore effectué le paiement. Vous pouvez encore rejeter la demande si nécessaire.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      variant="primary"
                      onClick={() => setDecision('approve')}
                      disabled={processing || request.payment?.status === 'pending'}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approuver
                    </Button>
                    
                    {/* Afficher le bouton Rejeter UNIQUEMENT si le paiement n'est pas effectué */}
                    {request.payment?.status === 'pending' && (
                      <Button
                        variant="danger"
                        onClick={() => setDecision('reject')}
                        disabled={processing}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rejeter
                      </Button>
                    )}
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