import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import notificationService from '../../services/notificationService';

interface NotificationBellProps {
  userRole: 'admin' | 'agent' | 'citizen';
}

const NotificationBell = ({ userRole }: NotificationBellProps) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const getNotificationPath = () => {
    switch (userRole) {
      case 'admin':
        return '/admin/notifications';
      case 'agent':
        return '/agent/notifications';
      case 'citizen':
        return '/citizen/notifications';
      default:
        return '/notifications';
    }
  };

  return (
    <Link
      to={getNotificationPath()}
      className="relative rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
      title="Notifications"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-xs font-medium text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
