# Multi-verse of Madness

## Current State
Full-stack 3D space simulation with Internet Identity login, Nova Credits economy, Space Missions, Multiverse, Black Hole, Daily Tasks, Admin Dashboard, and crypto monetization. Menu has ~20 items. Credits stored in backend via actor.

## Requested Changes (Diff)

### Add
- Game Arcade modal accessible from a new menu item `🎮 Game Arcade`
- 5 fully playable Canvas-based mini-games:
  1. **Asteroid Miner** -- pilot ship, blast asteroids, collect minerals, dodge debris. WASD/arrow controls + spacebar to shoot.
  2. **Gravity Escape** -- escape Sagittarius A* gravitational pull using thruster bursts before time runs out. Mouse/touch controls.
  3. **Planet Terraformer** -- slider-based puzzle: balance oxygen, temperature, water to terraform a planet. Turn-based, each planet unique.
  4. **Wormhole Racer** -- tunnel runner, dodge energy walls moving at increasing speed. Arrow keys / tap.
  5. **Space Defender** -- fixed cannon at bottom, shoot waves of descending alien ships. Arrow + spacebar.
- Each game has: Nova Credits entry fee (10-25 credits), score tracking, reward payout on good performance, high score display
- Game Arcade lobby screen showing all 5 games with cover art, entry fee, best score, and play button
- Backend: store high scores per user per game; global leaderboard per game
- New state variable `arcadeOpen` + setter in App.tsx

### Modify
- App.tsx: add `arcadeOpen` state, add `🎮 Game Arcade` menu item, render `<GameArcade>` modal
- Backend: add `submitGameScore`, `getHighScores`, `getMyScore` functions

### Remove
- Nothing removed

## Implementation Plan
1. Update Motoko backend with game score storage and retrieval
2. Create `GameArcade.tsx` -- lobby with 5 game cards
3. Create `games/AsteroidMiner.tsx` -- Canvas 2D game
4. Create `games/GravityEscape.tsx` -- Canvas 2D game
5. Create `games/PlanetTerraformer.tsx` -- UI puzzle game
6. Create `games/WormholeRacer.tsx` -- Canvas 2D tunnel runner
7. Create `games/SpaceDefender.tsx` -- Canvas 2D shooter
8. Wire into App.tsx menu and modal rendering
9. Integrate Nova Credits spend/earn flow per game
