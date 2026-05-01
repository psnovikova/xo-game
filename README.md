# XO

## Tic-Tac-Toe game: [demo](https://psnovikova.github.io/xo-game/)

### Deploy
- push changes to `main` (workflow starts automatically)
- or run manually: GitHub -> Actions -> `Deploy to GitHub Pages` -> `Run workflow`
- CI uses:
  - `Node.js 22`
  - `pnpm` from `packageManager` in `package.json` (`pnpm@9.12.0`)

### Done: 
- implement the logic of the PvP game with the ability to restart the game
- write the logic of a game against the computer with the ability to choose a PvP/PvE mode
- adaptation for mobile devices
- online PvP with invite link (`?room=<id>`) and real-time sync

### Online PvP run
- terminal 1: `pnpm run dev`
- terminal 2: `pnpm run dev:online`
- open `PvP`, click `Copy invite link`, share URL with second player
- for production, deploy `server/index.js` separately (GitHub Pages serves only static frontend)

### Plans:
- create a selection of color themes
- adding parallax effects

