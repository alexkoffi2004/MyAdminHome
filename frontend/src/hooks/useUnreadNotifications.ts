import { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

/**
 * Hook personnalisé pour récupérer le nombre de notifications non lues
 * Se rafraîchit automatiquement toutes les 30 secondes
 */
export const useUnreadNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return { unreadCount, loading };
};
