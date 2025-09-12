"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CameraIcon, Share2Icon } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth";

const profileSchema = z.object({
  firstName: z.string().max(50, "First name too long").optional(),
  lastName: z.string().max(50, "Last name too long").optional(),
  bio: z.string().max(500, "Bio too long").optional(),
  socialLinks: z
    .object({
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      youtube: z.string().optional(),
      tiktok: z.string().optional(),
      facebook: z.string().optional(),
      linkedin: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [uploadingImage, setUploadingImage] = useState(false);
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (response) => {
      updateUser(response.data.data.user);
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: user?.bio || "",
      socialLinks: {
        instagram: user?.socialLinks?.instagram || "",
        twitter: user?.socialLinks?.twitter || "",
        youtube: user?.socialLinks?.youtube || "",
        tiktok: user?.socialLinks?.tiktok || "",
        facebook: user?.socialLinks?.facebook || "",
        linkedin: user?.socialLinks?.linkedin || "",
        website: user?.socialLinks?.website || "",
      },
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: authService.uploadProfileImage,
    onSuccess: async (response) => {
      const imageUrl = response.data.data.profileImage;
      // Update the user context with the new image
      if (updateUser) {
        updateUser({ ...user, profileImage: imageUrl });
      }
      toast.success("Profile image updated successfully!");
      setUploadingImage(false);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to upload image");
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
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    uploadImageMutation.mutate(file);
  };

  const copyProfileUrl = async () => {
    const url = `${window.location.origin}/${user?.username}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Profile URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      toast.error("Failed to copy URL");
    }
  };

  return (
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
          onClick={copyProfileUrl}
          variant="outline"
          className="text-primary"
        >
          <Share2Icon className="w-5 h-5" />
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
                    src={
                      user.profileImage.startsWith("http")
                        ? user.profileImage
                        : `${
                            process.env.API_BASE_URL ||
                            "http://localhost:5001"
                          }${user.profileImage}`
                    }
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
              <p className="text-gray-600 dark:text-gray-400">
                @{user?.username}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                {user?.bio || "No bio added yet"}
              </p>
              <div className="mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white dark:bg-primary dark:text-primary">
                  {user?.profileUrl}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tab Content */}
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
                {...register("firstName")}
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message}
              />
              <Input
                {...register("lastName")}
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
                {...register("bio")}
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

            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
