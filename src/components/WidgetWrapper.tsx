import { ReactNode, useState } from 'react';
import { Trash2, Settings } from 'lucide-react';
import { useDrag } from '../hooks/useDrag';
import type { WidgetInstance, ElevationLevel, AppMode } from '../types';

interface WidgetWrapperProps {
  widget: WidgetInstance;
  children: ReactNode;
  mode: AppMode;
  onPositionChange: (id: string, x: number, y: number) => void;
  onBringToFront: (id: string) => void;
  onRemove?: (id: string) => void;
  onOpenSettings?: (id: string) => void;
}

const ELEVATION_CLASSES: Record<ElevationLevel, string> = {
  'surface': 'elevation-surface',
  'raised-1': 'elevation-raised-1',
  'raised-2': 'elevation-raised-2',
  'raised-3': 'elevation-raised-3',
  'raised-4': 'elevation-raised-4',
  'floating': 'elevation-floating',
};

export function WidgetWrapper({
  widget,
  children,
  mode,
  onPositionChange,
  onBringToFront,
  onRemove,
  onOpenSettings,
}: WidgetWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isEditMode = mode === 'edit';
  const isAmbientMode = mode === 'ambient';

  const { position, isDragging, handleMouseDown } = useDrag({
    initialX: widget.x,
    initialY: widget.y,
    onDragEnd: (x, y) => onPositionChange(widget.id, x, y),
    onDragStart: () => onBringToFront(widget.id),
  });

  if (!widget.visible) return null;

  const elevationClass = ELEVATION_CLASSES[widget.elevation] || ELEVATION_CLASSES['raised-1'];

  return (
    <div
      className={`widget-container gpu-accelerated ${elevationClass} ${
        isEditMode ? 'widget-draggable' : ''
      } ${isDragging ? 'widget-dragging' : ''} ${
        isHovered && isEditMode ? 'widget-lift' : ''
      } ${isAmbientMode ? 'pause-animations' : ''}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        zIndex: isDragging ? 1000 : widget.z_index,
      }}
      onMouseDown={isEditMode ? handleMouseDown : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditMode && isHovered && (
        <>
          <div className="absolute -inset-3 border-2 border-dashed border-gray-300/30 rounded-3xl pointer-events-none animate-fade-in" />

          <div className="widget-controls absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 animate-fade-in">
            {onOpenSettings && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSettings(widget.id);
                }}
                className="p-1.5 rounded-lg glass-panel-light hover:bg-white/50 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(widget.id);
                }}
                className="p-1.5 rounded-lg glass-panel-light hover:bg-rose-100/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-rose-500" />
              </button>
            )}
          </div>
        </>
      )}
      {children}
    </div>
  );
}
