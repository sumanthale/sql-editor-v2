import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  X,
  Search,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  FileText,
  Clock,
} from "lucide-react";

export interface Column {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "boolean";
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: any) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface DataTableProps {
  currentResult: any;
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
  showPagination?: boolean;
  onRowClick?: (row: any) => void;
  className?: string;
}

export function DataTable({
  currentResult,
  loading = false,
  emptyMessage = "No data available",
  pageSize = 50,
  showPagination = true,
  onRowClick,
  className = "",
}: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  const data = currentResult.rows;

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

  // Generate columns dynamically from data
  const columns: Column[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    const firstRow = data[0];
    return Object.keys(firstRow).map((key) => {
      const value = firstRow[key];
      let type: Column["type"] = "text";

      // Determine column type based on value
      if (typeof value === "number") {
        type = "number";
      } else if (typeof value === "boolean") {
        type = "boolean";
      } else if (value && typeof value === "string") {
        // Check if it looks like a date
        if (
          value.match(/^\d{4}-\d{2}-\d{2}/) ||
          (value.includes("T") && value.includes("Z"))
        ) {
          type = "date";
        }
      }

      return {
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
        type,
        sortable: true,
        align: "left",
        render: (value) => {
          if (value === null || value === undefined) {
            return (
              <span className="text-slate-400 italic bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">
                NULL
              </span>
            );
          }

          if (type === "date" && value) {
            try {
              const date = new Date(value);
              return (
                <div className="text-xs">
                  <div className="text-slate-900 dark:text-slate-100 font-medium">
                    {date.toLocaleDateString()}
                  </div>
                </div>
              );
            } catch {
              return <span className="font-mono text-xs">{String(value)}</span>;
            }
          }

          if (type === "number") {
            return (
              <span className="font-mono text-xs font-medium">
                {Number(value).toLocaleString()}
              </span>
            );
          }

          if (type === "boolean") {
            return (
              <span className="px-2 py-1 rounded-full text-xs font-semibold">
                {value ? "TRUE" : "FALSE"}
              </span>
            );
          }

          const stringValue = String(value);
          if (stringValue.length > 50) {
            return (
              <div className="max-w-xs text-xs">
                <span className="truncate block" title={stringValue}>
                  {stringValue}
                </span>
              </div>
            );
          }

          return <span className="font-medium">{stringValue}</span>;
        },
      };
    });
  }, [data]);

  // Filter data based on global search
  const filteredData = useMemo(() => {
    if (!globalFilter) return data;

    return data.filter((row) => {
      return Object.values(row).some((value) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(globalFilter.toLowerCase());
      });
    });
  }, [data, globalFilter]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      let comparison = 0;

      if (aValue === null || aValue === undefined) comparison = 1;
      else if (bValue === null || bValue === undefined) comparison = -1;
      else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === "desc" ? -comparison : comparison;
    });
  }, [filteredData, sortConfig]);

  // Paginate sorted data
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, showPagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sorting
  const handleSort = useCallback((columnKey: string) => {
    setSortConfig((prev) => {
      if (prev?.key === columnKey) {
        if (prev.direction === "asc") {
          return { key: columnKey, direction: "desc" };
        } else {
          return null; // Remove sort
        }
      } else {
        return { key: columnKey, direction: "asc" };
      }
    });
  }, []);

  // Get sort indicator for column
  const getSortIndicator = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return (
        <ArrowUpDown
          size={12}
          className="opacity-0 group-hover:opacity-50 transition-opacity"
        />
      );
    }

    return sortConfig.direction === "asc" ? (
      <SortAsc size={12} className="text-blue-600 dark:text-blue-400" />
    ) : (
      <SortDesc size={12} className="text-blue-600 dark:text-blue-400" />
    );
  };

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data, globalFilter]);

  if (loading) {
    return (
      <div
        className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 ${className}`}
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-slate-600 dark:text-slate-400">
              Loading data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg flex flex-col h-full ${className}`}
      style={{ zoom: `${scale}` }}
    >
      {/* Header Controls */}
      <div className="p-2 bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-t-xl border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          {/* Left: Title & Info */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Query Results
            </h3>

            {globalFilter ? (
              <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                {sortedData.length} row{sortedData.length !== 1 ? "s" : ""}{" "}
                (filtered from {data.length})
              </span>
            ) : (
              <div className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 rounded-md">
                <Database size={12} className="text-blue-500" />
                {currentResult.totalRows} row
                {currentResult.totalRows !== 1 ? "s" : ""}
              </div>
            )}

            {/* Execution Time */}
            <div className="flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 rounded-md">
              <Clock size={12} className="text-emerald-500" />
              {currentResult.executionTime}ms
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-auto">
            {/* Zoom Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                −
              </button>
              <button
                onClick={handleZoomIn}
                className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                +
              </button>
              <span className="text-xs text-slate-500 w-14 text-center">
                {(scale * 100).toFixed(0)}%
              </span>
            </div>

            {/* Export Buttons */}
            <button
              onClick={exportToCSV}
              title="Export as CSV"
              className="flex items-center gap-1 text-xs px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-600"
            >
              <Download size={12} className="text-blue-500" />
              CSV
            </button>
            <button
              onClick={exportToJSON}
              title="Export as JSON"
              className="flex items-center gap-1 text-xs px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-600"
            >
              <FileText size={12} className="text-green-500" />
              JSON
            </button>

            {/* Global Search */}

            {scale < 1.2 && (
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-8 pr-8 py-1 text-xs w-44 sm:w-56 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-white"
                />
                {globalFilter && (
                  <button
                    onClick={() => setGlobalFilter("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        {sortedData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Search size={48} className="mx-auto mb-4 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">
                {emptyMessage}
              </p>
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter("")}
                  className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-xs"
                >
                  Clear search to see all data
                </button>
              )}
            </div>
          </div>
        ) : (
          <table className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-700/60 backdrop-blur-sm sticky top-0 z-10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-2 py-1 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-300 dark:border-slate-600 ${
                      column.sortable !== false
                        ? "cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-600/40 group transition-all"
                        : ""
                    }`}
                    style={{ width: column.width }}
                    onClick={() =>
                      column.sortable !== false && handleSort(column.key)
                    }
                  >
                    <div
                      className={`flex items-center gap-1 ${
                        column.align === "center"
                          ? "justify-center"
                          : column.align === "right"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <span>{column.label}</span>
                      {column.sortable !== false &&
                        getSortIndicator(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
              {paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={`transition-all duration-150 border hover:bg-slate-50 dark:hover:bg-slate-700 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-2 py-1 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 ${
                        column.align === "center"
                          ? "text-center"
                          : column.align === "right"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {column.render ? (
                        column.render(row[column.key], row)
                      ) : (
                        <span
                          className="truncate block max-w-[180px]"
                          title={String(row[column.key])}
                        >
                          {row[column.key]}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-b-xl text-xs text-slate-600 dark:text-slate-400">
          {/* Results Range Text */}
          <span>
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length}
          </span>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded-md transition-all font-medium flex items-center gap-1
          bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600
          disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={12} />
            </button>

            {/* Page Numbers (max 5) */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum =
                Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-all
              ${
                currentPage === pageNum
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
              }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded-md transition-all font-medium flex items-center gap-1
          bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600
          disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
