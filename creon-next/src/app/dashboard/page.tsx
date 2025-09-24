"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  LinkIcon,
  ChartBarIcon,
  EyeIcon,
  MousePointerClick,
  ShoppingBagIcon,
} from "lucide-react";
import { analyticsService } from "@/services/analytics";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  links: number;
  products: number;
  collections: number;
  totalClicks: number;
  profileViews: number;
  last7Days: {
    clicks: number;
    views: number;
  };
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => analyticsService.getDashboardStats(),
  });
  const router = useRouter();
  const stats: DashboardStats = statsData?.data?.data?.stats;

  const statCards = [
    {
      title: "Total Links",
      value: stats?.links || 247,
      icon: <LinkIcon className="w-8 h-8" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-500/10 to-purple-600/5",
      iconBg: "bg-purple-500",
      subtitle: "Active Links",
      growth: "+15%",
      detail: "12 Added this week",
    },
    {
      title: "Profile Views",
      value: stats?.profileViews || 1847,
      icon: <EyeIcon className="w-8 h-8" />,
      color: "from-violet-500 to-violet-600",
      bgColor: "from-violet-500/10 to-violet-600/5",
      iconBg: "bg-violet-500",
      subtitle: "This Month",
      growth: "+23%",
      detail: "Top performer",
    },
    {
      title: "Total Products",
      value: stats?.products || 89,
      icon: <ShoppingBagIcon className="w-8 h-8" />,
      color: "from-purple-700 to-purple-800",
      bgColor: "from-purple-700/10 to-purple-800/5",
      iconBg: "bg-purple-700",
      subtitle: "In Store",
      growth: "+8%",
      detail: "5 New arrivals",
    },
    {
      title: "Total Clicks",
      value: stats?.totalClicks || 3241,
      icon: <MousePointerClick className="w-8 h-8" />,
      color: "from-teal-500 to-teal-600",
      bgColor: "from-teal-500/10 to-teal-600/5",
      iconBg: "bg-teal-500",
      subtitle: "All Time",
      growth: "+31%",
      detail: "Trending up",
    },
  ];

  const recentStats = [
    {
      title: "Clicks (Last 7 Days)",
      value: stats?.last7Days?.clicks || 0,
      icon: <ChartBarIcon className="w-6 h-6 text-primary-500" />,
    },
    {
      title: "Views (Last 7 Days)",
      value: stats?.last7Days?.views || 0,
      icon: <EyeIcon className="w-6 h-6 text-secondary-500" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Light Theme Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50 rounded-3xl"></div>
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-100/50 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-violet-100/50 rounded-full"></div>

        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Main Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your links and track performance
              </p>
            </div>
            <div className="hidden md:block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                onClick={() => {
                  router.push("/dashboard/links");
                }}
              >
                <span className="text-xl">+</span>
                <span>Create New Link</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Light Theme Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="relative group overflow-hidden bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              {/* Subtle background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-50 rounded-3xl`}
              ></div>
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 rounded-full"></div>

              {/* Card Content */}
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${stat.iconBg} shadow-lg`}>
                    {React.cloneElement(stat.icon, {
                      className: "w-6 h-6 text-white",
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    {stat.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">{stat.subtitle}</p>
                </div>

                {/* Main Number */}
                <div className="mb-4">
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value.toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-violet-600 text-sm font-semibold">
                      ↗ {stat.growth}
                    </span>
                    <span className="text-gray-500 text-sm">{stat.detail}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Light Theme Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Recent Activity
              </h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Last 7 days
              </span>
            </div>

            <div className="space-y-4">
              {recentStats.map((stat) => (
                <div
                  key={stat.title}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-2xl border border-gray-100"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl shadow-md">
                      {React.cloneElement(stat.icon, {
                        className: "w-5 h-5 text-white",
                      })}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">
                        {stat.title}
                      </span>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-violet-600 text-xs font-semibold">
                          ↗ Active
                        </span>
                        <span className="text-xs text-gray-500">Growing</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">
                      {stat.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                onClick={() => {
                  router.push("/dashboard/analytics");
                }}
              >
                View Full Analytics
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Profile & Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-6"
        >
          {/* Profile Completion - Hidden for managers */}
          {user?.role !== "manager" && (
            <div className="bg-gradient-to-br from-purple-50 via-purple-25 to-violet-50 rounded-3xl p-6 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Profile Setup
                </h3>
                {/* <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-700 text-lg font-bold">85%</span>
                </div> */}
              </div>

              <div className="space-y-4">
                <div>
                  {/* <div className="w-full bg-green-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full shadow-sm"
                      style={{ width: "85%" }}
                    ></div>
                  </div> */}
                </div>

                <p className="text-sm text-gray-600">
                  Complete your profile to unlock premium features and boost
                  visibility!
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    router.push("/dashboard/profile");
                  }}
                >
                  Complete Profile
                </motion.button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h4 className="font-bold text-gray-900 mb-6">Quick Actions</h4>
            <div className="space-y-3">
              {[
                {
                  icon: LinkIcon,
                  text: "Add New Link",
                  color: "purple",
                  bg: "bg-purple-100",
                  textColor: "text-purple-700",
                  onClick: () => router.push("/dashboard/links"),
                },
                {
                  icon: ShoppingBagIcon,
                  text: "Add Product",
                  color: "violet",
                  bg: "bg-violet-100",
                  textColor: "text-violet-700",
                  onClick: () => router.push("/dashboard/shop"),
                },
                {
                  icon: ChartBarIcon,
                  text: "View Analytics",
                  color: "purple",
                  bg: "bg-purple-100",
                  textColor: "text-purple-700",
                  onClick: () => router.push("/dashboard/analytics"),
                },
              ].map((action) => (
                <motion.button
                  key={action.text}
                  whileHover={{ x: 5, scale: 1.02 }}
                  className="w-full text-left p-4 rounded-2xl hover:bg-gray-50 transition-all duration-200 flex items-center space-x-4 border border-gray-100 hover:border-gray-200"
                  onClick={action.onClick}
                >
                  <div className={`p-3 rounded-xl ${action.bg} shadow-sm`}>
                    <action.icon className={`w-5 h-5 ${action.textColor}`} />
                  </div>
                  <span className="text-gray-800 font-semibold">
                    {action.text}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Performance Overview
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-purple-500 font-semibold">
                ↗ 23% Growth
              </span>
              <span className="text-gray-500">this month</span>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border-2 border-dashed border-purple-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Advanced Analytics Coming Soon
              </p>
              <p className="text-gray-500">
                Detailed charts and insights for your performance
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
