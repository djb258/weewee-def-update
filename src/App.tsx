import React from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { Button } from './components/ui/Button';
import { Card, CardHeader, CardContent } from './components/ui/Card';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  CogIcon, 
  UserIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <RocketLaunchIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">SOP Library</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" icon={<UserIcon className="h-4 w-4" />}>
                Profile
              </Button>
              <Button variant="outline" icon={<CogIcon className="h-4 w-4" />}>
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Dashboard />
        </motion.div>

        {/* UI Components Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">UI Components Showcase</h2>
              <p className="text-gray-600">Explore the available UI components and their variants</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Button Variants */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Button Variants</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="success">Success</Button>
                  </div>
                </div>

                {/* Button Sizes */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Button Sizes</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                  </div>
                </div>

                {/* Button with Icons */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Buttons with Icons</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button icon={<ChartBarIcon className="h-4 w-4" />}>
                      View Analytics
                    </Button>
                    <Button variant="outline" icon={<CogIcon className="h-4 w-4" />}>
                      Configure
                    </Button>
                    <Button variant="success" icon={<RocketLaunchIcon className="h-4 w-4" />}>
                      Deploy
                    </Button>
                  </div>
                </div>

                {/* Loading States */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Loading States</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button loading>Processing...</Button>
                    <Button variant="outline" loading>Loading...</Button>
                    <Button variant="success" loading>Saving...</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
              </div>
              <p className="text-gray-600">
                Comprehensive analytics and reporting with interactive charts and real-time data visualization.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <RocketLaunchIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Deployment</h3>
              </div>
              <p className="text-gray-600">
                Streamlined deployment process with automated testing and continuous integration.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CogIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
              </div>
              <p className="text-gray-600">
                Flexible configuration management with environment-specific settings and validation.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

export default App;
