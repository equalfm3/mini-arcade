# Mini Arcade — Game Implementation Spec

## Overview

Implement all 35 games for the Mini Arcade collection. Snake is complete and serves as the reference implementation. Each remaining game follows the same patterns defined in the steering docs: modular `src/` folder, light `game.js` orchestrator, `config.js` for all constants, SVG assets for README, and rich documentation.

## Requirements

- All games must be playable on desktop (keyboard/mouse) and mobile (touch/swipe)
- Zero external dependencies — vanilla JS, HTML5 Canvas or DOM
- Each game uses the shared module system (Engine, Input, Audio8, Particles, Grid, Timer, Shell)
- Each game has a complete README with embedded SVG assets
- High scores saved to localStorage
- Consistent 8-bit retro visual style using the shared CSS token system

## Completed

- [x] Snake ✅ (reference implementation)

## Tasks

### Classics

#### Task 1: Tetris
- [ ] Create `tetris/src/config.js` — board 10×20, piece colors, drop speed, line clear scoring
- [ ] Create `tetris/src/pieces.js` — 7 tetromino shapes, rotation matrices, wall kick logic
- [ ] Create `tetris/src/board.js` — grid state, line detection, clearing with collapse
- [ ] Create `tetris/src/renderer.js` — board rendering, ghost piece preview, next piece display
- [ ] Create `tetris/game.js` — orchestrator with drop timer, input (rotate, move, hard drop, hold)
- [ ] Create `tetris/style.css` — accent color, next-piece sidebar
- [ ] Create `tetris/assets/` — banner, gameplay, controls, palette SVGs
- [ ] Create `tetris/README.md` — rotation system, scoring (single/double/triple/tetris), speed levels

#### Task 2: Breakout
- [ ] Create `breakout/src/config.js` — paddle size, ball speed, brick layout, lives
- [ ] Create `breakout/src/paddle.js` — paddle movement, mouse/touch tracking
- [ ] Create `breakout/src/ball.js` — ball physics, angle reflection, speed increase
- [ ] Create `breakout/src/bricks.js` — brick grid, hit detection, brick types/colors
- [ ] Create `breakout/src/renderer.js` — draw paddle, ball, bricks with pixel style
- [ ] Create `breakout/game.js` — orchestrator with ball launch, lives, level progression
- [ ] Create assets + README

#### Task 3: Minesweeper
- [ ] Create `minesweeper/src/config.js` — grid sizes (easy/medium/hard), mine count
- [ ] Create `minesweeper/src/board.js` — mine placement, neighbor counting, flood reveal
- [ ] Create `minesweeper/src/renderer.js` — DOM grid cells, number colors, flag/mine icons
- [ ] Create `minesweeper/game.js` — click to reveal, long-press/right-click to flag, win detection
- [ ] Create assets + README — flood fill algorithm explanation, probability discussion

#### Task 4: 2048
- [ ] Create `2048/src/config.js` — grid 4×4, tile colors per value, animation speed
- [ ] Create `2048/src/board.js` — grid state, merge logic, slide in 4 directions
- [ ] Create `2048/src/tiles.js` — tile spawning, merge animation, value tracking
- [ ] Create `2048/src/renderer.js` — DOM grid with colored tiles, slide animations
- [ ] Create `2048/game.js` — swipe/arrow input, move validation, win (2048) / lose detection
- [ ] Create assets + README — merge algorithm, scoring math

#### Task 5: Flappy Bird
- [ ] Create `flappy-bird/src/config.js` — gravity, flap force, pipe gap, pipe speed
- [ ] Create `flappy-bird/src/bird.js` — bird physics (gravity + flap), rotation based on velocity
- [ ] Create `flappy-bird/src/pipes.js` — pipe spawning, scrolling, gap positioning
- [ ] Create `flappy-bird/src/renderer.js` — bird, pipes, ground scroll, parallax background
- [ ] Create `flappy-bird/game.js` — tap/space to flap, pipe collision, score on pass
- [ ] Create assets + README — gravity physics, collision boxes

