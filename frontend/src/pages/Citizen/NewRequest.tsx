import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { 
  FileText, 
  Upload, 
  CreditCard, 
  Truck, 
  MapPin,
  AlertCircle,
  Info,
  User,
  Phone
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import { toast } from 'react-toastify';
import api from '../../config/api';
import { AxiosError } from 'axios';

// Document types
const documentTypes = [
  { value: 'birth_certificate', label: 'Acte de naissance' },
  // { value: 'marriage_certificate', label: 'Acte de mariage' },
  // { value: 'death_certificate', label: 'Acte de décès' },
  // { value: 'nationality_certificate', label: 'Certificat de nationalité' },
  // { value: 'residence_certificate', label: 'Certificat de résidence' },
  // { value: 'criminal_record', label: 'Casier judiciaire' },
];

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
  documentType: string;
  commune: string;
  fullName: string;
  birthDate: string;
  birthPlace: string;
  fatherName?: string;
  motherName?: string;
  deliveryMethod: string;
  address?: string;
  phoneNumber?: string;
  identityDocument?: FileList;
}

const NewRequest = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Determine document price based on type
  const getDocumentPrice = (docType: string) => {
    switch(docType) {
      case 'birth_certificate':
        return 1000;
      // case 'marriage_certificate':
      //   return 1500;
      // case 'death_certificate':
      //   return 1500;
      // case 'nationality_certificate':
      //   return 5000;
      // case 'residence_certificate':
      //   return 2000;
      // case 'criminal_record':
      //   return 3000;
      default:
        return 0;
    }
  };
  
  const documentPrice = getDocumentPrice(selectedDocType);
  
  // Calculate delivery fee
  const deliveryFee = selectedDeliveryMethod === 'delivery' ? 2000 : 0;
  
  // Total price
  const totalPrice = documentPrice + deliveryFee;

  const onSubmit = async (data: NewRequestFormData) => {
    try {
      setIsSubmitting(true);

      // Créer un objet FormData pour gérer les fichiers
      const formData = new FormData();
      
      // Ajouter les données du formulaire
      formData.append('documentType', data.documentType);
      formData.append('commune', data.commune);
      formData.append('fullName', data.fullName);
      formData.append('birthDate', data.birthDate);
      formData.append('birthPlace', data.birthPlace);
      if (data.fatherName) formData.append('fatherName', data.fatherName);
      if (data.motherName) formData.append('motherName', data.motherName);
      formData.append('deliveryMethod', data.deliveryMethod);
      if (data.address) formData.append('address', data.address);
      if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
      
      // Ajouter le fichier d'identité s'il existe
      if (data.identityDocument && data.identityDocument[0]) {
        formData.append('identityDocument', data.identityDocument[0]);
      }

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
            <span className="mt-2 text-xs font-medium">Informations</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              currentStep >= 3 ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300 bg-white text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
            }`}>
              3
            </div>
            <span className="mt-2 text-xs font-medium">Documents</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              currentStep >= 4 ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300 bg-white text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
            }`}>
              4
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
                    options={documentTypes}
                    {...field}
                  />
                )}
              />
              
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
              
              {selectedDocType && (
                <div className="rounded-md bg-primary-50 p-4 dark:bg-primary-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-primary-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-primary-800 dark:text-primary-300">Informations sur le document</h3>
                      <div className="mt-2 text-sm text-primary-700 dark:text-primary-400">
                        <p>Tarif: {documentPrice} FCFA</p>
                        <p>Délai: 2 à 5 jours ouvrables</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button 
                  onClick={nextStep}
                  disabled={!selectedDocType || !watch('commune')}
                >
                  Étape suivante
                </Button>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Informations personnelles</h2>
              
              <Input
                id="fullName"
                label="Nom complet"
                placeholder="Entrez votre nom complet"
                icon={<User size={18} />}
                error={errors.fullName?.message}
                {...register('fullName', { required: 'Le nom complet est requis' })}
              />
              
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="birthDate"
                  type="date"
                  label="Date de naissance"
                  error={errors.birthDate?.message}
                  {...register('birthDate', { required: 'La date de naissance est requise' })}
                />
                
                <Input
                  id="birthPlace"
                  label="Lieu de naissance"
                  placeholder="Ville, Pays"
                  error={errors.birthPlace?.message}
                  {...register('birthPlace', { required: 'Le lieu de naissance est requis' })}
                />
              </div>
              
              <Input
                id="fatherName"
                label="Nom du père"
                placeholder="Nom complet du père"
                {...register('fatherName')}
              />
              
              <Input
                id="motherName"
                label="Nom de la mère"
                placeholder="Nom complet de la mère"
                {...register('motherName')}
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
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Pièces justificatives</h2>
              
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Pièce d'identité
                </label>
                <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-neutral-300 px-6 pt-5 pb-6 dark:border-neutral-700">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                    <div className="flex text-sm text-neutral-600 dark:text-neutral-400">
                      <label
                        htmlFor="identityDocument"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-400 dark:bg-transparent"
                      >
                        <span>Téléverser un fichier</span>
                        <input
                          id="identityDocument"
                          type="file"
                          className="sr-only"
                          accept=".jpg,.jpeg,.png,.pdf"
                          {...register('identityDocument', { required: 'Une pièce d\'identité est requise' })}
                        />
                      </label>
                      <p className="pl-1">ou glisser-déposer</p>
                    </div>
                    <p className="text-xs text-neutral-500">
                      PNG, JPG ou PDF jusqu'à 5MB
                    </p>
                  </div>
                </div>
                {errors.identityDocument?.message && (
                  <p className="mt-1.5 text-sm text-error-500">{errors.identityDocument.message}</p>
                )}
              </div>
              
              <div className="rounded-md bg-primary-50 p-4 dark:bg-primary-900/20">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-primary-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-primary-800 dark:text-primary-300">Documents requis</h3>
                    <div className="mt-2 text-sm text-primary-700 dark:text-primary-400">
                      <ul className="list-inside list-disc space-y-1">
                        <li>Carte Nationale d'Identité (recto-verso) ou Passeport</li>
                        {selectedDocType === 'birth_certificate' && (
                          <li>Ancien acte de naissance (si demande de copie)</li>
                        )}
                        {selectedDocType === 'marriage_certificate' && (
                          <li>Livret de famille ou ancien certificat de mariage</li>
                        )}
                      </ul>
                    </div>
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
          
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Mode de réception</h2>
              
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
                      {documentTypes.find(dt => dt.value === selectedDocType)?.label}
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