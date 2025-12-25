import { useState, useCallback, useRef, useEffect } from 'react';

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

interface UseDragOptions {
  initialX: number;
  initialY: number;
  onDragEnd?: (x: number, y: number) => void;
  onDragStart?: () => void;
}

export function useDrag({ initialX, initialY, onDragEnd, onDragStart }: UseDragOptions) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const positionRef = useRef({ x: initialX, y: initialY });
  const dragState = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const onDragEndRef = useRef(onDragEnd);

  useEffect(() => {
    onDragEndRef.current = onDragEnd;
  }, [onDragEnd]);

  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: initialX, y: initialY });
      positionRef.current = { x: initialX, y: initialY };
    }
  }, [initialX, initialY, isDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    setIsDragging(true);
    onDragStart?.();
  }, [onDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current.isDragging) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const newX = ((e.clientX - dragState.current.offsetX) / viewportWidth) * 100;
    const newY = ((e.clientY - dragState.current.offsetY) / viewportHeight) * 100;

    const clampedX = Math.max(0, Math.min(90, newX));
    const clampedY = Math.max(0, Math.min(90, newY));

    positionRef.current = { x: clampedX, y: clampedY };
    setPosition({ x: clampedX, y: clampedY });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (dragState.current.isDragging) {
      dragState.current.isDragging = false;
      setIsDragging(false);
      onDragEndRef.current?.(positionRef.current.x, positionRef.current.y);
    }
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    position,
    isDragging,
    handleMouseDown,
  };
}
