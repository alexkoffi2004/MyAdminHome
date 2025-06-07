import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { User, Mail, Phone, MapPin, Lock, Save } from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  commune: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Mock communes list
const communes = [
  { value: 'abobo', label: 'Abobo' },
  { value: 'adjame', label: 'Adjamé' },
  { value: 'anyama', label: 'Anyama' },
  { value: 'attécoubé', label: 'Attécoubé' },
  { value: 'cocody', label: 'Cocody' },
  { value: 'koumassi', label: 'Koumassi' },
  { value: 'marcory', label: 'Marcory' },
  { value: 'plateau', label: 'Plateau' },
  { value: 'port-bouët', label: 'Port-Bouët' },
  { value: 'treichville', label: 'Treichville' },
  { value: 'yopougon', label: 'Yopougon' }
];

const Profile = () => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const { 
    register, 
    handleSubmit,
    watch,
    formState: { errors } 
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      commune: user?.commune || ''
    }
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Une erreur est survenue lors de la mise à jour du profil');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Mon Profil</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card title="Informations personnelles">
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="firstName"
                label="Prénom"
                icon={<User size={18} />}
                error={errors.firstName?.message}
                {...register('firstName', {
                  required: 'Le prénom est requis',
                  minLength: {
                    value: 2,
                    message: 'Le prénom doit contenir au moins 2 caractères'
                  }
                })}
              />
              
              <Input
                id="lastName"
                label="Nom"
                icon={<User size={18} />}
                error={errors.lastName?.message}
                {...register('lastName', {
                  required: 'Le nom est requis',
                  minLength: {
                    value: 2,
                    message: 'Le nom doit contenir au moins 2 caractères'
                  }
                })}
              />
            </div>

            <Input
              id="email"
              type="email"
              label="Adresse email"
              icon={<Mail size={18} />}
              error={errors.email?.message}
              {...register('email', {
                required: 'L\'adresse email est requise',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Adresse email invalide'
                }
              })}
            />

            <Input
              id="phone"
              label="Numéro de téléphone"
              icon={<Phone size={18} />}
              error={errors.phone?.message}
              {...register('phone', {
                required: 'Le numéro de téléphone est requis',
                pattern: {
                  value: /^(\+225|00225)?[ ]?[0-9]{8,10}$/,
                  message: 'Numéro de téléphone invalide'
                }
              })}
            />

            <Select
              id="commune"
              label="Commune"
              icon={<MapPin size={18} />}
              error={errors.commune?.message}
              options={communes}
              {...register('commune', {
                required: 'La commune est requise'
              })}
            />
          </div>
        </Card>

        {/* Password Change */}
        <Card title="Changer le mot de passe">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Mot de passe</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Mettez à jour votre mot de passe pour sécuriser votre compte
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
              >
                {isChangingPassword ? 'Annuler' : 'Modifier'}
              </Button>
            </div>

            {isChangingPassword && (
              <div className="space-y-4 border-t pt-4 dark:border-neutral-700">
                <Input
                  id="currentPassword"
                  type="password"
                  label="Mot de passe actuel"
                  icon={<Lock size={18} />}
                  error={errors.currentPassword?.message}
                  {...register('currentPassword', {
                    required: 'Le mot de passe actuel est requis'
                  })}
                />

                <Input
                  id="newPassword"
                  type="password"
                  label="Nouveau mot de passe"
                  icon={<Lock size={18} />}
                  error={errors.newPassword?.message}
                  {...register('newPassword', {
                    required: 'Le nouveau mot de passe est requis',
                    minLength: {
                      value: 8,
                      message: 'Le mot de passe doit contenir au moins 8 caractères'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/,
                      message: 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial'
                    }
                  })}
                />

                <Input
                  id="confirmPassword"
                  type="password"
                  label="Confirmer le nouveau mot de passe"
                  icon={<Lock size={18} />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword', {
                    required: 'Veuillez confirmer votre mot de passe',
                    validate: value => 
                      value === newPassword || 'Les mots de passe ne correspondent pas'
                  })}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit"
            icon={<Save size={18} />}
            isLoading={isUpdating}
          >
            Enregistrer les modifications
          </Button>
        </div>
      </form>

      {/* Account Deletion */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-error-500">Zone dangereuse</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Supprimer définitivement votre compte et toutes vos données
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-error-300 text-error-500 hover:bg-error-50 dark:border-error-800 dark:text-error-400 dark:hover:bg-error-900/20"
            onClick={() => {
              // In a real app, this would open a confirmation modal
              toast.error('Cette fonctionnalité n\'est pas encore disponible');
            }}
          >
            Supprimer le compte
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;