import React, { useState } from 'react';
import {
  Database,
  Table,
  Eye,
  Zap,
  Hash,
  ChevronRight,
  ChevronDown,
  Plus,
  RefreshCw,
  Key,
  Link,
  Circle
} from 'lucide-react';
import { DatabaseConnection, Schema } from '../../../types/database';

interface DatabaseTreeProps {
  connections: DatabaseConnection[];
  schemas: Schema[];
  activeConnection: DatabaseConnection | null;
  onConnectionSelect: (connection: DatabaseConnection) => void;
}

export function DatabaseTree({ connections, schemas, activeConnection, onConnectionSelect }: DatabaseTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['connections', 'schemas']));
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const isExpanded = (nodeId: string) => expandedNodes.has(nodeId);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Database size={16} className="text-blue-500" />
          Database Explorer
        </h2>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Connections */}
        <div>
          <div
            className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer text-sm font-medium transition-all duration-150 text-slate-700 dark:text-slate-300"
            onClick={() => toggleExpanded('connections')}
          >
            {isExpanded('connections') ? 
              <ChevronDown size={16} className="text-slate-500" /> : 
              <ChevronRight size={16} className="text-slate-500" />
            }
            <Database size={16} className="text-blue-500" />
            <span>Connections</span>
            <div className="ml-auto bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium">
              {connections.length}
            </div>
          </div>

          {isExpanded('connections') && (
            <div className="ml-4 mt-1 space-y-1">
              {connections.map(conn => (
                <div
                  key={conn.id}
                  className={`flex items-center gap-3 px-3 py-2 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer text-sm group transition-all duration-150 ${
                    activeConnection?.id === conn.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800' : 'text-slate-600 dark:text-slate-400'
                  }`}
                  onClick={() => onConnectionSelect(conn)}
                  onMouseEnter={() => setHoveredItem(conn.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className={`w-2 h-2 rounded-full ${conn.isConnected ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-red-500 shadow-sm shadow-red-500/50'}`} />
                  <span className="flex-1 truncate font-medium">{conn.label}</span>
                  {hoveredItem === conn.id && (
                    <RefreshCw size={12} className="opacity-50 hover:opacity-100 transition-opacity" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schemas (only show if connected) */}
        {activeConnection?.isConnected && (
          <div>
            <div
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer text-sm font-medium transition-all duration-150 text-slate-700 dark:text-slate-300"
              onClick={() => toggleExpanded('schemas')}
            >
              {isExpanded('schemas') ? 
                <ChevronDown size={16} className="text-slate-500" /> : 
                <ChevronRight size={16} className="text-slate-500" />
              }
              <Database size={16} className="text-purple-500" />
              <span>Schemas</span>
              <div className="ml-auto bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium">
                {schemas.length}
              </div>
            </div>

            {isExpanded('schemas') && (
              <div className="ml-4 mt-1 space-y-1">
                {schemas.map(schema => (
                  <div key={schema.name}>
                    <div
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer text-sm transition-all duration-150 text-slate-600 dark:text-slate-400"
                      onClick={() => toggleExpanded(`schema-${schema.name}`)}
                    >
                      {isExpanded(`schema-${schema.name}`) ? 
                        <ChevronDown size={14} className="text-slate-500" /> : 
                        <ChevronRight size={14} className="text-slate-500" />
                      }
                      <Circle size={8} className="text-purple-400 fill-current" />
                      <span className="flex-1 font-medium">{schema.name}</span>
                    </div>

                    {isExpanded(`schema-${schema.name}`) && (
                      <div className="ml-4 space-y-1">
                        {/* Tables */}
                        <div
                          className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 group transition-all duration-150"
                          onClick={() => toggleExpanded(`tables-${schema.name}`)}
                          onMouseEnter={() => setHoveredItem(`tables-${schema.name}`)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          {isExpanded(`tables-${schema.name}`) ? 
                            <ChevronDown size={12} className="text-slate-500" /> : 
                            <ChevronRight size={12} className="text-slate-500" />
                          }
                          <Table size={12} className="text-green-500" />
                          <span>Tables</span>
                          <div className="ml-auto flex items-center gap-1">
                            <span className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs px-1.5 py-0.5 rounded font-medium">
                              {schema.tables.length}
                            </span>
                            {hoveredItem === `tables-${schema.name}` && (
                              <Plus size={10} className="opacity-50 hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </div>

                        {isExpanded(`tables-${schema.name}`) && (
                          <div className="ml-4 space-y-0.5">
                            {schema.tables.map(table => (
                              <div key={table.name}>
                                <div
                                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer text-xs group transition-all duration-150 text-slate-600 dark:text-slate-400"
                                  onClick={() => toggleExpanded(`table-${schema.name}-${table.name}`)}
                                  onMouseEnter={() => setHoveredItem(`table-${schema.name}-${table.name}`)}
                                  onMouseLeave={() => setHoveredItem(null)}
                                >
                                  {isExpanded(`table-${schema.name}-${table.name}`) ? 
                                    <ChevronDown size={10} className="text-slate-500" /> : 
                                    <ChevronRight size={10} className="text-slate-500" />
                                  }
                                  <Table size={10} className="text-green-400" />
                                  <span className="flex-1 font-medium">{table.name}</span>
                                  <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                    {table.rowCount?.toLocaleString()}
                                  </span>
                                </div>

                                {isExpanded(`table-${schema.name}-${table.name}`) && (
                                  <div className="ml-4 space-y-0.5">
                                    {table.columns.map(column => (
                                      <div
                                        key={column.name}
                                        className="flex items-center gap-2 px-3 py-1 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded text-xs transition-all duration-150 text-slate-500 dark:text-slate-500"
                                      >
                                        {column.isPrimaryKey ? (
                                          <Key size={8} className="text-yellow-500" />
                                        ) : column.isForeignKey ? (
                                          <Link size={8} className="text-blue-500" />
                                        ) : (
                                          <Circle size={6} className="text-slate-400" />
                                        )}
                                        <span className="flex-1 font-medium">{column.name}</span>
                                        <span className="text-slate-400 text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                          {column.type}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Views */}
                        <div
                          className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 transition-all duration-150"
                          onClick={() => toggleExpanded(`views-${schema.name}`)}
                        >
                          {isExpanded(`views-${schema.name}`) ? 
                            <ChevronDown size={12} className="text-slate-500" /> : 
                            <ChevronRight size={12} className="text-slate-500" />
                          }
                          <Eye size={12} className="text-blue-500" />
                          <span>Views</span>
                          <div className="ml-auto bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs px-1.5 py-0.5 rounded font-medium">
                            {schema.views.length}
                          </div>
                        </div>

                        {isExpanded(`views-${schema.name}`) && (
                          <div className="ml-4 space-y-0.5">
                            {schema.views.map(view => (
                              <div
                                key={view.name}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer text-xs transition-all duration-150 text-slate-600 dark:text-slate-400"
                              >
                                <Eye size={10} className="text-blue-400" />
                                <span className="font-medium">{view.name}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Functions */}
                        <div
                          className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 transition-all duration-150"
                          onClick={() => toggleExpanded(`functions-${schema.name}`)}
                        >
                          {isExpanded(`functions-${schema.name}`) ? 
                            <ChevronDown size={12} className="text-slate-500" /> : 
                            <ChevronRight size={12} className="text-slate-500" />
                          }
                          <Zap size={12} className="text-orange-500" />
                          <span>Functions</span>
                          <div className="ml-auto bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs px-1.5 py-0.5 rounded font-medium">
                            {schema.functions.length}
                          </div>
                        </div>

                        {isExpanded(`functions-${schema.name}`) && (
                          <div className="ml-4 space-y-0.5">
                            {schema.functions.map(func => (
                              <div
                                key={func.name}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer text-xs transition-all duration-150 text-slate-600 dark:text-slate-400"
                              >
                                <Zap size={10} className="text-orange-400" />
                                <span className="font-medium">{func.name}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Sequences */}
                        <div
                          className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 transition-all duration-150"
                          onClick={() => toggleExpanded(`sequences-${schema.name}`)}
                        >
                          {isExpanded(`sequences-${schema.name}`) ? 
                            <ChevronDown size={12} className="text-slate-500" /> : 
                            <ChevronRight size={12} className="text-slate-500" />
                          }
                          <Hash size={12} className="text-purple-500" />
                          <span>Sequences</span>
                          <div className="ml-auto bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs px-1.5 py-0.5 rounded font-medium">
                            {schema.sequences.length}
                          </div>
                        </div>

                        {isExpanded(`sequences-${schema.name}`) && (
                          <div className="ml-4 space-y-0.5">
                            {schema.sequences.map(seq => (
                              <div
                                key={seq.name}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer text-xs transition-all duration-150 text-slate-600 dark:text-slate-400"
                              >
                                <Hash size={10} className="text-purple-400" />
                                <span className="flex-1 font-medium">{seq.name}</span>
                                <span className="text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs">
                                  {seq.currentValue}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}