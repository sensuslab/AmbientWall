import { Settings, Eye, EyeOff, Move } from 'lucide-react';
import type { WidgetPosition } from '../types';

interface EditModeControlsProps {
  editMode: boolean;
  onToggleEdit: () => void;
  widgets: WidgetPosition[];
  onToggleVisibility: (id: string, visible: boolean) => void;
}

const widgetLabels: Record<string, string> = {
  time: 'Time',
  orb: 'Status Orb',
  weather: 'Weather',
  news: 'News Strip',
  notifications: 'Notifications',
  status_dots: 'Status Dots',
};

export function EditModeControls({
  editMode,
  onToggleEdit,
  widgets,
  onToggleVisibility,
}: EditModeControlsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="glass-panel-heavy p-2 flex items-center gap-2">
        <button
          onClick={onToggleEdit}
          className={`p-3 rounded-xl transition-all ${
            editMode
              ? 'bg-cyan-500/20 text-cyan-700'
              : 'hover:bg-white/30 text-gray-600/80'
          }`}
          title={editMode ? 'Exit edit mode' : 'Enter edit mode'}
        >
          {editMode ? <Move className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
        </button>

        {editMode && (
          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/30">
            {widgets.map((widget) => (
              <button
                key={widget.id}
                onClick={() => onToggleVisibility(widget.id, !widget.visible)}
                className={`p-2 rounded-lg transition-all ${
                  widget.visible
                    ? 'hover:bg-white/30 text-gray-700'
                    : 'bg-gray-200/30 text-gray-400'
                }`}
                title={`${widget.visible ? 'Hide' : 'Show'} ${widgetLabels[widget.widget_type]}`}
              >
                {widget.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {editMode && (
        <div className="mt-2 glass-panel-light p-3 text-xs text-gray-600/70 font-light">
          <div className="flex items-center gap-2">
            <Move className="w-3 h-3" />
            <span>Drag widgets to reposition</span>
          </div>
        </div>
      )}
    </div>
  );
}
