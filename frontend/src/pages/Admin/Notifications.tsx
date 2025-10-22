import { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  File,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import notificationService, { Notification } from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications({
        unreadOnly: filter === 'unread',
        limit: 50
      });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const handleMarkAsRead = async (id: string) => {
    console.log('🔔 Marking notification as read:', id);
    try {
      await notificationService.markAsRead(id);
      console.log('✅ API call successful');
      
      setNotifications(prev => {
        const updated = prev.map(notif =>
          notif._id === id ? { ...notif, read: true } : notif
        );
        console.log('📝 Updated notifications:', updated);
        return updated;
      });
      
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1);
        console.log('📊 New unread count:', newCount);
        return newCount;
      });
      
      toast.success('Notification marquée comme lue');
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      return;
    }

    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif._id !== id));
      toast.success('Notification supprimée');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const iconMap = {
      request_created: FileText,
      request_updated: AlertCircle,
      request_completed: CheckCircle,
      request_rejected: XCircle,
      request_assigned: FileText,
      request_reassigned: FileText,
      request_status_updated: Clock,
      payment_received: DollarSign,
      document_generated: File,
      system_alert: AlertTriangle,
    };
    return iconMap[type] || Bell;
  };

  const getNotificationColorClasses = (type: Notification['type']) => {
    const colorMap = {
      request_created: {
        bg: 'bg-primary-100 dark:bg-primary-900/30',
        text: 'text-primary-600 dark:text-primary-400'
      },
      request_updated: {
        bg: 'bg-warning-100 dark:bg-warning-900/30',
        text: 'text-warning-600 dark:text-warning-400'
      },
      request_completed: {
        bg: 'bg-success-100 dark:bg-success-900/30',
        text: 'text-success-600 dark:text-success-400'
      },
      request_rejected: {
        bg: 'bg-error-100 dark:bg-error-900/30',
        text: 'text-error-600 dark:text-error-400'
      },
      request_assigned: {
        bg: 'bg-primary-100 dark:bg-primary-900/30',
        text: 'text-primary-600 dark:text-primary-400'
      },
      request_reassigned: {
        bg: 'bg-warning-100 dark:bg-warning-900/30',
        text: 'text-warning-600 dark:text-warning-400'
      },
      request_status_updated: {
        bg: 'bg-primary-100 dark:bg-primary-900/30',
        text: 'text-primary-600 dark:text-primary-400'
      },
      payment_received: {
        bg: 'bg-success-100 dark:bg-success-900/30',
        text: 'text-success-600 dark:text-success-400'
      },
      document_generated: {
        bg: 'bg-success-100 dark:bg-success-900/30',
        text: 'text-success-600 dark:text-success-400'
      },
      system_alert: {
        bg: 'bg-error-100 dark:bg-error-900/30',
        text: 'text-error-600 dark:text-error-400'
      },
    };
    return colorMap[type] || {
      bg: 'bg-neutral-100 dark:bg-neutral-900/30',
      text: 'text-neutral-600 dark:text-neutral-400'
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Gérez vos notifications et alertes système
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Tout marquer comme lu ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400" />
            <select
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
            >
              <option value="all">Toutes les notifications</option>
              <option value="unread">Non lues uniquement</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
              <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
                Aucune notification
              </h3>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                {filter === 'unread' 
                  ? 'Vous n\'avez aucune notification non lue'
                  : 'Vous n\'avez aucune notification pour le moment'}
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClasses = getNotificationColorClasses(notification.type);
              
              return (
                <div
                  key={notification._id}
                  className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                    notification.read
                      ? 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800/50'
                      : 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20'
                  }`}
                >
                  <div className={`flex-shrink-0 rounded-lg p-2 ${colorClasses.bg}`}>
                    <Icon className={`h-5 w-5 ${colorClasses.text}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification._id);
                            }}
                            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 transition-colors"
                            title="Marquer comme lu"
                            type="button"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification._id);
                          }}
                          className="rounded-lg p-2 text-neutral-400 hover:bg-error-100 hover:text-error-600 dark:hover:bg-error-900/30 dark:hover:text-error-400 transition-colors"
                          title="Supprimer"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

export default Notifications;
