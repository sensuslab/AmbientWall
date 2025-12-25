import type { WidgetManifest, WidgetType, WidgetCategory } from '../types';

class WidgetRegistry {
  private widgets: Map<string, WidgetManifest> = new Map();

  register(manifest: WidgetManifest): void {
    if (this.widgets.has(manifest.id)) {
      console.warn(`Widget "${manifest.id}" is already registered. Overwriting.`);
    }
    this.widgets.set(manifest.id, manifest);
  }

  get(id: string): WidgetManifest | undefined {
    return this.widgets.get(id);
  }

  getAll(): WidgetManifest[] {
    return Array.from(this.widgets.values());
  }

  getByCategory(category: WidgetCategory): WidgetManifest[] {
    return this.getAll().filter((w) => w.category === category);
  }

  has(id: string): boolean {
    return this.widgets.has(id);
  }

  unregister(id: string): boolean {
    return this.widgets.delete(id);
  }
}

export const widgetRegistry = new WidgetRegistry();

export function registerWidget(manifest: WidgetManifest): void {
  widgetRegistry.register(manifest);
}

export function getWidgetManifest(type: WidgetType): WidgetManifest | undefined {
  return widgetRegistry.get(type);
}

export function getAllWidgetManifests(): WidgetManifest[] {
  return widgetRegistry.getAll();
}

export function getWidgetsByCategory(category: WidgetCategory): WidgetManifest[] {
  return widgetRegistry.getByCategory(category);
}
