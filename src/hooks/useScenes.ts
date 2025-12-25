import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Scene } from '../types';

const DEFAULT_SCENES: Omit<Scene, 'id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Morning', description: 'Calm start to the day', background_mode: 'warm', background_value: null, is_active: false, sort_order: 1 },
  { name: 'Work', description: 'Focused productivity', background_mode: 'white', background_value: null, is_active: false, sort_order: 2 },
  { name: 'Evening', description: 'Wind down mode', background_mode: 'gradient', background_value: null, is_active: false, sort_order: 3 },
];

export function useScenes() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScenes();
  }, []);

  async function loadScenes() {
    const { data } = await supabase
      .from('scenes')
      .select('*')
      .order('sort_order', { ascending: true });

    if (data && data.length > 0) {
      setScenes(data);
      const active = data.find((s) => s.is_active);
      setActiveScene(active || data[0]);

      if (data.length === 1 && data[0].name === 'Default') {
        await createDefaultScenes();
      }
    }
    setLoading(false);
  }

  async function createDefaultScenes() {
    const { data } = await supabase
      .from('scenes')
      .insert(DEFAULT_SCENES)
      .select();

    if (data) {
      setScenes((prev) => [...prev, ...data]);
    }
  }

  const switchScene = useCallback(async (sceneId: string) => {
    await supabase
      .from('scenes')
      .update({ is_active: false })
      .neq('id', sceneId);

    await supabase
      .from('scenes')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', sceneId);

    setScenes((prev) =>
      prev.map((s) => ({ ...s, is_active: s.id === sceneId }))
    );
    setActiveScene(scenes.find((s) => s.id === sceneId) || null);
  }, [scenes]);

  const updateScene = useCallback(async (sceneId: string, updates: Partial<Scene>) => {
    const { data } = await supabase
      .from('scenes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', sceneId)
      .select()
      .maybeSingle();

    if (data) {
      setScenes((prev) =>
        prev.map((s) => (s.id === sceneId ? data : s))
      );
      if (activeScene?.id === sceneId) {
        setActiveScene(data);
      }
    }
  }, [activeScene]);

  const createScene = useCallback(async (scene: Omit<Scene, 'id' | 'created_at' | 'updated_at'>) => {
    const { data } = await supabase
      .from('scenes')
      .insert(scene)
      .select()
      .maybeSingle();

    if (data) {
      setScenes((prev) => [...prev, data]);
      return data;
    }
    return null;
  }, []);

  const deleteScene = useCallback(async (sceneId: string) => {
    if (scenes.length <= 1) return false;

    await supabase
      .from('scenes')
      .delete()
      .eq('id', sceneId);

    setScenes((prev) => prev.filter((s) => s.id !== sceneId));

    if (activeScene?.id === sceneId) {
      const remaining = scenes.filter((s) => s.id !== sceneId);
      if (remaining.length > 0) {
        await switchScene(remaining[0].id);
      }
    }
    return true;
  }, [scenes, activeScene, switchScene]);

  return {
    scenes,
    activeScene,
    loading,
    switchScene,
    updateScene,
    createScene,
    deleteScene,
  };
}
