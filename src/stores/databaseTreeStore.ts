import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface TreeNode {
  id: string;
  name: string;
  type: 'schema' | 'table' | 'view' | 'function' | 'sequence' | 'column' | 'index' | 'foreign_key' | 'check' | 'folder';
  children?: TreeNode[];
  hasChildren?: boolean; // Indicates if node can have children (for lazy loading)
  isLoaded?: boolean; // Indicates if children have been loaded
  isLoading?: boolean; // Indicates if currently loading children
  metadata?: {
    dataType?: string;
    nullable?: boolean;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    description?: string;
    schemaName?: string;
    tableName?: string;
  };
}

interface DatabaseTreeState {
  treeData: TreeNode[];
  expandedNodes: Set<string>;
  searchQuery: string;
  filteredTree: TreeNode[];
  
  // Actions
  setSearchQuery: (query: string) => void;
  toggleNode: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  setTreeData: (data: TreeNode[]) => void;
  updateNodeChildren: (nodeId: string, children: TreeNode[]) => void;
  setNodeLoading: (nodeId: string, isLoading: boolean) => void;
  loadSchemas: () => Promise<void>;
  loadSchemaContents: (schemaName: string) => Promise<void>;
  loadTableDetails: (schemaName: string, tableName: string, tableType: 'table' | 'view' | 'function') => Promise<void>;
}

// Mock API functions - replace these with actual API calls
const mockApiDelay = () => new Promise(resolve => setTimeout(resolve, 800));

const mockGetSchemas = async (): Promise<TreeNode[]> => {
  await mockApiDelay();
  return [
    {
      id: 'schema-public',
      name: 'public',
      type: 'schema',
      hasChildren: true,
      isLoaded: false,
      children: []
    },
    {
      id: 'schema-information_schema',
      name: 'information_schema',
      type: 'schema',
      hasChildren: true,
      isLoaded: false,
      children: []
    }
  ];
};

const mockGetSchemaContents = async (schemaName: string): Promise<TreeNode[]> => {
  await mockApiDelay();
  
  if (schemaName === 'public') {
    return [
      {
        id: `folder-tables-${schemaName}`,
        name: 'Tables',
        type: 'folder',
        hasChildren: true,
        isLoaded: false,
        metadata: { schemaName },
        children: []
      },
      {
        id: `folder-views-${schemaName}`,
        name: 'Views',
        type: 'folder',
        hasChildren: true,
        isLoaded: false,
        metadata: { schemaName },
        children: []
      },
      {
        id: `folder-functions-${schemaName}`,
        name: 'Functions',
        type: 'folder',
        hasChildren: true,
        isLoaded: false,
        metadata: { schemaName },
        children: []
      },
      {
        id: `folder-sequences-${schemaName}`,
        name: 'Sequences',
        type: 'folder',
        hasChildren: true,
        isLoaded: false,
        metadata: { schemaName },
        children: []
      }
    ];
  }
  
  return [
    {
      id: `folder-tables-${schemaName}`,
      name: 'Tables',
      type: 'folder',
      hasChildren: false,
      isLoaded: true,
      metadata: { schemaName },
      children: []
    }
  ];
};

const mockGetTablesInSchema = async (schemaName: string): Promise<TreeNode[]> => {
  await mockApiDelay();
  
  if (schemaName === 'public') {
    return [
      {
        id: `table-${schemaName}-audit`,
        name: 'audit',
        type: 'table',
        hasChildren: true,
        isLoaded: false,
        metadata: { schemaName, tableName: 'audit' },
        children: []
      },
      {
        id: `table-${schemaName}-department`,
        name: 'department',
        type: 'table',
        hasChildren: true,
        isLoaded: false,
        metadata: { schemaName, tableName: 'department' },
        children: []
      },
      {
        id: `table-${schemaName}-employee`,
        name: 'employee',
        type: 'table',
        hasChildren: true,
        isLoaded: false,
        metadata: { schemaName, tableName: 'employee' },
        children: []
      },
      {
        id: `table-${schemaName}-salary`,
        name: 'salary',
        type: 'table',
        hasChildren: true,
        isLoaded: false,
        metadata: { schemaName, tableName: 'salary' },
        children: []
      }
    ];
  }
  
  return [];
};

const mockGetViewsInSchema = async (schemaName: string): Promise<TreeNode[]> => {
  await mockApiDelay();
  
  if (schemaName === 'public') {
    return [
      {
        id: `view-${schemaName}-current_dept_emp`,
        name: 'current_dept_emp',
        type: 'view',
        hasChildren: true,
        isLoaded: false,
        metadata: { schemaName, tableName: 'current_dept_emp' },
        children: []
      },
      {
        id: `view-${schemaName}-dept_emp_latest_date`,
        name: 'dept_emp_latest_date',
        type: 'view',
        hasChildren: true,
        isLoaded: false,
        metadata: { schemaName, tableName: 'dept_emp_latest_date' },
        children: []
      }
    ];
  }
  
  return [];
};

