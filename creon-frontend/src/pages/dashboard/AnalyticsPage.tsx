import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  EyeIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { apiService } from '../../services/api';

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  clickRate: number;
  topLinks: Array<{
    title: string;
    url: string;
    clicks: number;
  }>;
  dailyStats: Array<{
    date: string;
    views: number;
    clicks: number;
    rate: number;
  }>;
}

const AnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7 Days');

  const periods = ['7 Days', '30 Days', '90 Days'];

  // Mock data for now - replace with actual API call later
  const mockData: AnalyticsData = {
    totalViews: 1247,
    totalClicks: 523,
    clickRate: 40.0,
    topLinks: [
      { title: 'My Portfolio', url: 'portfolio.com', clicks: 156 },
      { title: 'Instagram', url: 'instagram.com/me', clicks: 132 },
      { title: 'Latest Blog Post', url: 'blog.com/latest', clicks: 98 },
      { title: 'YouTube Channel', url: 'youtube.com/c/me', clicks: 87 },
    ],
    dailyStats: [
      { date: '1/15/2024', views: 45, clicks: 18, rate: 40.0 },
      { date: '1/16/2024', views: 52, clicks: 21, rate: 40.4 },
      { date: '1/17/2024', views: 38, clicks: 15, rate: 39.5 },
      { date: '1/18/2024', views: 67, clicks: 28, rate: 41.8 },
      { date: '1/19/2024', views: 71, clicks: 32, rate: 45.1 },
      { date: '1/20/2024', views: 89, clicks: 41, rate: 46.1 },
      { date: '1/21/2024', views: 94, clicks: 38, rate: 40.4 },
    ],
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Linktree</h1>
            <p className="text-gray-500">Track your link performance and engagement</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-sky-200 text-sky-600 hover:bg-sky-50">
              View Profile
            </Button>
            <Button className="bg-sky-500 hover:bg-sky-600 text-white">
              Share
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex justify-end">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Views */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                    <EyeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Profile Views</p>
                    <p className="text-2xl font-bold text-gray-900">{mockData.totalViews.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-16 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-400 text-sm">Chart data loading...</p>
            </div>
          </motion.div>

          {/* Total Clicks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Clicks</p>
                    <p className="text-2xl font-bold text-gray-900">{mockData.totalClicks.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-16 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-400 text-sm">Chart data loading...</p>
            </div>
          </motion.div>

          {/* Click Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Click Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{mockData.clickRate}%</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-16 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-400 text-sm">Chart data loading...</p>
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interactive Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800 rounded-2xl p-8 text-center"
          >
            <ChartBarIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Interactive chart coming soon</p>
          </motion.div>

          {/* Top Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-4"
          >
            {mockData.topLinks.map((link, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-2xl p-4 flex items-center justify-between text-white"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{link.title}</h3>
                  <p className="text-gray-400 text-sm">{link.url}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold">{link.clicks}</span>
                  <SparklesIcon className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Export Data Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            leftIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
            className="border-sky-200 text-sky-600 hover:bg-sky-50"
          >
            Export Data
          </Button>
        </div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {mockData.dailyStats.map((stat, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.clicks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;