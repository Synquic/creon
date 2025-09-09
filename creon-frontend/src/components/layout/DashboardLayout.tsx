import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, } from 'framer-motion';
import {
  HomeIcon,
  LinkIcon,
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon,
  RectangleStackIcon,
  EyeIcon,
  ShareIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  adminOnly?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Links', href: '/dashboard/links', icon: LinkIcon },
  { name: 'Products', href: '/dashboard/products', icon: ShoppingBagIcon },
  { name: 'Collections', href: '/dashboard/collections', icon: RectangleStackIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Appearance', href: '/dashboard/appearance', icon: EyeIcon },
  { name: 'Social Links', href: '/dashboard/social', icon: ShareIcon },
  { name: 'Role Management', href: '/dashboard/roles', icon: ShieldCheckIcon, adminOnly: true },
  { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Debug user state
  useEffect(() => {
    console.log('👤 Current user:', user);
    console.log('🔐 Is authenticated:', !!user);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pr-6">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Floating Light Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform lg:transform-none lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        transition-transform duration-300 ease-in-out
      `}>
        <div className="p-4 h-full">
          <motion.div 
            animate={{ width: sidebarCollapsed ? 80 : 280 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="bg-white/95 backdrop-blur-xl flex flex-col h-full shadow-xl border border-gray-200/50 rounded-3xl relative overflow-hidden"
          >
            {/* Green gradient background patterns */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 via-white to-emerald-50/40 rounded-3xl"></div>
            <div className="absolute top-8 right-8 w-20 h-20 bg-green-100/50 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 left-8 w-16 h-16 bg-emerald-100/50 rounded-full blur-xl"></div>
            {/* Light Theme Header */}
            <div className="relative z-10 flex h-20 items-center justify-between px-6 border-b border-gray-200/50">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img src="/logo.png" alt="Creon Logo" className="w-10 h-10 flex-shrink-0" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-200 to-emerald-200 rounded-lg opacity-30 blur"></div>
                </div>
                {!sidebarCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Creon
                    </h1>
                    <p className="text-xs text-gray-500 font-medium">Dashboard</p>
                  </motion.div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {/* Close button for mobile */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 lg:hidden"
                >
                  <XMarkIcon className="w-5 h-5" />
                </motion.button>
                {/* Collapse toggle for desktop */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors hidden lg:block"
                >
                  <motion.div
                    animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </motion.div>
                </motion.button>
              </div>
            </div>

            {/* Light Theme User Info */}
            <div className="relative z-10 p-6">
              {!sidebarCollapsed ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-green-50/50 border border-gray-200/50 shadow-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-50/30 to-emerald-50/30 rounded-2xl"></div>
                  <div className="relative flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">
                          {user?.firstName?.[0] || user?.username?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-600 truncate flex items-center">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                        @{user?.username}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">
                      {user?.firstName?.[0] || user?.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Light Theme Navigation */}
            <nav className="relative z-10 flex-1 px-4 py-2 overflow-y-auto">
              <ul className="space-y-2">
                {navigation.map((item, index) => {
                  // Hide admin-only items for users without appropriate roles
                  if (item.adminOnly && !['super_admin', 'admin', 'manager'].includes(user?.role || '')) {
                    return null;
                  }
                  
                  const isActive = location.pathname === item.href;
                  return (
                    <motion.li 
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08, type: "spring", bounce: 0.4 }}
                    >
                      <Link
                        to={item.href}
                        className={`group relative flex items-center px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        {/* Active background effect */}
                        {isActive && (
                          <motion.div
                            layoutId="activeNavBackground"
                            className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                          />
                        )}
                        
                        <div className="relative flex items-center w-full">
                          <div className={`${sidebarCollapsed ? 'mx-auto' : 'mr-4'} relative`}>
                            <item.icon className={`h-6 w-6 flex-shrink-0 ${
                              isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                            }`} />
                            {isActive && (
                              <div className="absolute -inset-1 bg-white/30 rounded-lg blur-sm"></div>
                            )}
                          </div>
                          
                          {!sidebarCollapsed && (
                            <span className="truncate font-semibold">{item.name}</span>
                          )}
                          
                          {isActive && !sidebarCollapsed && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto w-2 h-2 bg-white rounded-full shadow-sm"
                              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                            />
                          )}
                        </div>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* Light Theme Logout button */}
            <div className="relative z-10 p-4 border-t border-gray-200/50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className={`w-full flex items-center px-4 py-3 rounded-2xl text-sm font-semibold bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 hover:border-red-300 transition-all duration-300 shadow-sm ${
                  sidebarCollapsed ? 'justify-center' : 'justify-start'
                }`}
                title={sidebarCollapsed ? 'Logout' : undefined}
              >
                <ArrowRightOnRectangleIcon className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
                {!sidebarCollapsed && <span>Logout</span>}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Light Theme Header */}
        <header className="bg-white/80 backdrop-blur-xl border-[1px]  sticky top-0 z-30 mt-6 rounded-lg border-emerald-200 py-2">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Bars3Icon className="w-6 h-6" />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  My Creon
                </h1>
                <p className="text-sm text-gray-500 mt-1">Manage your links and profile</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to={`/${user?.username}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm transition-all duration-200"
                >
                  View Profile
                </motion.button>
              </Link>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 hover:shadow-lg transition-all duration-200"
              >
                Share
              </motion.button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 mt-6 rounded-lg border-[1px] border-emerald-200 no-scrollbar">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;