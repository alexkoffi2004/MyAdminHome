import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Clock, 
  User, 
  Users, 
  FileCheck, 
  History, 
  CreditCard, 
  BarChart, 
  LogOut, 
  ChevronRight,
  Bell
} from 'lucide-react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { cn } from '../../utils/classNames';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';

interface SidebarProps {
  userType: UserRole;
}

const Sidebar = ({ userType }: SidebarProps) => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { unreadCount } = useUnreadNotifications();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Navigation items based on user type
  const getNavItems = (type: UserRole) => {
    switch (type) {
      case 'citizen':
        return [
          { path: '/citizen/dashboard', name: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
          { path: '/citizen/new-request', name: 'Nouvelle demande', icon: <FileText size={20} /> },
          { path: '/citizen/requests', name: 'Suivi de demandes', icon: <Clock size={20} /> },
          { path: '/citizen/notifications', name: 'Notifications', icon: <Bell size={20} /> },
          { path: '/citizen/profile', name: 'Mon profil', icon: <User size={20} /> },
        ];
      case 'agent':
        return [
          { path: '/agent/dashboard', name: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
          { path: '/agent/requests', name: 'Demandes à traiter', icon: <FileCheck size={20} /> },
          { path: '/agent/history', name: 'Historique', icon: <History size={20} /> },
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', name: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
          { path: '/admin/users', name: 'Gestion utilisateurs', icon: <Users size={20} /> },
          { path: '/admin/document-types', name: 'Types de documents', icon: <FileText size={20} /> },
          { path: '/admin/payments', name: 'Suivi des paiements', icon: <CreditCard size={20} /> },
          { path: '/admin/statistics', name: 'Statistiques', icon: <BarChart size={20} /> },
          { path: '/admin/notifications', name: 'Notifications', icon: <Bell size={20} /> },
        ];
      default:
        return [];
    }
  };
  
  const navItems = getNavItems(userType);

  return (
    <div 
      className={cn(
        "flex h-full flex-col bg-white transition-all duration-300 dark:bg-neutral-800",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo & Collapse button */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link to="/\" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 text-white">
              <FileText size={16} />
            </div>
            <span className="font-heading text-lg font-semibold text-primary-500">E-Civil</span>
          </Link>
        )}
        
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 text-white">
            <FileText size={16} />
          </div>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-1 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          <ChevronRight 
            size={20}
            className={cn(
              "transition-transform",
              collapsed ? "" : "rotate-180"
            )}
          />
        </button>
      </div>
      
      {/* User info */}
      {!collapsed && (
        <div className="border-b p-4">
          <div className="text-sm font-medium text-neutral-900 dark:text-white">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {userType === 'citizen' && 'Citoyen'}
            {userType === 'agent' && `Agent - ${user?.commune}`}
            {userType === 'admin' && 'Administrateur'}
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto py-4">
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => {
            const isNotificationPage = item.name === 'Notifications';
            const showBadge = isNotificationPage && unreadCount > 0;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === item.path
                    ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700",
                  collapsed ? "justify-center" : "gap-3",
                  "relative"
                )}
              >
                <div className="relative">
                  {item.icon}
                  {showBadge && (
                    <>
                      {/* Badge avec animation de pulsation */}
                      <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-medium text-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                      {/* Cercle d'animation autour du badge */}
                      <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-error-500 opacity-75 animate-ping"></span>
                    </>
                  )}
                </div>
                {!collapsed && (
                  <span className="flex-1">{item.name}</span>
                )}
                {!collapsed && showBadge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-xs font-medium text-white shadow-lg">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Logout */}
      <div className="border-t p-3">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;