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
5. Make the environment itself a scoring and tactical layer, not just a backdrop.

## Core Fidelity Principles
1. Readability first: enemy silhouettes, destructibles, pickups, and hazards must be instantly legible.
2. Sector identity matters: each background section should imply a place, not a generic scroll texture.
3. Destructible terrain is gameplay: buildings, bridges, vats, radar sites, bunkers, and fuel depots should matter to score and feel.
4. Between-mission economy is part of the fantasy: cash and destruction must feed Harold's shop loop.
5. Scripted pacing beats randomness: memorable formations and terrain beats are more important than sheer enemy count.

## Screen-By-Screen Recreation Targets

### 1. Opening Cinematic
Desired behavior:
- The intro should reliably play on first boot.
- It should not auto-skip because of stray input.
- It should use full-screen still panels with dramatic pacing and a visible skip prompt.

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
- Use positioned hotspots over the actual background art.
- Keep pilot stats in a smaller UI panel, not the main focus.
- Add hover/focus outlines for debugging, with a flag to disable them later.
- Add keyboard navigation between hangar hotspots.

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

Implementation target:
- Keep the centered playfield border for now.
- Treat level JSON coordinates as local-to-playfield, not local-to-window.
- Widen the field modestly only if formations still feel cramped after spawn math is correct.

### 7. Enemy Entry, Waves, and Bosses
Desired behavior:
- Enemy formations should enter cleanly through the top or sides of the playfield.
- Boss arrival should feel staged and deliberate.
- Waves should have tighter formation composition and less prototype randomness.

Implementation target:
- In [enemyFactory.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/entities/enemyFactory.js), keep all spawn interpretation playfield-relative.
- In [enemyBehaviors.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/entities/enemyBehaviors.js), bias motion toward readable entry arcs rather than abrupt spawns.
- In [level1.json](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/levels/level1.json), adjust waves so they feel like composed attack patterns, not debug lanes.

### 8. HUD and On-Screen Readability
Desired behavior:
- The HUD should read as classic shooter instrumentation.
- Hull, score, money, and weapon state should be immediately legible.

Implementation target:
- Keep [hud.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/ui/hud.js) as the rendering anchor.
- Tighten the visual style toward a classic side-panel or top/bottom readout.
- Distinguish `cash earned` from `score` clearly.
- Add current secondary weapon and reserve megabomb readouts.

### 9. Landing / Mission Complete
Desired behavior:
- Returning from the mission should feel like a landing sequence back at base.
- It should not feel like a direct hard cut to another screen.

Implementation target:
- After level completion, show a short landing/return card or still image before entering hangar.
- Reuse the current mission-complete delay in [gameState.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/gameState.js) as the timing hook.
- Match the `land in hangar` DOS screenshot as the visual target.

## Environment, Terrain, and Scrolling Background
This is the biggest missing fidelity category after the menu/shop loop.

The original game did not feel like a single endlessly tiled background. It felt like a mission through real hostile territory with recognizable man-made targets embedded into the terrain.

### Environment Fidelity Goal
The scrolling background must be broken into distinctive sections with matching destructible structures, hazards, and enemy behavior.

The environment should do all of the following:
- establish location and mission fantasy
- telegraph what kinds of destructibles are present
- create score opportunities beyond air kills
- vary color and terrain rhythm over the course of a mission
- support wave choreography
- make the player read the ground, not just the airspace

### Required Environment Behaviors
1. Background scroll should have distinct region changes.
2. Each region should contain themed ground structures.
3. Ground structures should award cash and score when destroyed.
4. High-value structures should be visibly different from low-value filler targets.
5. Ground structures should be spatially tied to the art beneath them.
6. Bridges and similar structures should feel like landmarks, not random props.
7. Water/coastal sections should include destructibles that make sense there.
8. The player should be able to “farm” score intelligently by spotting valuable targets.
9. Terrain sections should support mixed air/ground pressure.

### Level 1 Environment Identity Target
Level 1 should not be one visual tone. It should feel like a hostile coastal-industrial sector with evolving terrain.

Recommended section flow for the current project:
1. Coastal military outskirts
- sparse roads
- small bunkers
- radar dishes
- fuel depots
- light anti-air presence

2. Industrial shoreline
- warehouse roofs
- crane or dock-style silhouettes
- storage tanks
- heavier ground installations
- mixed fighter waves above fixed defenses

3. Bridge / transit corridor set piece
- bridge spans or causeway geometry
- chokepoint feeling
- turrets or bunkers placed near structural landmarks
- enemy formations timed to cross over the bridge section

4. Chemical or refinery water section
- ocean or inlet palette shift
- chemical vats / tanks / pipelines / platform-like targets
- explosive fuel targets with higher reward
- stronger contrast between water and industrial objects

