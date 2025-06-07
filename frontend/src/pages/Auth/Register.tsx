import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Phone, MapPin, Lock, FileText, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  commune: string;
  address: string;
  password: string;
  confirmPassword: string;
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

const Register = () => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setGeneralError(null);
      
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        commune: data.commune,
        address: data.address,
        role: 'citizen',
        password: data.password
      });
      
      navigate('/citizen/dashboard');
    } catch (error) {
      setGeneralError('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900">
      <div className="container-custom flex items-center justify-center py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white">
                <FileText size={20} />
              </div>
              <span className="ml-2 font-heading text-2xl font-bold text-primary-500">E-Civil</span>
            </Link>
            <h1 className="mt-6 font-heading text-2xl font-bold text-neutral-900 dark:text-white">Créer un compte</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Inscrivez-vous pour accéder aux services d'état civil
            </p>
          </div>

          {generalError && (
            <div className="mb-6 rounded-md bg-error-50 p-3 dark:bg-error-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-error-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-error-700 dark:text-error-400">{generalError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-lg bg-white shadow-card dark:bg-neutral-800">
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="firstName"
                      type="text"
                      label="Prénom"
                      placeholder="Votre prénom"
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
                      type="text"
                      label="Nom"
                      placeholder="Votre nom"
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
                    placeholder="votre@email.com"
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
                    type="tel"
                    label="Numéro de téléphone"
                    placeholder="+225 XX XX XX XX XX"
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
                  
                  <Input
                    id="address"
                    type="text"
                    label="Adresse"
                    placeholder="Votre adresse complète"
                    icon={<MapPin size={18} />}
                    error={errors.address?.message}
                    {...register('address', {
                      required: 'L\'adresse est requise',
                      minLength: {
                        value: 5,
                        message: 'L\'adresse doit contenir au moins 5 caractères'
                      }
                    })}
                  />
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="password"
                      type="password"
                      label="Mot de passe"
                      placeholder="••••••••"
                      icon={<Lock size={18} />}
                      error={errors.password?.message}
                      {...register('password', {
                        required: 'Le mot de passe est requis',
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
                      label="Confirmer le mot de passe"
                      placeholder="••••••••"
                      icon={<Lock size={18} />}
                      error={errors.confirmPassword?.message}
                      {...register('confirmPassword', {
                        required: 'Veuillez confirmer votre mot de passe',
                        validate: value => 
                          value === password || 'Les mots de passe ne correspondent pas'
                      })}
                    />
                  </div>

                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="text-neutral-700 dark:text-neutral-300">
                        J'accepte les{' '}
                        <a href="#" className="text-primary-500 hover:text-primary-400">
                          conditions d'utilisation
                        </a>
                        {' '}et la{' '}
                        <a href="#" className="text-primary-500 hover:text-primary-400">
                          politique de confidentialité
                        </a>
                      </label>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    fullWidth 
                    isLoading={isSubmitting}
                  >
                    Créer mon compte
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="font-medium text-primary-500 hover:text-primary-400">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;