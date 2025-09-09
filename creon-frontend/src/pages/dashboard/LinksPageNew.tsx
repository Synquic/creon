import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PublicProfilePreview from '../../components/PublicProfilePreview';
import VideoThumbnail from '../../components/VideoThumbnail';
import { getVideoInfo } from '../../utils/videoUtils';
import * as simpleApi from '../../services/api-simple';

interface Link {
  _id: string;
  userId: string;
  title: string;
  url: string;
  shortCode: string;
  description?: string;
  image?: string;
  isActive: boolean;
  clickCount: number;
  order: number;
  type: 'link' | 'header' | 'social' | 'product_collection';
  shortUrl: string;
  createdAt: string;
  updatedAt: string;
}

const linkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  url: z.string().url('Please enter a valid URL').min(1, 'URL is required'),
  description: z.string().max(250, 'Description too long').optional().or(z.literal('')),
  shortCode: z.string().optional().or(z.literal('')).refine((val) => {
    if (!val || val === '') return true;
    return val.length >= 4 && val.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(val);
  }, {
    message: 'Short code must be 4-20 characters and contain only letters, numbers, hyphens, and underscores'
  }),
});

type LinkFormData = z.infer<typeof linkSchema>;

const LinksPageNew: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [urlPreview, setUrlPreview] = useState<{ url: string; metadata: any } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const queryClient = useQueryClient();

  const { data: linksData, isLoading, error } = useQuery({
    queryKey: ['links'],
    queryFn: () => simpleApi.getLinks(),
  });

  const createLinkMutation = useMutation({
    mutationFn: simpleApi.createLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link created successfully!');
      setShowCreateForm(false);
      reset();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to create link';
      toast.error(errorMessage);
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      simpleApi.updateLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link updated successfully!');
      setEditingLink(null);
      setShowCreateForm(false);
      reset();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to update link';
      toast.error(errorMessage);
    },
  });

  const toggleLinkMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      simpleApi.updateLink(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
    onError: (error: string) => {
      toast.error('Failed to toggle link status');
      console.log(error);
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: simpleApi.deleteLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link deleted successfully!');
    },
    onError: (error: string) => {
      toast.error('Failed to delete link');
            console.log(error);
    },
  });

  const reorderLinksMutation = useMutation({
    mutationFn: simpleApi.reorderLinks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
  });

  const watchedUrl = watch('url');

  const links: Link[] = linksData?.data?.data?.links || [];

  // Handle URL preview fetching
  useEffect(() => {
    const fetchUrlPreview = async () => {
      if (!watchedUrl || watchedUrl.length < 8) {
        setUrlPreview(null);
        return;
      }

      try {
        // Check if it's a valid URL
        new URL(watchedUrl);
        
        // Only fetch preview for video URLs to avoid too many API calls
        const videoInfo = getVideoInfo(watchedUrl);
        if (videoInfo.isVideo) {
          setIsLoadingPreview(true);
          const response = await simpleApi.fetchUrlMetadata(watchedUrl);
          setUrlPreview({
            url: watchedUrl,
            metadata: response.data?.data?.metadata
          });
        } else {
          setUrlPreview(null);
        }
      } catch (error) {
        setUrlPreview(null);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    const debounceTimer = setTimeout(fetchUrlPreview, 1000);
    return () => clearTimeout(debounceTimer);
  }, [watchedUrl]);

  const onSubmit = async (data: LinkFormData) => {
    const cleanData = {
      title: data.title,
      url: data.url,
      description: data.description && data.description.trim() !== '' ? data.description : undefined,
      shortCode: data.shortCode && data.shortCode.trim() !== '' ? data.shortCode : undefined,
    };

    try {
      if (editingLink) {
        await updateLinkMutation.mutateAsync({ id: editingLink._id, data: cleanData });
      } else {
        await createLinkMutation.mutateAsync(cleanData);
      }
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleEdit = (link: Link) => {
    setEditingLink(link);
    setValue('title', link.title);
    setValue('url', link.url);
    setValue('description', link.description || '');
    setValue('shortCode', link.shortCode);
    setShowCreateForm(true);
  };

  const handleDelete = async (linkId: string) => {
    if (confirm('Are you sure you want to delete this link?')) {
      await deleteLinkMutation.mutateAsync(linkId);
    }
  };

  const handleToggleActive = async (link: Link) => {
    await toggleLinkMutation.mutateAsync({ id: link._id, isActive: !link.isActive });
  };

  const handleCopyLink = (link: Link) => {
    const fullUrl = `${window.location.origin}/s/${link.shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(link._id);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newLinks = [...links];
    [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
    
    const linkOrders = newLinks.map((link, idx) => ({
      id: link._id,
      order: idx,
    }));
    
    await reorderLinksMutation.mutateAsync(linkOrders);
  };

  const handleMoveDown = async (index: number) => {
    if (index === links.length - 1) return;
    const newLinks = [...links];
    [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
    
    const linkOrders = newLinks.map((link, idx) => ({
      id: link._id,
      order: idx,
    }));
    
    await reorderLinksMutation.mutateAsync(linkOrders);
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingLink(null);
    setUrlPreview(null);
    reset();
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Links</h3>
            <p className="text-gray-600">
              {(error as any)?.response?.data?.message || 'Something went wrong'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Links</h1>
              <p className="text-gray-600">Manage your links</p>
            </div>

            {/* Add Link Button */}
            {!showCreateForm && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowCreateForm(true)}
                className="w-full mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Link</span>
              </motion.button>
            )}

            {/* Create/Edit Form */}
            <AnimatePresence>
              {showCreateForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingLink ? 'Edit Link' : 'Add New Link'}
                    </h3>
                    <button
                      onClick={cancelForm}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                      {...register('title')}
                      label="Title"
                      placeholder="My awesome link"
                      error={errors.title?.message}
                    />
                    
                    <Input
                      {...register('url')}
                      label="URL"
                      placeholder="https://example.com"
                      error={errors.url?.message}
                    />
                    
                    <Input
                      {...register('shortCode')}
                      label="Custom Short Code (Optional)"
                      placeholder="my-link"
                      error={errors.shortCode?.message}
                    />
                    
                    <Input
                      {...register('description')}
                      label="Description (Optional)"
                      placeholder="Brief description"
                      error={errors.description?.message}
                    />

                    {/* URL Preview for Video Links */}
                    {watchedUrl && getVideoInfo(watchedUrl).isVideo && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-sm font-medium text-gray-700">Video Preview</span>
                          {isLoadingPreview && (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-200 border-t-primary-600"></div>
                          )}
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <VideoThumbnail 
                            url={watchedUrl} 
                            title={watchedUrl}
                            size="large"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {getVideoInfo(watchedUrl).platform?.toUpperCase()} Video
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Video Content
                              </span>
                            </div>
                            
                            {urlPreview?.metadata && (
                              <div className="text-sm text-gray-600">
                                {urlPreview.metadata.title && (
                                  <p className="font-medium">{urlPreview.metadata.title}</p>
                                )}
                                {urlPreview.metadata.description && (
                                  <p className="text-xs mt-1 line-clamp-2">{urlPreview.metadata.description}</p>
                                )}
                              </div>
                            )}
                            
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (urlPreview?.metadata?.title && !watch('title')) {
                                    setValue('title', urlPreview.metadata.title);
                                  }
                                  if (urlPreview?.metadata?.description && !watch('description')) {
                                    setValue('description', urlPreview.metadata.description);
                                  }
                                }}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                              >
                                Auto-fill title & description
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-3">
                      <Button
                        type="submit"
                        isLoading={isSubmitting}
                        className="flex-1"
                      >
                        {editingLink ? 'Update Link' : 'Add Link'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelForm}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Links List */}
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-700 border-t-transparent"></div>
              </div>
            ) : links.length === 0 ? (
              <div className="text-center py-12">
                <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No links yet</h3>
                <p className="text-gray-600">Create your first link to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((link, index) => (
                  <motion.div
                    key={link._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        {/* Drag Handle */}
                        <div className="flex flex-col space-y-1 pt-1">
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowUpIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === links.length - 1}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowDownIcon className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Video Thumbnail (if applicable) */}
                        {getVideoInfo(link.url).isVideo && (
                          <div className="flex-shrink-0">
                            <VideoThumbnail 
                              url={link.url} 
                              title={link.title}
                              size="medium"
                            />
                          </div>
                        )}

                        {/* Link Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{link.title}</h3>
                            {getVideoInfo(link.url).isVideo && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Video
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate mb-2">{link.url}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <ChartBarIcon className="w-4 h-4" />
                              <span>{link.clickCount} clicks</span>
                            </span>
                            {getVideoInfo(link.url).isVideo && (
                              <span className="flex items-center space-x-1">
                                <span>🎥</span>
                                <span>{getVideoInfo(link.url).platform}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopyLink(link)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copy link"
                          >
                            {copiedId === link._id ? (
                              <CheckIcon className="w-5 h-5 text-green-600" />
                            ) : (
                              <ClipboardDocumentIcon className="w-5 h-5" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => window.open(`/dashboard/analytics/link/${link._id}`, '_blank')}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View analytics"
                          >
                            <ChartBarIcon className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={() => handleEdit(link)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit link"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(link._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete link"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                          
                          {/* Toggle Switch */}
                          <button
                            onClick={() => handleToggleActive(link)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              link.isActive ? 'bg-green-600' : 'bg-gray-200'
                            }`}
                            title={link.isActive ? 'Deactivate link' : 'Activate link'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                link.isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Preview</h2>
                <p className="text-sm text-gray-600">See how your page looks</p>
              </div>
              <PublicProfilePreview 
                links={links.filter(link => link.isActive).map(link => ({
                  _id: link._id,
                  title: link.title,
                  url: link.url,
                  shortCode: link.shortCode,
                  isActive: link.isActive,
                  clickCount: link.clickCount,
                  // Add other required properties that might be missing
                  type: link.type || 'link'
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LinksPageNew;