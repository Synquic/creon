import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  RectangleStackIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CameraIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import * as simpleApi from '../../services/api-simple';

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  image?: string;
  affiliateUrl: string;
  shortCode: string;
  clickCount: number;
  isActive: boolean;
}

interface Collection {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  image?: string;
  products: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const collectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional().or(z.literal('')),
  image: z.string().optional(),
  products: z.array(z.string()).default([]),
});

// Define form data types for Zod validation
// z.infer<typeof collectionSchema>;

const CollectionsPageNew: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: collectionsData, isLoading: collectionsLoading, error: collectionsError } = useQuery({
    queryKey: ['collections'],
    queryFn: () => simpleApi.getCollections(),
  });

  // Fetch products to select for collections
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => simpleApi.getProducts(),
  });

  const createCollectionMutation = useMutation({
    mutationFn: simpleApi.createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection created successfully!');
      setShowCreateForm(false);
      setCurrentImage(null);
      reset();
    },
    onError: (error: Error) => {
      const errorMessage = (error as ApiErrorResponse).response?.data?.message || 'Failed to create collection';
      toast.error(errorMessage);
    },
  });

  const updateCollectionMutation = useMutation({
    mutationFn: ({ id, title, data }: { id: string; title: string; data: Record<string, unknown> }) =>
      simpleApi.updateCollection(id, title, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection updated successfully!');
      setEditingCollection(null);
      setShowCreateForm(false);
      setCurrentImage(null);
      reset();
    },
    onError: (error: Error) => {
      const errorMessage = (error as ApiErrorResponse).response?.data?.message || 'Failed to update collection';
      toast.error(errorMessage);
    },
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: simpleApi.deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete collection');
    },
  });

  const toggleCollectionMutation = useMutation({
    mutationFn: ({ id, title, isActive }: { id: string; title: string; isActive: boolean }) =>
      simpleApi.updateCollection(id, title, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection status updated successfully');
    },
    onError: () => {
      toast.error('Failed to toggle collection status');
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: simpleApi.uploadImage,
    onSuccess: (response) => {
      const imageUrl = response.data.data.url;
      setCurrentImage(imageUrl);
      setValue('image', imageUrl);
      toast.success('Image uploaded successfully!');
      setUploadingImage(false);
    },
    onError: (error: Error) => {
      toast.error((error as ApiErrorResponse).response?.data?.message || 'Failed to upload image');
      setUploadingImage(false);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      title: '',
      description: '',
      image: '',
      products: [] as string[],
    }
  });

  const collections: Collection[] = collectionsData?.data?.data?.collections || [];

  const onSubmit = async (data: Record<string, unknown>) => {
    const cleanData = {
      title: data.title as string,
      description: typeof data.description === 'string' && data.description.trim() !== '' 
        ? data.description.trim() 
        : undefined,
      image: currentImage || (data.image as string),
      products: selectedProducts,
    };

    try {
      if (editingCollection) {
        await updateCollectionMutation.mutateAsync({ 
          id: editingCollection._id, 
          title: cleanData.title, 
          data: cleanData 
        });
      } else {
        await createCollectionMutation.mutateAsync(cleanData);
      }
    } catch {
      // Error handled in mutation
    }
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setValue('title', collection.title);
    setValue('description', collection.description || '');
    setValue('image', collection.image || '');
    setValue('products', collection.products || []);
    setSelectedProducts(collection.products || []);
    setCurrentImage(collection.image || null);
    setShowCreateForm(true);
  };

  const handleDelete = async (collectionId: string) => {
    if (confirm('Are you sure you want to delete this collection? Products in this collection will not be deleted, but will be unassigned.')) {
      await deleteCollectionMutation.mutateAsync(collectionId);
    }
  };

  const handleToggleActive = async (collection: Collection) => {
    try {
      await toggleCollectionMutation.mutateAsync({ 
        id: collection._id, 
        title: collection.title,
        isActive: !collection.isActive 
      });
    } catch (error) {
      console.error('Error toggling collection status:', error);
      // Error is already handled in the mutation
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    uploadImageMutation.mutate(file);
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingCollection(null);
    setCurrentImage(null);
    setSelectedProducts([]);
    setSearchTerm('');
    reset();
  };

  if (collectionsError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Collections</h3>
            <p className="text-gray-600">
              {(collectionsError as Error)?.message || 'Something went wrong'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Collections</h1>
          <p className="text-gray-600">Organize your products into curated collections</p>
        </div>

        {/* Add Collection Button */}
        {!showCreateForm && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowCreateForm(true)}
            className="w-full mb-6 p-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center space-x-3 hover:bg-gray-50"
          >
            <PlusIcon className="w-6 h-6" />
            <span className="text-lg font-medium">Create Collection</span>
          </motion.button>
        )}

        {/* Create/Edit Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingCollection ? 'Edit Collection' : 'Create New Collection'}
                </h3>
                <button
                  onClick={cancelForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Collection Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Collection Cover Image
                  </label>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                        {currentImage ? (
                          <img
                            src={currentImage}
                            alt="Collection preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <RectangleStackIcon className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700 transition-colors">
                        {uploadingImage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <CameraIcon className="w-4 h-4" />
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
                      <p className="text-sm text-gray-600 mb-2">
                        Upload a cover image for your collection (max 5MB)
                      </p>
                      <p className="text-xs text-gray-500">
                        Recommended: 800x400px or larger, JPG/PNG format
                      </p>
                    </div>
                  </div>
                </div>

                <Input
                  {...register('title')}
                  label="Collection Title"
                  placeholder="My Amazing Collection"
                  error={errors.title?.message}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe your collection..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Product Selection */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Products
                  </label>
                  
                  {/* Search input */}
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search products by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  {/* Selected products count */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                    </span>
                    {selectedProducts.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedProducts([]);
                          setValue('products', []);
                        }}
                        className="text-xs text-primary-600 hover:text-primary-800 hover:underline"
                        type="button"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Product list */}
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    {productsLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-700"></div>
                      </div>
                    ) : productsData?.data?.data?.products?.length ? (
                      <div className="divide-y divide-gray-200">
                        {productsData.data.data.products
                          .filter((product: Product) => 
                            product.title.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((product: Product) => (
                            <div 
                              key={product._id}
                              className="flex items-center p-3 hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                id={`product-${product._id}`}
                                checked={selectedProducts.includes(product._id)}
                                onChange={() => {
                                  const updatedSelection = selectedProducts.includes(product._id)
                                    ? selectedProducts.filter(id => id !== product._id)
                                    : [...selectedProducts, product._id];
                                  
                                  setSelectedProducts(updatedSelection);
                                  setValue('products', updatedSelection);
                                }}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <div className="ml-3 flex items-center">
                                {product.image && (
                                  <img 
                                    src={product.image}
                                    alt={product.title}
                                    className="h-10 w-10 object-cover rounded mr-3"
                                  />
                                )}
                                <div>
                                  <p className="font-medium text-gray-900">{product.title}</p>
                                  <p className="text-sm text-gray-600">
                                    {new Intl.NumberFormat(undefined, {
                                      style: 'currency',
                                      currency: product.currency
                                    }).format(product.price)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No products available to add to this collection
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="flex-1"
                  >
                    {editingCollection ? 'Update Collection' : 'Create Collection'}
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

        {/* Collections List */}
        {collectionsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-700"></div>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <RectangleStackIcon className="w-12 h-12 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No collections yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Group your products into themed collections to make it easier for your audience to discover what they're looking for.
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              leftIcon={<PlusIcon className="w-5 h-5" />}
              size="lg"
            >
              Create Your First Collection
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection, index) => (
              <motion.div
                key={collection._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Collection Image */}
                <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                  {collection.image ? (
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <RectangleStackIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* Collection Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                      {collection.title}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <span>{collection.products.length}</span>
                      <span>products</span>
                    </div>
                  </div>

                  {collection.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {collection.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => console.log('View collection products')}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View products"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEdit(collection)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit collection"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(collection._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete collection"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleActive(collection)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        collection.isActive ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                      title={collection.isActive ? 'Deactivate collection' : 'Activate collection'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          collection.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CollectionsPageNew;