#### Task 6: Pong
- [ ] Create `pong/src/config.js` — paddle size, ball speed, win score, AI difficulty
- [ ] Create `pong/src/paddle.js` — player paddle (keys/touch), AI paddle with tracking
- [ ] Create `pong/src/ball.js` — ball movement, paddle reflection angles, speed increase
- [ ] Create `pong/src/renderer.js` — paddles, ball, center line, score display
- [ ] Create `pong/game.js` — 2-player or vs AI mode, serve mechanic, win condition
- [ ] Create assets + README — reflection angle math, AI behavior

#### Task 7: Memory Cards
- [ ] Create `memory-cards/src/config.js` — grid size, card symbols/emojis, flip timing
- [ ] Create `memory-cards/src/deck.js` — card pairs generation, shuffle algorithm
- [ ] Create `memory-cards/src/renderer.js` — DOM card grid, flip animation (CSS transform)
- [ ] Create `memory-cards/game.js` — card flip logic, match checking, move counting, win detection
- [ ] Create assets + README — Fisher-Yates shuffle, matching state machine

#### Task 8: Whack-a-Mole
- [ ] Create `whack-a-mole/src/config.js` — grid 3×3, mole timing, round duration, scoring
- [ ] Create `whack-a-mole/src/moles.js` — mole spawn timing, random hole selection, peek duration
- [ ] Create `whack-a-mole/src/renderer.js` — DOM holes with mole pop-up animation
- [ ] Create `whack-a-mole/game.js` — tap/click to whack, countdown timer, score tracking
- [ ] Create assets + README

#### Task 9: Tic-Tac-Toe
- [ ] Create `tic-tac-toe/src/config.js` — board 3×3, AI difficulty levels
- [ ] Create `tic-tac-toe/src/ai.js` — minimax algorithm with alpha-beta pruning
- [ ] Create `tic-tac-toe/src/board.js` — win detection (rows, cols, diagonals), draw detection
- [ ] Create `tic-tac-toe/src/renderer.js` — DOM grid, X/O drawing, win line highlight
- [ ] Create `tic-tac-toe/game.js` — player turn, AI turn, game reset
- [ ] Create assets + README — minimax tree explanation

#### Task 10: Simon Says
- [ ] Create `simon-says/src/config.js` — 4 colors, tone frequencies, sequence timing
- [ ] Create `simon-says/src/sequence.js` — sequence generation, playback, input validation
- [ ] Create `simon-says/src/renderer.js` — 4 colored buttons with light-up animation
- [ ] Create `simon-says/game.js` — watch phase, input phase, round progression, fail detection
- [ ] Create assets + README

#### Task 11: Solitaire
- [ ] Create `solitaire/src/config.js` — card dimensions, animation speed, layout positions
- [ ] Create `solitaire/src/deck.js` — 52-card deck, shuffle, suit/rank data
- [ ] Create `solitaire/src/tableau.js` — 7 columns, face-down/up cards, stacking rules
- [ ] Create `solitaire/src/foundation.js` — 4 foundation piles, ace-to-king validation
- [ ] Create `solitaire/src/stock.js` — stock pile, waste pile, draw mechanic
- [ ] Create `solitaire/src/drag.js` — drag-and-drop + tap-to-move for mobile
- [ ] Create `solitaire/src/renderer.js` — canvas card rendering, card faces, animations
- [ ] Create `solitaire/game.js` — orchestrator, auto-complete detection, win animation
- [ ] Create assets + README — Klondike rules, valid move logic

#### Task 12: Wordle
- [ ] Create `wordle/src/config.js` — word length 5, max guesses 6, keyboard layout
- [ ] Create `wordle/src/words.js` — word list (target words + valid guesses)
- [ ] Create `wordle/src/evaluator.js` — letter evaluation (correct/present/absent)
- [ ] Create `wordle/src/keyboard.js` — on-screen keyboard with color state
- [ ] Create `wordle/src/renderer.js` — DOM grid rows, letter tiles, flip animation
- [ ] Create `wordle/game.js` — input handling, guess submission, win/lose detection
- [ ] Create assets + README — evaluation algorithm, letter frequency

