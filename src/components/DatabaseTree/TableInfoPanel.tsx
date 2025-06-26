import React from "react";
import { Key, Link, Hash, Database, Shield, Search } from "lucide-react";
import { useDatabaseTreeStore } from "../../stores/databaseTreeStore";

export const TableInfoPanel: React.FC = () => {
  const { selectedTable, activeInfoTab, setActiveInfoTab } =
    useDatabaseTreeStore();

  if (!selectedTable) return null;

  const getColumnIcon = (column: any) => {
    if (column.isPrimaryKey)
      return <Key size={14} className="text-yellow-500" />;
    if (column.isForeignKey)
      return <Link size={14} className="text-blue-500" />;
    return <Database size={14} className="text-slate-400" />;
  };

  const getIndexIcon = (index: any) => {
    switch (index.type) {
      case "PRIMARY":
        return <Key size={14} className="text-yellow-500" />;
      case "UNIQUE":
        return <Shield size={14} className="text-green-500" />;
      case "FOREIGN":
        return <Link size={14} className="text-blue-500" />;
      default:
        return <Hash size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="h-64 flex flex-col text-sm">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm">
        {(
          [
            {
              key: "columns",
              label: `Columns (${selectedTable.columns.length})`,
            },
            {
              key: "indexes",
              label: `Indexes (${selectedTable.indexes.length})`,
            },
          ] as { key: "columns" | "indexes"; label: string }[]
        ).map((tab) => {
          const isActive = activeInfoTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveInfoTab(tab.key)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
                isActive
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/40 dark:hover:bg-slate-700/50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {activeInfoTab === "columns" &&
          (selectedTable.columns.length ? (
            selectedTable.columns.map((col, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 hover:shadow-sm"
              >
                {getColumnIcon(col)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {col.name}
                    </span>
                    {col.isPrimaryKey && (
                      <span className="badge-yellow">PK</span>
                    )}
                    {col.isForeignKey && <span className="badge-blue">FK</span>}
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-xs">
                      {col.dataType}
                    </span>
                  </div>
                  {/* <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono">
                      {col.dataType}
                    </span>
                    {!col.nullable && (
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        NOT NULL
                      </span>
                    )}
                    {col.defaultValue && (
                      <span className="text-green-600 dark:text-green-400">
                        DEFAULT: {col.defaultValue}
                      </span>
                    )}
                  </div> */}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={<Database size={24} />}
              message="No columns found"
            />
          ))}

        {activeInfoTab === "indexes" &&
          (selectedTable.indexes.length ? (
            selectedTable.indexes.map((idx, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 hover:shadow-sm"
              >
                {getIndexIcon(idx)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {idx.name}
                    </span>
                    <span
                      className={`badge ${
                        idx.type === "PRIMARY"
                          ? "badge-yellow"
                          : idx.type === "UNIQUE"
                          ? "badge-green"
                          : idx.type === "FOREIGN"
                          ? "badge-blue"
                          : "badge-gray"
                      }`}
                    >
                      {idx.type}
                    </span>
                    {idx.isUnique &&
                      !["PRIMARY", "UNIQUE"].includes(idx.type) && (
                        <span className="badge-purple">UNIQUE</span>
                      )}
                  </div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    Columns: {idx.columns.join(", ")}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={<Search size={24} />}
              message="No indexes found"
            />
          ))}
      </div>
    </div>
  );
};

// Compact badge utilities (Tailwind classes)
const badgeBase = "text-xs px-1.5 py-0.5 rounded font-semibold";
const badgeStyles = {
  yellow:
    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  purple:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  gray: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
};

const badge = (color: keyof typeof badgeStyles) =>
  `${badgeBase} ${badgeStyles[color]}`;

// Shortcut classes
const badgeYellow = badge("yellow");
const badgeBlue = badge("blue");
const badgeGreen = badge("green");
const badgePurple = badge("purple");
const badgeGray = badge("gray");

// Empty state renderer
const EmptyState = ({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) => (
  <div className="flex flex-col items-center justify-center h-full py-10 text-slate-500 dark:text-slate-400">
    <div className="mb-2 opacity-50">{icon}</div>
    <p className="text-sm">{message}</p>
  </div>
);
