import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LinkIcon, 
  ChartBarIcon, 
  PaintBrushIcon, 
  ShoppingBagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <LinkIcon className="w-8 h-8" />,
      title: 'Smart Link Management',
      description: 'Create, organize, and track all your important links in one beautiful dashboard.'
    },
    {
      icon: <ChartBarIcon className="w-8 h-8" />,
      title: 'Advanced Analytics',
      description: 'Get detailed insights on your link performance with real-time analytics and click tracking.'
    },
    {
      icon: <PaintBrushIcon className="w-8 h-8" />,
      title: 'Customizable Themes',
      description: 'Personalize your profile with beautiful themes and colors that match your brand.'
    },
    {
      icon: <ShoppingBagIcon className="w-8 h-8" />,
      title: 'Product Collections',
      description: 'Showcase your products and affiliate links with stunning product collections.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Creon Logo" className="w-10 h-10" />
          <span className="text-2xl font-bold gradient-text">Creon</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/auth/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/auth/register">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Your Links,</span>
            <br />
            <span className="gradient-text">Your Story</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Create a stunning bio page that showcases all your links, products, and social media in one place. 
            Built for creators, businesses, and influencers who want to make an impact.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button size="xl" rightIcon={<ArrowRightIcon className="w-5 h-5" />}>
                Create Your Page
              </Button>
            </Link>
            <Button variant="outline" size="xl">
              View Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold gradient-text mb-4">
            Everything You Need to Shine Online
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you grow your audience and maximize your online presence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card hover={false} className="text-center h-full">
                <div className="text-primary-500 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Preview Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold gradient-text mb-6">
                Beautiful. Fast. Powerful.
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Create a professional bio page that converts visitors into followers, customers, and fans. 
                With our intuitive drag-and-drop builder, you can have your page ready in minutes.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Custom domains and themes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Advanced analytics and insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Product collections and affiliate links</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-1">
                <div className="bg-white rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full"></div>
                    <div>
                      <h3 className="font-semibold">@yourhandle</h3>
                      <p className="text-gray-500 text-sm">Creator & Entrepreneur</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-100 rounded-xl p-3 text-center">
                      <span className="text-gray-700">🌟 Latest Project</span>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-3 text-center">
                      <span className="text-gray-700">📱 Follow on Instagram</span>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-3 text-center">
                      <span className="text-gray-700">🛍️ Shop My Favorites</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl p-12 md:p-20 text-white"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Create Your Story?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of creators who trust Creon to showcase their best content and grow their audience.
          </p>
          
          <Link to="/auth/register">
            <Button 
              size="xl" 
              variant="outline" 
              className="bg-white text-green-600 hover:bg-gray-50 border-white"
              rightIcon={<ArrowRightIcon className="w-5 h-5" />}
            >
              Get Started Free
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 text-center text-gray-600">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <img src="/logo.png" alt="Creon Logo" className="w-8 h-8" />
          <span className="text-lg font-bold gradient-text">Creon</span>
        </div>
        <p>&copy; 2024 Creon. Built with ❤️ for creators everywhere.</p>
      </footer>
    </div>
  );
};

export default LandingPage;