import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'cv-builder-theme';

function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* The editor remains usable when storage is unavailable. */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#151d29' : '#f3f5f8');
}

export function initializeTheme() {
  applyTheme(loadTheme());
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(loadTheme);
  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); }
    catch { /* The theme still works for this session. */ }
  }, [theme]);
  return { theme, toggleTheme: () => setTheme((current) => current === 'light' ? 'dark' : 'light') };
}
