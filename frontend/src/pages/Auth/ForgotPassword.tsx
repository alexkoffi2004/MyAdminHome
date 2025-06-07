import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, FileText, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword = () => {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { forgotPassword } = useAuth();
  
  const { 
    register, 
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setGeneralError(null);
      await forgotPassword(data.email);
      setSuccess(true);
    } catch (error) {
      setGeneralError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900">
      <div className="container-custom flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white">
                <FileText size={20} />
              </div>
              <span className="ml-2 font-heading text-2xl font-bold text-primary-500">E-Civil</span>
            </Link>
            <h1 className="mt-6 font-heading text-2xl font-bold text-neutral-900 dark:text-white">
              Mot de passe oublié
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Entrez votre adresse email pour réinitialiser votre mot de passe
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

          {success ? (
            <div className="rounded-lg bg-white p-6 shadow-card dark:bg-neutral-800">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-500 dark:bg-success-900/30 dark:text-success-400">
                  <Mail size={24} />
                </div>
                <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                  Email envoyé
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
                </p>
                <div className="mt-6">
                  <Link to="/login">
                    <Button variant="outline" fullWidth>
                      Retour à la connexion
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-white shadow-card dark:bg-neutral-800">
              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-4">
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

                    <Button 
                      type="submit" 
                      fullWidth 
                      isLoading={isSubmitting}
                    >
                      Envoyer le lien de réinitialisation
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Vous vous souvenez de votre mot de passe ?{' '}
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

export default ForgotPassword;