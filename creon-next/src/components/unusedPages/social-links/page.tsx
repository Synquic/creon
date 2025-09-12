"use client";

import React from "react";
import { motion } from "framer-motion";
import { PlusIcon, Share2Icon } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

const SocialLinksPage: React.FC = () => {
  const socialPlatforms = [
    { name: "Instagram", icon: "📷", color: "bg-pink-500" },
    { name: "Twitter/X", icon: "🐦", color: "bg-blue-500" },
    { name: "YouTube", icon: "📺", color: "bg-red-500" },
    { name: "TikTok", icon: "🎵", color: "bg-black" },
    { name: "LinkedIn", icon: "💼", color: "bg-blue-600" },
    { name: "Facebook", icon: "👥", color: "bg-blue-700" },
    { name: "Spotify", icon: "🎧", color: "bg-green-500" },
    { name: "Discord", icon: "🎮", color: "bg-indigo-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Social Links</h1>
        <p className="text-gray-600">
          Connect your social media profiles and grow your following
        </p>
      </div>

      {/* Social Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {socialPlatforms.map((platform, index) => (
          <motion.div
            key={platform.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div
                className={`w-16 h-16 ${platform.color} rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4`}
              >
                {platform.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {platform.name}
              </h3>
              <Button variant="outline" size="fullWidth">
                Connect
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Active Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Connected Accounts
            </h3>
            <Button>
              <PlusIcon className="w-5 h-5" />
              Add Custom Link
            </Button>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Share2Icon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No social links connected
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect your social media accounts to make it easy for your
              audience to follow you across all platforms.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <Card className="bg-primary-50 border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">
            💡 Pro Tip
          </h3>
          <p className="text-primary-800">
            Social links appear at the bottom of your profile. Use them to drive
            followers to your most important social platforms and grow your
            community.
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default SocialLinksPage;
