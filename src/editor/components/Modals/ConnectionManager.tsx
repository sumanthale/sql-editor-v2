import React, { useState } from 'react';
import { X, Database, Save, TestTube, AlertCircle, CheckCircle } from 'lucide-react';
import { DatabaseConnection } from '../../../types/database';

interface ConnectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (connection: Omit<DatabaseConnection, 'id'>) => void;
  editingConnection?: DatabaseConnection;
}

export function ConnectionManager({ isOpen, onClose, onSave, editingConnection }: ConnectionManagerProps) {
  const [formData, setFormData] = useState({
    label: editingConnection?.label || '',
    type: editingConnection?.type || 'postgresql' as const,
    host: editingConnection?.host || 'localhost',
    port: editingConnection?.port || 5432,
    username: editingConnection?.username || '',
    password: editingConnection?.password || '',
    database: editingConnection?.database || ''
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<'success' | 'error' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.label.trim()) newErrors.label = 'Label is required';
    if (!formData.host.trim()) newErrors.host = 'Host is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.database.trim()) newErrors.database = 'Database name is required';
    if (formData.port < 1 || formData.port > 65535) newErrors.port = 'Port must be between 1 and 65535';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSave({
      ...formData,
      isConnected: false
    });
    
    onClose();
  };

  const testConnection = async () => {
    if (!validateForm()) return;

    setIsTestingConnection(true);
    setConnectionTestResult(null);

    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock success/failure based on some criteria
    const success = formData.host !== 'invalid-host';
    setConnectionTestResult(success ? 'success' : 'error');
    setIsTestingConnection(false);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Database size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingConnection ? 'Edit Connection' : 'New Connection'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Connection Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Connection Label *
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => updateFormData('label', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.label ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="My Database"
            />
            {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label}</p>}
          </div>

          {/* Database Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Database Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => updateFormData('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
            </select>
          </div>

          {/* Host and Port */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Host *
              </label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => updateFormData('host', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.host ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="localhost"
              />
              {errors.host && <p className="text-red-500 text-xs mt-1">{errors.host}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Port *
              </label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => updateFormData('port', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.port ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="5432"
              />
              {errors.port && <p className="text-red-500 text-xs mt-1">{errors.port}</p>}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => updateFormData('username', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="username"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="password"
            />
          </div>

          {/* Database Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Database Name *
            </label>
            <input
              type="text"
              value={formData.database}
              onChange={(e) => updateFormData('database', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.database ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="database_name"
            />
            {errors.database && <p className="text-red-500 text-xs mt-1">{errors.database}</p>}
          </div>

          {/* Test Connection Result */}
          {connectionTestResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              connectionTestResult === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              {connectionTestResult === 'success' ? (
                <>
                  <CheckCircle size={16} />
                  Connection successful!
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  Connection failed. Please check your settings.
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={testConnection}
              disabled={isTestingConnection}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
            >
              <TestTube size={16} />
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save size={16} />
              {editingConnection ? 'Update' : 'Save'} Connection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}