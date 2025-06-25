import { DatabaseConnection, Schema, QueryHistory, QueryResult } from '../types/database';

export const mockConnections: DatabaseConnection[] = [
  {
    id: 'conn-1',
    label: 'Production DB',
    host: 'prod-db.company.com',
    port: 5432,
    username: 'admin',
    password: '****',
    database: 'production',
    type: 'postgresql',
    isConnected: true
  },
  {
    id: 'conn-2',
    label: 'Development DB',
    host: 'localhost',
    port: 3306,
    username: 'dev_user',
    password: '****',
    database: 'development',
    type: 'mysql',
    isConnected: false
  }
];

export const mockSchemas: Schema[] = [
  {
    name: 'public',
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'id', type: 'serial', nullable: false, isPrimaryKey: true },
          { name: 'email', type: 'varchar(255)', nullable: false },
          { name: 'name', type: 'varchar(100)', nullable: false },
          { name: 'age', type: 'integer', nullable: true },
          { name: 'is_active', type: 'boolean', nullable: false },
          { name: 'created_at', type: 'timestamp', nullable: false },
          { name: 'updated_at', type: 'timestamp', nullable: true },
          { name: 'last_login', type: 'timestamp', nullable: true }
        ],
        rowCount: 1247
      },
      {
        name: 'orders',
        columns: [
          { name: 'id', type: 'serial', nullable: false, isPrimaryKey: true },
          { name: 'user_id', type: 'integer', nullable: false, isForeignKey: true },
          { name: 'total_amount', type: 'decimal(10,2)', nullable: false },
          { name: 'status', type: 'varchar(50)', nullable: false },
          { name: 'order_date', type: 'date', nullable: false },
          { name: 'created_at', type: 'timestamp', nullable: false },
          { name: 'updated_at', type: 'timestamp', nullable: true }
        ],
        rowCount: 3891
      },
      {
        name: 'products',
        columns: [
          { name: 'id', type: 'serial', nullable: false, isPrimaryKey: true },
          { name: 'name', type: 'varchar(255)', nullable: false },
          { name: 'price', type: 'decimal(10,2)', nullable: false },
          { name: 'description', type: 'text', nullable: true },
          { name: 'category_id', type: 'integer', nullable: false, isForeignKey: true },
          { name: 'in_stock', type: 'boolean', nullable: false },
          { name: 'stock_quantity', type: 'integer', nullable: false },
          { name: 'created_at', type: 'timestamp', nullable: false },
          { name: 'updated_at', type: 'timestamp', nullable: true }
        ],
        rowCount: 156
      },
      {
        name: 'categories',
        columns: [
          { name: 'id', type: 'serial', nullable: false, isPrimaryKey: true },
          { name: 'name', type: 'varchar(100)', nullable: false },
          { name: 'description', type: 'text', nullable: true },
          { name: 'parent_id', type: 'integer', nullable: true, isForeignKey: true },
          { name: 'is_active', type: 'boolean', nullable: false },
          { name: 'created_at', type: 'timestamp', nullable: false }
        ],
        rowCount: 25
      },
      {
        name: 'order_items',
        columns: [
          { name: 'id', type: 'serial', nullable: false, isPrimaryKey: true },
          { name: 'order_id', type: 'integer', nullable: false, isForeignKey: true },
          { name: 'product_id', type: 'integer', nullable: false, isForeignKey: true },
          { name: 'quantity', type: 'integer', nullable: false },
          { name: 'unit_price', type: 'decimal(10,2)', nullable: false },
          { name: 'total_price', type: 'decimal(10,2)', nullable: false }
        ],
        rowCount: 8934
      },
      {
        name: 'customers',
        columns: [
          { name: 'id', type: 'serial', nullable: false, isPrimaryKey: true },
          { name: 'first_name', type: 'varchar(50)', nullable: false },
          { name: 'last_name', type: 'varchar(50)', nullable: false },
          { name: 'email', type: 'varchar(255)', nullable: false },
          { name: 'phone', type: 'varchar(20)', nullable: true },
          { name: 'address', type: 'text', nullable: true },
          { name: 'city', type: 'varchar(100)', nullable: true },
          { name: 'country', type: 'varchar(100)', nullable: true },
          { name: 'postal_code', type: 'varchar(20)', nullable: true },
          { name: 'date_of_birth', type: 'date', nullable: true },
          { name: 'is_premium', type: 'boolean', nullable: false },
          { name: 'created_at', type: 'timestamp', nullable: false }
        ],
        rowCount: 2156
      }
    ],
    views: [
      { name: 'user_orders_summary' },
      { name: 'monthly_sales' },
      { name: 'product_sales_stats' },
      { name: 'customer_analytics' },
      { name: 'inventory_status' }
    ],
    functions: [
      { name: 'calculate_total_revenue', returnType: 'decimal' },
      { name: 'get_user_orders', parameters: ['user_id'], returnType: 'table' },
      { name: 'update_stock_quantity', parameters: ['product_id', 'quantity'], returnType: 'boolean' },
      { name: 'get_monthly_sales', parameters: ['year', 'month'], returnType: 'decimal' },
      { name: 'calculate_discount', parameters: ['customer_id', 'order_total'], returnType: 'decimal' }
    ],
    sequences: [
      { name: 'users_id_seq', currentValue: 1247 },
      { name: 'orders_id_seq', currentValue: 3891 },
      { name: 'products_id_seq', currentValue: 156 },
      { name: 'categories_id_seq', currentValue: 25 },
      { name: 'customers_id_seq', currentValue: 2156 }
    ]
  }
];

