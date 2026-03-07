# PROJECT RAPTOR BIBLE

## 1. High-Level Project Overview
- **Project Name:** Project Raptor
- **Concept:** A modern re-imagining of the classic 1994 DOS game *Raptor: Call of the Shadows*, built with a data-driven, modular JavaScript engine.
- **Current Goal:** Stabilize the campaign framing, Level 1 environment identity, Level 1 combat composition, Harold's Emporium economy loop, end-of-run score model, and moment-to-moment audio/presentation feedback so the game plays like a faithful DOS-style contract run instead of a prototype shooter.
- **Active Fidelity Spec:** See `docs/FAITHFUL_RECREATION_SPEC.md` for the current screen-flow, layout, and gameplay targets.

## 2. Game Architecture
- **Technology Stack:** HTML5, CSS3, JavaScript (ES6 Modules), Web Audio API, Node.js, Git.
- **State Machine (`game.js`, `/states`):** Manages the overall game flow (Loading, Intro, Menu, Pilot Setup, Difficulty, Hangar, Briefing, Game, Landing, Shop, etc.), ensuring clean setup (`enter`) and teardown (`exit`) of game states.
- **Data-Driven Design (`levelX.json`, `...Data.js`):** Level layouts, enemy waves, mission metadata, player airframes, and object properties are defined in external data files where possible. The format is specified in `TECHNICAL_REFERENCE.md`.
- **Behavior Library (`enemyBehaviors.js`):** A palette of reusable movement and firing pattern functions that can be assigned to any enemy via the level data, enabling complex and varied encounters.
- **Layered Canvas Rendering:** Utilizes multiple stacked `<canvas>` elements (background, environment, enemy, projectile, player, explosion, ui) to separate rendering concerns and improve performance.
- **Asynchronous Asset Loading:** A dedicated `LoadingState` and `AssetManager` handle the asynchronous loading of all game assets (images, audio, data) at startup.
- **Pilot/Airframe Model:** Save data now persists pilot identity, difficulty, selected airframe, primary weapon level, owned secondaries, mission results, and future-facing event/ending flags.

## 3. Visual Style Guide
- **Core Aesthetic:** Modern Retro - a modern interpretation of the 1994 classic with higher fidelity, cleaner lines, and modern effects. Gritty and industrial military setting. High-contrast readability is mandatory.
- **Color Palette:** Deep blues, military greens, steel grays, warning reds, energy blues, accent oranges, highlight yellows, and water teals.
- **Typography:** Functional, readable UI fonts. Final fidelity pass should move further toward a period-appropriate DOS instrumentation look.
- **Sprite & Asset Design:** Clear silhouettes, consistent scale, readable projectiles, layered background identity, and destructible environment targets that make sense for the terrain.
- **Environment Design:** Smooth scrolling, destructible structures, section-based visual identity, and region-specific ground targets.
- **UI & HUD:** Compact, readable, and cash-first during active play. Score is only surfaced in debrief/final screens and is calculated from cash, kills, completion, and the selected difficulty multiplier. Major UI states now also use synthesized fallback interaction sounds until authored samples exist.

## 4. Game Mechanics & Flow
- **Gameplay:** Vertical scrolling shoot 'em up. Player controls a fighter jet, battling enemies on ground and in the air. Level 1 now uses named regional encounter beats, short inter-wave breathers, and a phased telegraphed boss encounter before landing/debrief.
- **Difficulty Levels:** Training, Rookie, Veteran, Elite.
- **Core Systems:**
  - **Money System:** Destroying enemies and ground targets earns money for upgrades.
  - **Weapon System:** Players keep a permanent machine gun baseline and unlock secondaries over time.
  - **Airframe System:** Pilots persist a selected jet type with different starting cannon stats, hull, speed, route seed, and ending hooks.
  - **Collectibles:** Health, weapon unlocks, and megabombs are the current active pickups.
- **Current Campaign Flow:**
  1. Intro and Main Menu
  2. Pilot Creation and Airframe Assignment
  3. Difficulty Selection
  4. Hangar
  5. Sector Briefing
  6. Play Mission
  7. Landing and Debrief
  8. Return to Hangar / Shop / Next Sortie

## 5. Controls
- **Keyboard/Mouse:** Arrow keys or WASD for movement, Ctrl/Space or mouse-left to fire, Shift for secondary fire, Alt for secondary auto-fire toggle, B for megabomb, P/Escape for pause.
- **Touch Controls:** Planned but not the current fidelity priority.

## 6. AI Collaboration Framework
- Keep the repo playable after each pass.
- Prefer explicit state-flow fixes and data-shape fixes over cosmetic patches that hide architectural problems.
- Update the design docs when implementation meaningfully changes the active target.
- Verify syntax and runtime-critical paths before pushing.

