import { X, Clock, Circle, Cloud, Newspaper, Bell, Activity } from 'lucide-react';
import type { WidgetType } from '../types';

interface AddWidgetPaletteProps {
  onClose: () => void;
  onAddWidget: (type: WidgetType) => void;
}

const AVAILABLE_WIDGETS: { type: WidgetType; name: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'time', name: 'Time', description: 'Sculptural time display', icon: Clock },
  { type: 'orb', name: 'Status Orb', description: 'Ambient status indicator', icon: Circle },
  { type: 'weather', name: 'Weather', description: 'Current conditions', icon: Cloud },
  { type: 'news', name: 'News Strip', description: 'Rotating headlines', icon: Newspaper },
  { type: 'notifications', name: 'Notifications', description: 'Floating alert cards', icon: Bell },
  { type: 'status_dots', name: 'Status Dots', description: 'Service indicators', icon: Activity },
];

export function AddWidgetPalette({ onClose, onAddWidget }: AddWidgetPaletteProps) {
  return (
    <div className="add-widget-palette animate-fade-in" onClick={onClose}>
      <div
        className="glass-panel-heavy p-6 max-w-lg w-full mx-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-light text-gray-800">Add Widget</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/40 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {AVAILABLE_WIDGETS.map((widget) => {
            const Icon = widget.icon;
            return (
              <button
                key={widget.type}
                onClick={() => {
                  onAddWidget(widget.type);
                  onClose();
                }}
                className="add-widget-card text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/40">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {widget.name}
                    </div>
                    <div className="text-xs font-light text-gray-500 mt-0.5">
                      {widget.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
