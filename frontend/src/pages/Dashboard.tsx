import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { isAuthenticated } from '../services/authService';

interface Request {
  _id: string;
  documentType: string;
  status: string;
  createdAt: string;
  // Ajoutez d'autres champs selon vos besoins
}

const Dashboard = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (!isAuthenticated()) {
          navigate('/login');
          return;
        }

        const response = await axios.get(API_ENDPOINTS.REQUESTS.GET_ALL);
        setRequests(response.data.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Une erreur est survenue');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigate]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mes demandes</h1>
      {requests.length === 0 ? (
        <p>Aucune demande trouvée</p>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white p-4 rounded-lg shadow"
            >
              <h2 className="text-lg font-semibold">{request.documentType}</h2>
              <p>Statut: {request.status}</p>
              <p>Date: {new Date(request.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 