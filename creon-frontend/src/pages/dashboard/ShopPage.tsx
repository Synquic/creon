import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  ShoppingBagIcon,
  RectangleStackIcon,
  XMarkIcon,
  EyeSlashIcon,
  EyeIcon,
  ChartBarIcon,
  ShareIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import PublicProfilePreview from '../../components/PublicProfilePreview';
import * as simpleApi from '../../services/api-simple';
import toast from 'react-hot-toast';

interface ShopSettings {
  isVisible: boolean;
  title: string;
  description?: string;
  isMainTab: boolean;
}

const ShopPage: React.FC = () => {
  const { user } = useAuth();
  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    isVisible: false,
    title: 'Shop',
    description: 'Your Shop is currently hidden.',
    isMainTab: false
  });

  // Fetch shop settings
  const { data: shopSettingsData } = useQuery({
    queryKey: ['shop-settings'],
    queryFn: () => simpleApi.getShopSettings(),
    enabled: !!user,
  });

  // Update shop settings mutation
  const updateShopSettingsMutation = useMutation({
    mutationFn: simpleApi.updateShopSettings,
    onSuccess: () => {
      toast.success('Shop settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['shop-settings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update shop settings');
    },
  });

  // Set shop settings from API
  useEffect(() => {
    if (shopSettingsData?.data?.data?.settings) {
      const settings = shopSettingsData.data.data.settings;
      setShopSettings({
        isVisible: settings.isVisible || false,
        title: settings.title || 'Shop',
        description: settings.isVisible ? 'Your Shop is currently visible.' : 'Your Shop is currently hidden.',
        isMainTab: settings.isMainTab || false
      });
    }
  }, [shopSettingsData]);
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => simpleApi.getProducts(),
  });

  const { data: collectionsData, isLoading: collectionsLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => simpleApi.getCollections(),
  });

  const products = productsData?.data?.data?.products || [];
  const collections = collectionsData?.data?.data?.collections || [];

  const toggleShopVisibility = () => {
    setShopSettings(prev => ({
      ...prev,
      isVisible: !prev.isVisible,
      description: !prev.isVisible ? 'Your Shop is currently visible.' : 'Your Shop is currently hidden.'
    }));
  };

  const toggleMainTab = () => {
    setShopSettings(prev => ({
      ...prev,
      isMainTab: !prev.isMainTab
    }));
  };

  const handleAddCollection = () => {
    setShowAddModal(false);
    // Navigate to collections page or open collection form
    window.location.href = '/dashboard/collections';
  };

  const handleAddProduct = () => {
    setShowAddModal(false);
    // Navigate to products page or open product form
    window.location.href = '/dashboard/products';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop</h1>
              <p className="text-gray-600">Manage your shop, collections, and products</p>
            </div>

            {/* Shop Visibility Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-100 rounded-xl p-6 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center">
                    {shopSettings.isVisible ? (
                      <EyeIcon className="w-6 h-6 text-gray-600" />
                    ) : (
                      <EyeOffIcon className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Publish your Shop</h3>
                    <p className="text-gray-600">{shopSettings.description}</p>
                  </div>
                </div>
                <button
                  onClick={toggleShopVisibility}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    shopSettings.isVisible ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      shopSettings.isVisible ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </motion.div>

            {/* Set Shop as Main Tab Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-100 rounded-xl p-6 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Set Shop as main tab</h3>
                    <p className="text-gray-600">
                      {shopSettings.isMainTab ? 'Shop will be the default tab on your profile.' : 'Links will be the default tab on your profile.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleMainTab}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    shopSettings.isMainTab ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      shopSettings.isMainTab ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </motion.div>

            {/* Add Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowAddModal(true)}
              className="w-full mb-8 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add</span>
            </motion.button>

            {/* Collections Section */}
            {collections.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Collections</h2>
                <div className="space-y-4">
                  {collections.map((collection, index) => (
                    <motion.div
                      key={collection._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl border border-gray-200 p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-8 flex flex-col justify-center space-y-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{collection.title}</h3>
                            {collection.description && (
                              <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                            <ShareIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                          <button
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              collection.isActive ? 'bg-green-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                collection.isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Collection Products Placeholder */}
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-500 mb-2">Add products to collection</p>
                        <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                          + Add products
                        </button>
                      </div>

                      {/* Collection Stats */}
                      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>0 Products</span>
                          <span>0 Clicks</span>
                          <span>0.0% CTR</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <ShareIcon className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                          <button
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              collection.isActive ? 'bg-green-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                collection.isActive ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Products Section */}
            {products.filter(p => !p.collectionId).length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Individual Products</h2>
                <div className="space-y-4">
                  {products.filter(p => !p.collectionId).map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl border border-gray-200 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-3 h-8 flex flex-col justify-center space-y-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
                            {product.description && (
                              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>{product.clickCount} Clicks</span>
                              <span>{product.currency} {product.price}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                            <ShareIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                          <button
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              product.isActive ? 'bg-green-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                product.isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {collections.length === 0 && products.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <ShoppingBagIcon className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No shop items yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start building your shop by adding products and organizing them into collections.
                </p>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Shop Preview</h2>
                <p className="text-sm text-gray-600">See how your shop looks</p>
              </div>
              <PublicProfilePreview />
            </div>
          </div>
        </div>

        {/* Add Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full relative"
              >
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>

                <h3 className="text-2xl font-bold text-gray-900 mb-8">Add to your Shop</h3>

                <div className="space-y-4">
                  <button
                    onClick={handleAddCollection}
                    className="w-full p-6 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">Collection</h4>
                        <p className="text-gray-600">Organize products into a collection.</p>
                      </div>
                      <RectangleStackIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  </button>

                  <button
                    onClick={handleAddProduct}
                    className="w-full p-6 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">Product</h4>
                        <p className="text-gray-600">Add a product to your shop.</p>
                      </div>
                      <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default ShopPage;