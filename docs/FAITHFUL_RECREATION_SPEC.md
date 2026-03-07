# FAITHFUL RECREATION SPEC

## Purpose
This is the working fidelity spec for bringing `raptor_manusAI_v1` closer to the 1994 DOS release of *Raptor: Call of the Shadows* while staying inside the current HTML5/Canvas codebase.

Use this as the implementation target before adding new campaign scope.

## Source Ground Truth
Primary reference:
- 3D Realms legacy page: https://legacy.3drealms.com/raptor/

Reference gallery:
- MobyGames DOS screenshot gallery: https://www.mobygames.com/game/511/raptor-call-of-the-shadows/screenshots/
- DOS opening cinematic reference: https://www.mobygames.com/game/dos/raptor-call-of-the-shadows/screenshots/gameShotId%2C986573/
- DOS hangar menu reference: https://www.mobygames.com/game/511/raptor-call-of-the-shadows/screenshots/dos/2473/
- DOS loading screen reference: https://www.mobygames.com/game/511/raptor-call-of-the-shadows/screenshots/dos/986567/
- DOS landing reference: https://www.mobygames.com/game/511/raptor-call-of-the-shadows/screenshots/dos/986571/
- DOS difficulty reference: https://www.mobygames.com/game/511/raptor-call-of-the-shadows/screenshots/dos/706772/

Key original-game anchors:
- smooth VGA scrolling with strong regional identity
- four skill levels
- cash earned from destruction and spent between missions
- a strong between-mission hangar/shop loop
- memorable destructible terrain targets
- mission framing before and after flight

## Current Repo Target
Primary playable path today:
- [game.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/engine/game.js)
- [LoadingState.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/LoadingState.js)
- [introCutscene.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/introCutscene.js)
- [menu.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/menu.js)
- [characterSelect.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/characterSelect.js)
- [difficultySelect.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/difficultySelect.js)
- [hangar.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/hangar.js)
- [sectorBriefing.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/sectorBriefing.js)
- [gameState.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/gameState.js)
- [landing.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/states/landing.js)
- [level1.js](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/js/levels/level1.js)

## Current Implemented Status
The repo now ships:
- controlled intro skip behavior with a visible prompt
- pilot creation with airframe selection
- four-step campaign framing: pilot -> difficulty -> hangar -> briefing -> mission -> landing -> hangar
- persistent difficulty, airframe, primary weapon level, systems, secondaries, and mission results in pilot saves
- hangar hotspots aligned to the background art
- Level 1 terrain sections with cash-bearing destructible ground targets
- a cash-first flight HUD that prioritizes hull, shield state, weapons, and megabombs over live score
- multi-airframe architecture with per-ship stats, route seeds, and ending/event scaffolding
- Harold''s Emporium categories with repairs, systems, secondaries, and consumables
- end-of-run contract scoring built from cash, kills, and completion with the difficulty multiplier applied at the end
- a rewritten Level 1 combat script with named waves, short inter-wave breathers, section-aware threat labels, and a phased telegraphed boss finale
- synthesized fallback audio for menu, mission, boss warning, pickups, purchases, and combat feedback when no shipped sound asset exists
- layered explosion rendering with stronger shockwave / flash feedback and size-based blast cues
- stronger section-specific background atmosphere and a more terminal-style HUD / briefing / debrief presentation pass

Current compromise:
- only one full player sprite set exists today, so alternate airframes currently use sprite fallback plus tinting
- the shop structure is much stronger now, but its presentation still needs more DOS-authentic visual polish
- Level 2 is still not the active fidelity target

## Core Fidelity Goals
1. Preserve the modular JS engine and state machine.
2. Make the campaign loop feel like DOS Raptor before and after gameplay, not just during gameplay.
3. Treat terrain and destructible structures as part of mission design, not decoration.
4. Make cash, repair pressure, and upgrades central to the fantasy.
5. Build future route-specific events and endings on top of stable pilot/airframe architecture.

## Core Design Rules
1. Readability first.
2. Sector identity matters.
3. Destructible terrain is gameplay.
4. Cash drives progression.
5. Scripted pacing beats randomness.
6. Airframe choice should feel like pilot identity, not a cosmetic skin.

## Screen-By-Screen Recreation Targets

### 1. Opening Cinematic
Target:
- full-screen still panels
- deliberate pacing
- clear skip prompt
- no accidental instant-skip

Current state:
- implemented and usable

### 2. Main Menu
Target:
- keyboard-first navigation
- DOS-style menu feel rather than generic web list
- load-game panel should show pilot identity, airframe, and difficulty

Current state:
- structurally correct
- visual treatment still needs a stronger DOS pass

### 3. Pilot Creation and Airframe Assignment
Target:
- compact pilot entry
- airframe selection during pilot creation
- route/ending hooks attached to the chosen jet

Implementation rules:
- airframes are defined in data, not hard-coded in UI state
- each airframe owns hull, speed, starting gun, route seed, and ending key
- save data persists `shipId`, `primaryWeaponLevel`, `eventFlags`, `endingFlags`, and `missionResults`
- missing sprite sets must use fallback keys and tinting rather than blocking the feature

