import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface TreeNode {
  id: string;
  name: string;
  type: 'schema' | 'table' | 'view' | 'function' | 'procedure' | 'trigger' | 'column' | 'folder';
  children?: TreeNode[];
  hasChildren?: boolean;
  isLoaded?: boolean;
  isLoading?: boolean;
  metadata?: {
    dataType?: string;
    nullable?: boolean;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    description?: string;
    definition?: string;
    returnType?: string;
    schemaName?: string;
    tableName?: string;
  };
}

interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

interface ViewData {
  view_name: string;
  view_definition: string;
}

interface ProcedureData {
  procedure_name: string;
  procedure_definition: string;
}

interface FunctionData {
  function_name: string;
  function_definition: string;
  function_return: string;
}

interface TriggerData {
  trigger_name: string;
  trigger_definition: string;
  table_name: string;
}

interface ColumnData {
  column_name: string;
  data_type: string;
  nullable: boolean;
  is_primary_key?: boolean;
  is_foreign_key?: boolean;
}

interface DatabaseTreeState {
  treeData: TreeNode[];
  expandedNodes: Set<string>;
  searchQuery: string;
  filteredTree: TreeNode[];
  
  // Cache for API responses
  schemasCache: Map<string, {
    tables: string[];
    views: ViewData[];
    procedures: ProcedureData[];
    functions: FunctionData[];
    triggers: TriggerData[];
  }>;
  columnsCache: Map<string, ColumnData[]>; // key: schemaName.tableName
  
