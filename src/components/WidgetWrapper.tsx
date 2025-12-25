import { ReactNode } from 'react';
import { useDrag } from '../hooks/useDrag';
import type { WidgetPosition } from '../types';

interface WidgetWrapperProps {
  widget: WidgetPosition;
  children: ReactNode;
  onPositionChange: (id: string, x: number, y: number) => void;
  onBringToFront: (id: string) => void;
  editMode: boolean;
}

export function WidgetWrapper({
  widget,
  children,
  onPositionChange,
  onBringToFront,
  editMode,
}: WidgetWrapperProps) {
  const { position, isDragging, handleMouseDown } = useDrag({
    initialX: widget.x,
    initialY: widget.y,
    onDragEnd: (x, y) => onPositionChange(widget.id, x, y),
    onDragStart: () => onBringToFront(widget.id),
  });

  if (!widget.visible) return null;

  return (
    <div
      className={`absolute transition-all duration-200 ${
        editMode ? 'widget-draggable' : ''
      } ${isDragging ? 'widget-dragging' : ''}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        zIndex: widget.z_index,
      }}
      onMouseDown={editMode ? handleMouseDown : undefined}
    >
      {editMode && (
        <div className="absolute -inset-2 border-2 border-dashed border-gray-300/50 rounded-3xl pointer-events-none" />
      )}
      {children}
    </div>
  );
}