Current state:
- implemented structurally
- dedicated bespoke ship art still needed for non-default jets

### 4. Difficulty Selection
Target:
- four skill levels: `Training`, `Rookie`, `Veteran`, `Elite`
- persistent per-pilot difficulty
- real impact on enemy health, enemy fire cadence, and rewards

Current state:
- implemented and persisted
- reward/pressure tuning still needs balancing passes

### 5. Hangar Layout
Target:
- left-side launch area
- right-side shop area
- upper terminal save area
- smaller, less prominent menu exit
- pilot stats in a compact side panel

Current state:
- hotspot alignment implemented
- visual polish and stronger diegetic labeling still needed

### 6. Sector Briefing / Loading
Target:
- communicate mission identity before gameplay
- show mission title, sector, difficulty, airframe, and objectives
- feel like a DOS loading/briefing card

Current state:
- implemented structurally
- still needs more period-authentic presentation design

### 7. Gameplay Window and HUD
Target:
- clear combat window framing
- compact, readable instrumentation
- prioritize hull, cash, weapon state, and bombs during active play
- keep score internal until later summary/end screens to save UI space

Current state:
- compact cash-first HUD implemented
- final art direction still needs a dedicated pass

### 8. Landing / Debrief
Target:
- mission complete should feel like a landing/debrief stage, not a hard cut
- report should focus on payout, kills, and mission route
- route and ending hooks should be present for later story expansion

Current state:
- implemented structurally
- final cinematic polish still pending

## Environment, Terrain, and Scrolling Background
This remains one of the most important fidelity categories.

The original game did not feel like a single endlessly tiled background. It felt like a mission through real hostile territory with recognizable ground targets embedded into the terrain.

### Environment Fidelity Goal
The scrolling background must be broken into distinctive sections with matching destructible structures, hazards, and enemy behavior.

The environment should:
- establish location and mission fantasy
- telegraph what kinds of destructibles are present
- create cash opportunities beyond air kills
- vary color and terrain rhythm over the mission
- support wave choreography
- make the player read the ground, not just the airspace

### Required Environment Behaviors
1. Background scroll has distinct region changes.
2. Each region contains themed ground structures.
3. Ground structures award cash and internal score when destroyed.
4. High-value structures are visibly different from filler targets.
5. Ground structures are spatially tied to the art beneath them.
6. Bridges and similar structures feel like landmarks, not random props.
7. Water/coastal sections include destructibles that make sense there.
8. Terrain sections support mixed air/ground pressure.

### Level 1 Region Identity Target
Level 1 should read as:
1. Coastal military outskirts
2. Industrial shoreline
3. Bridge corridor set piece
4. Refinery or chemical inlet
5. Hardened military complex before boss

### Minimum Level 1 Destructible Families
- bunker
- radar dish
- fuel tank / depot
- warehouse / storage structure
- bridge segment or support target
- refinery / chemical tank
- dockside support structure
- anti-air platform or turret installation

Each family should eventually define:
- art identity
- health
- cash value
- internal score value
- explosion tier
- chain-reaction behavior
- landmark status
- terrain-region affinity

## Economy and Reward Targets
To feel like DOS Raptor, cash must matter every mission.

Required behaviors:
1. ground targets produce meaningful cash
2. high-value destructibles are worth detouring for
3. cash rewards reinforce map knowledge
4. score and money remain related internally even if only cash is shown live
5. later shop choices should be influenced by how thoroughly the player cleared a mission

Balancing rules:
- filler ground target: low cash, low internal score
- bunker / radar: medium cash, medium internal score
- fuel or chemical target: medium-to-high cash, strong explosion reward
- landmark target: high cash, high internal score, rare

## Asset and Reference Policy
This repo can use outside reference material for planning, but shipped runtime should avoid directly redistributing copyrighted screenshots unless you explicitly decide to do that later.

Current policy:
- outside screenshots are design references only
- repo spritework remains the shipped base
- reference-only salvage material stays in [salvage/zip-docs](/G:/My%20Drive/Manus%20Raptor/raptor_manusAI_v1/salvage/zip-docs)

## Implementation Roadmap

### Phase A: Flow and Playfield
- [done] intro skip behavior
- [done] hangar art-aligned hotspots
- [done] playfield-local enemy spawn math
- [done] modestly widened playfield

### Phase B: Campaign Framing
- [done] difficulty selection and persistence
- [done] sector briefing flow
- [done] landing/debrief flow
- [partial] HUD is more compact and DOS-leaning, but still needs final presentation polish
- [done] multi-airframe pilot architecture with route/ending scaffolding

### Phase C: Economy and Loadout
- [done] Harold''s Emporium loop exists with repairs, systems, secondaries, and consumables
- [done] primary/secondary ownership persists through shop and save data
- [partial] cash curves are better because of terrain targets, utility purchases, and difficulty scaling, but still need tuning
- [done] mission result summaries exist through landing/debrief
- [done] boss health indicator, targeting HUD, threat computer, hull/shield upgrades, and missile support are purchasable

