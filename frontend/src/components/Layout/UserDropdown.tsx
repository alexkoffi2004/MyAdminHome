import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  // Determine profile route based on user role
  const profileRoute = (() => {
    switch (user.role) {
      case 'citizen':
        return '/citizen/profile';
      case 'agent':
        return '/agent/dashboard'; // Agents don't have a dedicated profile page
      case 'admin':
        return '/admin/dashboard'; // Admins don't have a dedicated profile page
      default:
        return '/';
    }
  })();

  const getInitials = () => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center rounded-full bg-neutral-100 p-1 focus:outline-none dark:bg-neutral-700"
        aria-label="User menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
          {getInitials()}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition-all dark:bg-neutral-800">
          <div className="border-b px-4 py-2 dark:border-neutral-700">
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">{user.firstName} {user.lastName}</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</div>
          </div>

          <Link 
            to={profileRoute} 
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <User size={16} className="mr-2" />
            Profil
          </Link>

          {user.role === 'admin' && (
            <Link 
              to="/admin/settings" 
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <Settings size={16} className="mr-2" />
              Paramètres
            </Link>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="flex w-full items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <LogOut size={16} className="mr-2" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;