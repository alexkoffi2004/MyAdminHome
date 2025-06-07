import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth, UserRole } from '../../contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  link: string;
}

// Mock notifications based on user role
const getMockNotifications = (role: UserRole): Notification[] => {
  const now = new Date();
  
  switch (role) {
    case 'citizen':
      return [
        {
          id: 'n1',
          title: 'Demande validée',
          message: 'Votre demande d\'acte de naissance a été validée',
          date: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: false,
          link: '/citizen/requests/1'
        },
        {
          id: 'n2',
          title: 'Paiement reçu',
          message: 'Nous avons bien reçu votre paiement pour la demande #12345',
          date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          read: true,
          link: '/citizen/requests/2'
        }
      ];
    case 'agent':
      return [
        {
          id: 'n1',
          title: 'Nouvelle demande',
          message: '3 nouvelles demandes attendent votre validation',
          date: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
          read: false,
          link: '/agent/requests'
        },
        {
          id: 'n2',
          title: 'Rappel',
          message: 'Vous avez des demandes en attente depuis plus de 48h',
          date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          read: true,
          link: '/agent/requests'
        }
      ];
    case 'admin':
      return [
        {
          id: 'n1',
          title: 'Nouvel agent',
          message: 'Un nouvel agent a été enregistré dans le système',
          date: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
          read: false,
          link: '/admin/users'
        },
        {
          id: 'n2',
          title: 'Problème de paiement',
          message: 'Plusieurs transactions sont en échec depuis hier',
          date: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
          read: false,
          link: '/admin/payments'
        },
        {
          id: 'n3',
          title: 'Maintenance système',
          message: 'Maintenance planifiée pour le 15/06/2025 à 23h',
          date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          read: true,
          link: '/admin/dashboard'
        }
      ];
    default:
      return [];
  }
};

const NotificationsDropdown = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allRead, setAllRead] = useState(false);
  
  useEffect(() => {
    if (user) {
      setNotifications(getMockNotifications(user.role));
    }
  }, [user]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
    setAllRead(true);
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const formatNotificationDate = (date: Date) => {
    return format(date, "d MMM 'à' HH:mm", { locale: fr });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-all dark:bg-neutral-800 md:w-96">
      <div className="flex items-center justify-between border-b p-4 dark:border-neutral-700">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Notifications</h3>
        {unreadCount > 0 && !allRead && (
          <button 
            onClick={markAllAsRead}
            className="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Marquer tout comme lu
          </button>
        )}
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
            Aucune notification
          </div>
        ) : (
          notifications.map((notification) => (
            <Link
              key={notification.id}
              to={notification.link}
              className={`block border-b p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700 ${
                notification.read ? 'bg-white dark:bg-neutral-800' : 'bg-primary-50 dark:bg-primary-900/20'
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <Bell 
                    size={16} 
                    className={notification.read 
                      ? "mt-1 text-neutral-400 dark:text-neutral-500" 
                      : "mt-1 text-primary-500 dark:text-primary-400"
                    } 
                  />
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-white">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {formatNotificationDate(notification.date)}
                    </p>
                  </div>
                </div>
                {!notification.read && (
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500"></span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
      
      <div className="border-t p-2 text-center dark:border-neutral-700">
        <Link 
          to={`/${user?.role}/notifications`}
          className="block rounded-md px-3 py-2 text-sm text-primary-500 hover:bg-neutral-50 dark:hover:bg-neutral-700"
        >
          Voir toutes les notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationsDropdown;