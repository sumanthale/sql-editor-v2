import React, { useRef } from 'react';
import { 
  Download, 
  Upload, 
  Copy, 
  Trash2, 
  Code, 
  Zap,
  RotateCcw
} from 'lucide-react';

interface EditorToolbarProps {
  onRunQuery: () => void;
  onFormatQuery: () => void;
  onClearQuery: () => void;
  onCopyQuery: () => void;
  onExportQuery: () => void;
  onImportQuery: (content: string) => void;
  isConnected: boolean;
  isLoading: boolean;
}

export function EditorToolbar({
  onRunQuery,
  onFormatQuery,
  onClearQuery,
  onCopyQuery,
  onExportQuery,
  onImportQuery,
  isConnected,
  isLoading
}: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onImportQuery(content);
      };
      reader.readAsText(file);
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-12 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 flex items-center px-4 gap-2 shadow-sm">
      {/* Primary Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRunQuery}
          disabled={!isConnected || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none transform hover:scale-105 disabled:transform-none"
        >
          {isLoading ? (
            <>
              <RotateCcw size={14} className="animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Zap size={14} />
              Run Query
            </>
          )}
        </button>

        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />

        <button
          onClick={onFormatQuery}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-all duration-200"
          title="Format SQL (Ctrl+Shift+F)"
        >
          <Code size={14} />
          Format
        </button>

        <button
          onClick={onCopyQuery}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-all duration-200"
          title="Copy to Clipboard"
        >
          <Copy size={14} />
          Copy
        </button>

        <button
          onClick={onClearQuery}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-xs font-medium transition-all duration-200"
          title="Clear Editor"
        >
          <Trash2 size={14} />
          Clear
        </button>
      </div>

      <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />

      {/* Import/Export Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExportQuery}
          className="flex items-center  gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium transition-all duration-200"
          title="Export Query"
        >
          <Download size={14} />
          Export
        </button>

        <button
          onClick={handleImportClick}
          className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-medium transition-all duration-200"
          title="Import Query"
        >
          <Upload size={14} />
          Import
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".sql,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="hidden  ml-auto lg:flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs">Ctrl+Enter</kbd>
          <span>Run</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs">Ctrl+Shift+F</kbd>
          <span>Format</span>
        </div>
      </div>
    </div>
  );
}