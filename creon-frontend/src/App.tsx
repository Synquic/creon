import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import PublicProfilePage from './pages/public/PublicProfilePage';
import LinksPageNew from './pages/dashboard/LinksPageNew';
import ProductsPageNew from './pages/dashboard/ProductsPageNew';
import CollectionsPageNew from './pages/dashboard/CollectionsPageNew';
import AnalyticsPageNew from './pages/dashboard/AnalyticsPageNew';
import LinkAnalyticsPage from './pages/dashboard/LinkAnalyticsPage';
import AppearancePageNew from './pages/dashboard/AppearancePageNew';
import SocialLinksPage from './pages/dashboard/SocialLinksPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import RoleManagementPage from './pages/dashboard/RoleManagementPage';
import ShopPage from './pages/dashboard/ShopPage';
import ShortLinkRedirect from './pages/redirect/ShortLinkRedirect';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              
              <Route path="/auth/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              
              <Route path="/auth/register" element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/links" element={
                <ProtectedRoute>
                  <LinksPageNew />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/products" element={
                <ProtectedRoute>
                  <ProductsPageNew />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/collections" element={
                <ProtectedRoute>
                  <CollectionsPageNew />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/analytics" element={
                <ProtectedRoute>
                  <AnalyticsPageNew />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/analytics/link/:linkId" element={
                <ProtectedRoute>
                  <LinkAnalyticsPage />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/appearance" element={
                <ProtectedRoute>
                  <AppearancePageNew />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/social" element={
                <ProtectedRoute>
                  <SocialLinksPage />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/roles" element={
                <ProtectedRoute>
                  <RoleManagementPage />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/shop" element={
                <ProtectedRoute>
                  <ShopPage />
                </ProtectedRoute>
              } />

              <Route path="/s/:shortCode" element={<ShortLinkRedirect />} />
              
              <Route path="/:username" element={<PublicProfilePage />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#15803d',
                    secondary: '#ffffff',
                  },
                  style: {
                    background: '#f0fdf4',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#dc2626',
                    secondary: '#ffffff',
                  },
                  style: {
                    background: '#fef2f2',
                    color: '#991b1b',
                    border: '1px solid #fecaca',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
