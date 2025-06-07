import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface CreateAgentFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  commune: string;
}

const CreateAgent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAgentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    commune: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/admin/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phoneNumber,
          communeId: formData.commune,
          role: 'agent'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création de l\'agent');
      }

      toast.success('Agent créé avec succès');
      navigate('/admin/users');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de l\'agent');
      console.error('Error creating agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const communeOptions = [
    { value: '', label: 'Sélectionner une commune' },
    { value: 'abobo', label: 'Abobo' },
    { value: 'adjame', label: 'Adjamé' },
    { value: 'anyama', label: 'Anyama' },
    { value: 'attecoube', label: 'Attécoubé' },
    { value: 'cocody', label: 'Cocody' },
    { value: 'koumassi', label: 'Koumassi' },
    { value: 'marcory', label: 'Marcory' },
    { value: 'plateau', label: 'Plateau' },
    { value: 'port-bouet', label: 'Port-bouet' },
    { value: 'treichville', label: 'Treichville' },
    { value: 'yopougon', label: 'Yopougon' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Créer un nouvel agent
        </h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="Prénom"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <Input
              label="Nom"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Téléphone"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="Mot de passe"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Select
              label="Commune"
              name="commune"
              value={formData.commune}
              onChange={handleChange}
              required
              options={communeOptions}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/users')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Créer l'agent
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateAgent; 