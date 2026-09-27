'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

export type ThemeMode = 'system' | 'dark' | 'light';
export type OledMode = 'auto' | 'oled' | 'neutral';
export type UiScaleMode = 'compact' | 'default' | 'comfortable' | 'large';
export type MotionMode = 'system' | 'full' | 'interactive' | 'reduced';

interface SettingsContextType {
  theme: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  oledMode: OledMode;
  isOledDetected: boolean;
  isOledActive: boolean;
  uiScale: UiScaleMode;
  motion: MotionMode;
  isSettingsOpen: boolean;
  setTheme: (theme: ThemeMode) => void;
  setOledMode: (mode: OledMode) => void;
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
  OLED: 'bikko_oled_mode',
  SCALE: 'bikko_ui_scale',
  MOTION: 'bikko_motion',
} as const;

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [systemIsDark, setSystemIsDark] = useState<boolean>(false);
  const [oledMode, setOledModeState] = useState<OledMode>('auto');
  const [isOledDetected, setIsOledDetected] = useState<boolean>(false);
  const [uiScale, setUiScaleState] = useState<UiScaleMode>('default');
  const [motion, setMotionState] = useState<MotionMode>('system');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Initialize from localStorage and matchMedia
  useEffect(() => {
    const checkOledSupport = () => {
      if (typeof window === 'undefined') return false;
      const hdr = window.matchMedia && window.matchMedia('(dynamic-range: high)').matches;
      const p3 = window.matchMedia && window.matchMedia('(color-gamut: p3)').matches;
      return !!(hdr || p3);
    };

    const initTimer = setTimeout(() => {
      // Read stored preferences
      try {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null;
        if (savedTheme && ['system', 'dark', 'light'].includes(savedTheme)) {
          setThemeState(savedTheme);
        }

        const savedOled = localStorage.getItem(STORAGE_KEYS.OLED) as OledMode | null;
        if (savedOled && ['auto', 'oled', 'neutral'].includes(savedOled)) {
          setOledModeState(savedOled);
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

      // Check system dark mode & OLED display characteristics
      const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemIsDark(darkQuery.matches);
      setIsOledDetected(checkOledSupport());
    }, 0);

    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const hdrQuery = window.matchMedia('(dynamic-range: high)');
    const p3Query = window.matchMedia('(color-gamut: p3)');

    const onDarkChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    const onDisplayChange = () => {
      setIsOledDetected(checkOledSupport());
    };

    if (darkQuery.addEventListener) {
      darkQuery.addEventListener('change', onDarkChange);
      hdrQuery.addEventListener?.('change', onDisplayChange);
      p3Query.addEventListener?.('change', onDisplayChange);
    } else {
      darkQuery.addListener(onDarkChange);
    }

    return () => {
      clearTimeout(initTimer);
      if (darkQuery.removeEventListener) {
        darkQuery.removeEventListener('change', onDarkChange);
        hdrQuery.removeEventListener?.('change', onDisplayChange);
        p3Query.removeEventListener?.('change', onDisplayChange);
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

  // Compute active OLED pure black state
  const isOledActive: boolean = useMemo(() => {
    if (oledMode === 'oled') return true;
    if (oledMode === 'neutral') return false;
    return isOledDetected;
  }, [oledMode, isOledDetected]);

  // Apply to documentElement whenever state changes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Theme attributes: ensure BOTH data-theme and data-resolved-theme are aligned
    root.setAttribute('data-theme', resolvedTheme);
    root.setAttribute('data-theme-setting', theme);
    root.setAttribute('data-resolved-theme', resolvedTheme);

    // OLED hardware detection & styling attributes
    root.setAttribute('data-oled', isOledActive ? 'true' : 'false');
    root.setAttribute('data-display', isOledActive ? 'oled' : 'neutral');

    // Scale attribute
    root.setAttribute('data-scale', uiScale);

    // Motion attribute
    root.setAttribute('data-motion', motion);
  }, [theme, resolvedTheme, isOledActive, uiScale, motion]);

  // Setters with localStorage persistence
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch {}
  }, []);

  const setOledMode = useCallback((newMode: OledMode) => {
    setOledModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEYS.OLED, newMode);
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
    setOledMode('auto');
    setUiScale('default');
    setMotion('system');
  }, [setTheme, setOledMode, setUiScale, setMotion]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      oledMode,
      isOledDetected,
      isOledActive,
      uiScale,
      motion,
      isSettingsOpen,
      setTheme,
      setOledMode,
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
      oledMode,
      isOledDetected,
      isOledActive,
      uiScale,
      motion,
      isSettingsOpen,
      setTheme,
      setOledMode,
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
