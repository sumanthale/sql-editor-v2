import React, { useMemo } from "react";
import {
  Download,
  FileText,
  Database,
  Clock,
  RotateCcw,
  Play,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { DataTable } from "../DataTable/DataTable";
import { QueryResult } from "../../../types/database";

interface QueryResultsProps {
  results: QueryResult[];
  isLoading: boolean;
  lastExecuted?: Date;
}

export function QueryResults({
  results,
  isLoading,
  lastExecuted,
}: QueryResultsProps) {
  const currentResult = results[0]; // Show the most recent query result

  const exportToCSV = () => {
    if (!currentResult) return;

    const headers = currentResult.columns.map((col) => col.name);
    const csvContent = [
      headers.join(","),
      ...currentResult.rows.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return "";
            const stringValue = String(value);
            return stringValue.includes(",") ||
              stringValue.includes('"') ||
              stringValue.includes("\n")
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query-results-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!currentResult) return;

    const jsonContent = JSON.stringify(
      {
        query: currentResult.query,
        columns: currentResult.columns,
        rows: currentResult.rows,
        totalRows: currentResult.totalRows,
        executionTime: currentResult.executionTime,
        timestamp: currentResult.timestamp,
      },
      null,
      2
    );

    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query-results-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="h-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center">
        <div className="flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-6 py-4 rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-700/60">
          <div className="relative">
            <RotateCcw className="animate-spin text-blue-500" size={24} />
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              Executing query...
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Please wait while we process your request
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col">
      {/* Header */}


      {/* Results Content */}
      <div className="flex-1 overflow-hidden">
        {!currentResult ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Database size={32} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                No query results
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-1">
                Run a SQL query to see the data results here
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Use Ctrl+Enter to execute your query
              </p>
            </div>
          </div>
        ) : currentResult.rows.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Query executed successfully
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No rows returned from your query
              </p>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200/60 dark:border-slate-600/60">
                <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
                  {currentResult.query}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full">
            <DataTable
              data={currentResult.rows}
              loading={false}
              emptyMessage="No data returned from query"
              pageSize={50}
              showPagination={true}
              className="h-full border-0 rounded-none bg-transparent"
            />
          </div>
        )}
      </div>

      {/* Query Info Footer */}
      {currentResult && (
        <div className="px-4 py-3 border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate max-w-2xl bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">
              {currentResult.query}
            </div>

            {currentResult && (
              <div className="flex items-center gap-4 ml-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <Database size={14} className="text-blue-500" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {currentResult.totalRows} row
                    {currentResult.totalRows !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                  <Clock size={14} className="text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    {currentResult.executionTime}ms
                  </span>
                </div>

                {lastExecuted && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                    <Play size={14} className="text-purple-500" />
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                      {lastExecuted.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
