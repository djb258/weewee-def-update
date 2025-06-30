import React from 'react';
import { PingPongEngine } from './core/pingPongEngine';
import { PingPongPromptUI } from './components/PingPongPromptUI';

const engine = new PingPongEngine({ 
  initialPrompt: 'Write a clear, specific prompt for your AI task. Be as detailed as possible about what you want to achieve, any constraints, and the expected output format.' 
});

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cursor Blueprint Enforcer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Foundational Home System - Single Source of Truth for All Doctrine, Data Schemas, Tools, and Processes
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Barton Numbering System
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Database 1: Command Ops</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Database 2: Marketing DB</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">Format: DB.HQ.SUB.NESTED.INDEX</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <code className="text-sm text-gray-800">Example: 1.5.3.30.0</code>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Sub-Hive Architecture
            </h2>
            <div className="space-y-2 text-sm">
              <div><strong>clnt:</strong> Client management</div>
              <div><strong>dpr:</strong> Doctrine + Library</div>
              <div><strong>marketing:</strong> Marketing operations</div>
              <div><strong>pers_db:</strong> Personal — David Barton</div>
              <div><strong>shq:</strong> Supreme Headquarters</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Section Categories
          </h2>
          <div className="grid md:grid-cols-5 gap-4 text-sm">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="font-semibold">0-9</div>
              <div className="text-gray-600">Tone</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="font-semibold">10-19</div>
              <div className="text-gray-600">Structure</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded">
              <div className="font-semibold">20-29</div>
              <div className="text-gray-600">Process</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <div className="font-semibold">30-39</div>
              <div className="text-gray-600">Compliance</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="font-semibold">40-49</div>
              <div className="text-gray-600">Messaging</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Ping-Pong Prompt Engine
          </h2>
          <PingPongPromptUI engine={engine} />
        </div>
      </div>
    </div>
  );
} 