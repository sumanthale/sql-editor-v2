import { useRef, useState } from "react";
import {
  Plus,
  Sun,
  Moon,
  ChevronDown,
  X,
  Activity,
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { DatabaseConnection, SqlTab } from "../../../types/database";
import { createPortal } from "react-dom";

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
  tabs,
  onNewTab,
  onCloseTab,
  onTabChange,
  queryLimit,
  onQueryLimitChange,
}: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const [showLimitDropdown, setShowLimitDropdown] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleNewTab = () => {
    onNewTab();
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          left: scrollContainerRef.current.scrollWidth,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  return (
    <div className="h-16 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-slate-200/60 dark:border-slate-700/60 px-4 sm:px-6 flex items-center justify-between gap-6 shadow-sm border-b-4">

      {/* Left: Logo + Tabs */}
      <div className="flex items-center gap-4 flex-1 overflow-hidden ">
        {/* Logo */}
        <img
          src="https://www.synchrony.com/syc/img/2023_synchrony_basic_logo.svg"
          alt="Synchrony Logo"
          className="h-10 w-auto"
        />

        {/* Tab List */}
{/* a divider */}
        <div className="border-l border-slate-200 dark:border-slate-700 h-10 mx-2" />

        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide no-scroll flex-1"
        >
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm cursor-pointer transition-all whitespace-nowrap ${
                tab.isActive
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow"
                  : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="font-medium">{tab.title}</span>
              {tab.isDirty && (
                <div className="w-2 h-2 bg-orange-400 rounded-full" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className={`hover:bg-black/10 rounded p-1 transition-colors ${
                  tab.isActive ? "text-white/80 hover:text-white" : ""
                }`}
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {/* + Button */}
          <button
            onClick={handleNewTab}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            title="New Tab"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">

        {/* Query Limit Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLimitDropdown(!showLimitDropdown)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md text-slate-600 dark:text-slate-300 transition"
          >
            <Activity size={12} />
            LIMIT {queryLimit}
            <ChevronDown size={12} />
          </button>

          {showLimitDropdown &&
            createPortal(
              <div className="absolute top-12  right-10 z-50 mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg overflow-hidden">
                {QUERY_LIMITS.map((limit) => (
                  <button
                    key={limit}
                    onClick={() => {
                      onQueryLimitChange(limit);
                      setShowLimitDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition ${
                      queryLimit === limit
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    LIMIT {limit}
                  </button>
                ))}
              </div>,
              document.body
            )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </div>
  );
}
