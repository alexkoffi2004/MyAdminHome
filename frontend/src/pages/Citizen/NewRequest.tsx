import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { 
  FileText, 
  Upload, 
  Truck, 
  MapPin,
  AlertCircle,
  Info,
  User,
  Phone,
  Loader,
  CheckCircle,
  X
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import { toast } from 'react-toastify';
import api from '../../config/api';
import { AxiosError } from 'axios';
import documentTypeService, { DocumentType } from '../../services/documentTypeService';


// Communes
const communes = [
  { value: 'abobo', label: 'Abobo' },
  // { value: 'adjame', label: 'Adjamé' },
  // { value: 'anyama', label: 'Anyama' },
  // { value: 'attécoubé', label: 'Attécoubé' },
  // { value: 'cocody', label: 'Cocody' },
  // { value: 'koumassi', label: 'Koumassi' },
  // { value: 'marcory', label: 'Marcory' },
  // { value: 'plateau', label: 'Plateau' },
  // { value: 'port-bouët', label: 'Port-Bouët' },
  // { value: 'treichville', label: 'Treichville' },
  // { value: 'yopougon', label: 'Yopougon' }
];

// Delivery methods
const deliveryMethods = [
  { value: 'download', label: 'Téléchargement (PDF)' },
  { value: 'pickup', label: 'Retrait sur place' },
  { value: 'delivery', label: 'Livraison à domicile (+2000 FCFA)' }
];

interface NewRequestFormData {
  // Étape 1: Type de document
  documentType: string;
  commune: string;
  
  // Étape 2: Informations de l'enfant
  childLastName: string;
  childFirstName: string;
  childBirthDate: string;
  childBirthPlace: string;
  childBirthTime: string;
  childMaternity: string;
  childGender: 'M' | 'F';
  
  // Étape 3: Informations des parents
  // Père
  fatherFullName: string;
  fatherNationality: string;
  fatherProfession: string;
  fatherAddress: string;
  // Mère
  motherFullName: string;
  motherNationality: string;
  motherProfession: string;
  motherAddress: string;
  
  // Étape 4: Documents
  birthCertificate?: FileList;
  fatherIdCard?: FileList;
  motherIdCard?: FileList;
  familyBook?: FileList;
  marriageCertificate?: FileList;
  
  // Étape 5: Mode de réception
  deliveryMethod: string;
  address?: string;
  phoneNumber?: string;
}

const NewRequest = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loadingDocTypes, setLoadingDocTypes] = useState(true);
  const [docTypesError, setDocTypesError] = useState<string | null>(null);
  
  const { 
    control,
    register, 
    handleSubmit,
    watch,
    formState: { errors } 
  } = useForm<NewRequestFormData>({
    defaultValues: {
      documentType: '',
      commune: '',
      deliveryMethod: 'download'
    }
  });
  
  const selectedDocType = watch('documentType');
  const selectedDeliveryMethod = watch('deliveryMethod');

  // Charger les types de documents depuis l'API (route publique)
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        setLoadingDocTypes(true);
        setDocTypesError(null);
        const data = await documentTypeService.getAllPublic({ status: 'active' });
        setDocumentTypes(data);
      } catch (error) {
        console.error('Error fetching document types:', error);
        setDocTypesError('Impossible de charger les types de documents');
        toast.error('Erreur lors du chargement des types de documents');
      } finally {
        setLoadingDocTypes(false);
      }
    };

    fetchDocumentTypes();
  }, []);
  
  // Trouver le type de document sélectionné
  const selectedDocTypeData = documentTypes.find(dt => dt._id === selectedDocType);
  const documentPrice = selectedDocTypeData?.price || 0;
  const processingTime = selectedDocTypeData?.processingTime || 7;
  
  // Calculate delivery fee
  const deliveryFee = selectedDeliveryMethod === 'delivery' ? 2000 : 0;
  
  // Total price
  const totalPrice = documentPrice + deliveryFee;

  const onSubmit = async (data: NewRequestFormData) => {
    try {
      setIsSubmitting(true);

      // Créer un objet FormData pour gérer les fichiers
      const formData = new FormData();
      
      // Étape 1: Type de document
      formData.append('documentType', data.documentType);
      formData.append('commune', data.commune);
      
      // Étape 2: Informations de l'enfant
      formData.append('childLastName', data.childLastName);
      formData.append('childFirstName', data.childFirstName);
      formData.append('childBirthDate', data.childBirthDate);
      formData.append('childBirthPlace', data.childBirthPlace);
      formData.append('childBirthTime', data.childBirthTime);
      formData.append('childMaternity', data.childMaternity);
      formData.append('childGender', data.childGender);
      
      // Étape 3: Informations des parents
      formData.append('fatherFullName', data.fatherFullName);
      formData.append('fatherNationality', data.fatherNationality);
      formData.append('fatherProfession', data.fatherProfession);
      formData.append('fatherAddress', data.fatherAddress);
      formData.append('motherFullName', data.motherFullName);
      formData.append('motherNationality', data.motherNationality);
      formData.append('motherProfession', data.motherProfession);
      formData.append('motherAddress', data.motherAddress);
      
      // Étape 4: Documents
      if (data.birthCertificate && data.birthCertificate[0]) {
        formData.append('birthCertificate', data.birthCertificate[0]);
      }
      if (data.fatherIdCard && data.fatherIdCard[0]) {
        formData.append('fatherIdCard', data.fatherIdCard[0]);
      }
      if (data.motherIdCard && data.motherIdCard[0]) {
        formData.append('motherIdCard', data.motherIdCard[0]);
      }
      if (data.familyBook && data.familyBook[0]) {
        formData.append('familyBook', data.familyBook[0]);
      }
      if (data.marriageCertificate && data.marriageCertificate[0]) {
        formData.append('marriageCertificate', data.marriageCertificate[0]);
      }
      
      // Étape 5: Mode de réception
      formData.append('deliveryMethod', data.deliveryMethod);
      if (data.address) formData.append('address', data.address);
      if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);

      // Ajouter le prix
      formData.append('price', totalPrice.toString());

      // Envoyer la demande à l'API
      const response = await api.post('/requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 secondes de timeout
      });

      if (response.data.success) {
        // Afficher le message de succès avec le message personnalisé
        toast.success(response.data.message || 'Demande créée avec succès');
        
        // Rediriger vers la page des demandes
        navigate('/citizen/requests');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la création de la demande';
      
      if (error instanceof AxiosError) {
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        }
      }
      
      toast.error(errorMessage);
      console.error('Error details:', error instanceof AxiosError ? error.response?.data : error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Nouvelle demande</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        Remplissez le formulaire ci-dessous pour effectuer une nouvelle demande de document.
      </p>
      
      {/* Steps Indicator */}
      <div className="relative">
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-neutral-200 dark:bg-neutral-700"></div>
        <div className="relative flex justify-between">
          <div className="flex flex-col items-center">
            <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              currentStep >= 1 ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300 bg-white text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
            }`}>
              1
            </div>
            <span className="mt-2 text-xs font-medium">Type</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              currentStep >= 2 ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300 bg-white text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
            }`}>
              2
            </div>
            <span className="mt-2 text-xs font-medium">Enfant</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              currentStep >= 3 ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300 bg-white text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
            }`}>
              3
            </div>
            <span className="mt-2 text-xs font-medium">Parents</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              currentStep >= 4 ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300 bg-white text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
            }`}>
              4
            </div>
            <span className="mt-2 text-xs font-medium">Documents</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              currentStep >= 5 ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300 bg-white text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
            }`}>
              5
            </div>
            <span className="mt-2 text-xs font-medium">Réception</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="transition-all">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Type de document</h2>
              
              {loadingDocTypes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-8 w-8 animate-spin text-primary-500" />
                  <span className="ml-3 text-neutral-600 dark:text-neutral-400">Chargement des types de documents...</span>
                </div>
              ) : docTypesError ? (
                <div className="rounded-lg bg-error-50 p-4 text-sm text-error-600 dark:bg-error-900/30 dark:text-error-400">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {docTypesError}
                  </div>
                </div>
              ) : documentTypes.length === 0 ? (
                <div className="rounded-lg bg-warning-50 p-4 text-sm text-warning-600 dark:bg-warning-900/30 dark:text-warning-400">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Aucun type de document disponible</p>
                      <p className="mt-1">Les types de documents n'ont pas encore été configurés par l'administrateur. Veuillez réessayer plus tard.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Controller
                  name="documentType"
                  control={control}
                  rules={{ required: 'Veuillez sélectionner un type de document' }}
                  render={({ field }) => (
                    <Select
                      id="documentType"
                      label="Type de document"
                      icon={<FileText size={18} />}
                      error={errors.documentType?.message}
                      options={documentTypes.map(dt => ({
                        value: dt._id,
                        label: `${dt.name} - ${dt.price} FCFA`
                      }))}
                      {...field}
                    />
                  )}
                />
              )}
              
              <Controller
                name="commune"
                control={control}
                rules={{ required: 'Veuillez sélectionner une commune' }}
                render={({ field }) => (
                  <Select
                    id="commune"
                    label="Commune de délivrance"
                    icon={<MapPin size={18} />}
                    error={errors.commune?.message}
                    options={communes}
                    {...field}
                  />
                )}
              />
              
              {selectedDocType && selectedDocTypeData && (
                <div className="rounded-md bg-primary-50 p-4 dark:bg-primary-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-primary-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-primary-800 dark:text-primary-300">Informations sur le document</h3>
                      <div className="mt-2 text-sm text-primary-700 dark:text-primary-400">
                        <p><strong>Type:</strong> {selectedDocTypeData.name}</p>
                        <p><strong>Catégorie:</strong> {selectedDocTypeData.category}</p>
                        <p><strong>Tarif:</strong> {documentPrice} FCFA</p>
                        <p><strong>Délai:</strong> {processingTime} jour{processingTime > 1 ? 's' : ''} ouvrable{processingTime > 1 ? 's' : ''}</p>
                        {selectedDocTypeData.description && (
                          <p className="mt-2"><strong>Description:</strong> {selectedDocTypeData.description}</p>
                        )}
                        {selectedDocTypeData.requiredFields && selectedDocTypeData.requiredFields.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Champs requis:</p>
                            <ul className="ml-4 mt-1 list-disc">
                              {selectedDocTypeData.requiredFields.map((field, index) => (
                                <li key={index}>{field}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button 
                  onClick={nextStep}
                  disabled={!selectedDocType || !watch('commune') || documentTypes.length === 0}
                >
                  Étape suivante
                </Button>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Informations de l'enfant</h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="childLastName"
                  label="Nom de famille"
                  placeholder="Nom de l'enfant"
                  icon={<User size={18} />}
                  error={errors.childLastName?.message}
                  {...register('childLastName', { required: 'Le nom de famille est requis' })}
                />
                
                <Input
                  id="childFirstName"
                  label="Prénom(s)"
                  placeholder="Prénom(s) de l'enfant"
                  icon={<User size={18} />}
                  error={errors.childFirstName?.message}
                  {...register('childFirstName', { required: 'Le prénom est requis' })}
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="childBirthDate"
                  type="date"
                  label="Date de naissance"
                  error={errors.childBirthDate?.message}
                  {...register('childBirthDate', { required: 'La date de naissance est requise' })}
                />
                
                <Input
                  id="childBirthTime"
                  type="time"
                  label="Heure de naissance"
                  error={errors.childBirthTime?.message}
                  {...register('childBirthTime', { required: 'L\'heure de naissance est requise' })}
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="childBirthPlace"
                  label="Lieu de naissance"
                  placeholder="Ville, Pays"
                  icon={<MapPin size={18} />}
                  error={errors.childBirthPlace?.message}
                  {...register('childBirthPlace', { required: 'Le lieu de naissance est requis' })}
                />
                
                <Input
                  id="childMaternity"
                  label="Maternité de naissance"
                  placeholder="Nom de la maternité"
                  error={errors.childMaternity?.message}
                  {...register('childMaternity', { required: 'La maternité est requise' })}
                />
              </div>
              
              <Controller
                name="childGender"
                control={control}
                rules={{ required: 'Le sexe est requis' }}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Sexe
                    </label>
                    <div className="flex gap-4">
                      <label className="flex cursor-pointer items-center">
                        <input
                          type="radio"
                          value="M"
                          checked={field.value === 'M'}
                          onChange={() => field.onChange('M')}
                          className="h-4 w-4 border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">Masculin</span>
                      </label>
                      <label className="flex cursor-pointer items-center">
                        <input
                          type="radio"
                          value="F"
                          checked={field.value === 'F'}
                          onChange={() => field.onChange('F')}
                          className="h-4 w-4 border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">Féminin</span>
                      </label>
                    </div>
                    {errors.childGender?.message && (
                      <p className="text-sm text-error-500">{errors.childGender.message}</p>
                    )}
                  </div>
                )}
              />
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Retour
                </Button>
                <Button onClick={nextStep}>
                  Étape suivante
                </Button>
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Informations des parents</h2>
              
              {/* Informations du père */}
              <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                <h3 className="mb-4 text-base font-medium text-neutral-900 dark:text-white">Père</h3>
                
                <div className="space-y-4">
                  <Input
                    id="fatherFullName"
                    label="Nom et prénom(s)"
                    placeholder="Nom complet du père"
                    icon={<User size={18} />}
                    error={errors.fatherFullName?.message}
                    {...register('fatherFullName', { required: 'Le nom du père est requis' })}
                  />
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="fatherNationality"
                      label="Nationalité"
                      placeholder="Ex: Ivoirienne"
                      error={errors.fatherNationality?.message}
                      {...register('fatherNationality', { required: 'La nationalité est requise' })}
                    />
                    
                    <Input
                      id="fatherProfession"
                      label="Profession"
                      placeholder="Ex: Enseignant"
                      error={errors.fatherProfession?.message}
                      {...register('fatherProfession', { required: 'La profession est requise' })}
                    />
                  </div>
                  
                  <Input
                    id="fatherAddress"
                    label="Domicile"
                    placeholder="Adresse complète"
                    icon={<MapPin size={18} />}
                    error={errors.fatherAddress?.message}
                    {...register('fatherAddress', { required: 'Le domicile est requis' })}
                  />
                </div>
              </div>
              
              {/* Informations de la mère */}
              <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                <h3 className="mb-4 text-base font-medium text-neutral-900 dark:text-white">Mère</h3>
                
                <div className="space-y-4">
                  <Input
                    id="motherFullName"
                    label="Nom et prénom(s)"
                    placeholder="Nom complet de la mère"
                    icon={<User size={18} />}
                    error={errors.motherFullName?.message}
                    {...register('motherFullName', { required: 'Le nom de la mère est requis' })}
                  />
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="motherNationality"
                      label="Nationalité"
                      placeholder="Ex: Ivoirienne"
                      error={errors.motherNationality?.message}
                      {...register('motherNationality', { required: 'La nationalité est requise' })}
                    />
                    
                    <Input
                      id="motherProfession"
                      label="Profession"
                      placeholder="Ex: Commerçante"
                      error={errors.motherProfession?.message}
                      {...register('motherProfession', { required: 'La profession est requise' })}
                    />
                  </div>
                  
                  <Input
                    id="motherAddress"
                    label="Domicile"
                    placeholder="Adresse complète"
                    icon={<MapPin size={18} />}
                    error={errors.motherAddress?.message}
                    {...register('motherAddress', { required: 'Le domicile est requis' })}
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Retour
                </Button>
                <Button onClick={nextStep}>
                  Étape suivante
                </Button>
              </div>
            </div>
          )}
          
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Documents à fournir</h2>
              
              <div className="rounded-md bg-primary-50 p-4 dark:bg-primary-900/20">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-primary-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-primary-800 dark:text-primary-300">Documents requis</h3>
                    <p className="mt-1 text-sm text-primary-700 dark:text-primary-400">
                      Veuillez fournir les documents suivants au format PDF, JPG ou PNG (max 5MB par fichier)
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Certificat de naissance */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Certificat de naissance <span className="text-error-500">*</span>
                </label>
                <div className={`mt-1 flex justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6 transition-colors ${
                  watch('birthCertificate')?.[0] 
                    ? 'border-success-500 bg-success-50 dark:border-success-500 dark:bg-success-900/20' 
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}>
                  <div className="space-y-1 text-center">
                    {watch('birthCertificate')?.[0] ? (
                      <>
                        <CheckCircle className="mx-auto h-12 w-12 text-success-500" />
                        <div className="flex items-center justify-center gap-2 text-sm text-success-700 dark:text-success-400">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{watch('birthCertificate')?.[0]?.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('birthCertificate') as HTMLInputElement;
                              if (input) input.value = '';
                              // Trigger re-render
                              window.dispatchEvent(new Event('input'));
                            }}
                            className="ml-2 text-error-500 hover:text-error-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-success-600 dark:text-success-400">
                          Fichier téléversé avec succès
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                        <div className="flex text-sm text-neutral-600 dark:text-neutral-400">
                          <label
                            htmlFor="birthCertificate"
                            className="relative cursor-pointer rounded-md bg-white font-medium text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-400 dark:bg-transparent"
                          >
                            <span>Téléverser un fichier</span>
                            <input
                              id="birthCertificate"
                              type="file"
                              className="sr-only"
                              accept=".jpg,.jpeg,.png,.pdf"
                              {...register('birthCertificate', { required: 'Le certificat de naissance est requis' })}
                            />
                          </label>
                          <p className="pl-1">ou glisser-déposer</p>
                        </div>
                        <p className="text-xs text-neutral-500">PNG, JPG ou PDF jusqu'à 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                {errors.birthCertificate?.message && (
                  <p className="mt-1.5 text-sm text-error-500">{errors.birthCertificate.message}</p>
                )}
              </div>
              
              {/* Pièce d'identité du père */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Pièce d'identité du père <span className="text-error-500">*</span>
                </label>
                <div className={`mt-1 flex justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6 transition-colors ${
                  watch('fatherIdCard')?.[0] 
                    ? 'border-success-500 bg-success-50 dark:border-success-500 dark:bg-success-900/20' 
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}>
                  <div className="space-y-1 text-center">
                    {watch('fatherIdCard')?.[0] ? (
                      <>
                        <CheckCircle className="mx-auto h-12 w-12 text-success-500" />
                        <div className="flex items-center justify-center gap-2 text-sm text-success-700 dark:text-success-400">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{watch('fatherIdCard')?.[0]?.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('fatherIdCard') as HTMLInputElement;
                              if (input) input.value = '';
                            }}
                            className="ml-2 text-error-500 hover:text-error-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-success-600 dark:text-success-400">
                          Fichier téléversé avec succès
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                        <div className="flex text-sm text-neutral-600 dark:text-neutral-400">
                          <label
                            htmlFor="fatherIdCard"
                            className="relative cursor-pointer rounded-md bg-white font-medium text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-400 dark:bg-transparent"
                          >
                            <span>Téléverser un fichier</span>
                            <input
                              id="fatherIdCard"
                              type="file"
                              className="sr-only"
                              accept=".jpg,.jpeg,.png,.pdf"
                              {...register('fatherIdCard', { required: 'La pièce d\'identité du père est requise' })}
                            />
                          </label>
                          <p className="pl-1">ou glisser-déposer</p>
                        </div>
                        <p className="text-xs text-neutral-500">PNG, JPG ou PDF jusqu'à 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                {errors.fatherIdCard?.message && (
                  <p className="mt-1.5 text-sm text-error-500">{errors.fatherIdCard.message}</p>
                )}
              </div>
              
              {/* Pièce d'identité de la mère */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Pièce d'identité de la mère <span className="text-error-500">*</span>
                </label>
                <div className={`mt-1 flex justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6 transition-colors ${
                  watch('motherIdCard')?.[0] 
                    ? 'border-success-500 bg-success-50 dark:border-success-500 dark:bg-success-900/20' 
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}>
                  <div className="space-y-1 text-center">
                    {watch('motherIdCard')?.[0] ? (
                      <>
                        <CheckCircle className="mx-auto h-12 w-12 text-success-500" />
                        <div className="flex items-center justify-center gap-2 text-sm text-success-700 dark:text-success-400">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{watch('motherIdCard')?.[0]?.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('motherIdCard') as HTMLInputElement;
                              if (input) input.value = '';
                            }}
                            className="ml-2 text-error-500 hover:text-error-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-success-600 dark:text-success-400">
                          Fichier téléversé avec succès
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                        <div className="flex text-sm text-neutral-600 dark:text-neutral-400">
                          <label
                            htmlFor="motherIdCard"
                            className="relative cursor-pointer rounded-md bg-white font-medium text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-400 dark:bg-transparent"
                          >
                            <span>Téléverser un fichier</span>
                            <input
                              id="motherIdCard"
                              type="file"
                              className="sr-only"
                              accept=".jpg,.jpeg,.png,.pdf"
                              {...register('motherIdCard', { required: 'La pièce d\'identité de la mère est requise' })}
                            />
                          </label>
                          <p className="pl-1">ou glisser-déposer</p>
                        </div>
                        <p className="text-xs text-neutral-500">PNG, JPG ou PDF jusqu'à 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                {errors.motherIdCard?.message && (
                  <p className="mt-1.5 text-sm text-error-500">{errors.motherIdCard.message}</p>
                )}
              </div>
              
              {/* Livret de famille (optionnel) */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Livret de famille <span className="text-neutral-500">(optionnel)</span>
                </label>
                <div className={`mt-1 flex justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6 transition-colors ${
                  watch('familyBook')?.[0] 
                    ? 'border-success-500 bg-success-50 dark:border-success-500 dark:bg-success-900/20' 
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}>
                  <div className="space-y-1 text-center">
                    {watch('familyBook')?.[0] ? (
                      <>
                        <CheckCircle className="mx-auto h-12 w-12 text-success-500" />
                        <div className="flex items-center justify-center gap-2 text-sm text-success-700 dark:text-success-400">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{watch('familyBook')?.[0]?.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('familyBook') as HTMLInputElement;
                              if (input) input.value = '';
                            }}
                            className="ml-2 text-error-500 hover:text-error-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-success-600 dark:text-success-400">
                          Fichier téléversé avec succès
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                        <div className="flex text-sm text-neutral-600 dark:text-neutral-400">
                          <label
                            htmlFor="familyBook"
                            className="relative cursor-pointer rounded-md bg-white font-medium text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-400 dark:bg-transparent"
                          >
                            <span>Téléverser un fichier</span>
                            <input
                              id="familyBook"
                              type="file"
                              className="sr-only"
                              accept=".jpg,.jpeg,.png,.pdf"
                              {...register('familyBook')}
                            />
                          </label>
                          <p className="pl-1">ou glisser-déposer</p>
                        </div>
                        <p className="text-xs text-neutral-500">PNG, JPG ou PDF jusqu'à 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Acte de mariage (optionnel) */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Acte de mariage <span className="text-neutral-500">(optionnel)</span>
                </label>
                <div className={`mt-1 flex justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6 transition-colors ${
                  watch('marriageCertificate')?.[0] 
                    ? 'border-success-500 bg-success-50 dark:border-success-500 dark:bg-success-900/20' 
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}>
                  <div className="space-y-1 text-center">
                    {watch('marriageCertificate')?.[0] ? (
                      <>
                        <CheckCircle className="mx-auto h-12 w-12 text-success-500" />
                        <div className="flex items-center justify-center gap-2 text-sm text-success-700 dark:text-success-400">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{watch('marriageCertificate')?.[0]?.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('marriageCertificate') as HTMLInputElement;
                              if (input) input.value = '';
                            }}
                            className="ml-2 text-error-500 hover:text-error-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-success-600 dark:text-success-400">
                          Fichier téléversé avec succès
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                        <div className="flex text-sm text-neutral-600 dark:text-neutral-400">
                          <label
                            htmlFor="marriageCertificate"
                            className="relative cursor-pointer rounded-md bg-white font-medium text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-400 dark:bg-transparent"
                          >
                            <span>Téléverser un fichier</span>
                            <input
                              id="marriageCertificate"
                              type="file"
                              className="sr-only"
                              accept=".jpg,.jpeg,.png,.pdf"
                              {...register('marriageCertificate')}
                            />
                          </label>
                          <p className="pl-1">ou glisser-déposer</p>
                        </div>
                        <p className="text-xs text-neutral-500">PNG, JPG ou PDF jusqu'à 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Retour
                </Button>
                <Button onClick={nextStep}>
                  Étape suivante
                </Button>
              </div>
            </div>
          )}
          
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Mode de réception et récapitulatif</h2>
              
              <Controller
                name="deliveryMethod"
                control={control}
                rules={{ required: 'Veuillez sélectionner un mode de réception' }}
                render={({ field }) => (
                  <div className="space-y-4">
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Mode de réception
                    </label>
                    {deliveryMethods.map(method => (
                      <div 
                        key={method.value}
                        className={`flex cursor-pointer items-center rounded-lg border p-4 transition-colors ${
                          field.value === method.value 
                            ? 'border-primary-500 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/20'
                            : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800'
                        }`}
                        onClick={() => field.onChange(method.value)}
                      >
                        <input
                          type="radio"
                          id={method.value}
                          value={method.value}
                          checked={field.value === method.value}
                          onChange={() => field.onChange(method.value)}
                          className="h-4 w-4 border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label 
                          htmlFor={method.value} 
                          className="ml-3 flex flex-1 cursor-pointer items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">{method.label}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {method.value === 'download' && 'Téléchargement immédiat après traitement'}
                              {method.value === 'pickup' && 'Récupération au bureau communal'}
                              {method.value === 'delivery' && 'Livraison à votre adresse'}
                            </p>
                          </div>
                          <div className="ml-4 shrink-0">
                            {method.value === 'download' && <FileText size={20} className="text-primary-500" />}
                            {method.value === 'pickup' && <MapPin size={20} className="text-primary-500" />}
                            {method.value === 'delivery' && <Truck size={20} className="text-primary-500" />}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              />
              
              {selectedDeliveryMethod === 'delivery' && (
                <div className="space-y-4">
                  <Input
                    id="address"
                    label="Adresse de livraison"
                    placeholder="Entrez votre adresse complète"
                    icon={<MapPin size={18} />}
                    error={errors.address?.message}
                    {...register('address', { 
                      required: selectedDeliveryMethod === 'delivery' ? 'L\'adresse est requise pour la livraison' : false 
                    })}
                  />
                  
                  <Input
                    id="phoneNumber"
                    label="Numéro de téléphone pour la livraison"
                    placeholder="+225 XX XX XX XX XX"
                    icon={<Phone size={18} />}
                    error={errors.phoneNumber?.message}
                    {...register('phoneNumber', { 
                      required: selectedDeliveryMethod === 'delivery' ? 'Le numéro de téléphone est requis pour la livraison' : false 
                    })}
                  />
                </div>
              )}
              
              {/* Summary */}
              <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                <h3 className="mb-4 font-medium text-neutral-900 dark:text-white">Récapitulatif</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Document:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {selectedDocTypeData?.name || 'Non sélectionné'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Frais de document:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">{documentPrice} FCFA</span>
                  </div>
                  
                  {selectedDeliveryMethod === 'delivery' && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Frais de livraison:</span>
                      <span className="font-medium text-neutral-900 dark:text-white">{deliveryFee} FCFA</span>
                    </div>
                  )}
                  
                  <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700">
                    <div className="flex justify-between">
                      <span className="font-medium text-neutral-900 dark:text-white">Total:</span>
                      <span className="font-bold text-primary-500">{totalPrice} FCFA</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Retour
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Création en cours...' : 'Créer la demande'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </form>
    </div>
  );
};

export default NewRequest;