import React from 'react';
import { clsx } from 'clsx';
import { ENDPOINTS, CATEGORIES } from '../../types/endpoints';
import type { EndpointConfig } from '../../types';

interface EndpointListProps {
  selectedId: string | null;
  onSelect: (endpoint: EndpointConfig) => void;
}

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-700 border-green-200',
  POST: 'bg-blue-100 text-blue-700 border-blue-200',
  PUT: 'bg-amber-100 text-amber-700 border-amber-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
};

export const EndpointList: React.FC<EndpointListProps> = ({ selectedId, onSelect }) => {
  return (
    <div className="bg-white border-r border-brand-border h-full overflow-y-auto">
      <div className="p-4 border-b border-brand-border bg-brand-bg">
        <h2 className="font-semibold text-brand-textPrimary">API Endpoints</h2>
        <p className="text-xs text-brand-textSecondary mt-1">{ENDPOINTS.length} endpoints</p>
      </div>
      <div className="p-2">
        {CATEGORIES.map((category) => {
          const endpoints = ENDPOINTS.filter((e) => e.category === category);
          return (
            <div key={category} className="mb-4">
              <p className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wide px-2 py-1.5">
                {category}
              </p>
              <div className="space-y-0.5">
                {endpoints.map((endpoint) => (
                  <button
                    key={endpoint.id}
                    onClick={() => onSelect(endpoint)}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded-lg transition-colors group',
                      selectedId === endpoint.id
                        ? 'bg-primary-50 border border-primary/30'
                        : 'hover:bg-brand-bg border border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          'text-xs font-bold px-1.5 py-0.5 rounded border',
                          methodColors[endpoint.method]
                        )}
                      >
                        {endpoint.method}
                      </span>
                      <span
                        className={clsx(
                          'text-sm truncate flex-1',
                          selectedId === endpoint.id
                            ? 'text-primary font-medium'
                            : 'text-brand-textPrimary'
                        )}
                      >
                        {endpoint.name}
                      </span>
                    </div>
                    <p className="text-xs text-brand-textSecondary mt-0.5 truncate pl-10">
                      {endpoint.path}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
