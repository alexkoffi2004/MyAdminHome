import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { getRequestDetails, updatePaymentStatus } from '../../services/requestService';
import { useAuth } from '../../contexts/AuthContext';

const PaymentConfirm = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [requestDetails, setRequestDetails] = useState<any>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        if (!id) {
          throw new Error('ID de la demande non spécifié');
        }

        console.log('Starting payment confirmation...');
        console.log('User:', user);
        console.log('Request ID:', id);

        // Récupérer les détails de la demande
        const request = await getRequestDetails(id);
        console.log('Request details:', request);
        setRequestDetails(request);

        // Vérifier le statut du paiement dans l'URL
        const paymentIntent = searchParams.get('payment_intent');
        const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
        const redirectStatus = searchParams.get('redirect_status');

        console.log('Payment Status:', {
          paymentIntent,
          paymentIntentClientSecret,
          redirectStatus
        });

        if (redirectStatus === 'succeeded' && paymentIntent) {
          // Mettre à jour le statut du paiement dans la base de données
          await updatePaymentStatus(id, paymentIntent, 'succeeded');
          setStatus('success');
          toast.success('Paiement effectué avec succès');
        } else {
          if (paymentIntent) {
            // Mettre à jour le statut du paiement comme échoué
            await updatePaymentStatus(id, paymentIntent, 'failed');
          }
          setStatus('error');
          toast.error('Le paiement n\'a pas pu être confirmé');
        }
      } catch (error) {
        console.error('Payment confirmation error:', error);
        setStatus('error');
        toast.error('Une erreur est survenue lors de la confirmation du paiement');
      }
    };

    confirmPayment();
  }, [id, searchParams, user]);

  const handleReturnToRequest = () => {
    if (!isAuthenticated) {
      // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
      navigate('/citizen/login', { 
        state: { 
          from: `/citizen/requests/${id}`,
          message: 'Veuillez vous connecter pour accéder à votre demande'
        }
      });
      return;
    }

    if (id) {
      navigate(`/citizen/requests/${id}`);
    } else {
      navigate('/citizen/dashboard');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <div className="text-center space-y-4">
          {status === 'success' ? (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 dark:bg-success-900/30">
                <Check className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Paiement confirmé
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Votre paiement a été effectué avec succès. Vous pouvez maintenant suivre l'avancement de votre demande.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error-100 dark:bg-error-900/30">
                <X className="h-6 w-6 text-error-600 dark:text-error-400" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Paiement échoué
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.
              </p>
            </>
          )}

          <div className="mt-6">
            <button
              onClick={handleReturnToRequest}
              className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {isAuthenticated ? 'Retour à la demande' : 'Se connecter pour voir la demande'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentConfirm; 