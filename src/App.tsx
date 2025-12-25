import { useState } from 'react';
import { useWidgetPositions } from './hooks/useWidgetPositions';
import { WidgetWrapper } from './components/WidgetWrapper';
import { EditModeControls } from './components/EditModeControls';
import { TimeWidget } from './components/widgets/TimeWidget';
import { OrbiWidget } from './components/widgets/OrbiWidget';
import { WeatherWidget } from './components/widgets/WeatherWidget';
import { NewsWidget } from './components/widgets/NewsWidget';
import { NotificationsWidget } from './components/widgets/NotificationsWidget';
import { StatusDotsWidget } from './components/widgets/StatusDotsWidget';
import type { WidgetType } from './types';

const widgetComponents: Record<WidgetType, React.ComponentType> = {
  time: TimeWidget,
  orb: OrbiWidget,
  weather: WeatherWidget,
  news: NewsWidget,
  notifications: NotificationsWidget,
  status_dots: StatusDotsWidget,
};

function App() {
  const [editMode, setEditMode] = useState(false);
  const { positions, loading, updatePosition, updateVisibility, bringToFront } = useWidgetPositions();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to left, rgba(245, 245, 245, 0.3) 0%, transparent 40%)',
        }}
      />

      {positions.map((widget) => {
        const WidgetComponent = widgetComponents[widget.widget_type as WidgetType];
        if (!WidgetComponent) return null;

        return (
          <WidgetWrapper
            key={widget.id}
            widget={widget}
            onPositionChange={updatePosition}
            onBringToFront={bringToFront}
            editMode={editMode}
          >
            <WidgetComponent />
          </WidgetWrapper>
        );
      })}

      <EditModeControls
        editMode={editMode}
        onToggleEdit={() => setEditMode(!editMode)}
        widgets={positions}
        onToggleVisibility={updateVisibility}
      />
    </div>
  );
}

export default App;
