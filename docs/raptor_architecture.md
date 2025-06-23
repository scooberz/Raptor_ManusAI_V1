# Raptor: Call of the Shadows Reimagining - Game Architecture

## Technology Stack

For our reimagining of Raptor: Call of the Shadows, we use:

### Core Technologies
- **HTML5**: Game structure
- **CSS3**: Styling and effects
- **JavaScript (ES6+)**: Game logic and interactivity

### Game Development Framework
- **HTML5 Canvas API**: Rendering
- **No external game engines**: Lightweight, runs well on low-spec hardware

### Audio
- **Web Audio API**: Sound effects and music

### Development Tools
- **Git**: Version control
- **npm**: Package management
- **ESLint**: Code quality

### Deployment
- **GitHub Pages**: Hosting (if needed)

## Core Architecture

### Modular, Data-Driven Design
- **Entity-Component System (ECS)**: All game objects (player, enemies, projectiles, etc.) are entities with modular components for behavior, rendering, and state.
- **Behavior Library**: All enemy movement and firing patterns are reusable, composable functions (see `enemyBehaviors.js`). These are assigned via level JSON data, making enemy design highly flexible and data-driven.
- **Level & Enemy Data in JSON**: Levels, enemy waves, and behaviors are defined in external JSON files. This enables rapid iteration, easy expansion, and future support for a visual level editor.
- **State Machine**: Clean separation of game states (boot, menu, hangar, gameplay, pause, game over, etc.) for maintainability and scalability.
- **Asset & Audio Management**: Centralized asset loader and a planned robust AudioManager for sound/music with volume controls.
- **Tilemap & Environment System (Planned)**: Future levels will use a tilemap-based system for more complex, interactive environments.

### Example: Data-Driven Enemy
```json
{
  "type": "striker",
  "movementPattern": "move_to_point_and_hold",
  "firingPattern": "single_aimed_shot",
  "spawn": { "x": 100, "y": -50 },
  "overrides": { "hold_duration_ms": 3000 }
}
```

### Layered Rendering
- Multiple canvas layers for backgrounds, entities, projectiles, UI, etc. for performance and visual clarity.

### Save System
- LocalStorage-based save manager for progress, settings, and high scores.

## Development Roadmap

1. **Setup Project Structure** *(Complete)*
2. **Implement Core Engine** *(Complete)*
3. **Create Entity System** *(Complete)*
4. **Implement Game States** *(Complete)*
5. **Develop Level 1** *(Complete)*
6. **Develop Level 2** *(Complete)*
7. **Polish and Optimize** *(In Progress)*
8. **Testing and Deployment** *(In Progress)*
9. **Future Architectural Goals & Features**
   - Refactor to a Generic, Reusable Level Class
   - Implement a Robust AudioManager with volume controls
   - Implement a full Tilemap-based Environment System
   - Design and build the Hangar/Shop System
   - Design and build the Data-Pad Level Editor
   - Design and build a Power-up/Collectibles System

## Summary

The project is now a modular, data-driven shooter with a flexible behavior library, JSON-based level/enemy design, and a clear roadmap for future extensibility and tooling.

