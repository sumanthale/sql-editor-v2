import React from 'react';
import { GripVertical, GripHorizontal } from 'lucide-react';

interface ResizableHandleProps {
  direction: 'horizontal' | 'vertical';
  onMouseDown: () => void;
  isResizing: boolean;
}

export function ResizableHandle({ direction, onMouseDown, isResizing }: ResizableHandleProps) {
  const isHorizontal = direction === 'horizontal';
  
  return (
    <div
      className={`
        ${isHorizontal ? 'w-1 h-full cursor-col-resize' : 'w-full h-1 cursor-row-resize'}
        bg-slate-200 dark:bg-slate-600 hover:bg-blue-400 dark:hover:bg-blue-500
        transition-all duration-200 flex items-center justify-center group
        ${isResizing ? 'bg-blue-500 dark:bg-blue-400 shadow-lg shadow-blue-500/25' : ''}
        relative
      `}
      onMouseDown={onMouseDown}
    >
      <div className={`
        ${isHorizontal ? 'w-4 h-10' : 'w-10 h-4'}
        bg-slate-300 dark:bg-slate-500 group-hover:bg-blue-500 dark:group-hover:bg-blue-400
        rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100
        transition-all duration-200 shadow-sm
        ${isResizing ? 'opacity-100 bg-blue-500 dark:bg-blue-400 shadow-md' : ''}
      `}>
        {isHorizontal ? (
          <GripVertical size={12} className="text-white" />
        ) : (
          <GripHorizontal size={12} className="text-white" />
        )}
      </div>
    </div>
  );
}