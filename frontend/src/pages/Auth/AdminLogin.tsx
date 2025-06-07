import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/Auth/LoginForm';
import { User } from 'lucide-react';

const AdminLogin = () => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white shadow dark:bg-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <User className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-neutral-900 dark:text-white">MyAdminHome</span>
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/citizen/login"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                Espace Citoyen
              </Link>
              <Link
                to="/agent/login"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                Espace Agent
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <LoginForm
        userType="admin"
        title="Espace Administrateur"
        description="Connectez-vous pour gérer la plateforme"
      />
    </div>
  );
};

export default AdminLogin; 