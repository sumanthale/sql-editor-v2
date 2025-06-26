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

export interface TableColumn {
  name: string;
  dataType: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  defaultValue?: string;
  description?: string;
}

export interface TableIndex {
  name: string;
  type: 'PRIMARY' | 'UNIQUE' | 'INDEX' | 'FOREIGN';
  columns: string[];
  isUnique: boolean;
  description?: string;
}

export interface TableInfo {
  schemaName: string;
  tableName: string;
  columns: TableColumn[];
  indexes: TableIndex[];
  rowCount?: number;
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
  default_value?: string;
}

interface IndexData {
  index_name: string;
  index_type: 'PRIMARY' | 'UNIQUE' | 'INDEX' | 'FOREIGN';
  columns: string[];
  is_unique: boolean;
}

interface DatabaseTreeState {
  treeData: TreeNode[];
  expandedNodes: Set<string>;
  searchQuery: string;
  filteredTree: TreeNode[];
  
  // Bottom panel state
  selectedTable: TableInfo | null;
  isInfoPanelOpen: boolean;
  activeInfoTab: 'columns' | 'indexes';
  
  // Cache for API responses
  schemasCache: Map<string, {
    tables: string[];
    views: ViewData[];
    procedures: ProcedureData[];
    functions: FunctionData[];
    triggers: TriggerData[];
  }>;
  tableInfoCache: Map<string, TableInfo>; // key: schemaName.tableName
  
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
  loadTableInfo: (schemaName: string, tableName: string) => Promise<void>;
  onNodeSelect: (node: TreeNode) => void;
  loadNodeChildren: (nodeId: string, node: TreeNode) => Promise<void>;
  
  // Bottom panel actions
  setSelectedTable: (tableInfo: TableInfo | null) => void;
  setInfoPanelOpen: (isOpen: boolean) => void;
  setActiveInfoTab: (tab: 'columns' | 'indexes') => void;
  closeInfoPanel: () => void;
}

// Mock API functions - replace these with actual API calls
const mockApiDelay = () => new Promise(resolve => setTimeout(resolve, 800));

const mockGetSchemas = async (): Promise<ApiResponse<string[]>> => {
  await mockApiDelay();
  return {
    data: ['deptdb', 'empdb', 'public'],
    success: true
  };
};

