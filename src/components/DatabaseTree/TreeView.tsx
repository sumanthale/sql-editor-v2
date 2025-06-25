import React, { memo } from 'react';
import { TreeNode } from './TreeNode';
import { TreeNode as TreeNodeType, useDatabaseTreeStore } from '../../stores/databaseTreeStore';

interface TreeViewProps {
  nodes: TreeNodeType[];
  searchQuery: string;
}

export const TreeView = memo<TreeViewProps>(({ nodes, searchQuery }) => {
  const { expandedNodes, toggleNode } = useDatabaseTreeStore();

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-slate-500 dark:text-slate-400">
        <div className="text-center">
          <div className="text-sm">No matching items found</div>
          {searchQuery && (
            <div className="text-xs mt-1">
              Try adjusting your search query
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          isExpanded={expandedNodes.has(node.id)}
          onToggle={toggleNode}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
});

TreeView.displayName = 'TreeView';