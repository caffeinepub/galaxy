# Multi-verse of Madness

## Current State
The app opens to a LandingScreen (`currentView === 'landing'`). Navigation from the landing screen sets `currentView` to `'solar'` and opens feature modals (MultiverseView, GameArcade, SpaceMissions, Leaderboard) as overlays over the solar system canvas. There is a fixed '⌂ Home' button that returns to landing, but NO back button exists on any modal or sub-view. The UI is not responsive — the 240px left menu panel and fixed-position HUD elements have no mobile breakpoints.

## Requested Changes (Diff)

### Add
- A consistent back button (sci-fi HUD style, top-left corner) on every full-screen modal/overlay: MultiverseView, GameArcade, SpaceMissions, Leaderboard, AdminDashboard, CreditShop, DailyTaskPanel, DonationModal, and any other full-screen view
- The back button should call its respective `onClose`/`onBack` prop to dismiss the overlay and return the user to the previous context
- Mobile-responsive layout fixes: the 240px left side menu panel should collapse or reposition on screens < 768px, the HUD elements should not overlap on small screens, touch targets should be at least 44x44px
- A media query or JS-based breakpoint check (`useIsMobile`) to adjust layout for phones

### Modify
- All full-screen overlay components (MultiverseView, GameArcade, SpaceMissions, Leaderboard, AdminDashboard, CreditShop, DailyTaskPanel) to include a back/close button in a consistent top-left position
- App.tsx side menu panel: add responsive width/positioning for mobile
- Game components (AsteroidMiner, SpaceDefender, WormholeRacer, GravityEscape, PlanetTerraformer) to include a back button returning to the GameArcade lobby
- LandingScreen: ensure nav cards and buttons are properly touch-sized and laid out on mobile

### Remove
- Nothing removed

## Implementation Plan
1. Create or use existing `useIsMobile` hook to detect mobile viewport (< 768px)
2. Add a reusable `BackButton` component with sci-fi HUD styling (neon border, monospace font, chevron left icon)
3. Add `BackButton` to the top-left of: MultiverseView, GameArcade, SpaceMissions, Leaderboard, AdminDashboard, CreditShop, DailyTaskPanel, DonationModal
4. Add back button inside each mini-game (AsteroidMiner, SpaceDefender, WormholeRacer, GravityEscape, PlanetTerraformer) to return to GameArcade
5. Fix App.tsx side menu to use responsive width and positioning on mobile (stack below or hide behind hamburger on small screens)
6. Ensure all interactive elements have minimum 44px touch targets for mobile
7. Fix any overflow/wrapping issues in HUD elements on narrow screens
