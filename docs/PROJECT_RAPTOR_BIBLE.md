# PROJECT RAPTOR BIBLE

## 1. High-Level Project Overview
- **Project Name:** Project Raptor
- **Concept:** A modern re-imagining of the classic 1994 DOS game *Raptor: Call of the Shadows*, built with a data-driven, modular JavaScript engine.
- **Current Goal:** Begin development of the "Raptor Forge" visual level editor while maintaining the stability of the core game engine.

## 2. Game Architecture
- **Technology Stack:** HTML5, CSS3, JavaScript (ES6 Modules), Web Audio API, Node.js, Git.
- **State Machine (`game.js`, `/states`):** Manages the overall game flow (Loading, Menu, Game, Hangar, Shop, etc.), ensuring clean setup (`enter`) and teardown (`exit`) of game states.
- **Data-Driven Design (`levelX.json`, `...Data.js`):** Level layouts, enemy waves, and object properties are defined in external .json files, allowing for rapid iteration without changing engine code. The format is specified in `TECHNICAL_REFERENCE.md`.
- **Behavior Library (`enemyBehaviors.js`):** A palette of reusable movement and firing pattern functions that can be assigned to any enemy via the level data, enabling complex and varied encounters.
- **Layered Canvas Rendering:** Utilizes multiple stacked `<canvas>` elements (background, environment, enemy, projectile, player, explosion, ui) to separate rendering concerns and improve performance.
- **Asynchronous Asset Loading:** A dedicated `LoadingState` and `AssetManager` handle the asynchronous loading of all game assets (images, audio, data) at startup.
- **Project Directory Structure:**
  ```
  raptor-game/
  ├── assets/         # Contains all game assets
  │   ├── data/         # JSON files for levels, etc.
  │   ├── images/       # All sprite and image files
  │   └── audio/        # Audio files are planned but not yet present
  ├── css/            # Contains all stylesheets
  │   └── style.css
  ├── docs/           # Project documentation
  ├── editor/         # Files for the level editor
  ├── js/             # All JavaScript source code
  │   ├── engine/       # Core systems (Game, AssetManager, Collision, etc.)
  │   ├── entities/     # Game objects (Player, Enemy, Projectile, etc.)
  │   ├── environment/  # Background and environment managers
  │   ├── states/       # All game states (Menu, Game, Shop, etc.)
  │   ├── ui/           # Heads-Up Display and other UI elements
  │   ├── utils/        # Utility functions
  │   └── main.js       # Main entry point for the application
  ├── tests/          # Jest test files
  ├── .gitignore      # Specifies files for Git to ignore
  ├── babel.config.cjs  # Babel configuration
  ├── index.html      # Main HTML file
  └── package.json    # Project dependencies and scripts
  ```

## 3. Visual Style Guide
- **Core Aesthetic:** Modern Retro - a modern interpretation of the 1994 classic with higher fidelity, cleaner lines, and modern effects. Gritty & Industrial military setting. High-contrast for readability.
- **Color Palette:**
    - **Core Aesthetic:** Modern Retro - a modern interpretation of the 1994 classic with higher fidelity, cleaner lines, and modern effects. Gritty & Industrial military setting. High-contrast for readability.
    - **Primary Colors:**
        - **Deep Space Blue**: `#0A1128` - For backgrounds and dark elements
        - **Military Green**: `#3E5622` - For ground-based enemies and terrain
        - **Steel Gray**: `#7D8491` - For metallic elements and UI frames
        - **Warning Red**: `#D62828` - For enemy highlights and warning indicators
        - **Energy Blue**: `#4CC9F0` - For player weapons and shields
    - **Secondary Colors:**
        - **Accent Orange**: `#F77F00` - For explosions and special effects
        - **Highlight Yellow**: `#FCBF49` - For collectibles and power-ups
        - **Tech Cyan**: `#06D6A0` - For special weapons and energy indicators
        - **Ground Brown**: `#774936` - For terrain and ground installations
        - **Water Teal**: `#118AB2` - For water areas
- **Typography:**
    - **UI Font**: "Exo 2" - A modern, slightly futuristic sans-serif font for menus and HUD
    - **Title Font**: "Orbitron" - Bold, tech-inspired font for game title and headings
    - **In-Game Text**: "Rajdhani" - Clean, readable font for in-game messages
- **Sprite & Asset Design:** Clean, defined look paying homage to the 16-bit era. Clear silhouettes. Simple, impactful animations. Consistent scale.
- **Environment Design:** Parallax scrolling for depth. Destructible elements. Distinct visual themes per level.
- **UI & HUD:** Minimalist, readable, clear feedback.
- **Reference & Inspiration:** *Raptor: Call of the Shadows*, *Ikaruga*, *Jamestown*, *Sky Force Reloaded*, *Advance Wars*, *Starcraft*.

## 4. Game Mechanics & Flow
- **Gameplay:** Vertical scrolling shoot '''em up. Player controls a fighter jet, battling enemies on ground, air, and sea. Levels end with a boss.
- **Difficulty Levels:** Rookie, Veteran, Elite.
- **Core Systems:**
    - **Money System:** Destroying enemies earns money for upgrades.
    - **Weapon System:** Players can collect and purchase different primary and special weapons.
    - **Collectibles:** Money, weapon bonuses, energy modules, megabombs.
- **Game Flow:**
  1. Main Menu → Select Difficulty
  2. Hangar (Interface) → Select New Mission
  3. Flight Computer → Select Mission (Wave)
  4. Play Mission
  5. After Mission → Supply Room (buy/sell weapons)
  6. Return to Hangar → Select next Mission

## 5. Controls
- **Keyboard/Mouse:** Arrow keys for movement, Ctrl to fire, Alt to cycle weapons, Space for megabomb.
- **Touch Controls:**
    - **Detection:** Automatically detects touch-capable devices.
    - **Movement:** Ship follows finger position with a vertical offset to prevent obstruction.
    - **Auto-Fire:** Weapons fire automatically while touching the screen.
    - **Boundary Clamping:** Ship stays within game boundaries.

## 6. AI Collaboration Framework (User Workflow)
This section outlines the workflow between the human "Director" (the user) and an AI "Architect" (Gemini).
- **The Golden Rule:** Trust, but verify. Every significant code change must be confirmed before testing.
- **The Workflow Loop:**
  1. **The Briefing:** The Director states a goal or reports a bug.
  2. **The Plan:** The Architect proposes a solution.
  3. **The Prompt:** The Architect provides a comprehensive, copy-paste-ready prompt for the chosen AI tool.
  4. **The Execution:** The Director gives the prompt to the AI tool.
  5. **THE VERIFICATION (CRITICAL STEP):** The Director pastes the entire contents of the changed file(s) back to the Architect.
  6. **The Review:** The Architect performs a quick code review to confirm the changes.
  7. **The Test:** Once confirmed, the Director tests the game.
- **Tiers of Execution:**
  - **Tier 1: Manual Edit (The Scalpel):** For small, single-file changes.
  - **Tier 2: Cursor AI (The Power Move):** For medium-to-large, well-defined tasks.
  - **Tier 3: ManusAI (The Architect'''s Gambit):** For massive, creative tasks.
