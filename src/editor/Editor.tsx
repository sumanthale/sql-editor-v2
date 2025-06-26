import { useState, useCallback } from "react";
import { TopBar } from "./components/Header/TopBar";
import { EditorToolbar } from "./components/Header/EditorToolbar";
import { DatabaseTree } from "./components/Sidebar/DatabaseTree";
import { SqlEditor } from "./components/Editor/SqlEditor";
import { QueryResults } from "./components/Results/QueryResults";
import { ResizableHandle } from "./components/Layout/ResizableHandle";
import { useResizable } from "./hooks/useResizable";
import { DatabaseConnection, SqlTab, QueryResult } from "../types/database";
import {
  mockConnections,
  mockSchemas,
  mockQueryResults,
} from "../data/mockData";
import { format } from "sql-formatter";

interface EditorProps {
  setActiveView: (view: "connections" | "migration") => void;
}

const Editor: React.FC<EditorProps> = ({ setActiveView }) => {
  // State
  const [connections, setConnections] =
    useState<DatabaseConnection[]>(mockConnections);
  const [activeConnection, setActiveConnection] =
    useState<DatabaseConnection | null>(mockConnections[0]);
  const [tabs, setTabs] = useState<SqlTab[]>([
    {
      id: "tab-1",
      title: "Query 1",
      content: "SELECT * FROM users WHERE created_at > '2024-01-01' LIMIT 10;",
      isActive: true,
      isDirty: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("tab-1");
  const [queryResults, setQueryResults] =
    useState<QueryResult[]>(mockQueryResults);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [lastQueryExecuted, setLastQueryExecuted] = useState<Date>(new Date());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showConnectionManager, setShowConnectionManager] = useState(false);
  const [queryLimit, setQueryLimit] = useState(1000);

  // Resizable panels
  const sidebarResize = useResizable({
    initialSize: 300,
    minSize: 200,
    maxSize: 500,
    direction: "horizontal",
  });

  const resultsResize = useResizable({
    initialSize: 300,
    minSize: 200,
    maxSize: 600,
    direction: "vertical",
  });

  // Handlers
  const handleConnectionChange = useCallback(
    (connection: DatabaseConnection) => {
      setActiveConnection(connection);
    },
    []
  );

  const handleRunQuery = useCallback(async () => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab || !activeConnection?.isConnected) return;

    setIsQueryLoading(true);

    // Simulate query execution
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate mock results based on query content
    const query = activeTab.content.toLowerCase().trim();
    let mockResult: QueryResult;

    if (query.includes("select") && query.includes("users")) {
      mockResult = mockQueryResults[0];
    } else if (query.includes("select") && query.includes("orders")) {
      mockResult = {
        columns: [
          { name: "id", type: "integer" },
          { name: "user_id", type: "integer" },
          { name: "total_amount", type: "decimal" },
          { name: "status", type: "varchar" },
          { name: "order_date", type: "date" },
          { name: "created_at", type: "timestamp" },
        ],
        rows: [
          {
            id: 1,
            user_id: 1,
            total_amount: 99.99,
            status: "completed",
            order_date: "2024-01-20",
            created_at: "2024-01-20T10:30:00Z",
          },
          {
            id: 2,
            user_id: 2,
            total_amount: 149.5,
            status: "pending",
            order_date: "2024-01-20",
            created_at: "2024-01-20T11:15:00Z",
          },
          {
            id: 3,
            user_id: 1,
            total_amount: 75.25,
            status: "completed",
            order_date: "2024-01-20",
            created_at: "2024-01-20T14:22:00Z",
          },
          {
            id: 4,
            user_id: 3,
            total_amount: 200.0,
            status: "shipped",
            order_date: "2024-01-20",
            created_at: "2024-01-20T16:45:00Z",
          },
          {
            id: 5,
            user_id: 2,
            total_amount: 89.99,
            status: "completed",
            order_date: "2024-01-21",
            created_at: "2024-01-21T09:30:00Z",
          },
        ],
        totalRows: 5,
        executionTime: Math.floor(Math.random() * 100) + 20,
        query: activeTab.content,
        timestamp: new Date(),
      };
    } else if (query.includes("select") && query.includes("products")) {
      mockResult = {
        columns: [
          { name: "id", type: "integer" },
          { name: "name", type: "varchar" },
          { name: "price", type: "decimal" },
          { name: "category_id", type: "integer" },
          { name: "in_stock", type: "boolean" },
          { name: "stock_quantity", type: "integer" },
          { name: "created_at", type: "timestamp" },
        ],
        rows: [
          {
            id: 1,
            name: "Laptop Pro",
            price: 1299.99,
            category_id: 1,
            in_stock: true,
            stock_quantity: 15,
            created_at: "2024-01-15T10:00:00Z",
          },
          {
            id: 2,
            name: "Wireless Mouse",
            price: 29.99,
            category_id: 2,
            in_stock: true,
            stock_quantity: 50,
            created_at: "2024-01-15T10:30:00Z",
          },
          {
            id: 3,
            name: "Mechanical Keyboard",
            price: 149.99,
            category_id: 2,
            in_stock: false,
            stock_quantity: 0,
            created_at: "2024-01-15T11:00:00Z",
          },
          {
            id: 4,
            name: "Monitor 4K",
            price: 399.99,
            category_id: 3,
            in_stock: true,
            stock_quantity: 8,
            created_at: "2024-01-15T11:30:00Z",
          },
          {
            id: 5,
            name: "USB-C Hub",
            price: 79.99,
            category_id: 2,
            in_stock: true,
            stock_quantity: 25,
            created_at: "2024-01-15T12:00:00Z",
          },
        ],
        totalRows: 5,
        executionTime: Math.floor(Math.random() * 100) + 20,
        query: activeTab.content,
        timestamp: new Date(),
      };
    } else {
      // Default empty result for non-SELECT queries or unknown tables
      mockResult = {
        columns: [],
        rows: [],
        totalRows: 0,
        executionTime: Math.floor(Math.random() * 50) + 10,
        query: activeTab.content,
        timestamp: new Date(),
      };
    }

    setQueryResults([mockResult]);
    setIsQueryLoading(false);
    setLastQueryExecuted(new Date());
  }, [tabs, activeTabId, activeConnection]);

  const handleNewTab = useCallback(() => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: SqlTab = {
      id: newTabId,
      title: `Query ${tabs.length + 1}`,
      content: "",
      isActive: false,
      isDirty: false,
    };

    setTabs((prev) =>
      prev
        .map((t) => ({ ...t, isActive: false }))
        .concat({ ...newTab, isActive: true })
    );
    setActiveTabId(newTabId);
  }, [tabs.length]);

  const handleCloseTab = useCallback(
    (tabId: string) => {
      if (tabs.length === 1) return; // Don't close the last tab

      const tabIndex = tabs.findIndex((t) => t.id === tabId);
      const newTabs = tabs.filter((t) => t.id !== tabId);

      if (activeTabId === tabId) {
        // Set the previous tab as active, or the first one if closing the first tab
        const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
        const newActiveTab = newTabs[newActiveIndex];
        if (newActiveTab) {
          setActiveTabId(newActiveTab.id);
          newTabs[newActiveIndex] = { ...newActiveTab, isActive: true };
        }
      }

      setTabs(newTabs);
    },
    [tabs, activeTabId]
  );

  const handleTabChange = useCallback((tabId: string) => {
    setTabs((prev) => prev.map((t) => ({ ...t, isActive: t.id === tabId })));
    setActiveTabId(tabId);
  }, []);

  const handleEditorChange = useCallback(
    (value: string) => {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? { ...t, content: value, isDirty: t.content !== value }
            : t
        )
      );
    },
    [activeTabId]
  );

  // Editor toolbar handlers
  const handleFormatQuery = useCallback(() => {
    // This would typically format the SQL query
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab) {
      const unformatted = activeTab.content; // Replace with actual formatting logic;

      const formatted = format(unformatted, {
        language: "sql", // "mysql", "postgresql", "sqlite", etc.
      });

      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId ? { ...t, content: formatted, isDirty: true } : t
        )
      );
    }
  }, []);

  const handleClearQuery = useCallback(() => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, content: "", isDirty: true } : t
      )
    );
  }, [activeTabId]);

  const handleCopyQuery = useCallback(() => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab) {
      navigator.clipboard.writeText(activeTab.content);
    }
  }, [tabs, activeTabId]);

  const handleExportQuery = useCallback(() => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab) {
      const blob = new Blob([activeTab.content], { type: "text/sql" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTab.title.replace(/\s+/g, "_")}.sql`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [tabs, activeTabId]);

  const handleImportQuery = useCallback(
    (content: string) => {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId ? { ...t, content, isDirty: true } : t
        )
      );
    },
    [activeTabId]
  );

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-all duration-300">
      {/* Top Bar */}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          style={{ width: `${sidebarResize.size}px` }}
          className="flex-shrink-0 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-r border-slate-200/60 dark:border-slate-700/60 shadow-lg"
        >
          <DatabaseTree />
        </div>

        {/* Sidebar Resize Handle */}
        <ResizableHandle
          direction="horizontal"
          onMouseDown={sidebarResize.startResizing}
          isResizing={sidebarResize.isResizing}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar
            connections={connections}
            activeConnection={activeConnection}
            tabs={tabs}
            activeTabId={activeTabId}
            onConnectionChange={handleConnectionChange}
            onRunQuery={handleRunQuery}
            onNewTab={handleNewTab}
            onCloseTab={handleCloseTab}
            onTabChange={handleTabChange}
            onOpenConnectionManager={() => setShowConnectionManager(true)}
            queryLimit={queryLimit}
            onQueryLimitChange={setQueryLimit}
            setActiveView={setActiveView}
          />
          <EditorToolbar
            onRunQuery={handleRunQuery}
            onFormatQuery={handleFormatQuery}
            onClearQuery={handleClearQuery}
            onCopyQuery={handleCopyQuery}
            onExportQuery={handleExportQuery}
            onImportQuery={handleImportQuery}
            isConnected={activeConnection?.isConnected || false}
            isLoading={isQueryLoading}
          />

          {/* Editor */}
          <div
            className="flex-1 overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 shadow-inner"
            style={{ height: `calc(100% - ${resultsResize.size}px - 4px)` }}
          >
            <SqlEditor
              value={activeTab?.content || ""}
              onChange={handleEditorChange}
              onRunQuery={handleRunQuery}
              schemas={mockSchemas}
            />
          </div>

          {/* Results Resize Handle */}
          <ResizableHandle
            direction="vertical"
            onMouseDown={resultsResize.startResizing}
            isResizing={resultsResize.isResizing}
          />

          {/* Results Panel */}
          <div
            style={{ height: `${resultsResize.size}px` }}
            className="flex-shrink-0 backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 shadow-lg"
          >
            <QueryResults
              results={queryResults}
              isLoading={isQueryLoading}
              lastExecuted={lastQueryExecuted}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