#### Task 13: Space Invaders
- [ ] Create `space-invaders/src/config.js` — grid formation, enemy speed, bullet speed, lives
- [ ] Create `space-invaders/src/player.js` — ship movement, shooting cooldown
- [ ] Create `space-invaders/src/enemies.js` — formation grid, lateral movement, descent, shooting
- [ ] Create `space-invaders/src/bullets.js` — bullet pool, collision detection
- [ ] Create `space-invaders/src/renderer.js` — pixel art sprites for ship, enemies, bullets
- [ ] Create `space-invaders/game.js` — wave progression, difficulty scaling, lives
- [ ] Create assets + README

#### Task 14: Doodle Jump
- [ ] Create `doodle-jump/src/config.js` — gravity, jump force, platform spacing, scroll speed
- [ ] Create `doodle-jump/src/player.js` — player physics, horizontal movement (tilt/keys)
- [ ] Create `doodle-jump/src/platforms.js` — platform types (normal, moving, breaking), generation
- [ ] Create `doodle-jump/src/camera.js` — vertical scrolling, platform recycling
- [ ] Create `doodle-jump/src/renderer.js` — player, platforms, background
- [ ] Create `doodle-jump/game.js` — orchestrator, fall detection, score = height
- [ ] Create assets + README — platform generation algorithm, physics

### Modern Hits

#### Task 15: Color Switch
- [ ] Create `color-switch/src/config.js` — ring colors, rotation speed, ball speed
- [ ] Create `color-switch/src/ball.js` — ball physics, color assignment, tap to jump
- [ ] Create `color-switch/src/obstacles.js` — rotating rings, color gates, pattern generation
- [ ] Create `color-switch/src/renderer.js` — ring drawing with arc segments, ball, stars
- [ ] Create `color-switch/game.js` — color matching collision, scrolling, score
- [ ] Create assets + README — arc collision math

#### Task 16: Stack Tower
- [ ] Create `stack-tower/src/config.js` — block width, speed, shrink rate, colors
- [ ] Create `stack-tower/src/blocks.js` — sliding block, stack, overhang trimming
- [ ] Create `stack-tower/src/renderer.js` — 3D-ish isometric block stack, animation
- [ ] Create `stack-tower/game.js` — tap to place, perfect bonus, game over when too small
- [ ] Create assets + README — overhang calculation

#### Task 17: Crossy Road
- [ ] Create `crossy-road/src/config.js` — lane types, vehicle speeds, river log speeds
- [ ] Create `crossy-road/src/player.js` — hop movement on grid, forward/lateral
- [ ] Create `crossy-road/src/lanes.js` — lane generation (road, river, grass), obstacle spawning
- [ ] Create `crossy-road/src/renderer.js` — top-down pixel art lanes, vehicles, logs
- [ ] Create `crossy-road/game.js` — hop input, collision, idle timeout, score = distance
- [ ] Create assets + README

#### Task 18: Fruit Ninja
- [ ] Create `fruit-ninja/src/config.js` — fruit types, throw speed, gravity, bomb chance
- [ ] Create `fruit-ninja/src/fruits.js` — fruit spawning, arc trajectory, rotation
- [ ] Create `fruit-ninja/src/blade.js` — swipe trail rendering, slice detection
- [ ] Create `fruit-ninja/src/renderer.js` — fruit drawing, slice halves, juice particles
- [ ] Create `fruit-ninja/game.js` — swipe input, slice collision, bomb penalty, lives
- [ ] Create assets + README — projectile arc math, swipe detection

#### Task 19: Reaction Time
- [ ] Create `reaction-time/src/config.js` — wait range, colors, rating thresholds
- [ ] Create `reaction-time/src/test.js` — state machine (wait → ready → go → result), timing
- [ ] Create `reaction-time/src/renderer.js` — full-screen color changes, result display
- [ ] Create `reaction-time/game.js` — tap/click timing, too-early detection, best tracking
- [ ] Create assets + README — reaction time statistics