const mockGetFunctionsInSchema = async (schemaName: string): Promise<TreeNode[]> => {
  await mockApiDelay();
  
  if (schemaName === 'public') {
    return [
      {
        id: `function-${schemaName}-log_dml_operations`,
        name: 'log_dml_operations()',
        type: 'function',
        hasChildren: false,
        isLoaded: true,
        metadata: { schemaName },
        children: []
      }
    ];
  }
  
  return [];
};

const mockGetSequencesInSchema = async (schemaName: string): Promise<TreeNode[]> => {
  await mockApiDelay();
  
  if (schemaName === 'public') {
    return [
      {
        id: `sequence-${schemaName}-audit_id_seq`,
        name: 'audit_id_seq',
        type: 'sequence',
        hasChildren: false,
        isLoaded: true,
        metadata: { schemaName },
        children: []
      },
      {
        id: `sequence-${schemaName}-employee_emp_no_seq`,
        name: 'employee_emp_no_seq',
        type: 'sequence',
        hasChildren: false,
        isLoaded: true,
        metadata: { schemaName },
        children: []
      }
    ];
  }
  
  return [];
};

const mockGetTableDetails = async (schemaName: string, tableName: string): Promise<TreeNode[]> => {
  await mockApiDelay();
  
  const folders: TreeNode[] = [
    {
      id: `folder-columns-${schemaName}-${tableName}`,
      name: 'Columns',
      type: 'folder',
      hasChildren: true,
      isLoaded: false,
      metadata: { schemaName, tableName },
      children: []
    }
  ];

  // Add indexes folder for tables
  if (tableName !== 'salary') {
    folders.push({
      id: `folder-indexes-${schemaName}-${tableName}`,
      name: 'Indexes',
      type: 'folder',
      hasChildren: true,
      isLoaded: false,
      metadata: { schemaName, tableName },
      children: []
    });
  }

  // Add foreign keys folder for some tables
  if (['dept_emp', 'dept_manager'].includes(tableName)) {
    folders.push({
      id: `folder-foreign_keys-${schemaName}-${tableName}`,
      name: 'Foreign keys',
      type: 'folder',
      hasChildren: true,
      isLoaded: false,
      metadata: { schemaName, tableName },
      children: []
    });
  }

  // Add checks folder for employee table
  if (tableName === 'employee') {
    folders.push({
      id: `folder-checks-${schemaName}-${tableName}`,
      name: 'Checks',
      type: 'folder',
      hasChildren: true,
      isLoaded: false,
      metadata: { schemaName, tableName },
      children: []
    });
  }

  return folders;
};

const mockGetTableColumns = async (schemaName: string, tableName: string): Promise<TreeNode[]> => {
  await mockApiDelay();
  
  const columnData: Record<string, TreeNode[]> = {
    audit: [
      {
        id: `column-${schemaName}-${tableName}-id`,
        name: 'id',
        type: 'column',
        hasChildren: false,
        isLoaded: true,
        metadata: { dataType: 'integer', isPrimaryKey: true, nullable: false, schemaName, tableName }
      },
      {
        id: `column-${schemaName}-${tableName}-operation`,
        name: 'operation',
        type: 'column',
        hasChildren: false,
        isLoaded: true,
        metadata: { dataType: 'text', nullable: false, schemaName, tableName }
      },
      {
        id: `column-${schemaName}-${tableName}-query`,
        name: 'query',
        type: 'column',
        hasChildren: false,
        isLoaded: true,
        metadata: { dataType: 'text', nullable: true, schemaName, tableName }
      },
      {
        id: `column-${schemaName}-${tableName}-user_name`,
        name: 'user_name',
        type: 'column',
        hasChildren: false,
        isLoaded: true,
        metadata: { dataType: 'text', nullable: false, schemaName, tableName }
      },
      {
        id: `column-${schemaName}-${tableName}-changed_at`,
        name: 'changed_at',
        type: 'column',
        hasChildren: false,
        isLoaded: true,
        metadata: { dataType: 'timestamp with time zone', nullable: false, schemaName, tableName }
      }
    ],
    department: [
      {
        id: `column-${schemaName}-${tableName}-dept_no`,
        name: 'dept_no',
        type: 'column',
        hasChildren: false,
        isLoaded: true,
        metadata: { dataType: 'text', isPrimaryKey: true, nullable: false, schemaName, tableName }
      },
      {
        id: `column-${schemaName}-${tableName}-dept_name`,
        name: 'dept_name',
        type: 'column',
        hasChildren: false,
        isLoaded: true,
        metadata: { dataType: 'text', nullable: false, schemaName, tableName }
      }
    ],
    employee: [
      {
        id: `column-${schemaName}-${tableName}-emp_no`,
        name: 'emp_no',
        type: 'column',
        hasChildren: false,
        isLoaded: true,
        metadata: { dataType: 'integer', isPrimaryKey: true, nullable: false, schemaName, tableName }
      },
      {
        id: `column-${schemaName}-${tableName}-first_name`,
        name: 'first_name',
        type: 'column',
        hasChildren: false,
        isLoaded: true,
        metadata: { dataType: 'text', nullable: false, schemaName, tableName }
      },
      {
        id: `column-${schemaName}-${tableName}-last_name`,
        name: 'last_name',
        type: 'column',
        hasChildren: false,
        isLoaded: true,
        metadata: { dataType: 'text', nullable: false, schemaName, tableName }
      },
      {
        id: `column-${schemaName}-${tableName}-gender`,
        name: 'gender',
        type: 'column',
        hasChildren: false,
        isLoaded: true,
        metadata: { dataType: 'text', nullable: false, schemaName, tableName }
      }
    ]
  };

  return columnData[tableName] || [];
};

