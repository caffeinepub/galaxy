# Galaxy

## Current State
A 3D solar system simulation with all 8 planets orbiting the sun, Saturn's rings, galaxy view (Milky Way), Internet Identity login, Stripe USD donations, planet detail panels, hover labels, and orbit controls. Title says "Solar System". A right-side legend lists all planet names with colored dots.

## Requested Changes (Diff)

### Add
- **Login profile popup**: clicking the logged-in user avatar/badge shows a dropdown with full principal ID and a copy button
- **Crypto donation tabs**: DonationModal gets tabs — USD (existing Stripe flow) and Crypto (ICP, Bitcoin, Solana wallet addresses shown with copy buttons, QR-code placeholder)
- **Planet surface / landing view**: new viewMode `surface` — when a planet is focused, a "Land on Planet" button appears. Clicking it transitions into a first-person ground-level view using Three.js scene with planet-specific terrain color, atmospheric haze, sun in sky, and stars. Has "Launch Back" button to exit.
- **Earth-like planet search**: a search button (magnifier icon) in the top controls opens a modal/panel letting users search/filter planets by habitability traits (temperature, atmosphere, water). Highlights Earth-like planets.
- **Ambient audio**: Web Audio API procedural ambient space drone plays in background when in solar system view. Planet-specific audio when in surface view (e.g. wind for Mars, ocean waves for Earth, howling winds for Jupiter, etc.) — all procedural using Web Audio API oscillators and noise, no external files.

### Modify
- **App title**: change from "Solar System" to "Galaxy"
- **Planet labels**: remove the right-side legend panel entirely. Planet name only appears as a label when clicked (already done via PlanetPanel). In 3D scene, show a small floating label only when hovering/clicking a planet.
- **DonationModal**: add tabbed interface — Tab 1: USD (existing Stripe), Tab 2: Crypto (ICP/BTC/SOL wallet addresses with copy and a note that these are configurable)
- **Login button**: when logged in, clicking the principal badge opens a small profile card showing full principal ID + copy button

### Remove
- Right-side planet legend panel (the animated list of planet names)

## Implementation Plan
1. Update App.tsx: rename title to "Galaxy", remove legend panel, add planet search button, add audio engine hook
2. Update AuthButton: clicking the logged-in badge shows a popover with full principal + copy
3. Create `SurfaceView.tsx`: Three.js first-person surface scene component, accepts planet config, shows terrain, atmospheric sky dome, sun position, stars. Uses planet color as ground/sky tints.
4. Update App.tsx: add `surface` to ViewMode, add "Land on Planet" button in planet panel controls area, handle surface view transitions
5. Update DonationModal.tsx: add Tabs component, USD tab = existing Stripe flow, Crypto tab = ICP/BTC/SOL wallet addresses with copy buttons
6. Create `PlanetSearch.tsx`: modal with search/filter for planets by Earth-like traits, shows compatibility scores
7. Create `useSpaceAudio.ts`: Web Audio API hook for procedural ambient sounds — space drone in solar mode, planet-specific wind/ocean/storm sounds in surface mode
8. Wire audio hook into App.tsx and surface view
