import React, { useState, useEffect } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    // Check API status
    fetch('/api/doctrine')
      .then(response => {
        if (response.ok) {
          setApiStatus('online')
        } else {
          setApiStatus('error')
        }
      })
      .catch(() => setApiStatus('offline'))
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600'
      case 'offline': return 'text-red-600'
      case 'error': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'API Online'
      case 'offline': return 'API Offline'
      case 'error': return 'API Error'
      default: return 'Checking...'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  WeeWee Definition Update System
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${getStatusColor(apiStatus)}`}>
                <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-green-500' : apiStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm font-medium">{getStatusText(apiStatus)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: '📊' },
              { id: 'doctrine', name: 'Doctrine', icon: '📚' },
              { id: 'gbt', name: 'GBT Doctrine', icon: '🤖' },
              { id: 'schemas', name: 'Schemas', icon: '🔧' },
              { id: 'compliance', name: 'Compliance', icon: '✅' },
              { id: 'api', name: 'API', icon: '🔌' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* System Status Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-lg">⚡</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">System Status</dt>
                        <dd className="text-lg font-medium text-gray-900">Operational</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Status Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-lg">🔌</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">API Status</dt>
                        <dd className={`text-lg font-medium ${getStatusColor(apiStatus)}`}>
                          {getStatusText(apiStatus)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Version Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-lg">📦</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Version</dt>
                        <dd className="text-lg font-medium text-gray-900">1.0.0</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Welcome to the WeeWee Definition Update System
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>This comprehensive system manages definitions, schemas, and doctrine using the STAMPED framework.</p>
                  <p>Key features:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>NEON Doctrine integration</li>
                    <li>GBT compliance system</li>
                    <li>Schema validation and management</li>
                    <li>API endpoints for external integration</li>
                    <li>Real-time status monitoring</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'doctrine' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Doctrine Management</h3>
              <p className="text-gray-600">Doctrine management interface coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'gbt' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">GBT Doctrine Data</h3>
                <div className="flex space-x-2">
                  <a 
                    href="/gbt_doctrine.json" 
                    download
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    📥 Download JSON
                  </a>
                  <a 
                    href="/gbt_doctrine.json" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    🔗 View Raw
                  </a>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">📊 Metadata</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Version:</strong> 1.0.0</p>
                    <p><strong>Framework:</strong> STAMPED</p>
                    <p><strong>Total Schemas:</strong> 16</p>
                    <p><strong>Generated:</strong> {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">🤖 GBT Integration</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Update Method:</strong> Replace All</p>
                    <p><strong>Validation:</strong> Required</p>
                    <p><strong>Backup:</strong> Enabled</p>
                    <p><strong>Status:</strong> Ready</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">🔗 Access URLs</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Direct:</strong> /gbt_doctrine.json</p>
                    <p><strong>API:</strong> /api/doctrine</p>
                    <p><strong>Status:</strong> /api/status</p>
                    <p><strong>Size:</strong> 41KB</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">📋 Schema Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>• dpr_command_log_schema (9 fields)</div>
                  <div>• dpr_doctrine_category_map_schema (4 fields)</div>
                  <div>• dpr_doctrine_christmas_tree_schema (12 fields)</div>
                  <div>• dpr_doctrine_notional_schema (9 fields)</div>
                  <div>• dpr_doctrine_schema (12 fields)</div>
                  <div>• dpr_doctrine_sections_schema (8 fields)</div>
                  <div>• dpr_doctrine_table_map_schema (7 fields)</div>
                  <div>• dpr_index_key_schema (6 fields)</div>
                  <div>• dpr_knowledge_sync_schema (6 fields)</div>
                  <div>• dpr_messaging_library_schema (9 fields)</div>
                  <div>• dpr_prep_table_schema (7 fields)</div>
                  <div>• dpr_research_library_schema (7 fields)</div>
                  <div>• dpr_sub_hive_assets_schema (13 fields)</div>
                  <div>• dpr_sub_hive_doctrine_map_schema (7 fields)</div>
                  <div>• dpr_sub_hive_registry_schema (9 fields)</div>
                  <div>• dpr_system_key_registry_schema (7 fields)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schemas' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Schema Management</h3>
              <p className="text-gray-600">Schema management interface coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Dashboard</h3>
              <p className="text-gray-600">Compliance monitoring interface coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">API Documentation</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">Available Endpoints:</h4>
                  <ul className="mt-2 space-y-2">
                    <li className="text-sm">
                      <code className="bg-gray-100 px-2 py-1 rounded">GET /api/doctrine</code>
                      <span className="ml-2 text-gray-600">- Retrieve doctrine data</span>
                    </li>
                    <li className="text-sm">
                      <code className="bg-gray-100 px-2 py-1 rounded">GET /api/schemas</code>
                      <span className="ml-2 text-gray-600">- Retrieve schema definitions</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Status:</h4>
                  <p className={`text-sm ${getStatusColor(apiStatus)}`}>
                    {getStatusText(apiStatus)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
