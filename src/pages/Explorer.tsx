import React, { useState } from 'react';
import { Scale, Settings, Zap, Wifi, WifiOff } from 'lucide-react';
import { EndpointList } from '../components/explorer/EndpointList';
import { EndpointForm } from '../components/explorer/EndpointForm';
import { ResponseViewer } from '../components/explorer/ResponseViewer';
import { FlowStatePanel } from '../components/explorer/FlowStatePanel';
import { useApp } from '../contexts/AppContext';
import { ENDPOINTS } from '../types/endpoints';
import { API_BASE } from '../api/client';
import type { EndpointConfig } from '../types';

export const Explorer: React.FC = () => {
  const { mode, setMode } = useApp();
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig | null>(ENDPOINTS[0]);
  const [response, setResponse] = useState<{
    status: number;
    headers: Record<string, string>;
    data: unknown;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResponse = (res: { status: number; headers: Record<string, string>; data: unknown }) => {
    setResponse(res);
    setError(null);
  };

  const handleError = (err: string) => {
    setError(err);
    setResponse(null);
  };

  const isLiveMode = mode === 'live';

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-brand-border shadow-sm sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-brand-textPrimary">NaijaLex API Explorer</h1>
                <p className="text-xs text-brand-textSecondary hidden sm:block">
                  Interactive API testing dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* API URL indicator */}
              <div className="hidden md:flex items-center gap-2 text-xs text-brand-textSecondary bg-brand-bg px-3 py-1.5 rounded-lg">
                {isLiveMode ? <Wifi className="w-3.5 h-3.5 text-primary" /> : <WifiOff className="w-3.5 h-3.5 text-warning" />}
                <code className="font-mono">{API_BASE}</code>
              </div>

              {/* Mode toggle */}
              <div className="flex items-center gap-1 p-0.5 bg-brand-bg border border-brand-border rounded-lg">
                <button
                  onClick={() => setMode('live')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    mode === 'live'
                      ? 'bg-white text-brand-textPrimary shadow-sm border border-brand-border'
                      : 'text-brand-textSecondary hover:text-brand-textPrimary'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  Live API
                </button>
                <button
                  onClick={() => setMode('demo')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    mode === 'demo'
                      ? 'bg-amber-100 text-warning border border-amber-200'
                      : 'text-brand-textSecondary hover:text-brand-textPrimary'
                  }`}
                >
                  <Settings className="w-3 h-3" />
                  Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Endpoint list */}
        <div className="w-64 shrink-0 hidden lg:block">
          <EndpointList
            selectedId={selectedEndpoint?.id ?? null}
            onSelect={setSelectedEndpoint}
          />
        </div>

        {/* Center - Endpoint form + response */}
        <div className="flex-1 flex flex-col lg:flex-row min-w-0">
          {/* Endpoint form */}
          <div className="flex-1 min-w-0 border-r border-brand-border">
            {selectedEndpoint ? (
              <EndpointForm
                endpoint={selectedEndpoint}
                onResponse={handleResponse}
                onError={handleError}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-brand-textSecondary">
                Select an endpoint to test
              </div>
            )}
          </div>

          {/* Response viewer */}
          <div className="w-full lg:w-96 shrink-0 border-t lg:border-t-0 border-brand-border">
            <ResponseViewer response={response} error={error} />
          </div>
        </div>

        {/* Right sidebar - Flow state */}
        <div className="w-64 shrink-0 hidden xl:block">
          <FlowStatePanel />
        </div>
      </div>

      {/* Mobile endpoint selector */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-border p-2 z-40">
        <select
          value={selectedEndpoint?.id || ''}
          onChange={(e) => {
            const ep = ENDPOINTS.find((x) => x.id === e.target.value);
            if (ep) setSelectedEndpoint(ep);
          }}
          className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm"
        >
          {ENDPOINTS.map((ep) => (
            <option key={ep.id} value={ep.id}>
              {ep.method} {ep.path} — {ep.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
