import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  LinkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
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
    if (!val || val === '') return true; // Empty is allowed
    return val.length >= 4 && val.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(val);
  }, {
    message: 'Short code must be 4-20 characters and contain only letters, numbers, hyphens, and underscores'
  }),
});

type LinkFormData = z.infer<typeof linkSchema>;

const LinksPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const queryClient = useQueryClient();

  // Debug authentication state
  useEffect(() => {
    console.log('🔍 Checking authentication state...');
    console.log('LocalStorage accessToken:', localStorage.getItem('accessToken'));
    console.log('LocalStorage refreshToken:', localStorage.getItem('refreshToken'));
    console.log('Simple API isAuthenticated:', simpleApi.isAuthenticated());
  }, []);

  const { data: linksData, isLoading, error } = useQuery({
    queryKey: ['links'],
    queryFn: () => simpleApi.getLinks(),
  });

  const createLinkMutation = useMutation({
    mutationFn: simpleApi.createLink,
    onSuccess: (response) => {
      console.log('✅ Link creation success:', response);
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('🎉 Link created successfully!');
      setShowCreateForm(false);
      reset();
    },
    onError: (error: any) => {
      console.error('❌ Full create link error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error message:', error.response?.data?.message);
      console.error('❌ Error config:', error.config);
      
      const errorMessage = error.response?.data?.message || 'Failed to create link. Please try again.';
      toast.error(`❌ ${errorMessage}`);
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      simpleApi.updateLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('✅ Link updated successfully!');
      setEditingLink(null);
      setShowCreateForm(false);
      reset();
    },
    onError: (error: any) => {
      console.error('Update link error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update link. Please try again.';
      toast.error(`❌ ${errorMessage}`);
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: simpleApi.deleteLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('🗑️ Link deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete link error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete link. Please try again.';
      toast.error(`❌ ${errorMessage}`);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
  });

  const links: Link[] = linksData?.data?.data?.links || [];

  const onSubmit = async (data: LinkFormData) => {
    console.log('🎯 Form submitted with data:', data);
    
    // Clean up the data - remove empty strings and convert to undefined
    const cleanData = {
      title: data.title,
      url: data.url,
      description: data.description && data.description.trim() !== '' ? data.description : undefined,
      shortCode: data.shortCode && data.shortCode.trim() !== '' ? data.shortCode : undefined,
    };
    
    console.log('🧹 Cleaned data:', cleanData);
    
    try {
      if (editingLink) {
        console.log('📝 Updating existing link:', editingLink._id);
        await updateLinkMutation.mutateAsync({ id: editingLink._id, data: cleanData });
      } else {
        console.log('🆕 Creating new link');
        await createLinkMutation.mutateAsync(cleanData);
      }
    } catch (error) {
      console.error('🚨 Submit error:', error);
      // Error handling is done in the mutation callbacks
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
    if (confirm('⚠️ Are you sure you want to delete this link? This action cannot be undone.')) {
      try {
        await deleteLinkMutation.mutateAsync(linkId);
      } catch (error) {
        // Error handling is done in the mutation callback
      }
    }
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingLink(null);
    reset();
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Links</h3>
            <p className="text-gray-600 mb-4">
              {(error as any)?.response?.data?.message || 'Something went wrong. Please try again.'}
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['links'] })}>
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Your Links
            </h1>
            <p className="text-lg text-gray-600">
              Create and manage your bio links
            </p>
          </div>
          <Button
            leftIcon={<PlusIcon className="w-5 h-5" />}
            onClick={() => setShowCreateForm(true)}
            size="lg"
            className="shadow-lg hover:shadow-xl"
          >
            Create Link
          </Button>
        </div>

        {/* Create/Edit Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingLink ? '✏️ Edit Link' : '✨ Create New Link'}
                </h3>
                <button
                  onClick={cancelForm}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    {...register('title')}
                    label="Link Title"
                    placeholder="My awesome link"
                    error={errors.title?.message}
                  />
                  <Input
                    {...register('shortCode')}
                    label="Custom Short Code (Optional)"
                    placeholder="my-link"
                    error={errors.shortCode?.message}
                  />
                </div>
                
                <Input
                  {...register('url')}
                  label="URL"
                  placeholder="https://example.com"
                  error={errors.url?.message}
                />
                
                <Input
                  {...register('description')}
                  label="Description (Optional)"
                  placeholder="Brief description of your link"
                  error={errors.description?.message}
                />
                
                <div className="flex items-center space-x-4 pt-6">
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    leftIcon={editingLink ? <PencilIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                    size="lg"
                    className="flex-1 md:flex-none md:px-8"
                  >
                    {editingLink ? 'Update Link' : 'Create Link'}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={cancelForm}
                    size="lg"
                    className="flex-1 md:flex-none md:px-8"
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
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-700 mb-4 mx-auto"></div>
              <p className="text-gray-600 text-lg">Loading your links...</p>
            </div>
          </div>
        ) : links.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <LinkIcon className="w-12 h-12 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No links yet
              </h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                Create your first link to start building your bio page and sharing your content.
              </p>
              <Button
                leftIcon={<PlusIcon className="w-5 h-5" />}
                onClick={() => setShowCreateForm(true)}
                size="lg"
                className="shadow-lg hover:shadow-xl"
              >
                Create Your First Link
              </Button>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {links.map((link, index) => (
              <motion.div
                key={link._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group"
              >
                <Card className="p-6 hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
                          <LinkIcon className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 truncate mb-1">
                          {link.title}
                        </h3>
                        <p className="text-gray-600 truncate mb-2 text-sm">
                          {link.url}
                        </p>
                        {link.description && (
                          <p className="text-gray-500 text-sm line-clamp-2 mb-2">
                            {link.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <EyeIcon className="w-4 h-4" />
                            <span className="font-medium">{link.clickCount} clicks</span>
                          </div>
                          <div className="text-gray-400">•</div>
                          <span className="text-gray-500 font-mono">
                            /{link.shortCode}
                          </span>
                          <div className="text-gray-400">•</div>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            link.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              link.isActive ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            {link.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<ChartBarIcon className="w-4 h-4" />}
                        onClick={() => window.open(`/dashboard/analytics/link/${link._id}`, '_blank')}
                        className="hover:bg-blue-50 hover:text-blue-700"
                      >
                        Analytics
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<PencilIcon className="w-4 h-4" />}
                        onClick={() => handleEdit(link)}
                        className="hover:bg-primary-50 hover:text-primary-700"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<TrashIcon className="w-4 h-4" />}
                        onClick={() => handleDelete(link._id)}
                        className="hover:bg-red-50 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Overview */}
        {links.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{links.length}</p>
              <p className="text-gray-600">Total Links</p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <EyeIcon className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {links.reduce((total, link) => total + link.clickCount, 0)}
              </p>
              <p className="text-gray-600">Total Clicks</p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {links.filter(link => link.isActive).length}
              </p>
              <p className="text-gray-600">Active Links</p>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LinksPage;