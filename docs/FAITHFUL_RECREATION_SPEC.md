# FAITHFUL RECREATION SPEC

## Purpose
This document is the working fidelity spec for bringing `raptor_manusAI_v1` closer to the 1994 DOS release of *Raptor: Call of the Shadows* while staying inside the current HTML5/Canvas codebase.

Use this document as the implementation target before adding new features.

## Source Ground Truth
Primary reference:
- 3D Realms legacy page: https://legacy.3drealms.com/raptor/

Screenshot/reference set:
- MobyGames DOS screenshot gallery: https://www.mobygames.com/game/511/raptor-call-of-the-shadows/screenshots/
- DOS opening cinematic reference: https://www.mobygames.com/game/dos/raptor-call-of-the-shadows/screenshots/gameShotId%2C986573/
- DOS hangar menu reference: https://www.mobygames.com/game/511/raptor-call-of-the-shadows/screenshots/dos/2473/
- DOS loading screen reference: https://www.mobygames.com/game/511/raptor-call-of-the-shadows/screenshots/dos/986567/
- DOS landing reference: https://www.mobygames.com/game/511/raptor-call-of-the-shadows/screenshots/dos/986571/
- DOS difficulty reference: https://www.mobygames.com/game/511/raptor-call-of-the-shadows/screenshots/dos/706772/

From the original 3D Realms page, the key baseline facts are:
- DOS VGA presentation with smooth scrolling visuals.
- 27 levels in the full game.
- Boss ships at the end of every wave.
- Cash earned from destruction is spent between waves.
- Four skill levels.
- Upgrades are bought between waves from Harold's Emporium.

From the MobyGames DOS screenshots, the key structural flow is:
- Opening cinematic.
- Main menu.
- Pilot entry.
- Difficulty selection.
- Hangar menu.
- Shop / purchase screen.
- Sector selection.
- Loading screen.
- Gameplay.
- Landing back in hangar.

## Current Repo Target
Primary playable path today:
- [game.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/engine/game.js)
- [LoadingState.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/LoadingState.js)
- [introCutscene.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/introCutscene.js)
- [menu.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/menu.js)
- [characterSelect.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/characterSelect.js)
- [hangar.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/hangar.js)
- [shop.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/shop.js)
- [gameState.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/gameState.js)
- [level1.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/levels/level1.js)

The current repo is already functional enough for a first-wave loop. Fidelity work should reshape the existing screens and rules, not replace the entire architecture.

## Fidelity Goals
1. Preserve the current JS engine and modular state machine.
2. Move the presentation closer to the DOS game screen-by-screen.
3. Keep the first implementation pass focused on Level 1 and the between-mission loop.
4. Prefer layout, timing, and game-feel corrections before adding new content.

## Screen-By-Screen Recreation Targets

### 1. Opening Cinematic
Desired behavior:
- The intro should reliably play on first boot.
- It should not auto-skip because of stray input.
- It should use full-screen still panels with dramatic pacing and a visible skip prompt.

Current repo gap:
- [introCutscene.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/introCutscene.js) advances on any keydown or mousedown.

Implementation target:
- Ignore skip input for the first 400 ms after entering.
- Only allow skip on `Enter`, `Space`, `Escape`, or explicit click/tap on a skip affordance.
- Render `Press Enter to skip` in the lower-right corner.
- Maintain the current JSON-driven sequence in `assets/data/introCutscene.json` unless stronger source material is added.

### 2. Main Menu and Pilot Setup
Desired behavior:
- Menu should feel like a DOS title/menu, not a modern overlay list.
- Pilot entry should be quicker and more compact.
- Difficulty selection should happen before the first mission, matching the DOS flow more closely.

Implementation target:
- Keep current menu state but add a dedicated difficulty selection panel after pilot creation.
- Add four skill levels: `Training`, `Rookie`, `Veteran`, `Elite`.
- Skill level should become part of persistent pilot data.
- The menu should default to keyboard-first navigation.

### 3. Hangar Layout
Source target:
- The DOS hangar/menu screenshot shows the hangar itself acting as the in-between-missions navigation surface.
- Buttons should line up with art landmarks, not float in a generic web card.

Desired behavior:
- Left-side exit/hangar door area launches the next mission.
- Right-side area opens the shop.
- Save should be attached to an in-world terminal or control panel.
- Exit to menu should be smaller and less prominent than mission launch.

Implementation target:
- Replace the two-column generic overlay in [hangar.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/hangar.js) with positioned hotspots over the actual background art.
- Keep pilot stats in a smaller UI panel, not the main focus.
- Add hover/focus outlines for debugging, with a flag to disable them later.

Hotspot plan for current background:
- `launchMissionHotspot`: left lower-third, aligned with the exit/door region.
- `shopHotspot`: right lower-third, aligned with the shop area.
- `saveHotspot`: right upper-third on a console-style panel.
- `menuHotspot`: bottom center or top-right, visually subordinate.

### 4. Shop / Harold's Emporium Feel
Desired behavior:
- The shop should feel like a between-wave armory, not a generic list view.
- Economy should emphasize repair, survivability, and weapon progression.

Implementation target:
- Keep [shop.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/shop.js) as the structural base.
- Reframe the layout to match a DOS store panel: item list, price, short description, current funds, current loadout.
- First faithful item categories:
  - Repair hull
  - Buy missile/secondary upgrades
  - Increase reserve megabombs
  - Unlock stronger weapon tiers
