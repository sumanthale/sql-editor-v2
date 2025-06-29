import { Database, RotateCcw, CheckCircle2 } from "lucide-react";
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
              {lastExecuted && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  Last executed: {lastExecuted.toLocaleString()}
                </p>
              )}
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
              {currentResult.executionTime && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Executed in {currentResult.executionTime}ms</span>
                  {lastExecuted && (
                    <>
                      <span>•</span>
                      <span>{lastExecuted.toLocaleString()}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full">
            <DataTable
              currentResult={currentResult}
              loading={false}
              emptyMessage="No data returned from query"
              pageSize={50}
              showPagination={true}
              className="h-full border-0 rounded-none bg-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
}
