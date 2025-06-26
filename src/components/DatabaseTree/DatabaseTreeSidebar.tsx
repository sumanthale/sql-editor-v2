import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  ExpandIcon,
  Minimize2,
  RefreshCw,
  MinusCircle,
  Database,
  CopyMinus,
  CopyPlus,
} from "lucide-react";
import { useDatabaseTreeStore } from "../../stores/databaseTreeStore";
import { TreeView } from "./TreeView";
import { DatabaseType } from "../../types/Connection";

export const DatabaseTreeSidebar: React.FC = () => {
  const {
    filteredTree,
    searchQuery,
    setSearchQuery,
    expandAll,
    collapseAll,
    loadSchemas,
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
    setSearchQuery("");
  };

  const handleRefresh = () => {
    loadSchemas();
  };
  const activeConnection = {
    name: "Main Cluster",
    dbType: "PostgreSQL", // from your `databaseTypes`
    environment: "prod", // from your `environmentConfig`
  };
  // const totalExpandedCount = expandedNodes.size;
  const hasSearchQuery = searchQuery.trim().length > 0;

  const databaseTypes: { value: DatabaseType; label: string; icon: string }[] =
    [
      { value: "MySQL", label: "MySQL", icon: "🐬" },
      { value: "PostgreSQL", label: "PostgreSQL", icon: "🐘" },
      { value: "MySQL", label: "MySQL", icon: "🏢" },
    ];

  const environmentConfig = {
    dev: {
      icon: "🔧",
      badge: "bg-green-600",
      text: "text-green-600",
      border: "border-green-600",
      bg: "bg-green-50",
      name: "DEV",
    },
    qa: {
      icon: "🧪",
      badge: "bg-blue-600",
      text: "text-blue-600",
      border: "border-blue-500",
      bg: "bg-blue-50",
      name: "QA",
    },
    staging: {
      icon: "🎭",
      badge: "bg-yellow-600",
      text: "text-yellow-600",
      border: "border-yellow-600",
      bg: "bg-yellow-50",
      name: "Staging",
    },
    uat: {
      icon: "👥",
      badge: "bg-purple-600",
      text: "text-purple-600",
      border: "border-purple-600",
      bg: "bg-purple-50",
      name: "UAT",
    },
    prod: {
      icon: "🚀",
      badge: "bg-red-600",
      text: "text-red-600",
      border: "border-red-600",
      bg: "bg-red-50",
      name: "PROD",
    },
  };

  const dbMeta = databaseTypes.find(
    (db) => db.value === activeConnection.dbType
  );
  // get environment config
  const envMeta =
    environmentConfig[
      activeConnection.environment as keyof typeof environmentConfig
    ];
  return (
    <div className="h-full flex flex-col bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
      {/* Header */}

      <div className="flex-shrink-0 p-3 pb-2 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80">
        {/* Search Bar */}
        <div className={`flex items-center gap-4 mb-4 p-3 rounded-lg border ${envMeta.border} ${envMeta.bg}  shadow-sm`}>
          {/* DB Icon */}
          <div
            className={`w-10 h-10 text-xl rounded-lg  text-white flex items-center justify-center shadow-md ${envMeta?.badge}`}
          >
            <span>{dbMeta?.icon}</span>
          </div>

          {/* Connection Info */}
          <div className="flex flex-col justify-center gap-1 flex-1 gap-y-1">
            <h2 className="text-sm font-bold text-slate-800">
              {activeConnection.dbType}@
              <span className="text-slate-600 font-medium">
                {activeConnection.name}
              </span>
            </h2>

            <div className="flex items-center gap-2 justify-between">
              {/* Environment Badge */}
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-md ${envMeta?.badge} ${envMeta?.border} text-white`}
              >
                {envMeta?.name} DB
              </span>

              {/* Disconnect Button */}
              <button
                onClick={collapseAll}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-700/60 hover:bg-red-200 dark:hover:bg-red-600 text-red-700 dark:text-red-100 rounded-md transition-all duration-150"
                title="Disconnect"
              >
                <MinusCircle size={12} />
                Disconnect
              </button>
            </div>
          </div>
        </div>


        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 my-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={expandAll}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-md transition-all duration-150 hover:scale-105"
                title="Expand All"
              >
                <CopyPlus size={12} />
              </button>
              <button
                onClick={collapseAll}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-md transition-all duration-150 hover:scale-105"
                title="Collapse All"
              >
                <CopyMinus size={12} />
              </button>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-md transition-all duration-150 hover:scale-105"
            title="Refresh schema"
          >
            <RefreshCw size={10} />
          </button>
        </div>
        <div className="relative">
          <div
            className={`relative transition-all duration-200 ${
              isSearchFocused ? "ring-2 ring-blue-500/20" : ""
            }`}
          >
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
        <div className="flex items-center justify-center gap-2 mt-2">
          {hasSearchQuery && (
            <span className="w-full text-center text-xs text-slate-500 font-medium dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
              {filteredTree.length} result
              {filteredTree.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {/* Controls */}
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-3 ">
        <div className="space-y-1">
          <TreeView nodes={filteredTree} searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  );
};
