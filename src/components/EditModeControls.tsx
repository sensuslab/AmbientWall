import { Settings, Eye, EyeOff, Move, Plus } from 'lucide-react';
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
  orb: 'Orb',
  weather: 'Weather',
  news: 'News',
  notifications: 'Alerts',
  status_dots: 'Status',
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
        <div className="relative p-1.5 flex gap-1 rounded-2xl animate-slide-up">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-heavy rounded-2xl border border-white/50" style={{
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 8px 32px rgba(0, 0, 0, 0.08)'
          }} />
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => onSwitchScene(scene.id)}
              className={`relative px-4 py-2 rounded-xl text-sm font-light transition-all duration-200 ${
                activeScene?.id === scene.id
                  ? 'bg-white/60 text-gray-800 shadow-sm'
                  : 'text-gray-500/70 hover:bg-white/30 hover:text-gray-700'
              }`}
            >
              {scene.name}
            </button>
          ))}
        </div>
      )}

      <div className="relative p-2 flex items-center gap-2 rounded-2xl animate-fade-in">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-heavy rounded-2xl border border-white/50" style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 8px 32px rgba(0, 0, 0, 0.08)'
        }} />

        <button
          onClick={onToggleEdit}
          className={`relative p-3 rounded-xl transition-all duration-200 ${
            isEditMode
              ? 'bg-teal-500/15 text-teal-700'
              : 'hover:bg-white/40 text-gray-500/80'
          }`}
          title={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
        >
          {isEditMode ? <Move className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
        </button>

        {isEditMode && (
          <>
            <div className="relative w-px h-6 bg-gray-200/50" />

            <button
              onClick={onOpenAddWidget}
              className="relative p-3 rounded-xl hover:bg-white/40 text-gray-500/80 transition-all duration-200"
              title="Add widget"
            >
              <Plus className="w-5 h-5" />
            </button>

            <div className="relative w-px h-6 bg-gray-200/50" />

            <div className="relative flex items-center gap-1">
              {widgets.slice(0, 6).map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => onToggleVisibility(widget.id, !widget.visible)}
                  className={`p-2 rounded-lg transition-all duration-200 group ${
                    widget.visible
                      ? 'hover:bg-white/40 text-gray-600'
                      : 'bg-gray-100/40 text-gray-400'
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
                <span className="text-xs text-gray-400 px-1">+{widgets.length - 6}</span>
              )}
            </div>
          </>
        )}
      </div>

      {isEditMode && (
        <div className="relative p-3 rounded-xl animate-fade-in">
          <div className="absolute inset-0 bg-white/30 backdrop-blur-glass rounded-xl border border-white/40" style={{
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
          }} />
          <div className="relative flex items-center gap-2 text-xs text-gray-500/70 font-light">
            <Move className="w-3 h-3" />
            <span>Drag widgets to reposition</span>
          </div>
        </div>
      )}
    </div>
  );
}
