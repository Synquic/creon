import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import {
  KeyIcon,
  ShieldCheckIcon,
  BellIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const SettingsPage: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('security');

  const changePasswordMutation = useMutation({
    mutationFn: apiService.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully!');
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordFormData) => {
    const { confirmPassword, ...passwordData } = data;
    changePasswordMutation.mutate(passwordData);
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      // TODO: Implement account deletion
      toast.error('Account deletion not implemented yet');
    }
  };

  const tabs = [
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'danger', name: 'Danger Zone', icon: ExclamationTriangleIcon },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Change Password */}
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <KeyIcon className="w-6 h-6 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Change Password
                </h3>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  {...register('currentPassword')}
                  type="password"
                  label="Current Password"
                  placeholder="Enter your current password"
                  error={errors.currentPassword?.message}
                  autoComplete="current-password"
                />
                <Input
                  {...register('newPassword')}
                  type="password"
                  label="New Password"
                  placeholder="Enter your new password"
                  error={errors.newPassword?.message}
                  autoComplete="new-password"
                />
                <Input
                  {...register('confirmPassword')}
                  type="password"
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  error={errors.confirmPassword?.message}
                  autoComplete="new-password"
                />
                <Button type="submit" isLoading={isSubmitting}>
                  Change Password
                </Button>
              </form>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <ShieldCheckIcon className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add an extra layer of security to your account with two-factor authentication.
              </p>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    2FA Status
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Not enabled
                  </p>
                </div>
                <Button variant="outline">
                  Enable 2FA
                </Button>
              </div>
            </Card>

            {/* Active Sessions */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Active Sessions
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Current Session
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Your current browser session
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Active
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <Button variant="outline" onClick={logout}>
                  Sign Out All Other Sessions
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <div className="flex items-center space-x-3 mb-6">
                <BellIcon className="w-6 h-6 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notification Preferences
                </h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Email Notifications
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive email updates about your account activity
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Marketing Emails
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive emails about new features and updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Security Alerts
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified about important security events
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'danger' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3 mb-6">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-400">
                  Danger Zone
                </h3>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-2">
                  Delete Account
                </h4>
                <p className="text-red-700 dark:text-red-300 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button
                  variant="danger"
                  leftIcon={<TrashIcon className="w-4 h-4" />}
                  onClick={handleDeleteAccount}
                >
                  Delete My Account
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;