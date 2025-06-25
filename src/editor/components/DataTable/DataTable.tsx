import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  X, 
  Search,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface Column {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface DataTableProps {
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
  showPagination?: boolean;
  onRowClick?: (row: any) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
  className?: string;
}

export function DataTable({
  data,
  loading = false,
  emptyMessage = "No data available",
  pageSize = 50,
  showPagination = true,
  onRowClick,
  onSelectionChange,
  className = ""
}: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Generate columns dynamically from data
  const columns: Column[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    const firstRow = data[0];
    return Object.keys(firstRow).map(key => {
      const value = firstRow[key];
      let type: Column['type'] = 'text';
      
      // Determine column type based on value
      if (typeof value === 'number') {
        type = 'number';
      } else if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (value && typeof value === 'string') {
        // Check if it looks like a date
        if (value.match(/^\d{4}-\d{2}-\d{2}/) || value.includes('T') && value.includes('Z')) {
          type = 'date';
        }
      }

      return {
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        type,
        sortable: true,
        align: type === 'number' ? 'right' : 'left',
        render: (value) => {
          if (value === null || value === undefined) {
            return <span className="text-slate-400 italic bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">NULL</span>;
          }
          
          if (type === 'date' && value) {
            try {
              const date = new Date(value);
              return (
                <div className="text-sm">
                  <div className="text-slate-900 dark:text-slate-100 font-medium">
                    {date.toLocaleDateString()}
                  </div>
                  {value.includes('T') && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {date.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              );
            } catch {
              return <span className="font-mono text-sm">{String(value)}</span>;
            }
          }
          
          if (type === 'number') {
            return <span className="font-mono text-sm font-medium">{Number(value).toLocaleString()}</span>;
          }
          
          if (type === 'boolean') {
            return (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                value ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {value ? 'TRUE' : 'FALSE'}
              </span>
            );
          }
          
          const stringValue = String(value);
          if (stringValue.length > 50) {
            return (
              <div className="max-w-xs">
                <span className="truncate block" title={stringValue}>
                  {stringValue}
                </span>
              </div>
            );
          }
          
          return <span className="font-medium">{stringValue}</span>;
        }
      };
    });
  }, [data]);

  // Filter data based on global search
  const filteredData = useMemo(() => {
    if (!globalFilter) return data;

    return data.filter(row => {
      return Object.values(row).some(value => {
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
      else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === 'desc' ? -comparison : comparison;
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
    setSortConfig(prev => {
      if (prev?.key === columnKey) {
        if (prev.direction === 'asc') {
          return { key: columnKey, direction: 'desc' };
        } else {
          return null; // Remove sort
        }
      } else {
        return { key: columnKey, direction: 'asc' };
      }
    });
  }, []);

  // Handle row selection
  const handleRowSelection = useCallback((rowId: string, isSelected: boolean) => {
    setSelectedRows(prev => {
      const newSelection = new Set(prev);
      if (isSelected) {
        newSelection.add(rowId);
      } else {
        newSelection.delete(rowId);
      }
      
      if (onSelectionChange) {
        const selectedData = data.filter((row, index) => newSelection.has(String(index)));
        onSelectionChange(selectedData);
      }
      
      return newSelection;
    });
  }, [data, onSelectionChange]);

  // Select all rows
  const handleSelectAll = useCallback(() => {
    const allIds = paginatedData.map((_, index) => String((currentPage - 1) * pageSize + index));
    const isAllSelected = allIds.every(id => selectedRows.has(id));
    
    setSelectedRows(prev => {
      const newSelection = new Set(prev);
      if (isAllSelected) {
        allIds.forEach(id => newSelection.delete(id));
      } else {
        allIds.forEach(id => newSelection.add(id));
      }
      return newSelection;
    });
  }, [paginatedData, selectedRows, currentPage, pageSize]);

  // Get sort indicator for column
  const getSortIndicator = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <SortAsc size={14} className="text-blue-600 dark:text-blue-400" />
      : <SortDesc size={14} className="text-blue-600 dark:text-blue-400" />;
  };

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data, globalFilter]);

  if (loading) {
    return (
      <div className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-slate-600 dark:text-slate-400">Loading data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg flex flex-col h-full ${className}`}>
      {/* Header Controls */}
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-t-xl flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Query Results
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full font-medium">
              {sortedData.length} row{sortedData.length !== 1 ? 's' : ''}
              {globalFilter && ` (filtered from ${data.length})`}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Global Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search all columns..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white transition-all duration-200 w-64"
              />
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        {sortedData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Search size={48} className="mx-auto mb-4 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter('')}
                  className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  Clear search to see all data
                </button>
              )}
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50/80 dark:bg-slate-700/50 backdrop-blur-sm sticky top-0 z-10">
              <tr>
                {onSelectionChange && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={paginatedData.length > 0 && paginatedData.every((_, index) => 
                        selectedRows.has(String((currentPage - 1) * pageSize + index))
                      )}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                {columns.map(column => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider ${
                      column.sortable !== false ? 'cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-600/50 group transition-all duration-150' : ''
                    }`}
                    style={{ width: column.width }}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                  >
                    <div className={`flex items-center gap-2 ${
                      column.align === 'center' ? 'justify-center' : 
                      column.align === 'right' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{column.label}</span>
                      {column.sortable !== false && getSortIndicator(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm divide-y divide-slate-200/60 dark:divide-slate-700/60">
              {paginatedData.map((row, index) => {
                const rowId = String((currentPage - 1) * pageSize + index);
                const isSelected = selectedRows.has(rowId);
                
                return (
                  <tr
                    key={rowId}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-all duration-150 ${
                      isSelected ? 'bg-blue-50/80 dark:bg-blue-900/20' : ''
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {onSelectionChange && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRowSelection(rowId, e.target.checked);
                          }}
                          className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map(column => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-sm text-slate-900 dark:text-slate-100 ${
                          column.align === 'center' ? 'text-center' : 
                          column.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {column.render ? column.render(row[column.key], row) : (
                          <span className="truncate block max-w-xs" title={String(row[column.key])}>
                            {row[column.key]}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-b-xl flex-shrink-0">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 font-medium"
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 font-medium ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 font-medium"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}