  // Actions
  setSearchQuery: (query: string) => void;
  toggleNode: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  collapseNodeAndChildren: (nodeId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  setTreeData: (data: TreeNode[]) => void;
  updateNodeChildren: (nodeId: string, children: TreeNode[]) => void;
  setNodeLoading: (nodeId: string, isLoading: boolean) => void;
  loadSchemas: () => Promise<void>;
  loadSchemaContents: (schemaName: string) => Promise<void>;
  loadTableColumns: (schemaName: string, tableName: string) => Promise<void>;
  onNodeSelect: (node: TreeNode) => void;
}

// Mock API functions - replace these with actual API calls
const mockApiDelay = () => new Promise(resolve => setTimeout(resolve, 800));

const mockGetSchemas = async (): Promise<ApiResponse<string[]>> => {
  await mockApiDelay();
  return {
    data: ['public', 'information_schema', 'pg_catalog'],
    success: true
  };
};

const mockGetTables = async (schemaName: string): Promise<ApiResponse<string[]>> => {
  await mockApiDelay();
  
  if (schemaName === 'public') {
    return {
      data: ['users', 'orders', 'products', 'categories', 'order_items', 'customers'],
      success: true
    };
  }
  
  return {
    data: [],
    success: true
  };
};

const mockGetViews = async (schemaName: string): Promise<ApiResponse<ViewData[]>> => {
  await mockApiDelay();
  
  if (schemaName === 'public') {
    return {
      data: [
        {
          view_name: 'user_orders_summary',
          view_definition: 'SELECT u.id, u.name, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id, u.name'
        },
        {
          view_name: 'monthly_sales',
          view_definition: 'SELECT DATE_TRUNC(\'month\', order_date) as month, SUM(total_amount) as total_sales FROM orders GROUP BY DATE_TRUNC(\'month\', order_date)'
        }
      ],
      success: true
    };
  }
  
  return {
    data: [],
    success: true
  };
};

const mockGetProcedures = async (schemaName: string): Promise<ApiResponse<ProcedureData[]>> => {
  await mockApiDelay();
  
  if (schemaName === 'public') {
    return {
      data: [
        {
          procedure_name: 'update_user_status',
          procedure_definition: 'CREATE OR REPLACE PROCEDURE update_user_status(user_id INT, new_status VARCHAR) AS $$ BEGIN UPDATE users SET status = new_status WHERE id = user_id; END; $$ LANGUAGE plpgsql;'
        },
        {
          procedure_name: 'process_order',
          procedure_definition: 'CREATE OR REPLACE PROCEDURE process_order(order_id INT) AS $$ BEGIN UPDATE orders SET status = \'processed\' WHERE id = order_id; END; $$ LANGUAGE plpgsql;'
        }
      ],
      success: true
    };
  }
  
  return {
    data: [],
    success: true
  };
};

const mockGetFunctions = async (schemaName: string): Promise<ApiResponse<FunctionData[]>> => {
  await mockApiDelay();
  
  if (schemaName === 'public') {
    return {
      data: [
        {
          function_name: 'calculate_total_revenue',
          function_definition: 'CREATE OR REPLACE FUNCTION calculate_total_revenue() RETURNS DECIMAL AS $$ BEGIN RETURN (SELECT SUM(total_amount) FROM orders WHERE status = \'completed\'); END; $$ LANGUAGE plpgsql;',
          function_return: 'DECIMAL'
        },
        {
          function_name: 'get_user_orders',
          function_definition: 'CREATE OR REPLACE FUNCTION get_user_orders(user_id INT) RETURNS TABLE(order_id INT, total_amount DECIMAL, order_date DATE) AS $$ BEGIN RETURN QUERY SELECT id, total_amount, order_date FROM orders WHERE user_id = $1; END; $$ LANGUAGE plpgsql;',
          function_return: 'TABLE'
        }
      ],
      success: true
    };
  }
  
  return {
    data: [],
    success: true
  };
};

const mockGetTriggers = async (schemaName: string): Promise<ApiResponse<TriggerData[]>> => {
  await mockApiDelay();
  
  if (schemaName === 'public') {
    return {
      data: [
        {
          trigger_name: 'update_modified_time',
          trigger_definition: 'CREATE TRIGGER update_modified_time BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();',
          table_name: 'users'
        },
        {
          trigger_name: 'log_order_changes',
          trigger_definition: 'CREATE TRIGGER log_order_changes AFTER INSERT OR UPDATE OR DELETE ON orders FOR EACH ROW EXECUTE FUNCTION log_changes();',
          table_name: 'orders'
        }
      ],
      success: true
    };
  }
  
  return {
    data: [],
    success: true
  };
};

const mockGetTableColumns = async (schemaName: string, tableName: string): Promise<ApiResponse<ColumnData[]>> => {
  await mockApiDelay();
  
  const columnData: Record<string, ColumnData[]> = {
    users: [
      { column_name: 'id', data_type: 'integer', nullable: false, is_primary_key: true },
      { column_name: 'email', data_type: 'varchar(255)', nullable: false },
      { column_name: 'name', data_type: 'varchar(100)', nullable: false },
      { column_name: 'age', data_type: 'integer', nullable: true },
      { column_name: 'is_active', data_type: 'boolean', nullable: false },
      { column_name: 'created_at', data_type: 'timestamp', nullable: false },
      { column_name: 'updated_at', data_type: 'timestamp', nullable: true }
    ],
    orders: [
      { column_name: 'id', data_type: 'integer', nullable: false, is_primary_key: true },
      { column_name: 'user_id', data_type: 'integer', nullable: false, is_foreign_key: true },
      { column_name: 'total_amount', data_type: 'decimal(10,2)', nullable: false },
      { column_name: 'status', data_type: 'varchar(50)', nullable: false },
      { column_name: 'order_date', data_type: 'date', nullable: false },
      { column_name: 'created_at', data_type: 'timestamp', nullable: false }
    ],
    products: [
      { column_name: 'id', data_type: 'integer', nullable: false, is_primary_key: true },
      { column_name: 'name', data_type: 'varchar(255)', nullable: false },
      { column_name: 'price', data_type: 'decimal(10,2)', nullable: false },
      { column_name: 'description', data_type: 'text', nullable: true },
      { column_name: 'category_id', data_type: 'integer', nullable: false, is_foreign_key: true },
      { column_name: 'in_stock', data_type: 'boolean', nullable: false },
      { column_name: 'created_at', data_type: 'timestamp', nullable: false }
    ]
  };

  return {
    data: columnData[tableName] || [],
    success: true
  };
};

// Filter tree function
const filterTree = (nodes: TreeNode[], query: string): TreeNode[] => {
  if (!query.trim()) return nodes;

  const searchLower = query.toLowerCase();
  
  const filterNode = (node: TreeNode): TreeNode | null => {
    const nameMatches = node.name.toLowerCase().includes(searchLower);
    
    let filteredChildren: TreeNode[] = [];
    if (node.children && node.isLoaded) {
      filteredChildren = node.children
        .map(filterNode)
        .filter((child): child is TreeNode => child !== null);
    }
    
    if (nameMatches || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children
      };
    }
    
    return null;
  };

