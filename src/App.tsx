import { useState } from 'react';
import { DatabaseType, Connection } from './types/Connection';
import { useConnections } from './hooks/useConnections';
import { DatabaseTabs } from './components/DatabaseTabs';
import { ConnectionList } from './components/ConnectionList';
import { AddConnectionModal } from './components/AddConnectionModal';
import { EditConnectionModal } from './components/EditConnectionModal';
import { PasswordUpdateModal } from './components/PasswordUpdateModal';
import { DatabaseMigration } from './components/DatabaseMigration';
import { exportConnections, importConnections } from './utils/importExport';
import { useTheme } from './editor/hooks/useTheme';
import {
  Plus,
  Download,
  Upload,
  Database,
  Sparkles,
  Sun,
  Moon,
  MousePointer,
  Grip,
} from 'lucide-react';
import Editor from './editor/Editor';

function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    connections,
    loading,
    addConnection,
    updateConnection,
    deleteConnection,
    connectToDatabase,
    disconnectFromDatabase,
    reorderConnections,
    importConnections: handleImportConnections,
    getConnectionsByType,
  } = useConnections();

  const [activeView, setActiveView] = useState<
    'connections' | 'migration' | 'editor'
  >('connections');
  const [activeTab, setActiveTab] = useState<DatabaseType>('PostgreSQL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(
    null
  );
  const [updatingPasswordConnection, setUpdatingPasswordConnection] =
    useState<Connection | null>(null);

  const connectionCounts = {
    PostgreSQL: getConnectionsByType('PostgreSQL').length,
    MySQL: getConnectionsByType('MySQL').length,
    Oracle: getConnectionsByType('Oracle').length,
  };

  const currentConnections = getConnectionsByType(activeTab);

  const handleExport = () => {
    exportConnections(connections);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const importedConnections = await importConnections(file);
          handleImportConnections(importedConnections);
          alert(
            `Successfully imported ${importedConnections.length} connections!`
          );
        } catch (error) {
          alert(
            error instanceof Error
              ? error.message
              : 'Failed to import connections'
          );
        }
      }
    };
    input.click();
  };

  const handleEditConnection = (connection: Connection) => {
    setEditingConnection(connection);
    setIsEditModalOpen(true);
  };

  const handleUpdatePassword = (connection: Connection) => {
    setUpdatingPasswordConnection(connection);
    setIsPasswordModalOpen(true);
  };

  const handleSaveEdit = (updatedConnection: Connection) => {
    updateConnection(updatedConnection.id, updatedConnection);
    setIsEditModalOpen(false);
    setEditingConnection(null);
  };

  const handlePasswordUpdate = (connectionId: string, newPassword: string) => {
    updateConnection(connectionId, { password: newPassword });
    setIsPasswordModalOpen(false);
    setUpdatingPasswordConnection(null);
  };

  const handleConnect = async (connection: Connection) => {
    const success = await connectToDatabase(connection);
    if (!success) {
      alert(
        'Failed to connect to the database. Please check your connection settings.'
      );
    }
  };

  const handleDisconnect = (connection: Connection) => {
    disconnectFromDatabase(connection);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 gradient-synchrony rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-theme-heavy">
              <Database className="w-10 h-10 text-charcoal animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-synchrony-gold animate-bounce" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-theme-primary mb-2">
            Loading Connections
          </h3>
          <p className="text-theme-secondary">
            Preparing your premium database interface...
          </p>
        </div>
      </div>
    );
  }

  // Show migration view
  if (activeView === 'migration') {
    return <DatabaseMigration setActiveView={setActiveView} />;
  }
  // Show SQL Editor
  if (activeView === 'editor') {
    return <Editor setActiveView={setActiveView} />;
  }

  return (
    <div className="min-h-screen bg-theme-primary transition-colors duration-300 grid place-items-center">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-4 sm:gap-8">
          <div className="flex flex-col items-start justify-center">
            <img
              src="https://www.synchrony.com/syc/img/2023_synchrony_basic_logo.svg"
              alt="Synchrony Logo"
              className="h-6"
            />
            <div>
              <h1 className="text-3xl font-bold text-theme-primary">
                Universal SQL Editor
              </h1>
              <p className="text-sm text-theme-secondary capitalize">
                Seamlessly connect, manage and scale across multiple databases
              </p>
            </div>
          </div>

          {/* Right Side: Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-synchrony-primary flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md"
            >
              <Plus className="w-3 h-3" />
              Add New Connection
            </button>

            <button
              onClick={handleExport}
              disabled={connections.length === 0}
              className="bg-dark-green text-white flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md hover:bg-opacity-90 disabled:opacity-50"
            >
              <Download className="w-3 h-3" />
              Export
            </button>

            <button
              onClick={handleImport}
              className="bg-charcoal text-white flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md hover:bg-opacity-90"
            >
              <Upload className="w-3 h-3" />
              Import
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-theme-secondary hover:bg-theme-tertiary"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-theme-primary" />
              ) : (
                <Sun className="w-5 h-5 text-synchrony-gold" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className=" absolute top-3 right-3 flex space-x-1 p-1 bg-gray-100 rounded-lg shadow-inner mb-6">
          <button
            onClick={() => setActiveView('editor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex-1 justify-center bg-indigo-600 text-white shadow`}
          >
            <Database className="w-4 h-4" />
            <span>Editor</span>
          </button>
        </div>
        {/* Database Tabs */}
        <div className="mb-6">
          <DatabaseTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            connectionCounts={connectionCounts}
          />
        </div>

        {/* Connection List */}
        <div className="card-synchrony p-6 min-w-[980px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4 mb-6">
            {/* Heading with count */}
            <h2 className="text-xl font-semibold text-theme-primary flex items-center gap-2">
              {activeTab} Connections
              <span className="px-2 py-0.5 bg-theme-accent text-synchrony-gold text-xs font-semibold rounded-full border border-synchrony-gold">
                {currentConnections.length}
              </span>
            </h2>

            {/* Interaction tips (Drag, Click) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-theme-muted">
              <div className="flex items-center gap-1">
                <Grip className="w-3 h-3 text-synchrony-gold" />
                <span className="text-black dark:text-white">
                  Drag to reorder
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MousePointer className="w-3 h-3 text-synchrony-gold" />
                <span className="text-black dark:text-white">
                  Click to connect
                </span>
              </div>
            </div>
          </div>

          <ConnectionList
            connections={currentConnections}
            type={activeTab}
            onDelete={deleteConnection}
            onEdit={handleEditConnection}
            onUpdatePassword={handleUpdatePassword}
            onReorder={reorderConnections}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        </div>
      </div>

      {/* Modals */}
      <AddConnectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addConnection}
      />
      <EditConnectionModal
        isOpen={isEditModalOpen}
        connection={editingConnection}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingConnection(null);
        }}
        onSave={handleSaveEdit}
      />
      <PasswordUpdateModal
        isOpen={isPasswordModalOpen}
        connection={updatingPasswordConnection}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setUpdatingPasswordConnection(null);
        }}
        onUpdate={handlePasswordUpdate}
      />
    </div>
  );
}

export default App;