// Filter tree function - only filters loaded nodes
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
    
    // Include node if name matches or if it has matching children
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

// Get all node IDs recursively (only from loaded nodes)
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

export const useDatabaseTreeStore = create<DatabaseTreeState>()(
  subscribeWithSelector((set, get) => ({
    treeData: [],
    expandedNodes: new Set(),
    searchQuery: '',
    filteredTree: [],

    setSearchQuery: (query: string) => {
      set((state) => {
        const filteredTree = filterTree(state.treeData, query);
        return {
          searchQuery: query,
          filteredTree,
          // Auto-expand nodes when searching (only loaded ones)
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
        // Collapse node
        set((state) => {
          const newExpanded = new Set(state.expandedNodes);
          newExpanded.delete(nodeId);
          return { expandedNodes: newExpanded };
        });
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
        const schemas = await mockGetSchemas();
        get().setTreeData(schemas);
      } catch (error) {
        console.error('Failed to load schemas:', error);
      }
    },

    loadSchemaContents: async (schemaName: string) => {
      const nodeId = `schema-${schemaName}`;
      try {
        get().setNodeLoading(nodeId, true);
        const contents = await mockGetSchemaContents(schemaName);
        get().updateNodeChildren(nodeId, contents);
      } catch (error) {
        console.error('Failed to load schema contents:', error);
        get().setNodeLoading(nodeId, false);
      }
    },

    loadTableDetails: async (schemaName: string, tableName: string, tableType: 'table' | 'view' | 'function') => {
      const nodeId = `${tableType}-${schemaName}-${tableName}`;
      try {
        get().setNodeLoading(nodeId, true);
        const details = await mockGetTableDetails(schemaName, tableName);
        get().updateNodeChildren(nodeId, details);
      } catch (error) {
        console.error('Failed to load table details:', error);
        get().setNodeLoading(nodeId, false);
      }
    },

    // Helper method to load node children based on node type
    loadNodeChildren: async (nodeId: string, node: TreeNode) => {
      try {
        get().setNodeLoading(nodeId, true);
        let children: TreeNode[] = [];

        if (node.type === 'schema') {
          children = await mockGetSchemaContents(node.name);
        } else if (node.type === 'folder') {
          const { schemaName, tableName } = node.metadata || {};
          
          if (node.name === 'Tables' && schemaName) {
            children = await mockGetTablesInSchema(schemaName);
          } else if (node.name === 'Views' && schemaName) {
            children = await mockGetViewsInSchema(schemaName);
          } else if (node.name === 'Functions' && schemaName) {
            children = await mockGetFunctionsInSchema(schemaName);
          } else if (node.name === 'Sequences' && schemaName) {
            children = await mockGetSequencesInSchema(schemaName);
          } else if (node.name === 'Columns' && schemaName && tableName) {
            children = await mockGetTableColumns(schemaName, tableName);
          } else if (node.name === 'Indexes' && schemaName && tableName) {
            // Mock indexes
            children = [
              {
                id: `index-${schemaName}-${tableName}-pkey`,
                name: `${tableName}_pkey`,
                type: 'index',
                hasChildren: false,
                isLoaded: true,
                metadata: { description: 'Primary key index', schemaName, tableName }
              }
            ];
          } else if (node.name === 'Foreign keys' && schemaName && tableName) {
            // Mock foreign keys
            children = [
              {
                id: `fk-${schemaName}-${tableName}-dept_no_fkey`,
                name: `${tableName}_dept_no_fkey`,
                type: 'foreign_key',
                hasChildren: false,
                isLoaded: true,
                metadata: { schemaName, tableName }
              }
            ];
          } else if (node.name === 'Checks' && schemaName && tableName) {
            // Mock checks
            children = [
              {
                id: `check-${schemaName}-${tableName}-gender_check`,
                name: `${tableName}_gender_check`,
                type: 'check',
                hasChildren: false,
                isLoaded: true,
                metadata: { description: "(gender = ANY (ARRAY['M'::text, 'F'::text]))", schemaName, tableName }
              }
            ];
          }
        } else if (['table', 'view'].includes(node.type)) {
          const { schemaName, tableName } = node.metadata || {};
          if (schemaName && tableName) {
            children = await mockGetTableDetails(schemaName, tableName);
          }
        }

        get().updateNodeChildren(nodeId, children);
      } catch (error) {
        console.error('Failed to load node children:', error);
        get().setNodeLoading(nodeId, false);
      }
    }
  }))
);