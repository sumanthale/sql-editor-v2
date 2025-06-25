import { useState, useEffect, useCallback } from 'react';
import { Connection, DatabaseType } from '../types/Connection';
import { saveConnections, loadConnections } from '../utils/storage';

export const useConnections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedConnections = loadConnections();
        // Migrate old connections to include new fields
        const migratedConnections = savedConnections.map(conn => ({
          ...conn,
          environment: conn.environment || 'dev',
          createdAt: conn.createdAt || new Date().toISOString(),
          lastUsed: conn.lastUsed || new Date().toISOString(),
          isConnected: conn.isConnected || false,
          connectionStatus: conn.connectionStatus || 'disconnected',
        }));
        setConnections(migratedConnections);
      } catch (error) {
        console.error('Failed to load connections:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const saveData = useCallback((newConnections: Connection[]) => {
    setConnections(newConnections);
    saveConnections(newConnections);
  }, []);

  const addConnection = useCallback((connection: Omit<Connection, 'id' | 'order'>) => {
    const newConnection: Connection = {
      ...connection,
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order: connections.length,
      environment: connection.environment || 'dev',
      createdAt: connection.createdAt || new Date().toISOString(),
      lastUsed: connection.lastUsed || new Date().toISOString(),
      isConnected: connection.isConnected || false,
      connectionStatus: 'disconnected',
    };
    
    const newConnections = [...connections, newConnection];
    saveData(newConnections);
  }, [connections, saveData]);

  const updateConnection = useCallback((id: string, updates: Partial<Connection>) => {
    const newConnections = connections.map(conn =>
      conn.id === id ? { 
        ...conn, 
        ...updates, 
        lastUsed: new Date().toISOString(),
        lastConnectionAttempt: updates.isConnected !== undefined ? new Date().toISOString() : conn.lastConnectionAttempt
      } : conn
    );
    saveData(newConnections);
  }, [connections, saveData]);

  const deleteConnection = useCallback((id: string) => {
    const newConnections = connections.filter(conn => conn.id !== id);
    saveData(newConnections);
  }, [connections, saveData]);

  const connectToDatabase = useCallback(async (connection: Connection) => {
    // Update status to connecting
    updateConnection(connection.id, { 
      connectionStatus: 'connecting',
      isConnected: false,
      connectionError: undefined
    });

    try {
      // Simulate connection attempt
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate connection test
      const success = await simulateConnectionTest(connection);
      
      if (success) {
        updateConnection(connection.id, { 
          isConnected: true,
          connectionStatus: 'connected',
          connectionError: undefined
        });
        return true;
      } else {
        updateConnection(connection.id, { 
          isConnected: false,
          connectionStatus: 'error',
          connectionError: 'Failed to establish connection'
        });
        return false;
      }
    } catch (error) {
      updateConnection(connection.id, { 
        isConnected: false,
        connectionStatus: 'error',
        connectionError: error instanceof Error ? error.message : 'Connection failed'
      });
      return false;
    }
  }, [updateConnection]);

  const disconnectFromDatabase = useCallback((connection: Connection) => {
    updateConnection(connection.id, { 
      isConnected: false,
      connectionStatus: 'disconnected',
      connectionError: undefined
    });
  }, [updateConnection]);

  const simulateConnectionTest = async (connection: Connection): Promise<boolean> => {
    // Simulate various failure scenarios
    if (connection.host === 'invalid-host') return false;
    if (connection.username === 'invalid-user') return false;
    if (connection.port < 1 || connection.port > 65535) return false;
    if (connection.databaseName === 'nonexistent') return false;
    if (connection.host.includes('timeout')) return false;
    
    // Success case
    return true;
  };

  const reorderConnections = useCallback((type: DatabaseType, newOrder: Connection[]) => {
    const otherConnections = connections.filter(conn => conn.type !== type);
    const reorderedConnections = newOrder.map((conn, index) => ({
      ...conn,
      order: index,
    }));
    
    const allConnections = [...otherConnections, ...reorderedConnections];
    saveData(allConnections);
  }, [connections, saveData]);

  const importConnections = useCallback((importedConnections: Connection[]) => {
    // Ensure imported connections have all required fields
    const processedConnections = importedConnections.map(conn => ({
      ...conn,
      environment: conn.environment || 'dev',
      createdAt: conn.createdAt || new Date().toISOString(),
      lastUsed: conn.lastUsed || new Date().toISOString(),
      isConnected: false, // Reset connection status for imported connections
      connectionStatus: 'disconnected' as const,
    }));
    
    const newConnections = [...connections, ...processedConnections];
    saveData(newConnections);
  }, [connections, saveData]);

  const getConnectionsByType = useCallback((type: DatabaseType) => {
    return connections
      .filter(conn => conn.type === type)
      .sort((a, b) => a.order - b.order);
  }, [connections]);

  return {
    connections,
    loading,
    addConnection,
    updateConnection,
    deleteConnection,
    connectToDatabase,
    disconnectFromDatabase,
    reorderConnections,
    importConnections,
    getConnectionsByType,
  };
};