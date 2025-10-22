import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import notificationService, { Notification as NotificationType } from '../../services/notificationService';

const getNotificationLink = (notification: NotificationType, userRole: string) => {
  if (notification.request) {
    return `/${userRole}/requests/${notification.request}`;
  }
  return `/${userRole}/notifications`;
};

const NotificationsDropdown = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications({ limit: 5 });
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNotifications();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(notification => ({
        ...notification,
        read: true
      })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(notification => 
        notification._id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const formatNotificationDate = (dateString: string) => {
    return format(new Date(dateString), "d MMM 'à' HH:mm", { locale: fr });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-all dark:bg-neutral-800 md:w-96">
      <div className="flex items-center justify-between border-b p-4 dark:border-neutral-700">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Notifications</h3>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Marquer tout comme lu
          </button>
        )}
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
            Aucune notification
          </div>
        ) : (
          notifications.map((notification) => (
            <Link
              key={notification._id}
              to={getNotificationLink(notification, user?.role || 'citizen')}
              className={`block border-b p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700 ${
                notification.read ? 'bg-white dark:bg-neutral-800' : 'bg-primary-50 dark:bg-primary-900/20'
              }`}
              onClick={() => markAsRead(notification._id)}
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
                      {formatNotificationDate(notification.createdAt)}
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