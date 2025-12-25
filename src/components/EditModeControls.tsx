import { Settings, Eye, EyeOff, Move, Plus, Layers } from 'lucide-react';
import type { WidgetInstance, Scene, AppMode } from '../types';

interface EditModeControlsProps {
  mode: AppMode;
  onToggleEdit: () => void;
  onOpenAddWidget: () => void;
  widgets: WidgetInstance[];
  scenes: Scene[];
  activeScene: Scene | null;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onSwitchScene: (sceneId: string) => void;
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
  mode,
  onToggleEdit,
  onOpenAddWidget,
  widgets,
  scenes,
  activeScene,
  onToggleVisibility,
  onSwitchScene,
}: EditModeControlsProps) {
  const isEditMode = mode === 'edit';
  const isAmbientMode = mode === 'ambient';

  if (isAmbientMode) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isEditMode && scenes.length > 1 && (
        <div className="scene-switcher animate-slide-up">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => onSwitchScene(scene.id)}
              className={`scene-button ${
                activeScene?.id === scene.id
                  ? 'scene-button-active'
                  : 'scene-button-inactive'
              }`}
            >
              {scene.name}
            </button>
          ))}
        </div>
      )}

      <div className="glass-panel-heavy p-2 flex items-center gap-2 animate-fade-in">
        <button
          onClick={onToggleEdit}
          className={`p-3 rounded-xl transition-all ${
            isEditMode
              ? 'bg-cyan-500/20 text-cyan-700'
              : 'hover:bg-white/30 text-gray-600/80'
          }`}
          title={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
        >
          {isEditMode ? <Move className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
        </button>

        {isEditMode && (
          <>
            <div className="w-px h-6 bg-white/30" />

            <button
              onClick={onOpenAddWidget}
              className="p-3 rounded-xl hover:bg-white/30 text-gray-600/80 transition-all"
              title="Add widget"
            >
              <Plus className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-white/30" />

            <div className="flex items-center gap-1">
              {widgets.slice(0, 6).map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => onToggleVisibility(widget.id, !widget.visible)}
                  className={`p-2 rounded-lg transition-all ${
                    widget.visible
                      ? 'hover:bg-white/30 text-gray-700'
                      : 'bg-gray-200/30 text-gray-400'
                  }`}
                  title={`${widget.visible ? 'Hide' : 'Show'} ${widgetLabels[widget.widget_type] || widget.widget_type}`}
                >
                  {widget.visible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              ))}
              {widgets.length > 6 && (
                <span className="text-xs text-gray-500 px-1">+{widgets.length - 6}</span>
              )}
            </div>
          </>
        )}
      </div>

      {isEditMode && (
        <div className="glass-panel-light p-3 text-xs text-gray-600/70 font-light animate-fade-in">
          <div className="flex items-center gap-2">
            <Move className="w-3 h-3" />
            <span>Drag widgets to reposition</span>
          </div>
        </div>
      )}
    </div>
  );
}
