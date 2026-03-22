# Multi-verse of Madness

## Current State
The app loads directly into the solar system simulation (3D Three.js canvas with React). App.tsx renders the full solar system immediately on load. No intro sequence exists. The `InterstellarBlackHoleHero` component exists but is unused (was removed as first-page hero in v21).

## Requested Changes (Diff)

### Add
- `WarpIntroSequence` component: a 6-second cinematic gravitational lens warp-in that plays before the solar system becomes interactive
  - Phase 1 (0-2s): Pure black with subtle star particles fading in, deep sub-bass rumble building via Web Audio API
  - Phase 2 (2-4s): Gravitational lens distortion effect using WebGL fragment shaders -- space tears open with chromatic aberration, light bending rings rippling outward, star streaking
  - Phase 3 (4-6s): Bloom flash reveals the solar system behind the warp, camera pulls back from inside the wormhole
  - Skippable by click/tap after 1 second
  - Web Audio API synthesizes: sub-bass sine wave building in amplitude, sharp transient crack at warp tear, fade into silence (solar system ambient takes over)
  - Uses CSS/canvas for the shader-like effects (chromatic aberration, lensing rings, star streaks) via requestAnimationFrame
- State in App.tsx: `showIntro` (boolean, default true) -- when true renders `WarpIntroSequence`; on complete sets to false and shows solar system

### Modify
- `App.tsx`: Add `showIntro` state, conditionally render `WarpIntroSequence` overlay before solar system Canvas

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/components/WarpIntroSequence.tsx` with full Canvas 2D gravitational lens animation, chromatic aberration effect, star field, and Web Audio synthesis
2. Add `showIntro` state to `App.tsx`, render `WarpIntroSequence` as overlay that fades out and calls `onComplete` when done