### Phase D: Level 1 Combat Composition
- [done] Level 1 terrain sections and landmark-driven background variation exist
- [done] Level 1 wave choreography is now rebuilt around named regional beats and landmark timing
- [done] boss arrival, phased attacks, and telegraphed pacing are implemented for the Level 1 finale
- [partial] expand destructible target families with more bespoke art and behavior
- [partial] integrate region-specific enemy behavior more tightly with bespoke enemy art and audio

### Phase E: Presentation and Audio
- [partial] procedural fallback audio now covers menu/UI navigation, mission ambience, pickups, damage, explosions, and boss warning cues
- [done] explosion tiers and chain-reaction feedback are visually stronger and size-aware
- [partial] environment regions now have stronger distinct atmosphere and overlay language, but still need more bespoke art variation
- [partial] HUD, briefing, landing, hangar, and shop now share a stronger terminal-style visual language
- [next] replace the fallback sound bed with authored music and bespoke sampled weapon / UI effects when assets exist

### Phase F: Campaign Expansion
- [next] apply the same fidelity structure to Level 2 and later sectors
- [rule] do not expand campaign scope until Level 1 feels complete

## Detailed Checklist

### Menu / Flow
- [done] intro plays intentionally
- [done] skip input is controlled
- [done] difficulty selection exists
- [done] difficulty persists per pilot
- [done] sector briefing exists before launch
- [done] landing/debrief exists after mission
- [done] pilot creation includes airframe selection
- [next] main menu needs stronger DOS-authentic visual treatment

### Hangar / Shop
- [done] hangar hotspots align to background landmarks
- [done] hangar supports keyboard and mouse
- [partial] stats panel is compact and useful
- [partial] shop now has a stronger Harold''s Emporium structure, but still needs more visual polish
- [partial] Harold''s shop language is closer to in-universe, but can be pushed further
- [done] repairs, loadout, and airframe context are integrated into shop flow

### Gameplay / Weapons
- [done] primary weapon is always available
- [done] secondaries are unlocked instead of free by default
- [done] current secondary is visible in HUD
- [done] megabombs are limited and visible
- [done] pickup beats are intentional and terrain-aware
- [done] airframe choice changes starting gun and hull profile
- [next] alternate secondaries need a proper slot/toggle/loadout architecture for later expansion

### Waves / Bosses
- [done] enemy formations enter more cleanly than before
- [done] each Level 1 wave now has a named tactical identity tied to a terrain section
- [done] boss arrival is staged with a lead-in warning and longer pre-boss breather
- [done] boss attacks now use visible telegraphs and phased pacing
- [partial] combined air/ground pressure escalates more deliberately, but still needs bespoke target art and audio cues

### Environment / Terrain
- [done] scrolling background changes identity during the mission
- [partial] each region has distinct landmark structures
- [partial] destructible objects broadly match the visible terrain beneath them
- [done] water, shore, bridge, refinery, and military sections feel different
- [done] each region now has stronger atmospheric tinting and overlay language in motion
- [partial] the mission is less visually same-ey, but still needs more bespoke landmarks and tile variation

### Economy / Debrief
- [partial] ground destruction meaningfully affects cash
- [partial] high-value targets are somewhat recognizable but need stronger art separation
- [partial] chain-reaction targets exist in limited form
- [done] mission income now directly influences repair, system, and secondary decisions in the shop
- [implemented by design] active HUD is cash-first and score is hidden until later summary/end screens
- [done] debrief summarizes payout and mission results
- [done] final contract score is calculated from cash, kills, completion, and the end-of-run difficulty multiplier

### Presentation / Audio
- [done] HUD reads more like instrumentation than before
- [partial] fonts and layout now lean further into a period terminal look, but still need final polish and more bespoke art framing
- [done] explosions now scale by target class with stronger layered flash / shockwave feedback
- [partial] menu and mission audio now have procedural fallback ambience and SFX, but still need authored music and sampled effects
- [done] pickups and major UI interactions now have stronger feedback

### Airframes / Route Hooks
- [done] save data supports multiple jets
- [done] save data supports event and ending flags
- [done] airframes define opening stat differences
- [partial] route and ending hooks exist architecturally but not yet in authored content
- [next] dedicated sprite sets are needed for non-default jets

## Non-Goals For The Next Pass
- full 27-level campaign support
- exact asset-perfect recreation of every DOS screen
- shipping original copyrighted screenshots as runtime assets
- full story/event/ending content before the core campaign loop is stable

## Definition of Done For The Next Major Fidelity Pass
The next pass is successful when:
- the repo still plays through intro -> menu -> pilot -> difficulty -> hangar -> briefing -> mission -> landing -> hangar without regressions
- Harold's shop feels like part of the same world as the hangar and debrief screens
- Level 1 waves feel authored around landmarks instead of generic timing lanes
- airframe choice affects run feel in a way the player can notice immediately
- the cash economy creates meaningful between-mission decisions




