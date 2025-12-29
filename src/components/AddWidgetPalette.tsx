import { X, Clock, Circle, Cloud, Newspaper, Bell, Activity, FileText, Image, Mic, type LucideIcon } from 'lucide-react';
import type { WidgetType } from '../types';

interface AddWidgetPaletteProps {
  onClose: () => void;
  onAddWidget: (type: WidgetType) => void;
}

const AVAILABLE_WIDGETS: { type: WidgetType; name: string; description: string; icon: LucideIcon }[] = [
  { type: 'time', name: 'Time', description: 'Sculptural time display', icon: Clock },
  { type: 'orb', name: 'Status Orb', description: 'Ambient status indicator', icon: Circle },
  { type: 'weather', name: 'Weather', description: 'Live weather data', icon: Cloud },
  { type: 'news', name: 'News', description: 'Live news rotation', icon: Newspaper },
  { type: 'grounded_brief', name: 'Daily Brief', description: 'News summary', icon: FileText },
  { type: 'photo', name: 'Photo', description: 'Photo slideshow', icon: Image },
  { type: 'voice_agent', name: 'Voice Agent', description: 'AI voice assistant', icon: Mic },
  { type: 'notifications', name: 'Notifications', description: 'Floating alert cards', icon: Bell },
  { type: 'status_dots', name: 'Status Dots', description: 'Service indicators', icon: Activity },
];

export function AddWidgetPalette({ onClose, onAddWidget }: AddWidgetPaletteProps) {
  return (
    <div
      className="fixed inset-0 bg-black/5 backdrop-blur-xs flex items-center justify-center animate-fade-in z-50"
      onClick={onClose}
    >
      <div
        className="relative p-6 max-w-lg w-full mx-4 rounded-3xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-white/55 backdrop-blur-heavy rounded-3xl border border-white/60" style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 24px 64px rgba(0, 0, 0, 0.12)'
        }} />

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-light text-gray-700">Add Widget</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
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
                  className="relative p-4 text-left rounded-2xl transition-all duration-200 hover:scale-[1.02] group"
                >
                  <div className="absolute inset-0 bg-white/40 rounded-2xl border border-white/50 transition-all duration-200 group-hover:bg-white/60" style={{
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
                  }} />
                  <div className="relative flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white/50 border border-white/60">
                      <Icon className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        {widget.name}
                      </div>
                      <div className="text-xs font-light text-gray-400 mt-0.5">
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
    </div>
  );
}
