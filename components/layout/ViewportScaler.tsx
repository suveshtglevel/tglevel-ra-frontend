'use client';

import { useEffect } from 'react';

// The whole UI is designed in fixed pixels (≈1440px-wide canvas), so on a large
// monitor/TV it otherwise sits tiny in the top-left with a sea of empty space.
// To make it "look the same" at any size we magnify the entire document with the
// viewport, so every page keeps identical proportions whether it's on a phone or
// an 8K TV — text, spacing, borders and widths all grow together.
//
// We use CSS `zoom` (not `transform: scale`) because it scales layout the way
// browser zoom does and, crucially, keeps elements portaled to <body> (menus,
// panels) scaled too — a transform on a wrapper would leave portals unscaled.
//
// The one catch: under `zoom`, viewport units (100vw/100vh, %) don't divide by
// the zoom factor consistently across browser versions, so a full-screen
// `h-screen`/`w-full` layout can overflow instead of fill. We sidestep that by
// publishing the EFFECTIVE size in *pixels* (`--app-w`/`--app-h`); full-screen
// layouts size from those. px is always scaled by `zoom`, so the math is exact:
// e.g. at 3840px wide, scale = 2.667, --app-w = 1440px, rendered = 3840px.
const BASE_WIDTH = 1440; // the width the design targets; scale = 1 at this width
// Floor of 1: never shrink below the design. At/below 1440 the existing
// responsive breakpoints (mobile drawer, smaller paddings, etc.) already handle
// small screens, so we leave them exactly as-is and only scale UP.
const MIN_SCALE = 1;

export default function ViewportScaler() {
  useEffect(() => {
    const apply = () => {
      const scale = Math.max(MIN_SCALE, window.innerWidth / BASE_WIDTH);
      const root = document.documentElement.style;
      // setProperty keeps TS happy (`zoom` isn't in the typed CSS declaration).
      root.setProperty('zoom', String(scale));
      // Effective (pre-zoom) viewport size in CSS px; zoom multiplies these back
      // up to exactly fill the real screen.
      root.setProperty('--app-w', `${window.innerWidth / scale}px`);
      root.setProperty('--app-h', `${window.innerHeight / scale}px`);
    };

    apply();
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      const root = document.documentElement.style;
      root.removeProperty('zoom');
      root.removeProperty('--app-w');
      root.removeProperty('--app-h');
    };
  }, []);

  return null;
}
