import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  ExpandIcon,
  Minimize2,
  Database,
  RefreshCw
} from 'lucide-react';
import { useDatabaseTreeStore } from '../../stores/databaseTreeStore';
import { TreeView } from './TreeView';

export const DatabaseTreeSidebar: React.FC = () => {
  const {
    filteredTree,
    searchQuery,
    expandedNodes,
    setSearchQuery,
    expandAll,
    collapseAll,
    loadSchemas
  } = useDatabaseTreeStore();

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Load initial schemas on mount
  useEffect(() => {
    loadSchemas();
  }, [loadSchemas]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleRefresh = () => {
    loadSchemas();
  };

  // const totalExpandedCount = expandedNodes.size;
  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <div className="h-full flex flex-col bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <Database size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Database Explorer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse schema structure
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className={`relative transition-all duration-200 ${
            isSearchFocused ? 'ring-2 ring-blue-500/20' : ''
          }`}>
            <Search 
              size={14} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" 
            />
            <input
              type="text"
              placeholder="Search tables, views, functions..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 placeholder-slate-400 dark:placeholder-slate-500 text-slate-700 dark:text-slate-300"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-md transition-all duration-150 hover:scale-105"
              title="Expand All"
            >
              <ExpandIcon size={12} />
              Expand
            </button>
            <button
              onClick={collapseAll}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-md transition-all duration-150 hover:scale-105"
              title="Collapse All"
            >
              <Minimize2 size={12} />
              Collapse
            </button>
          </div>

          <div className="flex items-center gap-2">
            {hasSearchQuery && (
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                {filteredTree.length} result{filteredTree.length !== 1 ? 's' : ''}
              </span>
            )}
            {/* <span className="text-xs text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
              {totalExpandedCount} expanded
            </span> */}
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          <TreeView 
            nodes={filteredTree} 
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span>Connected</span>
            <span>•</span>
            <span>Database Name</span>
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            title="Refresh schema"
          >
            <RefreshCw size={10} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};