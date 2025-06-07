import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CreditCard, ArrowLeft, Check } from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { toast } from 'react-toastify';
import { getRequestDetails, initializePayment } from '../../services/requestService';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useAuth } from '../../contexts/AuthContext';
import type { StripeElementsOptions } from '@stripe/stripe-js';

// Initialiser Stripe avec la clé publique
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  requestId: string;
}

// Composant du formulaire de paiement
const PaymentForm = ({ clientSecret, onSuccess, requestId }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/citizen/payment/confirm/${requestId}`,
        },
        redirect: 'always'
      });

      if (submitError) {
        setError(submitError.message || 'Une erreur est survenue lors du paiement');
        toast.error(submitError.message || 'Une erreur est survenue lors du paiement');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors du paiement';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Traitement en cours...' : 'Payer maintenant'}
      </button>
    </form>
  );
};

const Payment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          toast.error('ID de la demande non spécifié');
          return;
        }

        // Récupérer les détails de la demande et initialiser le paiement en parallèle
        const [requestResponse, paymentResponse] = await Promise.all([
          getRequestDetails(id),
          initializePayment(id)
        ]);

        setRequestDetails(requestResponse);
        setClientSecret(paymentResponse.clientSecret);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!clientSecret || !requestDetails) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500">Impossible d'initialiser le paiement</p>
        </div>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px',
      },
    },
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link 
          to={`/citizen/requests/${id}`}
          className="flex items-center text-sm text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400"
        >
          <ArrowLeft size={16} className="mr-1" />
          Retour à la demande
        </Link>
      </div>

      <Card>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Paiement</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Référence: {requestDetails.id}
            </p>
          </div>

          <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Montant à payer</span>
              <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                {requestDetails.price?.toLocaleString('fr-CI')} FCFA
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              {requestDetails.type}
            </p>
          </div>

          <Elements stripe={stripePromise} options={options}>
            <PaymentForm 
              clientSecret={clientSecret} 
              onSuccess={() => {}} 
              requestId={id || ''} 
            />
          </Elements>
        </div>
      </Card>
    </div>
  );
};

export default Payment;