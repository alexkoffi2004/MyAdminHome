import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Clock, 
  Calendar,
  MapPin,
  User,
  Phone,
  CreditCard,
  Download,
  ArrowLeft,
  FileText,
  Eye
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import RequestStatusBadge, { RequestStatus } from '../../components/UI/RequestStatusBadge';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getRequestDetails, RequestDetails } from '../../services/requestService';
import toast from 'react-hot-toast';

// Fonction pour mapper les statuts
const getStatusBadge = (status: string): RequestStatus => {
  switch (status) {
    case 'pending':
    case 'processing':
    case 'completed':
    case 'rejected':
      return status;
    default:
      return 'pending';
  }
};

// Fonction pour valider et transformer les données
const validateAndTransformData = (response: any): RequestDetails => {
  console.log('Raw response received:', response);
  
  // Extraire les données de la réponse
  const data = response.data;
  console.log('Extracted data:', data);

  // Validation du type de document
  const getDocumentType = (type: string): string => {
    switch (type) {
      case 'birth_certificate':
        return 'Acte de naissance';
      case 'death_certificate':
        return 'Acte de décès';
      case 'birth_declaration':
        return 'Déclaration de naissance';
      case 'identity_document':
        return 'Pièce d\'identité';
      case 'marriage_certificate':
        return 'Acte de mariage';
      default:
        return 'Document non spécifié';
    }
  };

  // Validation des dates
  const parseDate = (dateString: string | Date | undefined, fieldName: string): Date => {
    if (!dateString) {
      console.log(`Date manquante pour le champ: ${fieldName}`);
      return new Date();
    }

    if (dateString instanceof Date) {
      return dateString;
    }

    try {
      // Essayer de parser la date
      const parsedDate = parseISO(dateString);
      if (isNaN(parsedDate.getTime())) {
        console.log(`Date invalide pour ${fieldName}: ${dateString}`);
        return new Date();
      }
      return parsedDate;
    } catch (error) {
      console.log(`Erreur de parsing pour ${fieldName}: ${dateString}`, error);
      return new Date();
    }
  };

  // Validation du montant
  const validateAmount = (amount: any): number => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      console.log('Montant invalide:', amount);
      return 0;
    }
    return numAmount;
  };

  // Validation du statut de paiement
  const validatePaymentStatus = (status: string): 'pending' | 'paid' | 'completed' | 'failed' => {
    switch (status) {
      case 'paid':
        return 'paid';
      case 'completed':
        return 'completed';
      case 'failed':
        return 'failed';
      default:
        return 'pending';
    }
  };

  // Création de l'objet validé
  const validatedData: RequestDetails = {
    id: data.id || '',
    type: getDocumentType(data.type),
    status: getStatusBadge(data.status),
    date: parseDate(data.date, 'date'),
    lastUpdate: parseDate(data.lastUpdate, 'lastUpdate'),
    documentUrl: data.documentUrl,
    price: data.price || 0,
    details: {
      // Anciennes données (compatibilité)
      fullName: data.details?.fullName,
      birthDate: data.details?.birthDate ? parseDate(data.details.birthDate, 'birthDate') : undefined,
      birthPlace: data.details?.birthPlace,
      fatherName: data.details?.fatherName,
      motherName: data.details?.motherName,
      // Nouvelles données - Enfant
      childLastName: data.details?.childLastName,
      childFirstName: data.details?.childFirstName,
      childBirthDate: data.details?.childBirthDate ? parseDate(data.details.childBirthDate, 'childBirthDate') : undefined,
      childBirthTime: data.details?.childBirthTime,
      childMaternity: data.details?.childMaternity,
      childGender: data.details?.childGender,
      // Nouvelles données - Parents
      fatherFullName: data.details?.fatherFullName,
      fatherNationality: data.details?.fatherNationality,
      fatherProfession: data.details?.fatherProfession,
      fatherAddress: data.details?.fatherAddress,
      motherFullName: data.details?.motherFullName,
      motherNationality: data.details?.motherNationality,
      motherProfession: data.details?.motherProfession,
      motherAddress: data.details?.motherAddress,
      // Autres
      commune: data.details?.commune || 'Non spécifié',
      deliveryMethod: data.details?.deliveryMethod === 'delivery' ? 'delivery' : 'download',
      phoneNumber: data.details?.phoneNumber,
      address: data.details?.address
    },
    documents: data.documents || {},
    timeline: Array.isArray(data.timeline) ? data.timeline.map((event: any, index: number) => ({
      id: event.id || index + 1,
      status: getStatusBadge(event.status),
      date: parseDate(event.date, `timeline[${index}].date`),
      description: event.description || 'Événement'
    })) : [{
      id: 1,
      status: getStatusBadge(data.status),
      date: parseDate(data.date, 'timeline[0].date'),
      description: 'Demande soumise'
    }],
    payment: {
      amount: validateAmount(data.payment?.amount),
      status: validatePaymentStatus(data.payment?.status),
      date: parseDate(data.payment?.date, 'payment.date'),
      reference: data.payment?.reference || data.id || 'Non spécifié'
    }
  };

  console.log('Validated data:', validatedData);
  return validatedData;
};

