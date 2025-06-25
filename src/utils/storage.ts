import { Connection } from '../types/Connection';

const STORAGE_KEY = 'sql-editor-connections';

export const saveConnections = (connections: Connection[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
  } catch (error) {
    console.error('Failed to save connections:', error);
  }
};

export const loadConnections = (): Connection[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load connections:', error);
    return [];
  }
};

export const clearConnections = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear connections:', error);
  }
};