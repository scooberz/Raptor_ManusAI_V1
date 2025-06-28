# Project Raptor: Master Project Briefing & AI Collaboration Framework
**Version:** 4.0
**Last Updated:** 2025-06-27

## 1. High-Level Project Overview
- **Project Name:** Project Raptor
- **Concept:** A modern re-imagining of the classic 1994 DOS game *Raptor: Call of the Shadows*, built with a data-driven, modular JavaScript engine.
- **Current Goal:** Begin development of the "Raptor Forge" visual level editor while maintaining the stability of the core game engine.

## 2. Core Architecture Principles
The project's architecture is built on professional, data-driven design patterns that separate game content from engine logic.

- **State Machine (`game.js`, `/states`):** Manages the overall game flow, ensuring clean separation between states like the menu, hangar, gameplay, and the future level editor.

- **Data-Driven Design (`levelX.json`, `...Data.js`):** Level layouts, enemy waves, and object properties are defined in external .json files, allowing for rapid iteration and creative freedom without changing engine code.

- **Behavior Library (`enemyBehaviors.js`):** A palette of reusable movement and firing pattern functions that can be assigned to any enemy via the level data, enabling complex and varied encounters.

## 3. Our Collaboration Model: "The Verified Change Protocol"
Our workflow is a partnership between a human "Director" and an AI "Architect." To ensure accuracy and prevent frustrating bugs, we adhere to a strict "Verified Change Protocol."

Our Golden Rule: Trust, but verify. Every significant code change must be confirmed before testing.

The Workflow Loop:
1. **The Briefing:** The Director states a goal or reports a bug.
2. **The Plan:** The Architect proposes a solution and provides a "Tier of Execution."
3. **The Prompt:** The Architect provides a comprehensive, copy-paste-ready prompt for the chosen AI tool (e.g., Cursor).
4. **The Execution:** The Director gives the prompt to the AI tool, which modifies the project files.
5. **THE VERIFICATION (CRITICAL STEP):** Immediately after the AI finishes, the Director pastes the entire contents of the changed file(s) back to the Architect.
6. **The Review:** The Architect performs a quick code review to confirm the changes were applied completely and correctly.
7. **The Test:** Once the Architect gives the "all clear," the Director tests the game, confident that the intended code is running.

## 4. The Tiers of Execution
- **Tier 1: Manual Edit (The Scalpel):** For small, single-file, or single-line changes.
- **Tier 2: Cursor AI (The Power Move):** Our workhorse for medium-to-large, well-defined tasks.
- **Tier 3: ManusAI (The Architect's Gambit):** For massive, independent, creative tasks, such as generating the first draft of the "Raptor Forge" Level Editor.

## Final Boss AI Overhaul (2024-06)
- Boss now uses a `boss_patrol` movement pattern: enters, then patrols between three upper-screen waypoints, pausing initial descent at y=80.
- Firing pattern is `boss_multi_weapon_fire`: rapid straight missiles, burst-aimed shots (3-shot burst after a pause), periodic reposition pauses, and a desperation ring attack at 25% health.
- All boss fire rates are 3x faster than before.
- Projectiles use asset keys: `enemyMissile` (ENEMY_MISSILE.png) and `enemyBullet` (orange ball).
- See `asset_inventory.md` for pattern and asset details.

Please create this master briefing document in the docs/ folder. 