const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        if (!id) {
          toast.error('ID de la demande non spécifié');
          return;
        }

        console.log('Fetching request details for ID:', id);
        const response = await getRequestDetails(id);
        console.log('API response:', response); 
        
        const validatedData = validateAndTransformData(response);
        setRequest(validatedData);
        console.log('request')
      } catch (error) {
        console.error('Error fetching request details:', error);
        toast.error('Erreur lors du chargement des détails de la demande');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-neutral-600 dark:text-neutral-400">Demande non trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link 
            to="/citizen/requests" 
            className="flex items-center text-sm text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
          >
            <ArrowLeft size={16} className="mr-1" />
            Retour aux demandes
          </Link>
          <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700"></div>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Référence: {request.id}</span>
        </div>
        <div className="flex gap-2">
          {request.status === 'processing' && request.payment.status === 'pending' && (
            <Link to={`/citizen/payment/${request.id}`}>
              <Button
                variant="primary"
                className="w-full"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Procéder au paiement
              </Button>
            </Link>
          )}
          {request.status === 'completed' && request.documentUrl && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(request.documentUrl, '_blank')}
            >
              <Download className="mr-2 h-4 w-4" />
              Télécharger le document
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Status Card */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">{request.type}</h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  Soumise le {format(request.date, 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <RequestStatusBadge status={getStatusBadge(request.status)} />
                {request.payment.status === 'completed' && (
                  <span className="inline-flex items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800 dark:bg-success-900/30 dark:text-success-400">
                    <CreditCard className="mr-1 h-3 w-3" />
                    Paiement effectué
                  </span>
                )}
                {request.payment.status === 'failed' && (
                  <span className="inline-flex items-center rounded-full bg-error-100 px-2.5 py-0.5 text-xs font-medium text-error-800 dark:bg-error-900/30 dark:text-error-400">
                    <CreditCard className="mr-1 h-3 w-3" />
                    Paiement échoué
                  </span>
                )}
                {request.payment.status === 'pending' && request.status === 'processing' && (
                  <span className="inline-flex items-center rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-medium text-warning-800 dark:bg-warning-900/30 dark:text-warning-400">
                    <CreditCard className="mr-1 h-3 w-3" />
                    Paiement en attente
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Informations de l'enfant */}
          {(request.details.childLastName || request.details.childFirstName) && (
            <Card title="Informations de l'enfant">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <User className="mt-1 h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">Nom</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {request.details.childLastName || 'Non spécifié'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="mt-1 h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">Prénom</p>
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
                      {request.details.childBirthDate ? format(request.details.childBirthDate, 'dd MMMM yyyy', { locale: fr }) : 'Non spécifié'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="mt-1 h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">Heure de naissance</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {request.details.childBirthTime || 'Non spécifié'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-1 h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">Maternité</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {request.details.childMaternity || 'Non spécifié'}
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
          )}

          {/* Informations des parents */}
          {(request.details.fatherFullName || request.details.motherFullName) && (
            <Card title="Informations des parents">
              <div className="space-y-6">
                {/* Père */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">Père</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <User className="mt-1 h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">Nom complet</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {request.details.fatherFullName || 'Non spécifié'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-1 h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">Nationalité</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {request.details.fatherNationality || 'Non spécifié'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <User className="mt-1 h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">Profession</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {request.details.fatherProfession || 'Non spécifié'}
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
                <div className="border-t border-neutral-200 pt-6 dark:border-neutral-700">
                  <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">Mère</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <User className="mt-1 h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">Nom complet</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {request.details.motherFullName || 'Non spécifié'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-1 h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">Nationalité</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {request.details.motherNationality || 'Non spécifié'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <User className="mt-1 h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">Profession</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {request.details.motherProfession || 'Non spécifié'}
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
          )}

          {/* Documents fournis */}
          {request.documents && Object.keys(request.documents).length > 0 && (
            <Card title="Documents fournis">
              <div className="space-y-3">
                {request.documents.birthCertificate && (
                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary-500" />
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        Certificat de naissance
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(request.documents?.birthCertificate, '_blank')}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Voir
                    </Button>
                  </div>
                )}
                {request.documents.fatherIdCard && (
                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary-500" />
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        Pièce d'identité du père
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(request.documents?.fatherIdCard, '_blank')}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Voir
                    </Button>
                  </div>
                )}
                {request.documents.motherIdCard && (
                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary-500" />
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        Pièce d'identité de la mère
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(request.documents?.motherIdCard, '_blank')}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Voir
                    </Button>
                  </div>
                )}
                {request.documents.familyBook && (
                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary-500" />
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        Livret de famille
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(request.documents?.familyBook, '_blank')}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Voir
                    </Button>
                  </div>
                )}
                {request.documents.marriageCertificate && (
                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary-500" />
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        Acte de mariage
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(request.documents?.marriageCertificate, '_blank')}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Voir
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card title="Suivi de la demande">
            <div className="flow-root">
              <ul className="-mb-8">
                {request.timeline.map((event, eventIdx) => (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== request.timeline.length - 1 ? (
                        <span
                          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-neutral-200 dark:bg-neutral-700"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            event.status === 'completed' 
                              ? 'bg-success-100 text-success-500 dark:bg-success-900/30 dark:text-success-400'
                              : event.status === 'processing'
                              ? 'bg-primary-100 text-primary-500 dark:bg-primary-900/30 dark:text-primary-400'
                              : event.status === 'rejected'
                              ? 'bg-error-100 text-error-500 dark:bg-error-900/30 dark:text-error-400'
                              : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                          }`}>
                            <Clock size={16} />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-neutral-900 dark:text-white">
                              {event.status === 'pending' ? 'En attente' :
                               event.status === 'processing' ? 'En traitement' :
                               event.status === 'completed' ? 'Terminée' :
                               event.status === 'rejected' ? 'Rejetée' : 'Inconnu'}
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-neutral-500 dark:text-neutral-400">
                            {format(event.date, 'dd MMM yyyy à HH:mm', { locale: fr })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Info */}
          <Card title="Informations de paiement">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Montant</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {request.payment.amount.toLocaleString('fr-CI')} FCFA
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Référence</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {request.payment.reference}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Date</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {format(request.payment.date, 'dd/MM/yyyy HH:mm', { locale: fr })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Statut</span>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  request.payment.status === 'completed' 
                    ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400'
                    : request.payment.status === 'failed'
                    ? 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-400'
                    : 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-400'
                }`}>
                  {request.payment.status === 'completed' ? 'Payé' : 
                   request.payment.status === 'failed' ? 'Échec' : 'En attente'}
                </span>
              </div>
            </div>
          </Card>

          {/* Delivery Info */}
          <Card title="Mode de réception">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Méthode</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {request.details.deliveryMethod === 'download' ? 'Téléchargement' : 'Livraison'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Commune</span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {request.details.commune}
                </span>
              </div>
              
              {request.details.deliveryMethod === 'delivery' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Adresse</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {request.details.address}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Téléphone</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {request.details.phoneNumber}
                    </span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Help Card */}
          <Card>
            <div className="text-center">
              <h3 className="font-medium text-neutral-900 dark:text-white">Besoin d'aide ?</h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Notre équipe est disponible pour vous aider
              </p>
              <Button 
                variant="outline" 
                fullWidth 
                className="mt-4"
              >
                Contacter le support
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;