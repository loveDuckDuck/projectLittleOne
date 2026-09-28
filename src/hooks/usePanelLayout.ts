import { useEffect, useState } from 'react';

export type PanelSide = 'blocks' | 'properties';
export interface PanelLayout {
  blocksWidth: number;
  propertiesWidth: number;
  blocksCollapsed: boolean;
  propertiesCollapsed: boolean;
}

const STORAGE_KEY = 'cv-builder-panel-layout-v1';
const defaults: PanelLayout = { blocksWidth: 260, propertiesWidth: 300, blocksCollapsed: false, propertiesCollapsed: false };
export const MIN_PANEL_WIDTH = 220;
export const MAX_PANEL_WIDTH = 600;

export function panelWidthLimit(layoutWidth: number, otherPanelWidth: number): number {
  return Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, Math.floor(layoutWidth - otherPanelWidth - 420 - 16)));
}

function loadPanelLayout(): PanelLayout {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return defaults;
    const value = saved as Record<string, unknown>;
    return {
      blocksWidth: typeof value.blocksWidth === 'number' && Number.isFinite(value.blocksWidth) ? Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, value.blocksWidth)) : defaults.blocksWidth,
      propertiesWidth: typeof value.propertiesWidth === 'number' && Number.isFinite(value.propertiesWidth) ? Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, value.propertiesWidth)) : defaults.propertiesWidth,
      blocksCollapsed: typeof value.blocksCollapsed === 'boolean' ? value.blocksCollapsed : defaults.blocksCollapsed,
      propertiesCollapsed: typeof value.propertiesCollapsed === 'boolean' ? value.propertiesCollapsed : defaults.propertiesCollapsed,
    };
  } catch {
    return defaults;
  }
}

export function usePanelLayout() {
  const [layout, setLayout] = useState(loadPanelLayout);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(layout)); } catch { /* The editor still works if browser storage is unavailable. */ }
  }, [layout]);
  return {
    layout,
    togglePanel: (side: PanelSide) => setLayout((current) => ({ ...current, [`${side}Collapsed`]: !current[`${side}Collapsed`] })),
    setPanelWidth: (side: PanelSide, width: number) => setLayout((current) => ({ ...current, [`${side}Width`]: Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, Math.round(width))) })),
  };
}
