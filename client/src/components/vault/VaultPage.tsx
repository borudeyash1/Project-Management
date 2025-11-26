import React, { useState } from 'react';
import { ChevronRight, Grid3x3, List, Search, Plus } from 'lucide-react';
import AssetCard from './AssetCard';
import AssetRow from './AssetRow';

interface Asset {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'image' | 'video' | 'audio';
  size?: string;
  modified: string;
}

const VaultPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [breadcrumbs, setBreadcrumbs] = useState(['Vault', 'Projects', 'Q4']);

  // Sample data
  const assets: Asset[] = [
    {
      id: '1',
      name: 'Design Files',
      type: 'folder',
      modified: 'Nov 24, 2025',
    },
    {
      id: '2',
      name: 'Meeting Notes',
      type: 'folder',
      modified: 'Nov 23, 2025',
    },
    {
      id: '3',
      name: 'Project Proposal.pdf',
      type: 'file',
      size: '2.4 MB',
      modified: 'Nov 22, 2025',
    },
    {
      id: '4',
      name: 'Screenshot 2025.png',
      type: 'image',
      size: '1.8 MB',
      modified: 'Nov 21, 2025',
    },
    {
      id: '5',
      name: 'Demo Video.mp4',
      type: 'video',
      size: '45.2 MB',
      modified: 'Nov 20, 2025',
    },
    {
      id: '6',
      name: 'Background Music.mp3',
      type: 'audio',
      size: '5.6 MB',
      modified: 'Nov 19, 2025',
    },
    {
      id: '7',
      name: 'Budget 2025.xlsx',
      type: 'file',
      size: '856 KB',
      modified: 'Nov 18, 2025',
    },
    {
      id: '8',
      name: 'Team Photos',
      type: 'folder',
      modified: 'Nov 17, 2025',
    },
  ];

  return (
    <div className="h-screen bg-app-bg text-text-primary flex flex-col">
      {/* Header */}
      <div className="border-b border-border-subtle bg-app-bg">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <button
                  className={`
                    text-sm transition-colors
                    ${
                      index === breadcrumbs.length - 1
                        ? 'text-white font-medium'
                        : 'text-text-lighter hover:text-text-muted'
                    }
                  `}
                  onClick={() => {
                    // Handle breadcrumb navigation
                    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
                  }}
                >
                  {crumb}
                </button>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight size={14} className="text-text-lighter" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter"
                size={16}
              />
              <input
                type="text"
                placeholder="Search files..."
                className="bg-sidebar-bg border border-border-subtle rounded-lg pl-9 pr-4 py-1.5 text-sm text-text-light placeholder-text-lighter focus:outline-none focus:border-border-light transition-colors w-64"
              />
            </div>

            {/* View Toggler */}
            <div className="bg-border-subtle p-1 rounded-lg flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`
                  p-1.5 rounded transition-colors
                  ${
                    viewMode === 'grid'
                      ? 'bg-hover-bg text-white shadow-sm'
                      : 'text-text-muted hover:text-text-light'
                  }
                `}
              >
                <Grid3x3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`
                  p-1.5 rounded transition-colors
                  ${
                    viewMode === 'list'
                      ? 'bg-hover-bg text-white shadow-sm'
                      : 'text-text-muted hover:text-text-light'
                  }
                `}
              >
                <List size={16} />
              </button>
            </div>

            {/* New Button */}
            <button className="bg-accent-blue hover:bg-blue-600 text-white font-medium py-1.5 px-4 rounded-lg transition-colors text-sm flex items-center gap-2">
              <Plus size={16} />
              New
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                {...asset}
                onClick={() => {
                  if (asset.type === 'folder') {
                    setBreadcrumbs([...breadcrumbs, asset.name]);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div>
            {/* Header */}
            <div className="grid grid-cols-[1fr_150px_120px] gap-4 px-4 py-2 border-b border-border-subtle">
              <div className="text-2xs font-bold uppercase text-text-lighter">
                Name
              </div>
              <div className="text-2xs font-bold uppercase text-text-lighter">
                Modified
              </div>
              <div className="text-2xs font-bold uppercase text-text-lighter text-right">
                Size
              </div>
            </div>

            {/* Rows */}
            {assets.map((asset) => (
              <AssetRow
                key={asset.id}
                {...asset}
                onClick={() => {
                  if (asset.type === 'folder') {
                    setBreadcrumbs([...breadcrumbs, asset.name]);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultPage;