#### Task 20: Typing Speed
- [ ] Create `typing-speed/src/config.js` — word list, round duration, difficulty scaling
- [ ] Create `typing-speed/src/words.js` — word pool, random selection, difficulty tiers
- [ ] Create `typing-speed/src/renderer.js` — falling/scrolling words, input field, WPM display
- [ ] Create `typing-speed/game.js` — word matching, WPM calculation, countdown timer
- [ ] Create assets + README — WPM formula

#### Task 21: Endless Runner
- [ ] Create `endless-runner/src/config.js` — gravity, jump force, obstacle types, ground speed
- [ ] Create `endless-runner/src/player.js` — run, jump, duck states, hitbox
- [ ] Create `endless-runner/src/obstacles.js` — obstacle spawning, scrolling, variety
- [ ] Create `endless-runner/src/ground.js` — scrolling ground + parallax background
- [ ] Create `endless-runner/src/renderer.js` — pixel art player, obstacles, ground
- [ ] Create `endless-runner/game.js` — jump/duck input, collision, speed increase, score = distance
- [ ] Create assets + README

### Originals

#### Task 22: Gravity Flip
- [ ] Create `gravity-flip/src/config.js` — gravity strength, corridor speed, gap sizes
- [ ] Create `gravity-flip/src/player.js` — player with gravity, tap to flip gravity direction
- [ ] Create `gravity-flip/src/corridors.js` — scrolling corridor walls, gap generation
- [ ] Create `gravity-flip/src/renderer.js` — player, walls, gravity indicator
- [ ] Create `gravity-flip/game.js` — tap to flip, wall collision, score = distance
- [ ] Create assets + README — gravity flip physics

#### Task 23: Color Flood
- [ ] Create `color-flood/src/config.js` — grid 14×14, 6 colors, max moves 25
- [ ] Create `color-flood/src/board.js` — grid state, flood fill from top-left corner
- [ ] Create `color-flood/src/renderer.js` — DOM color grid, color picker buttons
- [ ] Create `color-flood/game.js` — color selection, flood fill, move counting, win detection
- [ ] Create assets + README — flood fill algorithm (BFS), optimal strategy

#### Task 24: Rhythm Tap
- [ ] Create `rhythm-tap/src/config.js` — lane count, note speed, timing windows, BPM
- [ ] Create `rhythm-tap/src/song.js` — procedural note pattern generation based on BPM
- [ ] Create `rhythm-tap/src/notes.js` — note spawning, scrolling, hit detection with timing grades
- [ ] Create `rhythm-tap/src/renderer.js` — lanes, falling notes, hit flash, combo display
- [ ] Create `rhythm-tap/game.js` — lane input (keys/tap), timing judgment, combo system, score
- [ ] Create assets + README — timing window math, combo multiplier

#### Task 25: Shadow Match
- [ ] Create `shadow-match/src/config.js` — shape types, display time, difficulty scaling
- [ ] Create `shadow-match/src/shapes.js` — shape generation, rotation, mirroring transforms
- [ ] Create `shadow-match/src/renderer.js` — shape display, choice grid, timer bar
- [ ] Create `shadow-match/game.js` — flash shape, show choices, validate pick, level progression
- [ ] Create assets + README — rotation/mirror transform math

#### Task 26: Chain Reaction
- [ ] Create `chain-reaction/src/config.js` — particle count, explosion radius, chain timing
- [ ] Create `chain-reaction/src/particles.js` — floating particles, random movement
- [ ] Create `chain-reaction/src/explosions.js` — explosion circles, chain trigger radius
- [ ] Create `chain-reaction/src/renderer.js` — particles, expanding explosion circles
- [ ] Create `chain-reaction/game.js` — click to start explosion, chain detection, level goals
- [ ] Create assets + README — chain reaction radius math, level design

#### Task 27: Orbit Dodge
- [ ] Create `orbit-dodge/src/config.js` — orbit radius, rotation speed, obstacle frequency
- [ ] Create `orbit-dodge/src/player.js` — circular orbit movement, tap to reverse direction
- [ ] Create `orbit-dodge/src/obstacles.js` — obstacles flying through orbit path
- [ ] Create `orbit-dodge/src/renderer.js` — orbit ring, player dot, obstacles, trail effect
- [ ] Create `orbit-dodge/game.js` — tap to switch direction, collision, score = time survived
- [ ] Create assets + README — circular motion math (sin/cos)

