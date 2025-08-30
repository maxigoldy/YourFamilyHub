import React from 'react';
import { Network, ExternalLink, Server } from 'lucide-react';
import { useNetworkLinks } from '../hooks/useLocalNetworkLinks';

export function LocalNetworkTab() {
  const { links, loading } = useNetworkLinks();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm sm:text-base">Loading network links...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 sm:p-3 gold-gradient rounded-2xl">
            <Network className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold gold-text">Network</h2>
        </div>
        <p className="text-gray-400 text-sm sm:text-base mb-2">Quick access to local network services</p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
          <span className="flex items-center gap-1">
            <Server className="h-4 w-4" />
            {links.length} services
          </span>
        </div>
      </div>

      {/* Network Links */}
      {links.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 glass-effect rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Server className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-3">No network links configured</h3>
          <p className="text-gray-400 mb-6 text-sm sm:text-base">
            Contact your admin to add network services
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-effect rounded-xl p-6 transition-all duration-300 hover-lift hover:border-yellow-500/50 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                  <Server className="h-6 w-6 text-yellow-400" />
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-yellow-400 transition-colors" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-yellow-400 transition-colors">
                {link.name}
              </h3>
              
              {link.description && (
                <p className="text-sm text-gray-400 mb-3">{link.description}</p>
              )}
              
              <div className="text-xs text-gray-500 font-mono bg-gray-800/50 rounded px-2 py-1 truncate">
                {link.url}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}