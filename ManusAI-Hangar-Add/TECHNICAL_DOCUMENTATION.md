# Raptor: Call of the Shadows Reimagined - Technical Documentation

## Architecture Overview

This game is built using HTML5 Canvas and JavaScript with a modular architecture designed for maintainability and extensibility.

### Core Components

#### Game Engine (`js/engine/`)

- **game.js**: Main game class that handles the game loop, state management, and rendering
- **input.js**: Input handler for keyboard controls
- **assets.js**: Asset manager for loading and managing images and data
- **audio.js**: Audio manager for sound effects and music (gracefully handles missing audio files)
- **collision.js**: Collision detection system using bounding box collision
- **entity.js**: Base entity class and entity manager

#### Game Entities (`js/entities/`)

- **player.js**: Player ship with movement, shooting, and health management
- **enemy.js**: Base enemy class with AI behaviors
- **enemyFactory.js**: Factory for creating different enemy types
- **projectile.js**: Bullet and missile projectiles
- **homingProjectile.js**: Special homing missiles for boss attacks
- **collectible.js**: Power-ups and collectible items
- **explosion.js**: Explosion effects and animations
- **environment.js**: Background and scrolling environment elements

#### Game States (`js/states/`)

- **boot.js**: Initial boot state
- **loading.js**: Asset loading state with progress bar
- **menu.js**: Main menu state
- **game.js**: Main gameplay state
- **pause.js**: Pause state
- **gameover.js**: Game over state
- **hangar.js**: Ship upgrade state (placeholder)
- **supply.js**: Weapon purchase state (placeholder)

#### User Interface (`js/ui/`)

- **hud.js**: Heads-up display for health, score, and weapons
- **menu.js**: Menu interface components

#### Levels (`js/levels/`)

- **level1.js**: First level implementation with enemy spawn patterns
- **level2.js**: Second level with advanced enemies and patterns

### Asset Structure

```
assets/
├── images/
│   ├── player/          # Player ship sprites
│   ├── enemies/         # Enemy sprites
│   ├── projectiles/     # Bullet and missile sprites
│   ├── explosions/      # Explosion animation frames
│   ├── collectibles/    # Power-up sprites
│   ├── environment/     # Background images
│   └── ui/              # User interface elements
├── data/
│   ├── level1.json      # Level 1 configuration
│   └── level2.json      # Level 2 configuration
└── audio/               # Audio files (optional)
```

### Game Loop

The game uses a fixed timestep game loop running at 60 FPS:

1. **Input Processing**: Handle keyboard input
2. **Update**: Update all game entities and systems
3. **Collision Detection**: Check for collisions between entities
4. **Rendering**: Draw all entities to their respective canvas layers

### Canvas Layers

The game uses multiple canvas layers for efficient rendering:

- **background-layer**: Scrolling background
- **enemy-layer**: Enemy entities
- **player-layer**: Player ship
- **projectile-layer**: Bullets and missiles
- **explosion-layer**: Explosion effects
- **ui-layer**: User interface elements

### Entity Component System

Entities use a simple component-based architecture:

- **Position**: x, y coordinates
- **Velocity**: movement speed and direction
- **Health**: hit points and damage handling
- **Sprite**: visual representation
- **Collision**: bounding box for collision detection

### Level Design

Levels are defined using JSON configuration files that specify:

- Enemy spawn patterns with timing and positions
- Wave progression and difficulty scaling
- Boss encounters and special events
- Collectible placement

### Performance Optimizations

- Object pooling for frequently created/destroyed entities
- Efficient collision detection using spatial partitioning
- Canvas layer separation to minimize redraw operations
- Asset preloading to prevent runtime delays

### Browser Compatibility

The game is designed to work on modern browsers that support:

- HTML5 Canvas
- ES6 JavaScript features
- Web Audio API (optional)

### Extending the Game

To add new features:

1. **New Enemy Types**: Extend the Enemy class and add to EnemyFactory
2. **New Weapons**: Add weapon types to the Player class
3. **New Levels**: Create new level classes following the existing pattern
4. **New Power-ups**: Extend the Collectible class

### Known Limitations

- Audio system is optional and gracefully handles missing files
- No save/load functionality
- Limited to two levels as per original requirements
- No multiplayer support

This architecture provides a solid foundation for a complete vertical scrolling shooter while maintaining clean, readable code.