#### Task 28: Word Chain
- [ ] Create `word-chain/src/config.js` — time limit, min word length, dictionary size
- [ ] Create `word-chain/src/dictionary.js` — word validation, common English words subset
- [ ] Create `word-chain/src/chain.js` — chain logic (last letter → first letter), history
- [ ] Create `word-chain/src/renderer.js` — word history display, input field, timer bar
- [ ] Create `word-chain/game.js` — input handling, validation, chain tracking, countdown
- [ ] Create assets + README

#### Task 29: Pixel Painter
- [ ] Create `pixel-painter/src/config.js` — grid 8×8, color palette, display time, difficulty
- [ ] Create `pixel-painter/src/patterns.js` — target pixel art patterns, difficulty tiers
- [ ] Create `pixel-painter/src/renderer.js` — target display, painting grid, color palette bar
- [ ] Create `pixel-painter/game.js` — show target briefly, paint from memory, accuracy scoring
- [ ] Create assets + README — accuracy calculation

#### Task 30: Merge Path
- [ ] Create `merge-path/src/config.js` — grid sizes per level, dot colors, max paths
- [ ] Create `merge-path/src/puzzle.js` — puzzle generation, solution validation
- [ ] Create `merge-path/src/paths.js` — path drawing, intersection detection
- [ ] Create `merge-path/src/renderer.js` — grid, colored dots, drawn paths
- [ ] Create `merge-path/game.js` — touch/mouse path drawing, completion check, level progression
- [ ] Create assets + README — path intersection algorithm

#### Task 31: Bounce Architect
- [ ] Create `bounce-architect/src/config.js` — gravity, bounce factor, pad count per level
- [ ] Create `bounce-architect/src/ball.js` — ball physics with gravity and bouncing
- [ ] Create `bounce-architect/src/pads.js` — pad placement (click/tap), angle, bounce behavior
- [ ] Create `bounce-architect/src/levels.js` — level definitions (start, goal, obstacles)
- [ ] Create `bounce-architect/src/renderer.js` — ball, pads, goal, trajectory preview
- [ ] Create `bounce-architect/game.js` — place pads phase, launch phase, win detection
- [ ] Create assets + README — bounce physics, reflection angles

#### Task 32: Sound Memory
- [ ] Create `sound-memory/src/config.js` — tone frequencies, sequence timing, button count
- [ ] Create `sound-memory/src/tones.js` — Web Audio tone generation, distinct musical notes
- [ ] Create `sound-memory/src/sequence.js` — sequence generation, playback, input matching
- [ ] Create `sound-memory/src/renderer.js` — tone buttons with visual feedback, waveform display
- [ ] Create `sound-memory/game.js` — listen phase, repeat phase, round progression
- [ ] Create assets + README — musical note frequencies

#### Task 33: Shrinking Arena
- [ ] Create `shrinking-arena/src/config.js` — arena size, shrink rate, AI count, player speed
- [ ] Create `shrinking-arena/src/player.js` — player movement (WASD/touch joystick)
- [ ] Create `shrinking-arena/src/enemies.js` — AI dots with avoidance behavior
- [ ] Create `shrinking-arena/src/arena.js` — shrinking boundary, out-of-bounds elimination
- [ ] Create `shrinking-arena/src/renderer.js` — arena, player, enemies, boundary warning
- [ ] Create `shrinking-arena/game.js` — movement, boundary check, elimination, last alive wins
- [ ] Create assets + README — AI steering behavior, arena shrink math

#### Task 34: One-Button Duels
- [ ] Create `one-button-duels/src/config.js` — timing windows, action types, round count
- [ ] Create `one-button-duels/src/combat.js` — action system (strike/parry/dodge), timing resolution
- [ ] Create `one-button-duels/src/renderer.js` — two fighters, action indicators, timing bar
- [ ] Create `one-button-duels/game.js` — P1 (left side/Q key) vs P2 (right side/P key), round system
- [ ] Create assets + README — timing combat system, action priority