5. Hardened military complex before boss
- denser structures
- larger bunkers / radar / fuel combinations
- more deliberate enemy escort waves
- clear ramp into boss territory

### Destructible Environment Target List
Every mission sector should define a set of destructible environment object families.

Minimum Level 1 object families:
- bunker
- radar dish
- fuel tank
- warehouse / storage building
- bridge segment or support target
- chemical vat / refinery tank
- dockside or industrial support structure
- anti-air emplacement / turret platform

Each destructible family should define:
- sprite/art identity
- health
- score value
- money value
- explosion tier
- whether it chains explosions
- whether it can drop pickups
- whether missiles can target it
- what terrain section it belongs to

### Terrain Section Rules
Every background section should have a terrain profile with:
- name
- start scroll position
- end scroll position
- palette / art treatment
- allowed environment object types
- suggested enemy families
- landmark object frequency
- base destructible density
- optional hazards or scripted events

Suggested data model:
- `terrainSections` array in mission data
- `environment_objects` tagged with `sectionId`
- optional `landmarks` list for large set-piece structures

### Scrolling Background Checklist
The scrolling background system should be upgraded to support:
1. region-based background art swaps or layered overlays
2. palette shifts between sections
3. landmark placement tied to scroll position
4. roads, shorelines, waterways, or structural lines that guide the eye
5. enough visual variation every 10-20 seconds to prevent sameness
6. alignment between background art and actual destructible collision objects
7. optional parallax accents where appropriate, but not at the expense of clarity

### Destruction and Scoring Checklist
Environmental destruction should support:
1. score gain
2. cash gain
3. satisfying explosion feedback
4. larger audio/visual response for fuel and chemical targets
5. occasional chain reactions
6. clear targeting priority for high-value structures
7. distinct hit feedback compared to airborne enemies

### Level 1 Specific Implementation Checklist
For the current repo, Level 1 should be rebuilt around these environment beats:
1. first 20-30 seconds
- light military outskirts
- easy bunker/radar targets
- teach the player that the ground matters

2. second section
- add more dense industrial buildings
- raise score opportunity through grouped structures
- pair ground targets with simple air harassment

3. midpoint section
- introduce the secondary-weapon pickup in a memorable terrain region
- place it near a landmark rather than as a floating generic reward beat

4. late section
- include a bridge or refinery set piece
- use it to anchor a difficult combined-arms wave

5. pre-boss section
- increase hardened target density
- make the environment itself feel militarized and defended

### Repo Targets For Environment Work
Primary files that should eventually own this system:
- [level1.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/levels/level1.js)
- [level1.json](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/levels/level1.json)
- [BackgroundManager.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/environment/BackgroundManager.js)
- [tilemap.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/environment/tilemap.js)
- [environmentFactory.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/entities/environmentFactory.js)
- [destructibleObject.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/entities/destructibleObject.js)
- [enemy.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/entities/enemy.js)

## Current Level 1 Environment Implementation
The current repo now implements a first-pass environment sector system for Level 1.

Implemented in code:
- [level1.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/levels/level1.js) now assigns Level 1 to named terrain sections by wave range.
- [BackgroundManager.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/environment/BackgroundManager.js) now renders section-specific procedural overlays for coastal, industrial, bridge, refinery, and military zones.
- [environmentData.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/assets/data/environmentData.js) now defines value-tiered environment variants using the existing bunker, radar dish, and fuel tank spritework.
- [environmentFactory.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/entities/environmentFactory.js) now spawns environment objects in playfield-local coordinates.
- [destructibleObject.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/entities/destructibleObject.js) now awards both score and cash for ground destruction.

Current Level 1 sector order:
1. Coastal Outskirts
2. Industrial Shoreline
3. Bridge Corridor
4. Refinery Inlet
5. Hardened Complex

Current implementation limits:
- Section changes are currently wave-driven, not scroll-position-driven.
- The background uses procedural themed overlays on top of the existing art, not full bespoke art sheets per sector.
- The destructible family set is broader in gameplay terms than in art terms; several types intentionally reuse the same bunker, radar, and fuel sprites with different values and roles.
- Bridge, warehouse, and chemical landmark visuals are implied through overlays and placement rather than unique new sprite assets.

This is acceptable for the current repo stage because it improves mission identity, score opportunities, and sector pacing without claiming a fully art-complete recreation.
## Controls and Feel Targets
Current repo control set is serviceable, but fidelity target should be:
- Keyboard-first by default.
- Mouse movement optional, not required.
- Primary fire should feel continuous and central.
- Secondary/missile behavior should support dedicated trigger or toggled auto-fire after unlock.
- Inputs should not accidentally skip non-gameplay screens.

