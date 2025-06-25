import { useState } from 'react';
import { 
  Play, 
  Plus, 
  Settings, 
  Sun, 
  Moon, 
  Database,
  ChevronDown,
  X,
  Zap,
  Activity
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { DatabaseConnection, SqlTab } from '../../../types/database';

interface TopBarProps {
  connections: DatabaseConnection[];
  activeConnection: DatabaseConnection | null;
  tabs: SqlTab[];
  activeTabId: string | null;
  onConnectionChange: (connection: DatabaseConnection) => void;
  onRunQuery: () => void;
  onNewTab: () => void;
  onCloseTab: (tabId: string) => void;
  onTabChange: (tabId: string) => void;
  onOpenConnectionManager: () => void;
  queryLimit: number;
  onQueryLimitChange: (limit: number) => void;
}

const QUERY_LIMITS = [100, 500, 1000, 5000, 10000];

export function TopBar({
  connections,
  activeConnection,
  tabs,
  activeTabId,
  onConnectionChange,
  onRunQuery,
  onNewTab,
  onCloseTab,
  onTabChange,
  onOpenConnectionManager,
  queryLimit,
  onQueryLimitChange
}: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const [showConnectionDropdown, setShowConnectionDropdown] = useState(false);
  const [showLimitDropdown, setShowLimitDropdown] = useState(false);

  return (
    <div className="h-14 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 flex items-center px-6 gap-6 shadow-sm">
      {/* Connection Selector */}
      <div className="relative">
        <button
          onClick={() => setShowConnectionDropdown(!showConnectionDropdown)}
          className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-slate-600 dark:hover:to-slate-500 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md border border-blue-200/50 dark:border-slate-600/50"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${activeConnection?.isConnected ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-red-500 shadow-sm shadow-red-500/50'}`} />
            <Database size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-slate-700 dark:text-slate-200">
            {activeConnection ? activeConnection.label : 'No Connection'}
          </span>
          <ChevronDown size={14} className="text-slate-500" />
        </button>
        
        {showConnectionDropdown && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2">
              {connections.map(conn => (
                <button
                  key={conn.id}
                  onClick={() => {
                    onConnectionChange(conn);
                    setShowConnectionDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-all duration-150 ${
                    activeConnection?.id === conn.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800' : ''
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${conn.isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <div className="flex-1">
                    <div className="font-medium">{conn.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{conn.host}:{conn.port}</div>
                  </div>
                </button>
              ))}
              <hr className="my-2 border-slate-200 dark:border-slate-700" />
              <button
                onClick={() => {
                  onOpenConnectionManager();
                  setShowConnectionDropdown(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 text-blue-600 dark:text-blue-400 transition-all duration-150"
              >
                <Plus size={16} />
                Add Connection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex-1 flex items-center gap-2 overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 whitespace-nowrap ${
              tab.isActive 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25' 
                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="font-medium">{tab.title}</span>
            {tab.isDirty && <div className="w-1.5 h-1.5 bg-orange-400 rounded-full shadow-sm" />}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              className={`hover:bg-black/10 rounded p-1 transition-colors ${tab.isActive ? 'text-white/80 hover:text-white' : ''}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={onNewTab}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          title="New Tab"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Query Limit */}
        <div className="relative">
          <button
            onClick={() => setShowLimitDropdown(!showLimitDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-all duration-200 font-medium text-slate-600 dark:text-slate-300"
          >
            <Activity size={12} />
            LIMIT {queryLimit}
            <ChevronDown size={12} />
          </button>
          
          {showLimitDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 rounded-lg shadow-xl z-50 overflow-hidden">
              {QUERY_LIMITS.map(limit => (
                <button
                  key={limit}
                  onClick={() => {
                    onQueryLimitChange(limit);
                    setShowLimitDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                    queryLimit === limit ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                  }`}
                >
                  LIMIT {limit}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Run Query */}
        <button
          onClick={onRunQuery}
          disabled={!activeConnection?.isConnected}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none transform hover:scale-105 disabled:transform-none"
        >
          <Zap size={14} />
          Run Query
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Settings */}
        <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}