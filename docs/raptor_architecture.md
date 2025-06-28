# Raptor Reimagined: Game Architecture

## 1. Technology Stack
- **Core:** HTML5, CSS3, JavaScript (ES6 Modules)
- **Rendering:** HTML5 Canvas API (2D Context)
- **Audio:** Web Audio API
- **Development Tools:** Node.js, Git

## 2. Core Architectural Pillars

### State Machine
The game's flow is managed by a robust state machine in `js/engine/game.js`. This separates all major sections of the game (e.g., LoadingState, MenuState, GameState, HangarState, ShopState) into distinct, manageable classes. This allows for clean setup (`enter` method) and teardown (`exit` method) of game states.

### Data-Driven Design
A core principle of this project is the separation of data from logic. Game content, such as level design and enemy properties, is defined in external `.json` files (e.g., `level1.json`). This allows for rapid iteration and balancing without changing the engine's code. The format is specified in `LEVEL_DATA_FORMAT.md`.

### Behavior Library
All enemy movement and firing patterns are defined as reusable functions in a "Behavior Library" (`js/entities/enemyBehaviors.js`). The level data simply references the names of these behaviors, allowing designers to create complex enemy encounters by mixing and matching pre-defined patterns.

### Layered Canvas Rendering
The game utilizes multiple stacked `<canvas>` elements to separate rendering concerns and improve performance. This allows static backgrounds to be drawn separately from dynamic entities like the player, enemies, and projectiles. The primary layers are: background, environment, enemy, projectile, player, explosion, and ui.

### Asynchronous Asset Loading
All game assets (images, audio, data) are loaded once at startup by a dedicated LoadingState. The AssetManager handles the asynchronous loading of these assets, ensuring that the game only proceeds once all necessary content is in memory.

## 3. Project Directory Structure

```
raptor-game/
├── assets/
│   ├── data/         # JSON files for levels, etc.
│   ├── images/
│   ├── audio/
├── docs/             # All markdown documentation
├── js/
│   ├── engine/       # Core systems (Game, AssetManager, Collision, etc.)
│   ├── entities/     # Game objects (Player, Enemy, Projectile, etc.)
│   ├── environment/  # Background and environment managers
│   ├── states/       # All game states (Menu, Game, Shop, etc.)
│   ├── ui/           # Heads-Up Display and other UI elements
│   └── main.js       # Main entry point for the application
├── index.html
├── style.css
```

## 4. Future Architectural Goals

- **Raptor Forge:** A visual, in-game level editor built as a new game state.
- **Tilemap System:** A more advanced system for creating complex, destructible background environments.
- **Hangar & Shop:** A persistent system for the player to buy and sell weapon upgrades and items between missions, using the `SaveManager`.