Recommended mapping target:
- `Arrow Keys` or `WASD`: move
- `Ctrl` or `Space`: primary fire
- `Alt` or `Shift`: secondary/special weapon
- `B`: megabomb
- `Enter`: confirm / skip intro
- `Esc`: pause / back

## Economy and Score Targets
To feel like DOS Raptor, cash and score must come from both air and ground destruction.

Required economy behaviors:
1. ground targets produce meaningful cash
2. high-value destructibles are worth detouring for
3. cash rewards should reinforce map knowledge
4. score and money should be related but not identical
5. later shop choices should be influenced by how thoroughly the player cleared a mission

Suggested balancing rules:
- filler ground target: low score, low cash
- bunker / radar: medium score, medium cash
- fuel or chemical target: medium-to-high score, high cash, strong explosion reward
- major landmark target: high score, high cash, rare

## Asset and Reference Policy
This repo can use outside reference material for fidelity planning, but the shipped game should avoid directly redistributing copyrighted screenshots from the DOS game unless you explicitly choose to do so.

Recommended policy:
- Use outside screenshots as design references only.
- Keep imported third-party images out of runtime unless they are cleared for use.
- Continue using the repo's own spritework and UI art as the shipped base.

Current reference-only additions are preserved in:
- [salvage/zip-docs](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/salvage/zip-docs)

## Implementation Roadmap

### Phase A
- Fix intro skip behavior.
- Convert hangar to art-aligned hotspots.
- Correct enemy spawn math to use playfield-local coordinates.
- Widen playfield modestly after spawn fix.

### Phase B
- Add difficulty selection and persistent difficulty.
- Add sector briefing/loading flow.
- Add landing/return presentation before hangar.
- Tighten HUD to a more DOS-faithful layout.

### Phase C
- Rework shop into a real Harold's Emporium loop.
- Formalize primary/secondary weapon ownership and loadout.
- Rebalance cash and score curves around both air and ground targets.
- Add mission result summaries.

### Phase D
- Rebuild Level 1 wave choreography.
- Add terrain sections and landmark-driven scrolling background variation.
- Expand destructible ground target families.
- Integrate section-specific enemy behavior.

### Phase E
- Add audio pass for menu, UI, weapons, explosions, and boss stings.
- Improve explosion tiers and chain-reaction feedback.
- Tighten visual identity of each environment region.

### Phase F
- Apply the same fidelity structure to Level 2 and later sectors.
- Only expand campaign scope after Level 1 feels complete.

## Detailed Checklist

### Menu / Flow
- intro plays intentionally
- skip input is controlled
- difficulty selection exists
- difficulty persists per pilot
- sector briefing exists before launch
- landing/debrief exists after mission

### Hangar / Shop
- hangar hotspots align to background landmarks
- hangar can be navigated by keyboard and mouse
- shop feels diegetic, not web-like
- repairs, loadout, and cash are presented clearly
- Harold's shop language is in-universe

### Gameplay / Weapons
- primary weapon is always available
- secondaries are unlocked or purchased, not free by default
- current secondary is visible in HUD
- megabombs are limited and clearly displayed
- pickup beats are intentional and terrain-aware

### Waves / Bosses
- enemy formations enter cleanly
- each wave has a tactical identity
- boss approach is staged
- boss attacks are telegraphed
- combined air/ground pressure escalates over the mission

### Environment / Terrain
- scrolling background changes identity during the mission
- each region has distinct landmark structures
- destructible objects match the visible terrain beneath them
- water, shore, bridge, industrial, and military sections feel different
- the background is not visually same-ey for more than 15-20 seconds

### Scoring / Economy
- ground destruction meaningfully affects cash and score
- high-value targets are easy to recognize
- chain-reaction targets exist
- mission income influences shop decisions
- cash and score are clearly distinct on the HUD

### Presentation / Audio
- HUD reads like classic instrumentation
- UI fonts and layout feel period-appropriate
- explosions scale with target size/value
- menu and mission audio reinforce the loop
- pickups and UI interactions have distinctive feedback

## Non-Goals For The Next Pass
- Full 27-level campaign.
- Full audio restoration from the original game.
- Exact asset-perfect recreation of every DOS screen.
- Legal redistribution of original art assets.

## Definition of Done For The Next Fidelity Pass
The next major fidelity pass is successful when:
- the game flow feels closer to DOS Raptor before and after missions, not just during them
- Level 1 has distinct terrain sections instead of a mostly uniform scroll
- destructible environment objects are a real source of score, cash, and spectacle
- the shop, hangar, and HUD feel like a coherent campaign loop
- the repo still plays through menu -> hangar -> mission -> hangar without regressions

