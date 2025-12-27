import { useState } from 'react';
import { useAppMode } from './hooks/useAppMode';
import { useWidgetPositions } from './hooks/useWidgetPositions';
import { WidgetWrapper } from './components/WidgetWrapper';
import { EditModeControls } from './components/EditModeControls';
import { AddWidgetPalette } from './components/AddWidgetPalette';
import { BackgroundLayer } from './components/BackgroundLayer';
import { ModeIndicator } from './components/ModeIndicator';
import { TimeWidget } from './components/widgets/TimeWidget';
import { OrbiWidget } from './components/widgets/OrbiWidget';
import { WeatherWidget } from './components/widgets/WeatherWidget';
import { NewsWidget } from './components/widgets/NewsWidget';
import { NotificationsWidget } from './components/widgets/NotificationsWidget';
import { StatusDotsWidget } from './components/widgets/StatusDotsWidget';
import { GroundedBriefWidget } from './components/widgets/GroundedBriefWidget';
import { PhotoWidget } from './components/widgets/PhotoWidget';
import { VoiceAgentWidget } from './components/widgets/VoiceAgentWidget';
import type { WidgetType, WidgetComponentProps } from './types';

const widgetComponents: Record<string, React.ComponentType<WidgetComponentProps>> = {
  time: TimeWidget,
  orb: OrbiWidget,
  weather: WeatherWidget,
  news: NewsWidget,
  notifications: NotificationsWidget,
  status_dots: StatusDotsWidget,
  grounded_brief: GroundedBriefWidget,
  photo: PhotoWidget,
  voice_agent: VoiceAgentWidget,
};

function App() {
  const [showAddWidget, setShowAddWidget] = useState(false);
  const { mode, isAmbient, toggleEdit } = useAppMode();
  const {
    widgets,
    loading,
    updatePosition,
    updateVisibility,
    bringToFront,
    addWidget,
    removeWidget,
  } = useWidgetPositions();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen overflow-hidden relative ${mode}-mode`}>
      <BackgroundLayer
        mode="white"
        value={null}
      />

      {widgets.map((widget) => {
        const WidgetComponent = widgetComponents[widget.widget_type];
        if (!WidgetComponent) return null;

        return (
          <WidgetWrapper
            key={widget.id}
            widget={widget}
            mode={mode}
            onPositionChange={updatePosition}
            onBringToFront={bringToFront}
            onRemove={removeWidget}
          >
            <WidgetComponent
              settings={widget.settings}
              isAmbient={isAmbient}
            />
          </WidgetWrapper>
        );
      })}

      <EditModeControls
        mode={mode}
        onToggleEdit={toggleEdit}
        onOpenAddWidget={() => setShowAddWidget(true)}
        widgets={widgets}
        onToggleVisibility={updateVisibility}
      />

      <ModeIndicator mode={mode} />

      {showAddWidget && (
        <AddWidgetPalette
          onClose={() => setShowAddWidget(false)}
          onAddWidget={handleAddWidget}
        />
      )}
    </div>
  );
}

export default App;
