export interface DatabaseConnection {
  id: string;
  label: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  type: 'postgresql' | 'mysql';
  isConnected?: boolean;
}

export interface Schema {
  name: string;
  tables: Table[];
  views: View[];
  functions: Function[];
  sequences: Sequence[];
}

export interface Table {
  name: string;
  columns: Column[];
  rowCount?: number;
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

export interface View {
  name: string;
  definition?: string;
}

export interface Function {
  name: string;
  parameters?: string[];
  returnType?: string;
}

export interface Sequence {
  name: string;
  currentValue?: number;
}

// Query execution history (for tracking purposes)
export interface QueryHistory {
  id: string;
  operation: string;
  query: string;
  user_name: string;
  changed_at: string;
  executionTime?: number;
  rowsAffected?: number;
}

// Actual query result data
export interface QueryResult {
  columns: QueryColumn[];
  rows: Record<string, any>[];
  totalRows: number;
  executionTime: number;
  query: string;
  timestamp: Date;
}

export interface QueryColumn {
  name: string;
  type: string;
  nullable?: boolean;
}

export interface SqlTab {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  isDirty: boolean;
}