import React, { memo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Database,
  Table,
  Eye,
  Zap,
  Folder,
  FolderOpen,
  Key,
  Link,
  Circle,
  FileText,
  Loader,
  Code,
  Play,
  TableProperties,
  Diamond,
} from "lucide-react";
import {
  TreeNode as TreeNodeType,
  useDatabaseTreeStore,
} from "../../stores/databaseTreeStore";

interface TreeNodeProps {
  node: TreeNodeType;
  level: number;
  isExpanded: boolean;
  onToggle: (nodeId: string) => void;
  searchQuery: string;
}

const getNodeIcon = (
  type: TreeNodeType["type"],
  isExpanded: boolean,
  isLoading?: boolean
) => {
  const iconProps = { size: 14, className: "flex-shrink-0" };

  if (isLoading) {
    return (
      <Loader
        {...iconProps}
        className="animate-spin text-blue-500 flex-shrink-0"
      />
    );
  }

  switch (type) {
    case "schema":
      return (
        <Database {...iconProps} className="text-blue-500 flex-shrink-0" />
      );
    case "table":
      return <Table {...iconProps} className="text-green-500 flex-shrink-0" />;
    case "view":
      return <Eye {...iconProps} className="text-purple-500 flex-shrink-0" />;
    case "function":
      return <Zap {...iconProps} className="text-orange-500 flex-shrink-0" />;
    case "procedure":
      return <Code {...iconProps} className="text-indigo-500 flex-shrink-0" />;
    case "trigger":
      return <Play {...iconProps} className="text-red-500 flex-shrink-0" />;
    case "column":
      return (
        <Diamond {...iconProps} className="text-slate-400 flex-shrink-0" />
      );
    case "folder":
      return isExpanded ? (
        <FolderOpen {...iconProps} className="text-slate-500 flex-shrink-0" />
      ) : (
        <Folder {...iconProps} className="text-slate-500 flex-shrink-0" />
      );
    default:
      return (
        <FileText {...iconProps} className="text-slate-400 flex-shrink-0" />
      );
  }
};

const getNodeStyles = (type: TreeNodeType["type"], level: number) => {
  const baseStyles =
    "flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer transition-all duration-150 rounded-md group";
  const hoverStyles = "hover:bg-slate-100/80 dark:hover:bg-slate-700/50";

  if (type === "schema") {
    return `${baseStyles} ${hoverStyles} font-semibold text-slate-800 dark:text-slate-200`;
  }

  if (type === "folder") {
    return `${baseStyles} ${hoverStyles} font-medium text-slate-700 dark:text-slate-300`;
  }

  // Clickable items (table, view, procedure, function, trigger)
  if (["table", "view", "procedure", "function", "trigger"].includes(type)) {
    return `${baseStyles} ${hoverStyles} text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300`;
  }

  return `${baseStyles} ${hoverStyles} text-slate-600 dark:text-slate-400`;
};

const highlightText = (text: string, searchQuery: string) => {
  if (!searchQuery.trim()) return text;

  const regex = new RegExp(`(${searchQuery})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark
        key={index}
        className="bg-yellow-200 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-200 px-0.5 rounded"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export const TreeNode = memo<TreeNodeProps>(
  ({ node, level, isExpanded, onToggle, searchQuery }) => {
    const { onNodeSelect, expandedNodes } = useDatabaseTreeStore();
    const hasChildren = node.hasChildren;
    const paddingLeft = level * 10;

    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasChildren) {
        onToggle(node.id);
      }
    };

    return (
      <div>
        <div
          className={getNodeStyles(node.type, level)}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={handleToggle}
        >
          {/* Expand/Collapse Icon */}
          <div className="w-4 h-4 flex items-center justify-center">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown
                  size={12}
                  className="text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                />
              ) : (
                <ChevronRight
                  size={12}
                  className="text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                />
              )
            ) : null}
          </div>

          {/* Node Icon */}
          {getNodeIcon(node.type, isExpanded, node.isLoading)}

          {/* Node Name */}
          <span className="flex-1 truncate font-medium" title={node.name}>
            {highlightText(node.name, searchQuery)}
          </span>

          {/* Loading indicator */}
          {node.isLoading && (
            <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2  rounded-sm">
              Loading...
            </span>
          )}

          {/* Metadata Badge */}
          {node.metadata?.dataType && (
            <span className="text-xs bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-2  rounded-sm font-mono">
              {node.metadata.dataType}
            </span>
          )}

          {/* Return Type Badge for Functions */}
          {node.metadata?.returnType && (
            <span className="text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2  rounded-sm font-mono">
              → {node.metadata.returnType}
            </span>
          )}

          {/* Primary Key Indicator */}
          {/* {node.metadata?.isPrimaryKey && (
            <Key size={10} className="text-yellow-500" />
          )} */}

          {/* Foreign Key Indicator */}
          {/* {node.metadata?.isForeignKey && (
            <Link size={10} className="text-blue-500" />
          )} */}

          {["table", "view", "procedure", "function", "trigger"].includes(
            node.type
          ) && (
            <span
              className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2  rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                onNodeSelect(node);
              }}
            >
              <TableProperties size={14} className="inline" />
            </span>
          )}
        </div>

        {/* Children */}
        {/* {hasChildren && isExpanded && (
          <>
            {!node.isLoaded ? (
              <div className="ml-6 text-xs text-slate-500">
                Loading children...
              </div>
            ) : (
              <div className="space-y-0.5">
                {node.children?.map((child) => (
                  <TreeNode
                    key={child.id}
                    node={child}
                    level={level + 1}
                    isExpanded={expandedNodes.has(child.id)}
                    onToggle={onToggle}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            )}
          </>
        )} */}
        {hasChildren && isExpanded && node.children && node.isLoaded && (
          <div className="space-y-0.5">
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                isExpanded={expandedNodes.has(child.id)}
                onToggle={onToggle}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

TreeNode.displayName = "TreeNode";
