import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  CursorArrowRaysIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import { apiService } from '../../services/api';

interface LinkAnalyticsData {
  link: {
    id: string;
    title: string;
    shortCode: string;
    url: string;
    totalClicks: number;
  };
  analytics: {
    totalClicks: number;
    dailyClicks: Record<string, number>;
    recentClicks: Array<{
      timestamp: string;
      ipAddress: string;
      userAgent: string;
      referer?: string;
    }>;
  };
}

const LinkAnalyticsPage: React.FC = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const periods = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
  ];

  // Mock data for now - replace with actual API call
  const mockData: LinkAnalyticsData = {
    link: {
      id: linkId || '1',
      title: 'My Portfolio',
      shortCode: 'portfolio',
      url: 'https://portfolio.com',
      totalClicks: 156,
    },
    analytics: {
      totalClicks: 156,
      dailyClicks: {
        '2024-01-15': 18,
        '2024-01-16': 21,
        '2024-01-17': 15,
        '2024-01-18': 28,
        '2024-01-19': 32,
        '2024-01-20': 42,
      },
      recentClicks: [
        {
          timestamp: '2024-01-21T10:30:00Z',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Chrome)',
          referer: 'https://google.com',
        },
        {
          timestamp: '2024-01-21T09:15:00Z',
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0 (Safari)',
          referer: 'https://twitter.com',
        },
      ],
    },
  };

  const { isLoading } = useQuery({
    queryKey: ['linkAnalytics', linkId, selectedPeriod],
    queryFn: () => apiService.getLinkAnalytics(linkId!, selectedPeriod),
    enabled: !!linkId,
  });

  // For now, use mock data until API is working
  const analyticsData = mockData;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => navigate('/dashboard/links')}
              className="text-gray-600 hover:text-gray-800"
            >
              Back to Links
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Link Analytics</h1>
              <p className="text-gray-500">{analyticsData.link.title}</p>
            </div>
          </div>

          {/* Period Selector */}
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

        {/* Link Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {analyticsData.link.title}
              </h2>
              <p className="text-gray-600 mb-2">{analyticsData.link.url}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Short URL: /{analyticsData.link.shortCode}</span>
                <span>•</span>
                <span>Total Clicks: {analyticsData.link.totalClicks}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/s/${analyticsData.link.shortCode}`, '_blank')}
              >
                Visit Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
              >
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Clicks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <CursorArrowRaysIcon className="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.analytics.totalClicks}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Daily Average */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Daily Average</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(analyticsData.analytics.totalClicks / 7)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Peak Day */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-orange-700" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Peak Day</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...Object.values(analyticsData.analytics.dailyClicks))}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Click Timeline Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Click Timeline</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Interactive chart coming soon</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Clicks</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {analyticsData.analytics.recentClicks.map((click, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(click.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {click.referer ? new URL(click.referer).hostname : 'Direct'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {click.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {click.userAgent.includes('Chrome') ? 'Chrome' : 
                       click.userAgent.includes('Safari') ? 'Safari' : 'Other'}
                    </td>
                  </tr>
                ))}
                {analyticsData.analytics.recentClicks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No recent clicks to display
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

export default LinkAnalyticsPage;