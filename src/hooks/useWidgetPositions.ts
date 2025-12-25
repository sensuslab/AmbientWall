import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { WidgetPosition, WidgetType } from '../types';

const DEFAULT_POSITIONS: Record<WidgetType, { x: number; y: number; z_index: number }> = {
  time: { x: 8, y: 8, z_index: 1 },
  orb: { x: 45, y: 35, z_index: 2 },
  weather: { x: 80, y: 8, z_index: 1 },
  news: { x: 5, y: 85, z_index: 3 },
  notifications: { x: 8, y: 35, z_index: 2 },
  status_dots: { x: 70, y: 50, z_index: 1 },
};

export function useWidgetPositions() {
  const [positions, setPositions] = useState<WidgetPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPositions();
  }, []);

  async function loadPositions() {
    const { data } = await supabase
      .from('widget_positions')
      .select('*')
      .order('z_index', { ascending: true });

    if (data && data.length > 0) {
      setPositions(data);
    } else {
      await initializeDefaultPositions();
    }
    setLoading(false);
  }

  async function initializeDefaultPositions() {
    const widgetTypes: WidgetType[] = ['time', 'orb', 'weather', 'news', 'notifications', 'status_dots'];
    const newPositions: Omit<WidgetPosition, 'id' | 'created_at' | 'updated_at'>[] = widgetTypes.map(type => ({
      widget_type: type,
      ...DEFAULT_POSITIONS[type],
      visible: true,
      settings: {},
    }));

    const { data } = await supabase
      .from('widget_positions')
      .insert(newPositions)
      .select();

    if (data) {
      setPositions(data);
    }
  }

  const updatePosition = useCallback(async (id: string, x: number, y: number) => {
    setPositions(prev =>
      prev.map(p => (p.id === id ? { ...p, x, y, updated_at: new Date().toISOString() } : p))
    );

    await supabase
      .from('widget_positions')
      .update({ x, y, updated_at: new Date().toISOString() })
      .eq('id', id);
  }, []);

  const updateVisibility = useCallback(async (id: string, visible: boolean) => {
    setPositions(prev =>
      prev.map(p => (p.id === id ? { ...p, visible, updated_at: new Date().toISOString() } : p))
    );

    await supabase
      .from('widget_positions')
      .update({ visible, updated_at: new Date().toISOString() })
      .eq('id', id);
  }, []);

  const bringToFront = useCallback(async (id: string) => {
    const maxZ = Math.max(...positions.map(p => p.z_index));
    setPositions(prev =>
      prev.map(p => (p.id === id ? { ...p, z_index: maxZ + 1 } : p))
    );

    await supabase
      .from('widget_positions')
      .update({ z_index: maxZ + 1, updated_at: new Date().toISOString() })
      .eq('id', id);
  }, [positions]);

  return {
    positions,
    loading,
    updatePosition,
    updateVisibility,
    bringToFront,
  };
}
