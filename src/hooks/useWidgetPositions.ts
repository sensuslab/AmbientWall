import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { WidgetInstance, WidgetType, ElevationLevel, ELEVATION_Z_INDEX } from '../types';

interface DefaultWidgetConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  elevation: ElevationLevel;
}

const DEFAULT_WIDGETS: Record<string, DefaultWidgetConfig> = {
  time: { x: 8, y: 8, width: 0, height: 0, elevation: 'raised-1' },
  orb: { x: 45, y: 35, width: 0, height: 0, elevation: 'raised-2' },
  weather: { x: 80, y: 8, width: 0, height: 0, elevation: 'raised-1' },
  news: { x: 5, y: 85, width: 0, height: 0, elevation: 'surface' },
  notifications: { x: 8, y: 40, width: 0, height: 0, elevation: 'raised-2' },
  status_dots: { x: 70, y: 55, width: 0, height: 0, elevation: 'surface' },
};

const ELEVATION_Z: Record<ElevationLevel, number> = {
  'surface': 1,
  'raised-1': 10,
  'raised-2': 20,
  'raised-3': 30,
  'raised-4': 40,
  'floating': 100,
};

export function useWidgetPositions(sceneId?: string) {
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWidgets();
  }, [sceneId]);

  async function loadWidgets() {
    setLoading(true);
    let query = supabase
      .from('widget_positions')
      .select('*')
      .order('z_index', { ascending: true });

    if (sceneId) {
      query = query.eq('scene_id', sceneId);
    }

    const { data } = await query;

    if (data && data.length > 0) {
      const mapped = data.map((d) => ({
        ...d,
        elevation: d.elevation || 'raised-1',
        width: d.width || 0,
        height: d.height || 0,
      }));
      setWidgets(mapped);
    } else if (!sceneId) {
      await initializeDefaultWidgets();
    }
    setLoading(false);
  }

  async function initializeDefaultWidgets() {
    const { data: defaultScene } = await supabase
      .from('scenes')
      .select('id')
      .eq('is_active', true)
      .maybeSingle();

    const widgetTypes: WidgetType[] = ['time', 'orb', 'weather', 'news', 'notifications', 'status_dots'];
    const newWidgets = widgetTypes.map((type) => {
      const config = DEFAULT_WIDGETS[type] || DEFAULT_WIDGETS.time;
      return {
        widget_type: type,
        x: config.x,
        y: config.y,
        width: config.width,
        height: config.height,
        elevation: config.elevation,
        z_index: ELEVATION_Z[config.elevation],
        visible: true,
        settings: {},
        scene_id: defaultScene?.id || null,
      };
    });

    const { data } = await supabase
      .from('widget_positions')
      .insert(newWidgets)
      .select();

    if (data) {
      setWidgets(data);
    }
  }

  const updatePosition = useCallback(async (id: string, x: number, y: number) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y, updated_at: new Date().toISOString() } : w))
    );

    await supabase
      .from('widget_positions')
      .update({ x, y, updated_at: new Date().toISOString() })
      .eq('id', id);
  }, []);

  const updateSize = useCallback(async (id: string, width: number, height: number) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, width, height, updated_at: new Date().toISOString() } : w))
    );

    await supabase
      .from('widget_positions')
      .update({ width, height, updated_at: new Date().toISOString() })
      .eq('id', id);
  }, []);

  const updateElevation = useCallback(async (id: string, elevation: ElevationLevel) => {
    const z_index = ELEVATION_Z[elevation];
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, elevation, z_index, updated_at: new Date().toISOString() } : w))
    );

    await supabase
      .from('widget_positions')
      .update({ elevation, z_index, updated_at: new Date().toISOString() })
      .eq('id', id);
  }, []);

  const updateVisibility = useCallback(async (id: string, visible: boolean) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible, updated_at: new Date().toISOString() } : w))
    );

    await supabase
      .from('widget_positions')
      .update({ visible, updated_at: new Date().toISOString() })
      .eq('id', id);
  }, []);

  const updateSettings = useCallback(async (id: string, settings: Record<string, unknown>) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, settings, updated_at: new Date().toISOString() } : w))
    );

    await supabase
      .from('widget_positions')
      .update({ settings, updated_at: new Date().toISOString() })
      .eq('id', id);
  }, []);

  const bringToFront = useCallback(async (id: string) => {
    const widget = widgets.find((w) => w.id === id);
    if (!widget) return;

    const sameElevation = widgets.filter((w) => w.elevation === widget.elevation);
    const maxZ = Math.max(...sameElevation.map((w) => w.z_index || ELEVATION_Z[widget.elevation]));
    const newZ = maxZ + 1;

    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, z_index: newZ } : w))
    );

    await supabase
      .from('widget_positions')
      .update({ z_index: newZ, updated_at: new Date().toISOString() })
      .eq('id', id);
  }, [widgets]);

  const addWidget = useCallback(async (type: WidgetType, sceneIdOverride?: string) => {
    const config = DEFAULT_WIDGETS[type] || DEFAULT_WIDGETS.time;
    const targetSceneId = sceneIdOverride || sceneId;

    const newWidget = {
      widget_type: type,
      x: 50,
      y: 50,
      width: config.width,
      height: config.height,
      elevation: config.elevation,
      z_index: ELEVATION_Z[config.elevation] + widgets.length,
      visible: true,
      settings: {},
      scene_id: targetSceneId || null,
    };

    const { data } = await supabase
      .from('widget_positions')
      .insert(newWidget)
      .select()
      .maybeSingle();

    if (data) {
      setWidgets((prev) => [...prev, data]);
      return data;
    }
    return null;
  }, [sceneId, widgets.length]);

  const removeWidget = useCallback(async (id: string) => {
    await supabase
      .from('widget_positions')
      .delete()
      .eq('id', id);

    setWidgets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return {
    widgets,
    loading,
    updatePosition,
    updateSize,
    updateElevation,
    updateVisibility,
    updateSettings,
    bringToFront,
    addWidget,
    removeWidget,
  };
}
