'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

export type ThemeMode = 'system' | 'dark' | 'light';
export type UiScaleMode = 'compact' | 'default' | 'comfortable' | 'large';
export type MotionMode = 'system' | 'full' | 'interactive' | 'reduced';

interface SettingsContextType {
  theme: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  uiScale: UiScaleMode;
  motion: MotionMode;
  isSettingsOpen: boolean;
  setTheme: (theme: ThemeMode) => void;
  setUiScale: (scale: UiScaleMode) => void;
  setMotion: (motion: MotionMode) => void;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const STORAGE_KEYS = {
  THEME: 'bikko_theme',
  SCALE: 'bikko_ui_scale',
  MOTION: 'bikko_motion',
} as const;

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [systemIsDark, setSystemIsDark] = useState<boolean>(false);
  const [uiScale, setUiScaleState] = useState<UiScaleMode>('default');
  const [motion, setMotionState] = useState<MotionMode>('system');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Initialize from localStorage and matchMedia
  useEffect(() => {
    const initTimer = setTimeout(() => {
      // Read stored preferences
      try {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null;
        if (savedTheme && ['system', 'dark', 'light'].includes(savedTheme)) {
          setThemeState(savedTheme);
        }

        const savedScale = localStorage.getItem(STORAGE_KEYS.SCALE) as UiScaleMode | null;
        if (savedScale && ['compact', 'default', 'comfortable', 'large'].includes(savedScale)) {
          setUiScaleState(savedScale);
        }

        const savedMotion = localStorage.getItem(STORAGE_KEYS.MOTION) as MotionMode | null;
        if (savedMotion && ['system', 'full', 'interactive', 'reduced'].includes(savedMotion)) {
          setMotionState(savedMotion);
        }
      } catch {
        // LocalStorage unavailable
      }

      // Media query for system dark mode
      const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemIsDark(darkQuery.matches);
    }, 0);

    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onDarkChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    if (darkQuery.addEventListener) {
      darkQuery.addEventListener('change', onDarkChange);
    } else {
      darkQuery.addListener(onDarkChange);
    }

    return () => {
      clearTimeout(initTimer);
      if (darkQuery.removeEventListener) {
        darkQuery.removeEventListener('change', onDarkChange);
      } else {
        darkQuery.removeListener(onDarkChange);
      }
    };
  }, []);

  // Compute resolved theme
  const resolvedTheme: 'dark' | 'light' = useMemo(() => {
    if (theme === 'dark') return 'dark';
    if (theme === 'light') return 'light';
    return systemIsDark ? 'dark' : 'light';
  }, [theme, systemIsDark]);

  // Apply to documentElement whenever state changes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Theme attribute
    if (theme === 'system') {
      root.removeAttribute('data-theme');
      root.setAttribute('data-resolved-theme', resolvedTheme);
    } else {
      root.setAttribute('data-theme', theme);
      root.setAttribute('data-resolved-theme', theme);
    }

    // Scale attribute
    root.setAttribute('data-scale', uiScale);

    // Motion attribute
    root.setAttribute('data-motion', motion);
  }, [theme, resolvedTheme, uiScale, motion]);

  // Setters with localStorage persistence
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch {}
  }, []);

  const setUiScale = useCallback((newScale: UiScaleMode) => {
    setUiScaleState(newScale);
    try {
      localStorage.setItem(STORAGE_KEYS.SCALE, newScale);
    } catch {}
  }, []);

  const setMotion = useCallback((newMotion: MotionMode) => {
    setMotionState(newMotion);
    try {
      localStorage.setItem(STORAGE_KEYS.MOTION, newMotion);
    } catch {}
  }, []);

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);
  const toggleSettings = useCallback(() => setIsSettingsOpen((prev) => !prev), []);

  const resetSettings = useCallback(() => {
    setTheme('system');
    setUiScale('default');
    setMotion('system');
  }, [setTheme, setUiScale, setMotion]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      uiScale,
      motion,
      isSettingsOpen,
      setTheme,
      setUiScale,
      setMotion,
      openSettings,
      closeSettings,
      toggleSettings,
      resetSettings,
    }),
    [
      theme,
      resolvedTheme,
      uiScale,
      motion,
      isSettingsOpen,
      setTheme,
      setUiScale,
      setMotion,
      openSettings,
      closeSettings,
      toggleSettings,
      resetSettings,
    ]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
