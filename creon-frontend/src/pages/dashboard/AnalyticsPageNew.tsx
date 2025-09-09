import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Define types for data structures used in this component
interface LinkData {
  _id: string;
  title: string;
  url: string;
  shortCode: string;
  isActive: boolean;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsItem {
  timestamp: string;
  linkTitle: string;
  clicks: number;
  views: number;
  clickRate: number;
}
import { useQuery } from '@tanstack/react-query';
import {
  EyeIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  SparklesIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import * as simpleApi from '../../services/api-simple';

const AnalyticsPageNew: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const periods = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' }
  ];

  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats', selectedPeriod],
    queryFn: () => simpleApi.getDashboardStats(),
  });

  const { data: linksData } = useQuery({
    queryKey: ['links'],
    queryFn: () => simpleApi.getLinks(),
  });

  const stats = statsData?.data?.data || {
    totalLinks: 0,
    totalProducts: 0,
    totalClicks: 0,
    totalViews: 0,
    clickRate: 0,
    topPerformingLinks: [],
    recentAnalytics: []
  };

  const links: LinkData[] = linksData?.data?.data?.links || [];

  const handleExportData = () => {
    // Create CSV data
    const csvData = [
      ['Date', 'Link Title', 'Clicks', 'Views', 'Click Rate'],
      ...stats.recentAnalytics.map((item: AnalyticsItem) => [
        new Date(item.timestamp).toLocaleDateString(),
        item.linkTitle || 'N/A',
        item.clicks || 0,
        item.views || 0,
        item.clickRate || 0 + '%'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewProfile = () => {
    window.open(`/${user?.username}`, '_blank');
  };

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/${user?.username}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.firstName} ${user?.lastName} - ${user?.username}`,
          text: user?.bio || `Check out ${user?.username}'s profile`,
          url,
        });
      } catch (_error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        // You could add a toast notification here
      }
    } else {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600">Unable to load analytics data</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Track your link performance and engagement</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleViewProfile}
              className="border-primary-200 text-primary-700 hover:bg-primary-50"
            >
              View Profile
            </Button>
            <Button 
              onClick={handleShareProfile}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              Share Profile
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex justify-end">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <LinkIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total Links</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalLinks || links.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Total Clicks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <CursorArrowRaysIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total Clicks</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalClicks || links.reduce((sum: number, link: { clickCount: number }) => sum + link.clickCount, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Profile Views */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <EyeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Profile Views</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalViews || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Click Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                      <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Click Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.clickRate ? `${stats.clickRate.toFixed(1)}%` : '0%'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Charts and Top Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
            <div className="h-64 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="w-12 h-12 text-primary-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive chart coming soon</p>
              </div>
            </div>
          </motion.div>

          {/* Top Performing Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Links</h3>
            <div className="space-y-3">
              {links
                .filter((link: { isActive: boolean; }) => link.isActive)
                .sort((a: { clickCount: number; }, b: { clickCount: number; }) => b.clickCount - a.clickCount)
                .slice(0, 5)
                .map((link: { _id: React.Key | null | undefined; title: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; url: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; clickCount: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, index: number) => (
                <div
                  key={link._id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 text-sm font-medium">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{link.title}</h4>
                      <p className="text-xs text-gray-500 truncate">{link.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">{link.clickCount}</span>
                    <SparklesIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
              
              {links.filter((link: { isActive: boolean }) => link.isActive).length === 0 && (
                <div className="text-center py-8">
                  <LinkIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No active links yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Export Data */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
            onClick={handleExportData}
            className="border-primary-200 text-primary-700 hover:bg-primary-50"
          >
            Export Data
          </Button>
        </div>

        {/* Recent Activity Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {links.slice(0, 10).map((link: any) => (
                  <tr key={link._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <LinkIcon className="w-4 h-4 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{link.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{link.url}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {link.clickCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        link.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {link.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                
                {links.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <LinkIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p>No links created yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPageNew;