import React from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ProductsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">
              Manage your products and affiliate links
            </p>
          </div>
          <Button leftIcon={<PlusIcon className="w-5 h-5" />}>
            Add Product
          </Button>
        </div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start showcasing your products to your audience. Add affiliate links, 
              pricing, and descriptions to boost your sales.
            </p>
            <Button leftIcon={<PlusIcon className="w-5 h-5" />}>
              Add Your First Product
            </Button>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;