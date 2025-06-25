import { Connection } from '../types/Connection';

export const exportConnections = (connections: Connection[]): void => {
  try {
    const dataStr = JSON.stringify(connections, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `sql-connections-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export connections:', error);
    alert('Failed to export connections. Please try again.');
  }
};

export const importConnections = (file: File): Promise<Connection[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const connections = JSON.parse(jsonStr);
        
        // Validate the imported data
        if (!Array.isArray(connections)) {
          throw new Error('Invalid file format: expected an array of connections');
        }
        
        const validatedConnections: Connection[] = connections.map((conn, index) => ({
          id: conn.id || `imported-${Date.now()}-${index}`,
          type: conn.type || 'PostgreSQL',
          connectionName: conn.connectionName || `Connection ${index + 1}`,
          databaseName: conn.databaseName || '',
          host: conn.host || 'localhost',
          port: conn.port || (conn.type === 'PostgreSQL' ? 5432 : conn.type === 'MySQL' ? 3306 : 1521),
          username: conn.username || '',
          password: conn.password || '',
          environment: conn.environment || 'dev',
          order: conn.order || index,
          createdAt: conn.createdAt || new Date().toISOString(),
          lastUsed: conn.lastUsed || new Date().toISOString(),
        }));
        
        resolve(validatedConnections);
      } catch (error) {
        console.log(error);
        reject(new Error('Invalid JSON file or file format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};