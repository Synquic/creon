import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import VideoThumbnail from './VideoThumbnail';
import { getVideoInfo } from '../utils/videoUtils';
import * as simpleApi from '../services/api-simple';

interface PreviewLink {
  _id: string;
  title: string;
  url: string;
  shortCode: string;
  isActive: boolean;
  clickCount: number;
  image?: string;
}

interface PreviewProduct {
  _id: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  image: string;
  affiliateUrl: string;
  isActive: boolean;
  formattedPrice?: string;
}

interface PreviewCollection {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  isActive: boolean;
  products: PreviewProduct[];
}

interface PublicProfilePreviewProps {
  className?: string;
  hideBranding?: boolean;
}

const PublicProfilePreview: React.FC<PublicProfilePreviewProps> = ({ 
  className = '', 
  hideBranding = false
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'links' | 'shop'>('links');

  // Fetch the actual public profile data for the current user
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['publicProfile', user?.username],
    queryFn: () => simpleApi.getUserProfile(user?.username || ''),
    enabled: !!user?.username,
  });

  // Fetch shop settings
  const { data: shopSettingsData } = useQuery({
    queryKey: ['shop-settings'],
    queryFn: () => simpleApi.getShopSettings(),
    enabled: !!user,
  });

  // Extract data from the actual API response
  const userProfile = profileData?.data?.data?.user;
  const links = profileData?.data?.data?.links || [];
  const products = profileData?.data?.data?.products || [];
  const collections = profileData?.data?.data?.collections || [];
  const theme = userProfile?.theme;
  const shopSettings = profileData?.data?.data?.shopSettings || shopSettingsData?.data?.data?.settings;

  // Set default tab based on shop settings
  React.useEffect(() => {
    if (shopSettings?.isMainTab && shopSettings?.isVisible && (products.length > 0 || collections.length > 0)) {
      setActiveTab('shop');
    } else {
      setActiveTab('links');
    }
  }, [shopSettings, products.length, collections.length]);

  // Set default tab based on shop settings
  React.useEffect(() => {
    if (shopSettings?.isMainTab && shopSettings?.isVisible && (products.length > 0 || collections.length > 0)) {
      setActiveTab('shop');
    } else {
      setActiveTab('links');
    }
  }, [shopSettings, products.length, collections.length]);

  // Generate dynamic styles based on theme - exactly like public page
  const pageStyle = {
    backgroundColor: theme?.backgroundColor || '#ffffff',
    backgroundImage: theme?.backgroundGradient ? 
      `linear-gradient(${
        theme.gradientDirection === 'horizontal' ? '90deg' : 
        theme.gradientDirection === 'diagonal' ? '135deg' : '180deg'
      }, ${theme.backgroundColor || '#ffffff'}, ${theme.secondaryColor || '#f3f4f6'})` :
      'none',
    color: theme?.textColor || '#1f2937',
    fontFamily: `"${theme?.fontFamily || 'Inter'}", system-ui, -apple-system, sans-serif`,
    fontSize: theme?.fontSize === 'small' ? '14px' : theme?.fontSize === 'large' ? '18px' : '16px',
    fontWeight: theme?.fontWeight || 'normal',
    minHeight: '100vh',
  };

  const containerStyle = {
    maxWidth: theme?.maxWidth === 'small' ? '480px' : theme?.maxWidth === 'large' ? '768px' : '640px',
  };

  const profileImageStyle = {
    borderRadius: theme?.profileImageShape === 'square' ? '8px' : 
                  theme?.profileImageShape === 'rounded-square' ? '16px' : '50%',
    width: theme?.profileImageSize === 'small' ? '80px' : 
           theme?.profileImageSize === 'large' ? '160px' : '128px',
    height: theme?.profileImageSize === 'small' ? '80px' : 
            theme?.profileImageSize === 'large' ? '160px' : '128px',
  };

  const buttonStyle = {
    backgroundColor: theme?.primaryColor || '#16a34a',
    borderColor: theme?.primaryColor || '#16a34a',
    borderWidth: `${theme?.buttonBorderWidth || 0}px`,
    color: '#ffffff',
    borderRadius: theme?.buttonStyle === 'square' ? '8px' : 
                  theme?.buttonStyle === 'pill' ? '50px' : '12px',
    boxShadow: theme?.buttonShadow ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
    fontFamily: `"${theme?.fontFamily || 'Inter'}", system-ui, -apple-system, sans-serif`,
    fontSize: theme?.fontSize === 'small' ? '14px' : theme?.fontSize === 'large' ? '18px' : '16px',
    fontWeight: theme?.fontWeight || 'normal',
  };

  // Helper function to get border radius for link buttons
  const getLinkButtonRadius = () => {
    if (theme?.buttonStyle === 'square') return '8px';
    if (theme?.buttonStyle === 'pill') return '50px';
    return '12px'; // default rounded
  };

  const linkSpacingClass = theme?.linkSpacing === 'compact' ? 'space-y-2' : 
                          theme?.linkSpacing === 'relaxed' ? 'space-y-6' : 'space-y-4';

  // Show loading state
  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="relative mx-auto" style={{ width: '320px', height: '680px' }}>
          <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl h-full">
            <div className="bg-black rounded-[2.5rem] p-1 h-full flex flex-col overflow-x-scroll">
              <div className="bg-white rounded-b-[2.5rem] overflow-hidden h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600">Loading preview...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`${className}`}>
        <div className="relative mx-auto" style={{ width: '320px', height: '680px' }}>
          <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl h-full">
            <div className="bg-black rounded-[2.5rem] p-1 h-full flex flex-col overflow-x-scroll">
              <div className="bg-white rounded-b-[2.5rem] overflow-hidden h-full flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="text-red-500 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Failed to load preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if shop should be shown
  const showShop = shopSettings?.isVisible && (products.length > 0 || collections.length > 0);

  return (
    <div className={`${className}`}>
      {/* iPhone Frame */}
      <div className="relative mx-auto" style={{ width: '320px', height: '680px' }}>
        {/* iPhone Body */}
        <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl h-full">
          {/* Screen */}
          <div className="bg-black rounded-[2.5rem] p-1 h-full flex flex-col overflow-x-scroll">
            {/* Status Bar */}
            <div className="bg-black rounded-t-[2.5rem] px-6 py-2 flex justify-between items-center text-white text-xs flex-shrink-0">
              <span>9:41</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-2 border border-white rounded-sm">
                  <div className="w-3 h-1 bg-white rounded-sm m-0.5"></div>
                </div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
            
            {/* Content Area */}
            <div 
              className="bg-white rounded-b-[2.5rem] overflow-hidden flex-1 flex flex-col"
              style={{
                ...pageStyle,
                fontFamily: `"${theme?.fontFamily || 'Inter'}", system-ui, -apple-system, sans-serif`,
              }}
            >
              <div className="px-4 py-6 flex-1 overflow-y-auto" style={containerStyle}>
                {/* Profile Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-6"
                >
                  <div className="relative inline-block mb-4">
                    {userProfile?.profileImage ? (
                      <img
                        src={userProfile.profileImage}
                        alt={`${userProfile.firstName} ${userProfile.lastName}`}
                        className="object-cover mx-auto border-4 border-white shadow-xl"
                        style={profileImageStyle}
                      />
                    ) : (
                      <div 
                        className="flex items-center justify-center mx-auto border-4 border-white shadow-xl"
                        style={{
                          ...profileImageStyle,
                          background: `linear-gradient(135deg, ${theme?.primaryColor || '#16a34a'}, ${theme?.secondaryColor || '#15803d'})`
                        }}
                      >
                        <span className="text-white text-2xl font-bold">
                          {userProfile?.firstName?.[0] || userProfile?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>

                  <h1 className="text-xl font-bold mb-1" style={{ color: theme?.textColor || '#1f2937' }}>
                    {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : userProfile?.username || 'User'}
                  </h1>
                  <p className="text-sm mb-2" style={{ color: theme?.textColor || '#6b7280', opacity: 0.8 }}>
                    @{userProfile?.username || 'username'}
                  </p>
                  
                  {userProfile?.bio && (
                    <p className="text-sm mb-4" style={{ color: theme?.textColor || '#374151' }}>
                      {userProfile.bio}
                    </p>
                  )}

                  {/* Social Links */}
                  {userProfile?.socialLinks && (
                    <div className="flex justify-center space-x-4 mb-4">
                      {userProfile.socialLinks.instagram && (
                        <div className="w-6 h-6 text-gray-600">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </div>
                      )}
                      {userProfile.socialLinks.twitter && (
                        <div className="w-6 h-6 text-gray-600">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                        </div>
                      )}
                      {userProfile.socialLinks.youtube && (
                        <div className="w-6 h-6 text-gray-600">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </div>
                      )}
                      {userProfile.socialLinks.tiktok && (
                        <div className="w-6 h-6 text-gray-600">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                          </svg>
                        </div>
                      )}
                      {userProfile.socialLinks.facebook && (
                        <div className="w-6 h-6 text-gray-600">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </div>
                      )}
                      {userProfile.socialLinks.linkedin && (
                        <div className="w-6 h-6 text-gray-600">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </div>
                      )}
                      {userProfile.socialLinks.website && (
                        <div className="w-6 h-6 text-gray-600">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-2 16l-4-4 1.414-1.414L10 14.172l7.586-7.586L19 8l-9 8z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Share Button */}
                  <button
                    className="inline-flex items-center px-4 py-2 border-2 font-medium transition-all mb-4"
                    style={buttonStyle}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share Profile
                  </button>
                </motion.div>

                {/* Tab Navigation */}
                {showShop && (
                  <div className="mb-6">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setActiveTab('links')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'links'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Links
                      </button>
                      <button
                        onClick={() => setActiveTab('shop')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'shop'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Shop
                      </button>
                    </div>
                  </div>
                )}
                {showShop && (
                  <div className="mb-6">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setActiveTab('links')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'links'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Links
                      </button>
                      <button
                        onClick={() => setActiveTab('shop')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'shop'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Shop
                      </button>
                    </div>
                  </div>
                )}

                {/* Links Tab */}
                {activeTab === 'links' && (
                  <div className={`mb-6 ${linkSpacingClass}`}>
                    {links.length > 0 ? (
                      links.map((link: PreviewLink, index: number) => {
                        const videoInfo = getVideoInfo(link.url);
                        return (
                          <motion.div
                            key={link._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div
                              className="cursor-pointer p-3 border border-gray-200 transition-all duration-200"
                              style={{
                                backgroundColor: theme?.backgroundColor || '#ffffff',
                                borderColor: theme?.primaryColor ? `${theme.primaryColor}20` : '#e5e7eb',
                                borderWidth: `${theme?.buttonBorderWidth || 1}px`,
                                borderRadius: getLinkButtonRadius(),
                                boxShadow: theme?.buttonShadow ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                                fontFamily: `"${theme?.fontFamily || 'Inter'}", system-ui, -apple-system, sans-serif`,
                                fontSize: theme?.fontSize === 'small' ? '14px' : theme?.fontSize === 'large' ? '18px' : '16px',
                                fontWeight: theme?.fontWeight || 'normal',
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {link.image ? (
                                    <img
                                      src={link.image}
                                      alt={link.title}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : videoInfo.isVideo ? (
                                    <VideoThumbnail 
                                      url={link.url} 
                                      title={link.title}
                                      size="small"
                                    />
                                  ) : (
                                    <div 
                                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                                      style={{
                                        background: `linear-gradient(135deg, ${theme?.primaryColor || '#16a34a'}, ${theme?.secondaryColor || '#15803d'})`
                                      }}
                                    >
                                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H6.99C4.58 7 2.4 8.58 2.4 11.99s2.18 4.99 4.59 4.99H11v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm5-6h4.01c2.41 0 4.59 1.58 4.59 4.99s-2.18 4.99-4.59 4.99H13v1.9h4.01c2.41 0 4.59-1.58 4.59-4.99S19.42 7 17.01 7H13v1.9z"/>
                                      </svg>
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center space-x-2">
                                      <h3 className="font-semibold truncate text-sm" style={{ color: theme?.textColor || '#1f2937' }}>
                                        {link.title}
                                      </h3>
                                      {videoInfo.isVideo && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                          Video
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ color: theme?.textColor || '#9ca3af', opacity: 0.5 }}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">No links available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Shop Tab */}
                {activeTab === 'shop' && (
                  <div className="space-y-6">
                    {/* Shop Header with Gradient */}
                    <div 
                      className="rounded-lg p-4 text-center text-white"
                      style={{
                        background: `linear-gradient(135deg, ${theme?.primaryColor || '#16a34a'}, ${theme?.secondaryColor || '#15803d'})`
                      }}
                    >
                      <h2 className="text-lg font-bold mb-1">{shopSettings?.title || 'Shop'}</h2>
                      {shopSettings?.description && (
                        <p className="text-sm opacity-90">{shopSettings.description}</p>
                      )}
                    </div>

                    {/* Collections */}
                    {collections.length > 0 && (
                      <div className={`${linkSpacingClass}`}>
                        <h3 className="text-sm font-semibold mb-3" style={{ color: theme?.textColor || '#1f2937' }}>
                          Collections
                        </h3>
                        {collections.map((collection: PreviewCollection, index: number) => (
                          <motion.div
                            key={collection._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div
                              className="cursor-pointer p-3 border border-gray-200 transition-all duration-200"
                              style={{
                                backgroundColor: theme?.backgroundColor || '#ffffff',
                                borderColor: theme?.primaryColor ? `${theme.primaryColor}20` : '#e5e7eb',
                                borderWidth: `${theme?.buttonBorderWidth || 1}px`,
                                borderRadius: getLinkButtonRadius(),
                                boxShadow: theme?.buttonShadow ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                                fontFamily: `"${theme?.fontFamily || 'Inter'}", system-ui, -apple-system, sans-serif`,
                                fontSize: theme?.fontSize === 'small' ? '14px' : theme?.fontSize === 'large' ? '18px' : '16px',
                                fontWeight: theme?.fontWeight || 'normal',
                              }}
                            >
                              <div className="flex items-center space-x-3">
                                {collection.image ? (
                                  <img
                                    src={collection.image}
                                    alt={collection.title}
                                    className="w-10 h-10 rounded-md object-cover"
                                  />
                                ) : (
                                  <div 
                                    className="w-10 h-10 rounded-md flex items-center justify-center"
                                    style={{
                                      background: `linear-gradient(135deg, ${theme?.primaryColor || '#16a34a'}, ${theme?.secondaryColor || '#15803d'})`
                                    }}
                                  >
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                    </svg>
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <span className="font-semibold truncate text-sm" style={{ color: theme?.textColor || '#1f2937' }}>
                                    {collection.title}
                                  </span>
                                  {collection.description && (
                                    <p className="text-xs truncate" style={{ color: theme?.textColor || '#6b7280', opacity: 0.7 }}>
                                      {collection.description}
                                    </p>
                                  )}
                                </div>
                                <div style={{ color: theme?.textColor || '#9ca3af', opacity: 0.5 }}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Products */}
                    {products.length > 0 && (
                      <div className={`${linkSpacingClass}`}>
                        <h3 className="text-sm font-semibold mb-3" style={{ color: theme?.textColor || '#1f2937' }}>
                          Products
                        </h3>
                        {products.map((product: PreviewProduct, index: number) => (
                          <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: (collections.length + index) * 0.1 }}
                          >
                            <div
                              className="cursor-pointer p-3 border border-gray-200 transition-all duration-200"
                              style={{
                                backgroundColor: theme?.backgroundColor || '#ffffff',
                                borderColor: theme?.primaryColor ? `${theme.primaryColor}20` : '#e5e7eb',
                                borderWidth: `${theme?.buttonBorderWidth || 1}px`,
                                borderRadius: getLinkButtonRadius(),
                                boxShadow: theme?.buttonShadow ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                                fontFamily: `"${theme?.fontFamily || 'Inter'}", system-ui, -apple-system, sans-serif`,
                                fontSize: theme?.fontSize === 'small' ? '14px' : theme?.fontSize === 'large' ? '18px' : '16px',
                                fontWeight: theme?.fontWeight || 'normal',
                              }}
                            >
                              <div className="flex items-center space-x-3">
                                <img
                                  src={product.image}
                                  alt={product.title}
                                  className="w-10 h-10 rounded-md object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold truncate text-sm" style={{ color: theme?.textColor || '#1f2937' }}>
                                      {product.title}
                                    </span>
                                    {product.formattedPrice && (
                                      <span className="text-xs font-semibold text-green-600 ml-2">
                                        {product.formattedPrice}
                                      </span>
                                    )}
                                  </div>
                                  {product.description && (
                                    <p className="text-xs truncate" style={{ color: theme?.textColor || '#6b7280', opacity: 0.7 }}>
                                      {product.description}
                                    </p>
                                  )}
                                </div>
                                <div style={{ color: theme?.textColor || '#9ca3af', opacity: 0.5 }}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Empty Shop State */}
                    {collections.length === 0 && products.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500">No products or collections available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                {!hideBranding && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="text-center mt-6"
                  >
                    <p className="text-xs" style={{ color: theme?.textColor || '#6b7280', opacity: 0.6 }}>
                      Powered by{' '}
                      <span className="font-medium" style={{ color: theme?.accentColor || '#8b5cf6' }}>
                        Creon
                      </span>
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Home Indicator */}
        <div className="mt-4 flex justify-center">
          <div className="w-32 h-1 bg-gray-900 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePreview;