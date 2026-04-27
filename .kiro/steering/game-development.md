---
inclusion: auto
---

# Mini Arcade — Game Development Standards

This document defines the coding patterns, file structure, and conventions used across all 35 games in the Mini Arcade project. Every game must follow these standards for consistency, readability, and maintainability.

## Project Architecture

The arcade uses a shared module system loaded by `shared/arcade.js`. Each game is a self-contained folder with no external dependencies beyond the shared modules.

### Shared Modules Available (loaded automatically)

| Global | File | Purpose |
|--------|------|---------|
| `Shell` | `game-shell.js` | HUD, overlay, toast, game area container |
| `Engine` | `engine.js` | Game loop, state machine, canvas setup |
| `Input` | `input.js` | Keyboard + touch + mobile d-pad/action button |
| `Audio8` | `audio.js` | Web Audio synth — preset sounds + custom notes |
| `Particles` | `particles.js` | Particle emitter for visual effects |
| `Grid` | `grid.js` | Grid data structure + DOM renderer |
| `Timer` | `timer.js` | Countdown + stopwatch |
| `GameIcons` | `icons.js` | 16x16 pixel art SVG icons |
| Utilities | `utils.js` | `randInt()`, `randPick()`, `clamp()`, `collides()`, `saveHighScore()`, `loadHighScore()`, `onSwipe()`, `preventScroll()` |

## File Structure Convention

Every game folder MUST follow this structure:

```
game-name/
├── index.html          # Entry point (minimal — config + loader only)
├── style.css           # Game-specific CSS overrides (accent color, custom elements)
├── game.js             # Light orchestrator — wires modules, runs Engine
├── src/                # Game-specific modules
│   ├── config.js       # All tunable constants (ALWAYS first)
│   ├── ...             # Entity/rendering/logic modules
│   └── ...
├── assets/             # SVG images for README
│   ├── banner.svg
│   ├── gameplay.svg
│   └── ...
└── README.md           # Rich documentation with embedded SVG images
```

## index.html Pattern

Every game's index.html must be minimal — only the GAME config and the arcade.js loader:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Game Name — Mini Arcade</title>
  <link rel="stylesheet" href="../shared/css/game.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <script>var GAME = {
    id: 'game-name',
    title: 'Game Name',
    stats: [{ id: 'score', label: 'Score', value: '0' }, { id: 'best', label: 'Best', value: '0' }],
    src: ['src/config.js', 'src/module1.js', 'src/module2.js']
  };</script>
  <script src="../shared/arcade.js"></script>
</body>
</html>
```

Key rules:
- `id` must match the folder name and the icon key in `shared/icons.js`
- `title` is the display name (no emoji — the pixel icon is injected by game-shell.js)
- `stats` defines HUD stat slots — each needs a unique `id`
- `src` lists game modules in load order — `config.js` is ALWAYS first
- No other HTML in the body — the shell builds everything

## style.css Pattern

Minimal. Only override the accent color and add game-specific styles:

```css
:root {
  --c-game: #44ff66;  /* Game accent color */
}

/* Game-specific styles only */
```

## src/config.js Pattern

ALL tunable constants in one file. No magic numbers anywhere else:

```js
var Config = {
  // Dimensions
  cols: 20,
  rows: 20,
  cellSize: 20,

  // Gameplay
  baseSpeed: 6,
  maxSpeed: 18,

  // Scoring
  pointsPerAction: 10,

  // Colors
  primary: '#44ff66',
  secondary: '#22aa44',
  // ...
};

// Derived values
Config.canvasW = Config.cols * Config.cellSize;
Config.canvasH = Config.rows * Config.cellSize;
```

Rules:
- Group by category with comments
- Derived values computed at the bottom
- Every color used in rendering must be here
- Every speed, size, threshold, or timing value must be here

## Module Pattern (src/*.js)

Every game module is an IIFE exposing a single global object:

```js
var ModuleName = (function () {

  // Private state
  var someState = null;

  // Private helpers
  function helper() { ... }

  // Public API
  function reset() { ... }
  function update(dt) { ... }
  function draw(ctx) { ... }

  return {
    reset: reset,
    update: update,
    draw: draw,
    get someProperty() { return someState; },
  };
})();
```

Rules:
- One module per file, one global per module
- Use `var` (not `let`/`const`) for broadest compatibility
- Module name matches the filename: `snake.js` → `Snake`, `food.js` → `Food`
- Common methods: `reset()`, `update(dt)`, `draw(ctx)`
- Use getters for read-only state access
- Reference `Config` for all constants — never hardcode values
- Reference shared globals directly: `Audio8.play('score')`, `Shell.setStat('score', n)`

## game.js Pattern

The orchestrator. Light logic only — delegates to modules:

```js
(function () {

  var score = 0;
  var best = loadHighScore('game-name');
  var particles = Particles.create();

  var game = Engine.create({
    canvas: { width: Config.canvasW, height: Config.canvasH },
    startHint: 'How to play hint text',

    init: function () {
      Input.init();
      // Set up mobile controls: Input.dpad() or Input.actionBtn('TAP')
      Shell.setStat('best', best);
    },

    reset: function () {
      score = 0;
      particles.clear();
      // Reset all game modules
      Shell.setStat('score', 0);
    },

    update: function (dt) {
      // 1. Read input
      // 2. Update game state
      // 3. Check collisions / win / lose
      // 4. Update animations (particles, etc.)
      // 5. Input.endFrame() — ALWAYS last
      Input.endFrame();
    },

    draw: function (ctx) {
      // Draw layers back-to-front:
      // 1. Background / board
      // 2. Game objects
      // 3. Player
      // 4. Effects / particles
    },
  });

  game.start();

})();
```

Rules:
- Wrapped in an IIFE to avoid polluting global scope
- `game.start()` is the last line
- Input handling at the top of update
- `Input.endFrame()` at the bottom of update
- Draw order: background → objects → player → effects
- Use `game.gameOver('Score: ' + score)` and `game.win('Score: ' + score)` for end states
- Save high scores with `saveHighScore('game-id', score)`

### Pause / Restart menu
When the player presses Esc, show a pause overlay with TWO options: **Resume** and **Restart**. Resume continues the game. Restart goes back to the start (or difficulty selection if applicable). Example:
```js
if (Input.pressed('Escape')) {
  Shell.showOverlay({
    title: 'Paused',
    btn: 'Resume',
    onAction: function () { Shell.hideOverlay(); game.play(); }
  });
  // Add restart button
  var overlay = document.getElementById('overlay');
  var rb = document.createElement('button');
  rb.className = 'btn restart-btn';
  rb.textContent = 'Restart';
  rb.addEventListener('click', function () { /* restart logic */ });
  overlay.appendChild(rb);
  game.pause();
}
```
Clean up the restart button when resuming or restarting.

## Canvas vs DOM Games

### Canvas games (majority)
Use `Engine.create({ canvas: { width, height } })`. The engine creates and manages the canvas.

### DOM/grid games (2048, Minesweeper, Memory Cards, Tic-Tac-Toe, Color Flood, Wordle)
Use `Grid.create(cols, rows, fill)` and `Grid.renderDOM(grid, Shell.area, onCellClick)`. Do NOT use Engine's canvas option — instead use a custom update loop or event-driven updates.

For DOM games, the game loop pattern changes:
```js
// No Engine.create with canvas — manage state manually
function startGame() {
  Shell.hideOverlay();
  // Set up grid, render DOM, attach click handlers
}

Shell.showOverlay({
  title: GAME.title,
  subtitle: 'Tap to play',
  btn: 'Start',
  onAction: startGame
});
```

## Audio Convention

Use `Audio8.play(preset)` for standard events:

| Event | Preset |
|-------|--------|
| Score / collect | `'score'` |
| Line clear / combo | `'clear'` |
| Hit / damage | `'hit'` |
| Move / place | `'move'` |
| Drop | `'drop'` |
| Game over | `'gameover'` |
| Win | `'win'` |
| Button click | `'click'` |
| Error / wrong | `'error'` |
| Timer tick | `'tick'` |
| Swoosh / swipe | `'whoosh'` |

For custom sounds, use `Audio8.note(frequency, duration, waveType, volume)`.

## Scoring & High Scores

- Always save with `saveHighScore('game-id', score)` — returns `true` if new best
- Always load with `loadHighScore('game-id')` on init
- Always show both current score and best in the HUD
- Update HUD with `Shell.setStat('statId', value)`

## Mobile Support Checklist

Every game MUST:
- Call `Input.init()` to enable swipe detection
- Add mobile controls: `Input.dpad()` for directional games, `Input.actionBtn('label')` for tap games
- Use `touch-action: none` on canvas (handled by shared CSS)
- Test that the game is playable without a keyboard

## README Convention

Every game must have a README.md with embedded SVG assets in an `assets/` folder.

### Required SVG assets:
1. `banner.svg` — Hero image (800×200) with pixel art, game title, and HUD mockup
2. `gameplay.svg` — Game board screenshot showing active gameplay
3. `controls.svg` — Desktop + mobile control diagrams
4. `palette.svg` — Color swatches with hex codes
5. Additional diagrams as needed (speed curves, state machines, mechanics)

### SVG style rules:
- Background: `#0a0a16`
- Border: `#2a2a40`, 2px, rx="6" or rx="8"
- Font: `monospace`
- Use the game's pixel icon in the HUD (not emoji) — render the 16x16 grid as SVG rects
- Use `shape-rendering="crispEdges"` for pixel art elements
- Match the game's color palette from Config

### Gameplay SVG grounding rule (CRITICAL):
- The gameplay screenshot MUST depict a state that is actually reachable during real gameplay
- Think through the game rules before drawing: if bricks break top-to-bottom, don't show bottom bricks broken while top rows are intact
- Tetris: locked pieces must form valid stacks (no floating blocks, no impossible shapes, rows fill from bottom up)
- Breakout: bricks are destroyed by a ball bouncing from below — damage propagates from the bottom rows upward, not randomly
- Snake: the body must be a connected path with no gaps
- In general: simulate a plausible mid-game moment. Ask "could a player actually reach this exact board state?" If not, fix it.

### README structure:
1. Banner image (centered)
2. One-line description
3. Controls (image + table)
4. Gameplay (image + rules)
5. Project Structure (SVG only — no redundant table)
6. Color Palette (image)
7. Core Mechanics (images + explanation with math/formulas)
8. State Machine (image + table)
9. Sound & Effects (table)
10. Customization Guide (code snippets)
11. Shared Modules Used (table)
12. Footer with link to main README

## Hub Page & Icons

When adding a new game:
1. Add the 16x16 pixel icon to `shared/icons.js`
2. Add the game entry to the appropriate section in `index.html` (classics/modern/originals)
3. Add the game to `README.md` in the root

## CSS Overrides

Games can override any CSS token in their `style.css`:
- `--c-game` — accent color (buttons, highlights, HUD values)
- `--game-max-w` — container max width (default 480px, increase for wider games like Solitaire)
- Add game-specific classes as needed, but prefer shared components
