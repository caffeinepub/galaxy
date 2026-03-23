# Multi-verse of Madness

## Current State
The app has 38 known bugs across 4 severity levels. Backend has no stable variables (all data wiped on every redeploy), missing `isCallerAdmin()` function, and dead Stripe/NFT code. Frontend has a nested button bug making Game Arcade inaccessible from the menu, double AudioContext, broken credit persistence, zero-reward issues in games/missions, and various other critical/medium/low bugs.

## Requested Changes (Diff)

### Add
- `isCallerAdmin()` public query function to backend
- `stable var adminPrincipal` to backend (restore admin role on upgrade)
- Stable backing arrays + preupgrade/postupgrade hooks to backend
- Login guard to AdminDashboard
- Auto-claim login bonus in DailyTaskPanel
- Credit reward on SpaceMissions completion
- Credit reward on DailyChallenge trivia correct answer
- Wave cap in SpaceDefender
- RAF cancel on game-over in AsteroidMiner

### Modify
- Backend: `adminClaimed` → `stable var adminClaimed`
- Backend: `totalDonations` → `stable var totalDonations`
- Backend: Add stable backing arrays for all collections (preupgrade/postupgrade)
- App.tsx: Unbundle Game Arcade MenuBtn from inside Name a Star MenuBtn
- App.tsx: Remove double AudioContext (remove useSpaceAudio or consolidate with AudioManager)
- useQueries.ts: Remove dead Stripe hooks
- GameArcade.tsx: Wire entry fee to backend spendCredits, wire earn to backend earnCredits
- CreditShop.tsx: Validate BigInt input (no decimals, no empty)
- AdminDashboard.tsx: Remove `as any` cast, fix BigInt comparison
- NovaCreditsDisplay.tsx: Remove `pointerEvents: none`
- WormholeRacer.tsx: Fix `.sort()` mutating segments in RAF loop
- SpaceMissions.tsx: Fix double-spend race condition with processing flag
- WarpIntroSequence.tsx: Fix skip button (remove nested button, fix pointerEvents)
- MultiverseView.tsx: Reuse WebGL canvas (don't recreate on each visit)
- BlackHole.tsx: Prevent audio double-layer with trigger guard
- PlanetTerraformer.tsx: Fix stale closure in handleNext

### Remove
- NFTTeaser.tsx and MonetizationModal.tsx (delete dead files)
- App.tsx.bak (delete stale backup)
- Dead Stripe/NFT imports and unused hooks

## Implementation Plan
1. Fix main.mo: add stable vars, preupgrade/postupgrade, isCallerAdmin, restore admin on upgrade
2. Fix App.tsx: unbundle nested button, remove dead imports
3. Fix all game/component bugs across frontend files
4. Delete dead files (NFTTeaser, MonetizationModal, App.tsx.bak)
