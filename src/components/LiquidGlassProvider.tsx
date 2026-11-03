'use client';

import React from 'react';
import { LiquidGlassScene } from 'simple-liquid-glass/backdrop';

export function LiquidGlassProvider({ children }: { children: React.ReactNode }) {
  return (
    <LiquidGlassScene
      id="liquid-glass-scene-root"
      style={{ minHeight: '100vh', position: 'relative' }}
    >
      {children}
    </LiquidGlassScene>
  );
}

export default LiquidGlassProvider;
