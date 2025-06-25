import React, { useRef, useEffect } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { useTheme } from "../../hooks/useTheme";
import { Schema } from "../../../types/database";

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRunQuery: () => void;
  schemas: Schema[];
}

export function SqlEditor({ value, onChange, onRunQuery, schemas }: SqlEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onRunQuery();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [onRunQuery]);

  const setupAutoCompletion = (monaco: Monaco) => {
    // SQL keywords
    const sqlKeywords = [
      'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
      'TABLE', 'INDEX', 'VIEW', 'FUNCTION', 'PROCEDURE', 'TRIGGER', 'DATABASE', 'SCHEMA',
      'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'AS', 'AND', 'OR', 'NOT',
      'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'ORDER', 'BY', 'GROUP', 'HAVING',
      'LIMIT', 'OFFSET', 'UNION', 'INTERSECT', 'EXCEPT', 'CASE', 'WHEN', 'THEN', 'ELSE',
      'END', 'IF', 'DISTINCT', 'ALL', 'ANY', 'SOME', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
      'CAST', 'CONVERT', 'SUBSTRING', 'UPPER', 'LOWER', 'TRIM', 'LENGTH', 'COALESCE',
      'ISNULL', 'NULLIF', 'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'NOW()',
      'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'CHECK', 'DEFAULT', 'AUTO_INCREMENT',
      'SERIAL', 'BIGSERIAL', 'VARCHAR', 'CHAR', 'TEXT', 'INTEGER', 'BIGINT', 'SMALLINT',
      'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL', 'BOOLEAN', 'DATE', 'TIME', 'TIMESTAMP',
      'INTERVAL', 'ARRAY', 'JSON', 'JSONB', 'UUID', 'BLOB', 'CLOB'
    ];

    // Get all table names, column names, views, functions, sequences from schemas
    const tableNames: string[] = [];
    const columnNames: string[] = [];
    const viewNames: string[] = [];
    const functionNames: string[] = [];
    const sequenceNames: string[] = [];

    schemas.forEach(schema => {
      schema.tables.forEach(table => {
        tableNames.push(table.name);
        table.columns.forEach(column => {
          columnNames.push(column.name);
        });
      });
      schema.views.forEach(view => viewNames.push(view.name));
      schema.functions.forEach(func => functionNames.push(func.name));
      schema.sequences.forEach(seq => sequenceNames.push(seq.name));
    });

    // Register completion provider
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions: any[] = [];

        // Add SQL keywords
        sqlKeywords.forEach(keyword => {
          suggestions.push({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range: range,
            detail: 'SQL Keyword'
          });
        });

        // Add table names
        tableNames.forEach(tableName => {
          suggestions.push({
            label: tableName,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: tableName,
            range: range,
            detail: 'Table'
          });
        });

        // Add column names
        columnNames.forEach(columnName => {
          suggestions.push({
            label: columnName,
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: columnName,
            range: range,
            detail: 'Column'
          });
        });

        // Add view names
        viewNames.forEach(viewName => {
          suggestions.push({
            label: viewName,
            kind: monaco.languages.CompletionItemKind.Interface,
            insertText: viewName,
            range: range,
            detail: 'View'
          });
        });

        // Add function names
        functionNames.forEach(funcName => {
          suggestions.push({
            label: funcName,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: funcName + '()',
            range: range,
            detail: 'Function'
          });
        });

        // Add sequence names
        sequenceNames.forEach(seqName => {
          suggestions.push({
            label: seqName,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: seqName,
            range: range,
            detail: 'Sequence'
          });
        });

        return { suggestions };
      }
    });
  };

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Apply initial theme
    monaco.editor.setTheme(theme === "dark" ? "vs-dark" : "vs");

    // Setup auto-completion
    setupAutoCompletion(monaco);

    // Add shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunQuery();
    });

    // Format SQL shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument').run();
    });
  };

  // Update theme dynamically when it changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === "dark" ? "vs-dark" : "vs");
    }
  }, [theme]);

  // Update auto-completion when schemas change
  useEffect(() => {
    if (monacoRef.current) {
      setupAutoCompletion(monacoRef.current);
    }
  }, [schemas]);

  return (
    <div className="h-full bg-white dark:bg-gray-800">
      <Editor
        height="100%"
        language="sql"
        theme={theme === "dark" ? "vs-dark" : "vs"}
        value={value}
        onChange={(value) => onChange(value || "")}
        onMount={(editor, monaco) => handleEditorDidMount(editor, monaco)}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
          lineNumbers: "on",
          rulers: [80, 120],
          wordWrap: "on",
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "blink",
          cursorSmoothCaretAnimation: true,
          contextmenu: true,
          selectOnLineNumbers: true,
          lineHeight: 22,
          padding: { top: 16, bottom: 16 },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          snippetSuggestions: "top",
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
          quickSuggestionsDelay: 100,
          parameterHints: {
            enabled: true
          },
          autoIndent: "full",
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
}