const mockGetTables = async (schemaName: string): Promise<ApiResponse<string[]>> => {
  await mockApiDelay();
  
  if (schemaName === 'deptdb') {
    return {
      data: ['customers', 'department', 'employee', 'orders', 'products', 'products_ordered', 'salesperson'],
      success: true
    };
  }
  
  if (schemaName === 'empdb') {
    return {
      data: ['employees', 'departments', 'projects'],
      success: true
    };
  }
  
  if (schemaName === 'public') {
    return {
      data: ['users', 'sessions', 'logs'],
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
  
  if (schemaName === 'deptdb') {
    return {
      data: [
        {
          view_name: 'employee_summary',
          view_definition: 'SELECT e.id, e.name, d.department_name FROM employee e JOIN department d ON e.department_id = d.id'
        },
        {
          view_name: 'sales_report',
          view_definition: 'SELECT p.name, SUM(po.quantity) as total_sold FROM products p JOIN products_ordered po ON p.id = po.product_id GROUP BY p.name'
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
  
  if (schemaName === 'deptdb') {
    return {
      data: [
        {
          procedure_name: 'update_employee_department',
          procedure_definition: 'CREATE OR REPLACE PROCEDURE update_employee_department(emp_id INT, dept_id INT) AS $$ BEGIN UPDATE employee SET department_id = dept_id WHERE id = emp_id; END; $$ LANGUAGE plpgsql;'
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
  
  if (schemaName === 'deptdb') {
    return {
      data: [
        {
          function_name: 'get_employee_count',
          function_definition: 'CREATE OR REPLACE FUNCTION get_employee_count(dept_id INT) RETURNS INT AS $$ BEGIN RETURN (SELECT COUNT(*) FROM employee WHERE department_id = dept_id); END; $$ LANGUAGE plpgsql;',
          function_return: 'INT'
        },
        {
          function_name: 'calculate_total_sales',
          function_definition: 'CREATE OR REPLACE FUNCTION calculate_total_sales() RETURNS DECIMAL AS $$ BEGIN RETURN (SELECT SUM(total_amount) FROM orders WHERE status = \'completed\'); END; $$ LANGUAGE plpgsql;',
          function_return: 'DECIMAL'
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
  
  if (schemaName === 'deptdb') {
    return {
      data: [
        {
          trigger_name: 'update_employee_modified',
          trigger_definition: 'CREATE TRIGGER update_employee_modified BEFORE UPDATE ON employee FOR EACH ROW EXECUTE FUNCTION update_modified_column();',
          table_name: 'employee'
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

const mockGetTableInfo = async (schemaName: string, tableName: string): Promise<ApiResponse<{ columns: ColumnData[], indexes: IndexData[] }>> => {
  await mockApiDelay();
  
  const tableData: Record<string, { columns: ColumnData[], indexes: IndexData[] }> = {
    department: {
      columns: [
        { column_name: 'departmentid', data_type: 'int', nullable: false, is_primary_key: true },
        { column_name: 'departmentname', data_type: 'varchar(25)', nullable: false },
        { column_name: 'locationid', data_type: 'int', nullable: true }
      ],
      indexes: [
        { index_name: 'pk_department', index_type: 'PRIMARY', columns: ['departmentid'], is_unique: true },
        { index_name: 'idx_dept_name', index_type: 'INDEX', columns: ['departmentname'], is_unique: false },
        { index_name: 'fk_location', index_type: 'FOREIGN', columns: ['locationid'], is_unique: false }
      ]
    },
    employee: {
      columns: [
        { column_name: 'id', data_type: 'int', nullable: false, is_primary_key: true },
        { column_name: 'name', data_type: 'varchar(50)', nullable: false },
        { column_name: 'email', data_type: 'varchar(100)', nullable: false },
        { column_name: 'department_id', data_type: 'int', nullable: true, is_foreign_key: true },
        { column_name: 'salary', data_type: 'decimal(10,2)', nullable: true },
        { column_name: 'hire_date', data_type: 'date', nullable: false },
        { column_name: 'created_at', data_type: 'timestamp', nullable: false, default_value: 'CURRENT_TIMESTAMP' }
      ],
      indexes: [
        { index_name: 'pk_employee', index_type: 'PRIMARY', columns: ['id'], is_unique: true },
        { index_name: 'uk_employee_email', index_type: 'UNIQUE', columns: ['email'], is_unique: true },
        { index_name: 'idx_employee_dept', index_type: 'INDEX', columns: ['department_id'], is_unique: false },
        { index_name: 'fk_employee_dept', index_type: 'FOREIGN', columns: ['department_id'], is_unique: false }
      ]
    },
    customers: {
      columns: [
        { column_name: 'id', data_type: 'int', nullable: false, is_primary_key: true },
        { column_name: 'first_name', data_type: 'varchar(50)', nullable: false },
        { column_name: 'last_name', data_type: 'varchar(50)', nullable: false },
        { column_name: 'email', data_type: 'varchar(100)', nullable: false },
        { column_name: 'phone', data_type: 'varchar(20)', nullable: true },
        { column_name: 'created_at', data_type: 'timestamp', nullable: false }
      ],
      indexes: [
        { index_name: 'pk_customers', index_type: 'PRIMARY', columns: ['id'], is_unique: true },
        { index_name: 'uk_customer_email', index_type: 'UNIQUE', columns: ['email'], is_unique: true },
        { index_name: 'idx_customer_name', index_type: 'INDEX', columns: ['last_name', 'first_name'], is_unique: false }
      ]
    },
    orders: {
      columns: [
        { column_name: 'id', data_type: 'int', nullable: false, is_primary_key: true },
        { column_name: 'customer_id', data_type: 'int', nullable: false, is_foreign_key: true },
        { column_name: 'total_amount', data_type: 'decimal(10,2)', nullable: false },
        { column_name: 'status', data_type: 'varchar(20)', nullable: false, default_value: 'pending' },
        { column_name: 'order_date', data_type: 'date', nullable: false },
        { column_name: 'created_at', data_type: 'timestamp', nullable: false }
      ],
      indexes: [
        { index_name: 'pk_orders', index_type: 'PRIMARY', columns: ['id'], is_unique: true },
        { index_name: 'idx_orders_customer', index_type: 'INDEX', columns: ['customer_id'], is_unique: false },
        { index_name: 'idx_orders_date', index_type: 'INDEX', columns: ['order_date'], is_unique: false },
        { index_name: 'fk_orders_customer', index_type: 'FOREIGN', columns: ['customer_id'], is_unique: false }
      ]
    },
    products: {
      columns: [
        { column_name: 'id', data_type: 'int', nullable: false, is_primary_key: true },
        { column_name: 'name', data_type: 'varchar(100)', nullable: false },
        { column_name: 'price', data_type: 'decimal(10,2)', nullable: false },
        { column_name: 'description', data_type: 'text', nullable: true },
        { column_name: 'category_id', data_type: 'int', nullable: true, is_foreign_key: true },
        { column_name: 'in_stock', data_type: 'boolean', nullable: false, default_value: 'true' }
      ],
      indexes: [
        { index_name: 'pk_products', index_type: 'PRIMARY', columns: ['id'], is_unique: true },
        { index_name: 'idx_products_name', index_type: 'INDEX', columns: ['name'], is_unique: false },
        { index_name: 'idx_products_category', index_type: 'INDEX', columns: ['category_id'], is_unique: false }
      ]
    }
  };

  return {
    data: tableData[tableName] || { columns: [], indexes: [] },
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
    selectedTable: null,
    isInfoPanelOpen: false,
    activeInfoTab: 'columns',
    schemasCache: new Map(),
    tableInfoCache: new Map(),

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

    // Bottom panel actions
    setSelectedTable: (tableInfo: TableInfo | null) => {
      set({ selectedTable: tableInfo });
    },

    setInfoPanelOpen: (isOpen: boolean) => {
      set({ isInfoPanelOpen: isOpen });
    },

    setActiveInfoTab: (tab: 'columns' | 'indexes') => {
      set({ activeInfoTab: tab });
    },

    closeInfoPanel: () => {
      set({ 
        isInfoPanelOpen: false,
        selectedTable: null 
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
              hasChildren: false, // Tables don't have children in tree view
              isLoaded: true,
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
            name: 'Stored Procedures',
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
          }
        ];
        
        get().updateNodeChildren(nodeId, children);
        return;
      }

      try {
        get().setNodeLoading(nodeId, true);
        
        // Make all API calls in parallel
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
                hasChildren: false, // Tables don't have children in tree view
                isLoaded: true,
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
              name: 'Stored Procedures',
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
            }
          ];

          get().updateNodeChildren(nodeId, children);
        }
      } catch (error) {
        console.error('Failed to load schema contents:', error);
        get().setNodeLoading(nodeId, false);
      }
    },

    loadTableInfo: async (schemaName: string, tableName: string) => {
      const cacheKey = `${schemaName}.${tableName}`;
      const state = get();
      
      // Check if already cached
      if (state.tableInfoCache.has(cacheKey)) {
        const cached = state.tableInfoCache.get(cacheKey)!;
        get().setSelectedTable(cached);
        get().setInfoPanelOpen(true);
        return;
      }

      try {
        const response = await mockGetTableInfo(schemaName, tableName);
        
        if (response.success) {
          const tableInfo: TableInfo = {
            schemaName,
            tableName,
            columns: response.data.columns.map(col => ({
              name: col.column_name,
              dataType: col.data_type,
              nullable: col.nullable,
              isPrimaryKey: col.is_primary_key,
              isForeignKey: col.is_foreign_key,
              defaultValue: col.default_value
            })),
            indexes: response.data.indexes.map(idx => ({
              name: idx.index_name,
              type: idx.index_type,
              columns: idx.columns,
              isUnique: idx.is_unique
            }))
          };
          
          // Cache the results
          state.tableInfoCache.set(cacheKey, tableInfo);
          
          get().setSelectedTable(tableInfo);
          get().setInfoPanelOpen(true);
        }
      } catch (error) {
        console.error('Failed to load table info:', error);
      }
    },

    onNodeSelect: (node: TreeNode) => {
      if (node.type === 'table' && node.metadata?.schemaName && node.metadata?.tableName) {
        // Load table info and show in bottom panel
        get().loadTableInfo(node.metadata.schemaName, node.metadata.tableName);
        return;
      }

      let definition = '';
      
      switch (node.type) {
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
        }
      } catch (error) {
        console.error('Failed to load node children:', error);
        get().setNodeLoading(nodeId, false);
      }
    }
  }))
);