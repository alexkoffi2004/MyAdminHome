import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth, UserRole } from '../../contexts/AuthContext';

interface LayoutProps {
  userType: UserRole;
}

const Layout = ({ userType }: LayoutProps) => {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Sidebar */}
      <Sidebar userType={user.role} />
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-50 p-4 dark:bg-neutral-900 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;