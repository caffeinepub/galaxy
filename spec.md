# Multi-verse of Madness

## Current State
- Full 3D solar system simulation with 8 planets, Multiverse, Black Hole, Space Missions
- Nova Credits economy: earn via tasks/missions, buy with crypto, spend on features
- 5 arcade mini-games (Asteroid Miner, Gravity Escape, Planet Terraformer, Wormhole Racer, Space Defender)
- Admin dashboard with stats and purchase approval (access-controlled via authorization component)
- Leaderboard currently shows top DONORS only (by ICP donated)
- Admin access: `isCallerAdmin()` exists but no way to claim admin role via UI; user cannot access admin panel
- UI: generic dark panels without distinct Sci-fi HUD aesthetic

## Requested Changes (Diff)

### Add
- Global game leaderboard: tracks Nova Credits earned from arcade games per user, ranked by highest earnings, visible to all logged-in users
- Backend: `getGameLeaderboard()` query returning top players by game credits earned
- Backend: `claimAdmin()` shared function — only works if zero admins currently exist; promotes caller to admin role
- Backend: `hasAdmin()` query — returns bool indicating if any admin has been claimed yet
- Backend: `recordGameCreditsEarned(amount)` — tracks cumulative game earnings per user for leaderboard
- Frontend: "Claim Admin" button in menu, visible only when logged in AND no admin exists yet
- Frontend: Leaderboard modal redesigned to show game credits leaderboard (separate from donor leaderboard)
- Frontend: Sci-fi HUD UI overhaul across all modals, menus, and panels

### Modify
- Leaderboard component: switch data source from `getTopDonors` to `getGameLeaderboard`, rank by Nova Credits earned from games
- AdminDashboard: add prompt/button for admin claim when `isAdmin === false` and no admin exists
- GameArcade: call `recordGameCreditsEarned` after each game session to update backend leaderboard
- All major modal components: apply Sci-fi HUD styling (neon borders, grid lines, monospace fonts, scanline effects, sharp edges)

### Remove
- Nothing removed

## Implementation Plan
1. Add `gameCreditsEarned` map to backend, `recordGameCreditsEarned`, `getGameLeaderboard`, `claimAdmin`, `hasAdmin` functions
2. Regenerate backend bindings
3. Update Leaderboard.tsx to use game credits leaderboard data
4. Add "Claim Admin" flow to AdminDashboard and App menu
5. Update GameArcade to call recordGameCreditsEarned on game over
6. Apply Sci-fi HUD visual overhaul to: App.tsx menu, Leaderboard, AdminDashboard, GameArcade, CreditShop, SpaceMissions modals
