import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { AlertTriangle } from 'lucide-react';

interface LoginFormProps {
  userType: 'citizen' | 'agent' | 'admin';
  title: string;
  description: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ userType, title, description }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ ...formData, role: userType });
      navigate(`/${userType}/dashboard`);
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-error-50 p-4 dark:bg-error-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-error-500" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-error-800 dark:text-error-400">
                  Erreur
                </h3>
                <div className="mt-2 text-sm text-error-700 dark:text-error-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              label="Adresse email"
              value={formData.email}
              onChange={handleChange}
            />

            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              label="Mot de passe"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm; 