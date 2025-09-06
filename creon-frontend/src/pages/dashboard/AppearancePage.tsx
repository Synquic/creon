import React from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, PaintBrushIcon, PhotoIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const AppearancePage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appearance</h1>
          <p className="text-gray-600">
            Customize the look and feel of your profile
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Customization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Customization
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <PhotoIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <Button variant="outline" size="sm">
                      Upload Photo
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['bg-gradient-to-br from-blue-400 to-purple-600',
                      'bg-gradient-to-br from-pink-400 to-red-600',
                      'bg-gradient-to-br from-green-400 to-blue-600',
                      'bg-gradient-to-br from-yellow-400 to-orange-600'
                    ].map((gradient, index) => (
                      <div
                        key={index}
                        className={`w-full h-12 rounded-lg cursor-pointer border-2 border-gray-200 hover:border-primary-500 transition-colors ${gradient}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Theme Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Theme Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Style
                  </label>
                  <div className="space-y-2">
                    {[
                      { name: 'Rounded', style: 'rounded-full' },
                      { name: 'Soft', style: 'rounded-lg' },
                      { name: 'Sharp', style: 'rounded-none' }
                    ].map((option) => (
                      <label key={option.name} className="flex items-center space-x-3">
                        <input type="radio" name="buttonStyle" className="text-primary-500" />
                        <span className="text-gray-700">{option.name}</span>
                        <div className={`w-16 h-8 bg-primary-500 ${option.style} ml-auto`} />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Style
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>Inter (Default)</option>
                    <option>Poppins</option>
                    <option>Roboto</option>
                    <option>Open Sans</option>
                  </select>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Live Preview
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <EyeIcon className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Your Profile Name
              </h4>
              <p className="text-gray-600 mb-4">
                Your bio description goes here
              </p>
              <div className="space-y-2 max-w-xs mx-auto">
                <div className="w-full h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                  Sample Link
                </div>
                <div className="w-full h-12 bg-secondary-500 rounded-full flex items-center justify-center text-white font-medium">
                  Another Link
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AppearancePage;