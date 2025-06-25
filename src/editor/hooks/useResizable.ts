import { useState, useCallback, useEffect } from 'react';

interface UseResizableOptions {
  initialSize: number;
  minSize?: number;
  maxSize?: number;
  direction: 'horizontal' | 'vertical';
}

export function useResizable({
  initialSize,
  minSize = 200,
  maxSize = window.innerWidth * 0.8,
  direction
}: UseResizableOptions) {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const newSize = direction === 'horizontal' 
      ? e.clientX 
      : window.innerHeight - e.clientY;

    if (newSize >= minSize && newSize <= maxSize) {
      setSize(newSize);
    }
  }, [isResizing, minSize, maxSize, direction]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResizing);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, resize, stopResizing, direction]);

  return { size, isResizing, startResizing };
}