// Mock query execution history
export const mockQueryHistory: QueryHistory[] = [
  {
    id: '1',
    operation: 'SELECT',
    query: 'SELECT * FROM users WHERE created_at > \'2024-01-01\' LIMIT 10',
    user_name: 'john.doe',
    changed_at: '2024-01-15 14:32:15',
    executionTime: 25,
    rowsAffected: 10
  },
  {
    id: '2',
    operation: 'UPDATE',
    query: 'UPDATE products SET price = price * 1.1 WHERE category_id = 1',
    user_name: 'jane.smith',
    changed_at: '2024-01-15 14:28:42',
    executionTime: 156,
    rowsAffected: 23
  },
  {
    id: '3',
    operation: 'INSERT',
    query: 'INSERT INTO orders (user_id, total_amount, status) VALUES (123, 99.99, \'pending\')',
    user_name: 'mike.johnson',
    changed_at: '2024-01-15 14:25:33',
    executionTime: 12,
    rowsAffected: 1
  },
  {
    id: '4',
    operation: 'DELETE',
    query: 'DELETE FROM users WHERE last_login < \'2023-01-01\'',
    user_name: 'admin',
    changed_at: '2024-01-15 14:20:18',
    executionTime: 89,
    rowsAffected: 5
  }
];

// Mock actual query result data (what you see when running SELECT queries)
export const mockQueryResults: QueryResult[] = [
  {
    columns: [
      { name: 'id', type: 'integer' },
      { name: 'email', type: 'varchar' },
      { name: 'name', type: 'varchar' },
      { name: 'age', type: 'integer' },
      { name: 'is_active', type: 'boolean' },
      { name: 'created_at', type: 'timestamp' },
      { name: 'last_login', type: 'timestamp' }
    ],
    rows: [
      {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        age: 28,
        is_active: true,
        created_at: '2024-01-15T10:30:00Z',
        last_login: '2024-01-20T14:22:15Z'
      },
      {
        id: 2,
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        age: 32,
        is_active: true,
        created_at: '2024-01-12T09:15:30Z',
        last_login: '2024-01-19T16:45:22Z'
      },
      {
        id: 3,
        email: 'mike.johnson@example.com',
        name: 'Mike Johnson',
        age: 25,
        is_active: false,
        created_at: '2024-01-10T14:20:45Z',
        last_login: '2024-01-18T11:30:10Z'
      },
      {
        id: 4,
        email: 'sarah.wilson@example.com',
        name: 'Sarah Wilson',
        age: 29,
        is_active: true,
        created_at: '2024-01-08T16:45:12Z',
        last_login: '2024-01-21T09:15:33Z'
      },
      {
        id: 5,
        email: 'david.brown@example.com',
        name: 'David Brown',
        age: 35,
        is_active: true,
        created_at: '2024-01-05T11:30:25Z',
        last_login: null
      },
      {
        id: 6,
        email: 'lisa.davis@example.com',
        name: 'Lisa Davis',
        age: 27,
        is_active: true,
        created_at: '2024-01-03T13:45:18Z',
        last_login: '2024-01-20T15:20:45Z'
      },
      {
        id: 7,
        email: 'tom.miller@example.com',
        name: 'Tom Miller',
        age: 31,
        is_active: true,
        created_at: '2024-01-02T08:15:30Z',
        last_login: '2024-01-19T12:10:22Z'
      },
      {
        id: 8,
        email: 'emma.garcia@example.com',
        name: 'Emma Garcia',
        age: 26,
        is_active: false,
        created_at: '2023-12-28T10:20:15Z',
        last_login: '2024-01-15T14:30:18Z'
      },
      {
        id: 9,
        email: 'alex.martinez@example.com',
        name: 'Alex Martinez',
        age: 33,
        is_active: true,
        created_at: '2023-12-25T15:45:22Z',
        last_login: '2024-01-21T10:45:12Z'
      },
      {
        id: 10,
        email: 'olivia.taylor@example.com',
        name: 'Olivia Taylor',
        age: 24,
        is_active: true,
        created_at: '2023-12-20T12:30:45Z',
        last_login: '2024-01-20T16:20:30Z'
      }
    ],
    totalRows: 10,
    executionTime: 25,
    query: 'SELECT * FROM users WHERE created_at > \'2024-01-01\' LIMIT 10',
    timestamp: new Date('2024-01-21T14:32:15Z')
  }
];