# Galaxy – Feature Expansion v5

## Current State
The app is a live 3D interactive solar system (React Three Fiber) with:
- All 8 planets, Saturn rings, sun bloom, starfield
- Internet Identity login with principal display
- Galaxy View (Milky Way visualization with sun orbiting)
- Planet surface/landing views (SurfaceView.tsx)
- Camera controls (zoom to planet, orbit)
- Crypto donations: ICP, BTC, SOL wallet addresses (DonationModal.tsx)
- Stripe donation support
- Planet search (PlanetSearch.tsx)
- Ambient audio (useSpaceAudio.ts)
- Backend: user profiles, donations, Stripe, RBAC

## Requested Changes (Diff)

### Add
- **Asteroid Belt**: Animated particle belt between Mars and Jupiter orbits in the 3D scene
- **Time Travel Mode**: Speed slider (0.1x – 50x) to control orbital simulation speed
- **Scale Mode**: Toggle true-to-scale view where planet sizes shrink proportionally
- **Constellation Mode**: Toggle overlay of major constellation patterns on the starfield
- **Planet Quiz**: Modal with 5 randomized multiple-choice questions about planets, shows score
- **Achievements/Badges**: Frontend tracking of milestones (visited all planets, used galaxy view, landed on a surface, etc.) shown in a badge panel
- **Space Missions**: 3 guided tour sequences (Apollo 11, Voyager 1 path, Mars Rover) that auto-navigate camera through waypoints
- **Wormhole Travel**: Animated warp/tunnel effect when switching between planets or entering Galaxy view
- **Leaderboard**: Modal showing top donors (ICP amount) fetched from backend donations
- **Planet Journals**: Per-planet notes/guestbook stored in backend; logged-in users can write and read notes for each planet
- **Name a Star**: Modal where users pay ICP and submit a name; stored in backend star registry, displayed in starfield
- **Premium Tier UI**: Paywall concept – free users see solar system + search; premium features (Galaxy View, surface landing, journals, name a star) show upgrade prompt if not premium; premium unlocked after any donation > 0
- **Merchandise / Sponsorship / Licensing pages**: Info modals for these revenue streams with contact info

### Modify
- App.tsx: Add controls for new features (time travel slider, scale mode button, constellation toggle, missions button, achievements button, leaderboard button, name a star button)
- Backend: Add star registry, planet journals, leaderboard query

### Remove
- Nothing removed

## Implementation Plan
1. Update backend (main.mo) to add: star registry (name + owner + timestamp), planet journals (planet name + message + author + timestamp), leaderboard query (top donors by amount)
2. Regenerate backend bindings
3. Add AsteroidBelt component to 3D scene
4. Add TimeTravelSlider UI component
5. Add ScaleMode toggle button
6. Add ConstellationOverlay component (SVG/HTML lines overlay on Canvas)
7. Add PlanetQuiz modal component
8. Add Achievements panel (frontend state, localStorage persistence)
9. Add SpaceMissions guided tour system
10. Add WormholeEffect transition animation
11. Add Leaderboard modal (reads donations from backend)
12. Add PlanetJournal component in planet detail flow
13. Add NameAStar modal
14. Add PremiumGate logic (any donation > 0 = premium)
15. Add Merch/Sponsor/License info modals
16. Wire all new UI into App.tsx
