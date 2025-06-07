import { useState } from 'react';
import { Bell, Menu, X, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import UserDropdown from './UserDropdown';
import NotificationsDropdown from './NotificationsDropdown';

const Navbar = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const toggleNotificationsMenu = () => {
    setShowNotifications(prev => !prev);
    // Close other dropdowns if open
  };

  return (
    <nav className="bg-white px-4 py-3 shadow-sm dark:bg-neutral-800 md:px-6">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-neutral-600 hover:text-primary-500 dark:text-neutral-200"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Page title - visible on all screens */}
        <h1 className="text-lg font-bold text-primary-500 md:text-xl">
          {user?.role === 'citizen' && 'Espace Citoyen'}
          {user?.role === 'agent' && 'Portail Agent'}
          {user?.role === 'admin' && 'Administration'}
        </h1>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotificationsMenu}
              className="relative rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary-500"></span>
            </button>
            {showNotifications && <NotificationsDropdown />}
          </div>

          {/* User menu */}
          <UserDropdown />
        </div>
      </div>

      {/* Mobile menu - only visible on small screens */}
      {isMobileMenuOpen && (
        <div className="mt-4 md:hidden">
          {/* Mobile navigation links based on user role */}
          {user?.role === 'citizen' && (
            <div className="flex flex-col space-y-2">
              <Link to="/citizen/dashboard\" className="rounded-md px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700">Dashboard</Link>
              <Link to="/citizen/new-request" className="rounded-md px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700">Nouvelle Demande</Link>
              <Link to="/citizen/requests" className="rounded-md px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700">Mes Demandes</Link>
              <Link to="/citizen/profile" className="rounded-md px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700">Profil</Link>
            </div>
          )}
          
          {user?.role === 'agent' && (
            <div className="flex flex-col space-y-2">
              <Link to="/agent/dashboard" className="rounded-md px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700">Dashboard</Link>
              <Link to="/agent/requests" className="rounded-md px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700">Demandes à traiter</Link>
              <Link to="/agent/history" className="rounded-md px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700">Historique</Link>
            </div>
          )}
          
          {user?.role === 'admin' && (
            <div className="flex flex-col space-y-2">
              <Link to="/admin/dashboard" className="rounded-md px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700">Dashboard</Link>
              <Link to="/admin/users" className="rounded-md px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700">Utilisateurs</Link>
              <Link to="/admin/document-types" className="rounded-md px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700">Types de Documents</Link>
              <Link to="/admin/payments" className="rounded-md px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700">Paiements</Link>
              <Link to="/admin/statistics" className="rounded-md px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700">Statistiques</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;