  return nodes
    .map(filterNode)
    .filter((node): node is TreeNode => node !== null);
};

// Get all node IDs recursively
const getAllNodeIds = (nodes: TreeNode[]): string[] => {
  const ids: string[] = [];
  
  const traverse = (node: TreeNode) => {
    ids.push(node.id);
    if (node.children && node.isLoaded) {
      node.children.forEach(traverse);
    }
  };
  
  nodes.forEach(traverse);
  return ids;
};

// Get all child node IDs recursively
const getAllChildNodeIds = (node: TreeNode): string[] => {
  const ids: string[] = [];
  
  const traverse = (currentNode: TreeNode) => {
    if (currentNode.children) {
      currentNode.children.forEach(child => {
        ids.push(child.id);
        traverse(child);
      });
    }
  };
  
  traverse(node);
  return ids;
};

export const useDatabaseTreeStore = create<DatabaseTreeState>()(
  subscribeWithSelector((set, get) => ({
    treeData: [],
    expandedNodes: new Set(),
    searchQuery: '',
    filteredTree: [],
    schemasCache: new Map(),
    columnsCache: new Map(),

    setSearchQuery: (query: string) => {
      set((state) => {
        const filteredTree = filterTree(state.treeData, query);
        return {
          searchQuery: query,
          filteredTree,
          expandedNodes: query.trim() 
            ? new Set([...state.expandedNodes, ...getAllNodeIds(filteredTree)])
            : state.expandedNodes
        };
      });
    },

    toggleNode: async (nodeId: string) => {
      const state = get();
      const isExpanded = state.expandedNodes.has(nodeId);
      
      if (isExpanded) {
        // Collapse node and all its children
        get().collapseNodeAndChildren(nodeId);
      } else {
        // Expand node
        set((state) => ({
          expandedNodes: new Set([...state.expandedNodes, nodeId])
        }));

        // Load children if not loaded
        const findNode = (nodes: TreeNode[], id: string): TreeNode | null => {
          for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
              const found = findNode(node.children, id);
              if (found) return found;
            }
          }
          return null;
        };

        const node = findNode(state.treeData, nodeId);
        if (node && node.hasChildren && !node.isLoaded && !node.isLoading) {
          await get().loadNodeChildren(nodeId, node);
        }
      }
    },

    expandNode: (nodeId: string) => {
      set((state) => ({
        expandedNodes: new Set([...state.expandedNodes, nodeId])
      }));
    },

    collapseNode: (nodeId: string) => {
      set((state) => {
        const newExpanded = new Set(state.expandedNodes);
        newExpanded.delete(nodeId);
        return { expandedNodes: newExpanded };
      });
    },

    collapseNodeAndChildren: (nodeId: string) => {
      set((state) => {
        const findNode = (nodes: TreeNode[], id: string): TreeNode | null => {
          for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
              const found = findNode(node.children, id);
              if (found) return found;
            }
          }
          return null;
        };

        const node = findNode(state.treeData, nodeId);
        const newExpanded = new Set(state.expandedNodes);
        
        // Remove the node itself
        newExpanded.delete(nodeId);
        
        // Remove all child nodes
        if (node) {
          const childIds = getAllChildNodeIds(node);
          childIds.forEach(id => newExpanded.delete(id));
        }
        
        return { expandedNodes: newExpanded };
      });
    },

    expandAll: () => {
      set((state) => ({
        expandedNodes: new Set(getAllNodeIds(state.treeData))
      }));
    },

    collapseAll: () => {
      set({ expandedNodes: new Set() });
    },

    setTreeData: (data: TreeNode[]) => {
      set((state) => ({
        treeData: data,
        filteredTree: filterTree(data, state.searchQuery)
      }));
    },

    updateNodeChildren: (nodeId: string, children: TreeNode[]) => {
      set((state) => {
        const updateNode = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map(node => {
            if (node.id === nodeId) {
              return {
                ...node,
                children,
                isLoaded: true,
                isLoading: false,
                hasChildren: children.length > 0
              };
            }
            if (node.children) {
              return {
                ...node,
                children: updateNode(node.children)
              };
            }
            return node;
          });
        };

        const newTreeData = updateNode(state.treeData);
        return {
          treeData: newTreeData,
          filteredTree: filterTree(newTreeData, state.searchQuery)
        };
      });
    },

    setNodeLoading: (nodeId: string, isLoading: boolean) => {
      set((state) => {
        const updateNode = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map(node => {
            if (node.id === nodeId) {
              return { ...node, isLoading };
            }
            if (node.children) {
              return {
                ...node,
                children: updateNode(node.children)
              };
            }
            return node;
          });
        };

        const newTreeData = updateNode(state.treeData);
        return {
          treeData: newTreeData,
          filteredTree: filterTree(newTreeData, state.searchQuery)
        };
      });
    },

    // API Methods
    loadSchemas: async () => {
      try {
        const response = await mockGetSchemas();
        if (response.success) {
          const schemas: TreeNode[] = response.data.map(schemaName => ({
            id: `schema-${schemaName}`,
            name: schemaName,
            type: 'schema',
            hasChildren: true,
            isLoaded: false,
            children: []
          }));
          get().setTreeData(schemas);
        }
      } catch (error) {
        console.error('Failed to load schemas:', error);
      }
    },

    loadSchemaContents: async (schemaName: string) => {
      const nodeId = `schema-${schemaName}`;
      const state = get();
      
      // Check if already cached
      if (state.schemasCache.has(schemaName)) {
        const cached = state.schemasCache.get(schemaName)!;
        const children = [
          {
            id: `folder-tables-${schemaName}`,
            name: 'Tables',
            type: 'folder' as const,
            hasChildren: cached.tables.length > 0,
            isLoaded: true,
            metadata: { schemaName },
            children: cached.tables.map(tableName => ({
              id: `table-${schemaName}-${tableName}`,
              name: tableName,
              type: 'table' as const,
              hasChildren: true,
              isLoaded: false,
              metadata: { schemaName, tableName },
              children: []
            }))
          },
          {
            id: `folder-views-${schemaName}`,
            name: 'Views',
            type: 'folder' as const,
            hasChildren: cached.views.length > 0,
            isLoaded: true,
            metadata: { schemaName },
            children: cached.views.map(view => ({
              id: `view-${schemaName}-${view.view_name}`,
              name: view.view_name,
              type: 'view' as const,
              hasChildren: false,
              isLoaded: true,
              metadata: { schemaName, definition: view.view_definition },
              children: []
            }))
          },
          {
            id: `folder-procedures-${schemaName}`,
            name: 'Procedures',
            type: 'folder' as const,
            hasChildren: cached.procedures.length > 0,
            isLoaded: true,
            metadata: { schemaName },
            children: cached.procedures.map(proc => ({
              id: `procedure-${schemaName}-${proc.procedure_name}`,
              name: proc.procedure_name,
              type: 'procedure' as const,
              hasChildren: false,
              isLoaded: true,
              metadata: { schemaName, definition: proc.procedure_definition },
              children: []
            }))
          },
          {
            id: `folder-functions-${schemaName}`,
            name: 'Functions',
            type: 'folder' as const,
            hasChildren: cached.functions.length > 0,
            isLoaded: true,
            metadata: { schemaName },
            children: cached.functions.map(func => ({
              id: `function-${schemaName}-${func.function_name}`,
              name: func.function_name,
              type: 'function' as const,
              hasChildren: false,
              isLoaded: true,
              metadata: { 
                schemaName, 
                definition: func.function_definition,
                returnType: func.function_return
              },
              children: []
            }))
          },
          {
            id: `folder-triggers-${schemaName}`,
            name: 'Triggers',
            type: 'folder' as const,
            hasChildren: cached.triggers.length > 0,
            isLoaded: true,
            metadata: { schemaName },
            children: cached.triggers.map(trigger => ({
              id: `trigger-${schemaName}-${trigger.trigger_name}`,
              name: trigger.trigger_name,
              type: 'trigger' as const,
              hasChildren: false,
              isLoaded: true,
              metadata: { 
                schemaName, 
                definition: trigger.trigger_definition,
                tableName: trigger.table_name
              },
              children: []
            }))
          }
        ];
        
        get().updateNodeChildren(nodeId, children);
        return;
      }

      try {
        get().setNodeLoading(nodeId, true);
        
        // Make all 5 API calls in parallel
        const [tablesRes, viewsRes, proceduresRes, functionsRes, triggersRes] = await Promise.all([
          mockGetTables(schemaName),
          mockGetViews(schemaName),
          mockGetProcedures(schemaName),
          mockGetFunctions(schemaName),
          mockGetTriggers(schemaName)
        ]);

        if (tablesRes.success && viewsRes.success && proceduresRes.success && functionsRes.success && triggersRes.success) {
          // Cache the results
          state.schemasCache.set(schemaName, {
            tables: tablesRes.data,
            views: viewsRes.data,
            procedures: proceduresRes.data,
            functions: functionsRes.data,
            triggers: triggersRes.data
          });

          // Create tree structure
          const children = [
            {
              id: `folder-tables-${schemaName}`,
              name: 'Tables',
              type: 'folder' as const,
              hasChildren: tablesRes.data.length > 0,
              isLoaded: true,
              metadata: { schemaName },
              children: tablesRes.data.map(tableName => ({
                id: `table-${schemaName}-${tableName}`,
                name: tableName,
                type: 'table' as const,
                hasChildren: true,
                isLoaded: false,
                metadata: { schemaName, tableName },
                children: []
              }))
            },
            {
              id: `folder-views-${schemaName}`,
              name: 'Views',
              type: 'folder' as const,
              hasChildren: viewsRes.data.length > 0,
              isLoaded: true,
              metadata: { schemaName },
              children: viewsRes.data.map(view => ({
                id: `view-${schemaName}-${view.view_name}`,
                name: view.view_name,
                type: 'view' as const,
                hasChildren: false,
                isLoaded: true,
                metadata: { schemaName, definition: view.view_definition },
                children: []
              }))
            },
            {
              id: `folder-procedures-${schemaName}`,
              name: 'Procedures',
              type: 'folder' as const,
              hasChildren: proceduresRes.data.length > 0,
              isLoaded: true,
              metadata: { schemaName },
              children: proceduresRes.data.map(proc => ({
                id: `procedure-${schemaName}-${proc.procedure_name}`,
                name: proc.procedure_name,
                type: 'procedure' as const,
                hasChildren: false,
                isLoaded: true,
                metadata: { schemaName, definition: proc.procedure_definition },
                children: []
              }))
            },
            {
              id: `folder-functions-${schemaName}`,
              name: 'Functions',
              type: 'folder' as const,
              hasChildren: functionsRes.data.length > 0,
              isLoaded: true,
              metadata: { schemaName },
              children: functionsRes.data.map(func => ({
                id: `function-${schemaName}-${func.function_name}`,
                name: func.function_name,
                type: 'function' as const,
                hasChildren: false,
                isLoaded: true,
                metadata: { 
                  schemaName, 
                  definition: func.function_definition,
                  returnType: func.function_return
                },
                children: []
              }))
            },
            {
              id: `folder-triggers-${schemaName}`,
              name: 'Triggers',
              type: 'folder' as const,
              hasChildren: triggersRes.data.length > 0,
              isLoaded: true,
              metadata: { schemaName },
              children: triggersRes.data.map(trigger => ({
                id: `trigger-${schemaName}-${trigger.trigger_name}`,
                name: trigger.trigger_name,
                type: 'trigger' as const,
                hasChildren: false,
                isLoaded: true,
                metadata: { 
                  schemaName, 
                  definition: trigger.trigger_definition,
                  tableName: trigger.table_name
                },
                children: []
              }))
            }
          ];

          get().updateNodeChildren(nodeId, children);
        }
      } catch (error) {
        console.error('Failed to load schema contents:', error);
        get().setNodeLoading(nodeId, false);
      }
    },

    loadTableColumns: async (schemaName: string, tableName: string) => {
      const nodeId = `table-${schemaName}-${tableName}`;
      const cacheKey = `${schemaName}.${tableName}`;
      const state = get();
      
      // Check if already cached
      if (state.columnsCache.has(cacheKey)) {
        const cached = state.columnsCache.get(cacheKey)!;
        const children = cached.map(col => ({
          id: `column-${schemaName}-${tableName}-${col.column_name}`,
          name: col.column_name,
          type: 'column' as const,
          hasChildren: false,
          isLoaded: true,
          metadata: {
            dataType: col.data_type,
            nullable: col.nullable,
            isPrimaryKey: col.is_primary_key,
            isForeignKey: col.is_foreign_key,
            schemaName,
            tableName
          },
          children: []
        }));
        
        get().updateNodeChildren(nodeId, children);
        return;
      }

      try {
        get().setNodeLoading(nodeId, true);
        const response = await mockGetTableColumns(schemaName, tableName);
        
        if (response.success) {
          // Cache the results
          state.columnsCache.set(cacheKey, response.data);
          
          const children = response.data.map(col => ({
            id: `column-${schemaName}-${tableName}-${col.column_name}`,
            name: col.column_name,
            type: 'column' as const,
            hasChildren: false,
            isLoaded: true,
            metadata: {
              dataType: col.data_type,
              nullable: col.nullable,
              isPrimaryKey: col.is_primary_key,
              isForeignKey: col.is_foreign_key,
              schemaName,
              tableName
            },
            children: []
          }));
          
          get().updateNodeChildren(nodeId, children);
        }
      } catch (error) {
        console.error('Failed to load table columns:', error);
        get().setNodeLoading(nodeId, false);
      }
    },

    onNodeSelect: (node: TreeNode) => {
      let definition = '';
      
      switch (node.type) {
        case 'table':
          if (node.metadata?.schemaName && node.metadata?.tableName) {
            definition = `SELECT * FROM ${node.metadata.schemaName}.${node.metadata.tableName};`;
          }
          break;
        case 'view':
        case 'procedure':
        case 'function':
        case 'trigger':
          definition = node.metadata?.definition || '';
          break;
        default:
          return;
      }
      
      // Dispatch custom event to update editor
      window.dispatchEvent(new CustomEvent('insertDefinition', { 
        detail: { definition } 
      }));
    },

    // Helper method to load node children based on node type
    loadNodeChildren: async (nodeId: string, node: TreeNode) => {
      try {
        get().setNodeLoading(nodeId, true);

        if (node.type === 'schema') {
          await get().loadSchemaContents(node.name);
        } else if (node.type === 'table') {
          const { schemaName, tableName } = node.metadata || {};
          if (schemaName && tableName) {
            await get().loadTableColumns(schemaName, tableName);
          }
        }
      } catch (error) {
        console.error('Failed to load node children:', error);
        get().setNodeLoading(nodeId, false);
      }
    }
  }))
);