- Avoid modern storefront phrasing like `Open Shop`; use in-universe naming.

### 5. Sector Selection and Loading
Desired behavior:
- After launching from hangar, the game should briefly communicate the mission/sector instead of instantly dropping into play.
- The loading screen should feel like a mission briefing/loading card.

Implementation target:
- Add a short `sector briefing` step before gameplay for mission 1.
- Reuse the existing loading artwork pipeline in [LoadingState.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/LoadingState.js) and [gameState.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/gameState.js).
- Use the DOS loading screen reference as the target framing.

### 6. Gameplay Window and Playfield
Desired behavior:
- The playfield should feel more like a centered 4:3 combat window.
- The barrier should contain player movement while not clipping enemy formations unnaturally.

Current repo gap:
- [level1.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/levels/level1.js) uses a `960`-pixel playfield.
- Some enemies spawn outside the visible combat area because [enemyFactory.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/entities/enemyFactory.js) mixes full-screen coordinates with playfield-local coordinates.

Implementation target:
- Increase `PLAYABLE_WIDTH` slightly from `960` to a range of `1024` to `1040` after spawn math is fixed.
- Keep the centered playfield border for now.
- Treat level JSON coordinates as local-to-playfield, not local-to-window.

Spawn rule:
- Base spawn should be:
  - `spawnWorldX = bounds.left + spawn_x`
  - `spawnWorldY = bounds.top + spawn_y`
- Then apply off-screen entry logic from the chosen movement pattern.
- Top-entry enemies should not use raw `spawn_x` against the full browser width.

### 7. Enemy Entry, Waves, and Bosses
Desired behavior:
- Enemy formations should enter cleanly through the top or sides of the playfield.
- Boss arrival should feel staged and deliberate.
- Waves should have tighter formation composition and less prototype randomness.

Implementation target:
- In [enemyFactory.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/entities/enemyFactory.js), move all spawn interpretation to playfield-relative coordinates.
- In [enemyBehaviors.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/entities/enemyBehaviors.js), bias motion toward readable entry arcs rather than abrupt spawns.
- In [level1.json](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/levels/level1.json), adjust waves so they feel more like composed attack patterns than debug lanes.

### 8. HUD and On-Screen Readability
Desired behavior:
- The HUD should read as classic shooter instrumentation.
- Hull, score, money, and weapon state should be immediately legible.

Implementation target:
- Keep [hud.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/ui/hud.js) as the rendering anchor.
- Tighten the visual style toward a classic side-panel or top/bottom readout.
- Reduce prototype/debug feel.
- Distinguish `cash earned` from `score` clearly.

### 9. Landing / Mission Complete
Desired behavior:
- Returning from the mission should feel like a landing sequence back at base.
- It should not feel like a direct hard cut to another screen.

Implementation target:
- After level completion, show a short landing/return card or still image before entering hangar.
- Reuse the current mission-complete delay in [gameState.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/gameState.js) as the timing hook.
- Match the `Land in hangar` DOS screenshot as the visual target.

## Controls and Feel Targets
Current repo control set is serviceable, but fidelity target should be:
- Keyboard-first by default.
- Mouse movement optional, not required.
- Primary fire should feel continuous and central.
- Secondary/missile behavior should support hold-to-fire or dedicated trigger.
- Inputs should not accidentally skip non-gameplay screens.

Recommended mapping target:
- `Arrow Keys` or `WASD`: move
- `Ctrl` or `Space`: primary fire
- `Alt` or `Shift`: secondary/special weapon
- `B`: megabomb
- `Enter`: confirm / skip intro
- `Esc`: pause / back

## Asset and Reference Policy
This repo can use outside reference material for fidelity planning, but the shipped game should avoid directly redistributing copyrighted screenshots from the DOS game unless you explicitly choose to do so.

Recommended policy:
- Use outside screenshots as design references only.
- Keep imported third-party images out of runtime unless they are cleared for use.
- Continue using the repo's own spritework and UI art as the shipped base.

Current reference-only additions are preserved in:
- [salvage/zip-docs](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/salvage/zip-docs)

## Immediate Implementation Plan
Phase A:
- Fix intro skip behavior.
- Convert hangar to art-aligned hotspots.
- Correct enemy spawn math to use playfield-local coordinates.
- Widen playfield modestly after spawn fix.

Phase B:
- Add difficulty selection and persistent difficulty.
- Add sector briefing/loading flow.
- Tighten HUD to a more DOS-faithful layout.
- Add landing/return presentation before hangar.

Phase C:
- Rebalance Level 1 waves to feel more like the original structure.
- Expand shop categories toward the DOS economy loop.
- Reintroduce later sectors and Level 2 only after Level 1 fidelity is solid.

## Non-Goals For The Next Pass
- Full 27-level campaign.
- Full audio restoration.
- Exact asset-perfect recreation of every DOS screen.
- Legal redistribution of original art assets.

## Definition of Done For The Next Fidelity Pass
The next pass is successful when:
- Intro reliably plays and skips intentionally.
- Hangar buttons are positioned to match the background scene.
- Enemies enter inside a slightly wider but still bounded playfield.
- Level 1 feels visually and structurally closer to the DOS reference loop.
- The repo still plays through menu -> hangar -> mission -> hangar without regressions.
