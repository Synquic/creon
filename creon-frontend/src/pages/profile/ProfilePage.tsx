import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UserIcon,
  CameraIcon,
  PaintBrushIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import * as simpleApi from '../../services/api-simple';

const profileSchema = z.object({
  firstName: z.string().max(50, 'First name too long').optional(),
  lastName: z.string().max(50, 'Last name too long').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  socialLinks: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
    tiktok: z.string().optional(),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [uploadingImage, setUploadingImage] = useState(false);
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: simpleApi.updateProfile,
    onSuccess: (response) => {
      updateUser(response.data.data.user);
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      socialLinks: {
        instagram: user?.socialLinks?.instagram || '',
        twitter: user?.socialLinks?.twitter || '',
        youtube: user?.socialLinks?.youtube || '',
        tiktok: user?.socialLinks?.tiktok || '',
        facebook: user?.socialLinks?.facebook || '',
        linkedin: user?.socialLinks?.linkedin || '',
        website: user?.socialLinks?.website || '',
      },
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: simpleApi.uploadProfileImage,
    onSuccess: async (response) => {
      const imageUrl = response.data.data.profileImage;
      // Update the user context with the new image
      if (updateUser) {
        updateUser({ ...user, profileImage: imageUrl });
      }
      toast.success('Profile image updated successfully!');
      setUploadingImage(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload image');
      setUploadingImage(false);
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    uploadImageMutation.mutate(file);
  };

  const copyProfileUrl = async () => {
    const url = `${window.location.origin}/${user?.username}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Profile URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Profile Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Customize your profile and appearance
            </p>
          </div>
          <Button
            leftIcon={<ShareIcon className="w-5 h-5" />}
            onClick={copyProfileUrl}
            variant="outline"
          >
            Copy Profile URL
          </Button>
        </div>

        {/* Profile Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage.startsWith('http') ? user.profileImage : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}${user.profileImage}`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {user?.firstName?.[0] || user?.username?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-700 border-t-transparent"></div>
                  ) : (
                    <CameraIcon className="w-4 h-4 text-gray-600" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">@{user?.username}</p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  {user?.bio || 'No bio added yet'}
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                    {user?.profileUrl}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

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
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Profile Information
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    {...register('firstName')}
                    label="First Name"
                    placeholder="John"
                    error={errors.firstName?.message}
                  />
                  <Input
                    {...register('lastName')}
                    label="Last Name"
                    placeholder="Doe"
                    error={errors.lastName?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Tell the world about yourself..."
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.bio.message}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    Social Links
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      {...register('socialLinks.instagram')}
                      label="Instagram"
                      placeholder="https://instagram.com/username"
                      error={errors.socialLinks?.instagram?.message}
                    />
                    <Input
                      {...register('socialLinks.twitter')}
                      label="Twitter"
                      placeholder="https://twitter.com/username"
                      error={errors.socialLinks?.twitter?.message}
                    />
                    <Input
                      {...register('socialLinks.youtube')}
                      label="YouTube"
                      placeholder="https://youtube.com/c/username"
                      error={errors.socialLinks?.youtube?.message}
                    />
                    <Input
                      {...register('socialLinks.tiktok')}
                      label="TikTok"
                      placeholder="https://tiktok.com/@username"
                      error={errors.socialLinks?.tiktok?.message}
                    />
                    <Input
                      {...register('socialLinks.facebook')}
                      label="Facebook"
                      placeholder="https://facebook.com/username"
                      error={errors.socialLinks?.facebook?.message}
                    />
                    <Input
                      {...register('socialLinks.linkedin')}
                      label="LinkedIn"
                      placeholder="https://linkedin.com/in/username"
                      error={errors.socialLinks?.linkedin?.message}
                    />
                    <Input
                      {...register('socialLinks.website')}
                      label="Website"
                      placeholder="https://yourwebsite.com"
                      error={errors.socialLinks?.website?.message}
                      className="md:col-span-2"
                    />
                  </div>
                </div>

                <Button type="submit" isLoading={isSubmitting}>
                  Save Changes
                </Button>
              </form>
            </Card>
          </motion.div>
        )}

        {activeTab === 'appearance' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Appearance Settings
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Theme Colors
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'Default', colors: 'from-primary-500 to-secondary-500' },
                      { name: 'Ocean', colors: 'from-blue-500 to-teal-500' },
                      { name: 'Sunset', colors: 'from-orange-500 to-pink-500' },
                      { name: 'Forest', colors: 'from-green-500 to-emerald-500' },
                    ].map((theme) => (
                      <button
                        key={theme.name}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition-colors"
                      >
                        <div className={`w-full h-12 bg-gradient-to-r ${theme.colors} rounded-lg mb-2`} />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {theme.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Button Style
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'Rounded', style: 'rounded-xl' },
                      { name: 'Square', style: 'rounded-md' },
                      { name: 'Pill', style: 'rounded-full' },
                    ].map((style) => (
                      <button
                        key={style.name}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition-colors"
                      >
                        <div className={`w-full h-10 bg-primary-500 ${style.style} mb-2`} />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {style.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <Button>
                  Save Appearance
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;