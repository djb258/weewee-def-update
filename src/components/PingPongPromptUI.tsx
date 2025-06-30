import React, { useState } from 'react';
import { PingPongEngine, AgentType } from '../core/pingPongEngine';

/**
 * Props for PingPongPromptUI
 * @param engine - An instance of PingPongEngine (manages all logic/state)
 */
interface PingPongPromptUIProps {
  engine: PingPongEngine;
}

export const PingPongPromptUI: React.FC<PingPongPromptUIProps> = ({ engine }) => {
  const [prompt, setPrompt] = useState(engine.getCurrentPrompt());
  const [_, setRerender] = useState(0);

  const forceUpdate = () => setRerender((n) => n + 1);

  const handleAgentRefine = (agent: AgentType) => {
    engine.refine(agent);
    setPrompt(engine.getCurrentPrompt());
    forceUpdate();
  };

  const handleApplyEdit = () => {
    engine.applyManualEdit(prompt);
    setPrompt(engine.getCurrentPrompt());
    forceUpdate();
  };

  const handleGo = () => {
    engine.triggerGo();
    forceUpdate();
  };

  const history = engine.getHistory();
  const currentVersion = engine.getCurrentVersion();
  const agentTurn = engine.getAgentTurn();
  const goTriggered = engine.isGoTriggered();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Ping-Pong Prompt Engine</h1>
          <p className="text-gray-600">Refine your prompts through iterative AI collaboration</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1: Initial Prompt */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  1
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Current Prompt</h2>
              </div>
              
              <textarea
                className="w-full p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={goTriggered}
                placeholder="Enter your initial prompt here..."
              />
              
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    agentTurn === 'A' && !goTriggered
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => handleAgentRefine('A')}
                  disabled={goTriggered || agentTurn !== 'A'}
                >
                  Agent A Refine
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    agentTurn === 'B' && !goTriggered
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => handleAgentRefine('B')}
                  disabled={goTriggered || agentTurn !== 'B'}
                >
                  Agent B Refine
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !goTriggered
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={handleApplyEdit}
                  disabled={goTriggered}
                >
                  Apply Manual Edit
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !goTriggered
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={handleGo}
                  disabled={goTriggered}
                >
                  Finalize & Research
                </button>
              </div>

              {goTriggered && (
                <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center mr-3">
                      ✓
                    </div>
                    <span className="text-green-800 font-medium">Ready for final research and deployment!</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Version History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  2
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Version History</h2>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((version, index) => (
                  <div
                    key={version.version}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      version.version === currentVersion.version
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-gray-700">
                        {version.version}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        version.agent === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        Agent {version.agent}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {version.prompt.substring(0, 100)}...
                    </p>
                    <div className="text-xs text-gray-500">
                      {new Date(version.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Current State & JSON Output */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
              3
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Current State & Output</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Version:</span>
                  <span className="font-mono font-bold">{currentVersion.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Agent Turn:</span>
                  <span className={`font-bold ${agentTurn === 'A' ? 'text-blue-600' : 'text-green-600'}`}>
                    Agent {agentTurn}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-bold ${goTriggered ? 'text-green-600' : 'text-yellow-600'}`}>
                    {goTriggered ? 'Finalized' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">STAMPED JSON Output</h3>
              <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto border">
                {JSON.stringify(currentVersion.json, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 