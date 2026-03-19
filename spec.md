# Multi-verse of Madness

## Current State
Version 17 is deployed with all major features: Interstellar black hole hero, solar system simulation, multiverse (6 universes), Space Missions with voice narration, daily challenges, space timeline, comet flybys, solar flares, audio system, premium gating, crypto donations, and Internet Identity login.

A full audit identified 33 issues ranging from critical bugs to minor inconsistencies.

## Requested Changes (Diff)

### Add
- Error boundary around all Canvas/WebGL components to prevent full-app crashes
- Visual countdown display (T-minus overlay) during launch sequence in SpaceMissions
- Locked universe click feedback in MultiverseView (tooltip/message explaining unlock requirement)

### Modify

**Critical Fixes:**
1. App.tsx: Fix auth button `pointerEvents: 'none'` bug — ensure login button is always clickable
2. App.tsx: Fix `u221e Multiverse` Unicode typo — use literal `∞` character
3. App.tsx: Fix premium gating — wire `useIsPremiumUser` result to actually gate Galaxy View and Surface Landing
4. App.tsx: Remove stale Stripe `payment_success` handler and unused checkout hooks
5. App.tsx: Expand `anyModalOpen` to include Daily Challenge, Timeline, Audio Settings, Black Hole Panel, Surface View modals
6. AudioManager.ts / useSpaceAudio.ts: Consolidate to a single AudioContext — remove duplicate audio context; fix unmute restoring to 14% (use 0.5 gain on unmute)
7. SpaceMissions.tsx: Memoize `speak` function with `useCallback` to stop voice narration stuttering/restarting every render
8. SpaceMissions.tsx: Fix Chrome voice selection — wait for `voiceschanged` event before selecting preferred voice
9. InterstellarBlackHoleHero.tsx: Fix module-level `audioCtx`/`audioStarted` — move into component state/ref and clean up on unmount so audio restarts correctly on remount
10. InterstellarBlackHoleHero.tsx: Render the missing bottom relativistic jet (wire `_botRef` to actual JSX)
11. BlackHole.tsx: Fix black hole audio trigger distance — reduce threshold from 300 to 600 units (or place Sagittarius A* closer to camera range)
12. BlackHole.tsx: Fix gravitational lensing `lookAt()` — ensure lens mesh properly faces the camera each frame
13. MultiverseView.tsx: Fix WebGL context exhaustion — reuse a single Three.js Canvas/renderer across universe switches instead of creating a new one each time
14. DonationModal.tsx: Show confirmation message when wallet address is copied (already functional UI, just needs feedback; crypto tracking note added)
15. BlackHolePanel.tsx: Remove duplicate "Schwarzschild Radius" entry to fix React key warning
16. DailyChallenge.tsx: Ensure React is imported where `React.CSSProperties` is used (or switch to plain CSS object types)
17. ConstellationOverlay.tsx: Replace hardcoded pixel positions with percentage-based or SVG viewBox coordinates so constellations scale correctly on all screen sizes
18. PlanetSearch.tsx: Guard camera zoom — only zoom to planet if planet mesh position is non-zero (has rendered its first frame)

### Remove
- Stale Stripe leftovers in App.tsx (payment_success handler, unused checkout hooks)

## Implementation Plan
1. Fix App.tsx: pointer events, Unicode char, premium gating wiring, stale Stripe code, anyModalOpen expansion
2. Fix audio: merge AudioManager + useSpaceAudio to single AudioContext; fix unmute volume
3. Fix SpaceMissions: memoize speak, fix Chrome voiceschanged, add visual countdown overlay
4. Fix InterstellarBlackHoleHero: move audio to component scope, add bottom jet, cleanup on unmount
5. Fix BlackHole: audio trigger distance, lensing lookAt
6. Fix MultiverseView: reuse single Canvas, add locked universe feedback
7. Fix BlackHolePanel: remove duplicate Schwarzschild Radius
8. Fix DailyChallenge: React import / CSSProperties
9. Fix ConstellationOverlay: percentage-based star positions
10. Fix PlanetSearch: guard against zero-position zoom
11. Add global ErrorBoundary wrapper around Canvas components
12. Validate and build
