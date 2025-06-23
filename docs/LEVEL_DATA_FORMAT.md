# Level Data Format Documentation (v2.0)

## Overview
This document describes the data-driven format for level files (e.g., `level1.json`) in Project Raptor. This structure allows for maximum creative flexibility in level design without needing to change game engine code.

## Root Object Structure
Each level file is a single JSON object with the following top-level properties.
```json
{
  "levelName": "Bravo Sector - The Gauntlet",
  "waves": [ ... ]
}
```
- `levelName`: (String) The name of the level, displayed for debugging.
- `waves`: (Array) An array of Wave Objects that defines the entire sequence of the level.

## Wave Object Structure
Each object in the waves array defines a single wave of enemies and environment objects.

```json
{
    "wave_id": "wave_01_scouts",
    "delay_after_previous_wave_ms": 3000,
    "enemies": [ ... ],
    "environment_objects": [ ... ]
}
```
- `wave_id`: (String) A unique descriptive name for the wave.
- `delay_after_previous_wave_ms`: (Number) The time in milliseconds to wait after the previous wave is fully cleared before this wave begins. This is the primary tool for controlling level pacing.
- `enemies`: (Array) An array of Enemy Objects to spawn during this wave.
- `environment_objects`: (Optional Array) An array of Environment Objects to spawn at the start of this wave.

## Enemy Object Structure
Each object in an enemies array defines a single enemy to be spawned.

```json
{
    "type": "striker",
    "spawn_x": 300,
    "spawn_y": -50,
    "delay": 1000,
    "overrides": {
        "movementPattern": "move_to_point_and_hold",
        "formation_point": { "x": 300, "y": 200 },
        "hold_duration_ms": 4000,
        "firingPattern": "single_aimed_shot",
        "speed": 150,
        "health": 75
    }
}
```
- `type`: (String) The enemy type ID. Must match a case in the EnemyFactory.
- `spawn_x`, `spawn_y`: (Number) The coordinates where the enemy first appears. `spawn_y` should be negative to appear off-screen.
- `delay`: (Number) How many milliseconds to wait after the wave begins before this specific enemy appears.
- `overrides`: (Optional Object) This is the creative control panel. Any property here will override the default behavior for this specific enemy instance.

### Available Overrides
- `movementPattern` (String): The key for the desired movement function from enemyBehaviors.js.
- `firingPattern` (String): The key for the desired firing function from enemyBehaviors.js.
- `speed` (Number): Base speed for movement patterns.
- `health` (Number): Overrides default health.
- `fireRate` (Number): Time in ms between shots/volleys for firing patterns.
- **Custom Pattern Parameters:** Some movement patterns require their own special parameters:
    - `formation_point`: An object `{ "x": number, "y": number }` used by move_to_point_and_hold.
    - `hold_duration_ms`: (Number) Time in ms used by move_to_point_and_hold.
    - `trigger_y`: (Number) The Y-coordinate that triggers the next phase of a pattern like descend_and_strafe.
    - `split_direction`: (Number, 1 for right or -1 for left) Used by split_and_descend.
    - `target_x`: (Number) The target X-coordinate used by strafe_to_x_position.

## Environment Object Structure
Each object in an environment_objects array defines a single static, destructible object.

```json
{
    "type": "FUEL_TANK",
    "spawn_x": 150,
    "spawn_y": 400,
    "delay": 0
}
```
- `type`: (String) The object type ID. Must match a case in the EnemyFactory (e.g., 'FUEL_TANK', 'BUNKER').
- `spawn_x`, `spawn_y`: (Number) The coordinates where the object is placed. `spawn_y` should be a positive number on the screen.
- `delay`: (Number) How many milliseconds to wait after the wave begins before this object appears.

## Environment Object Types

### Available Types
- **FUEL_TANK**: Volatile fuel storage (48x48, 25 HP, large explosion)
- **RADAR_DISH**: Communications array (64x64, 75 HP, medium explosion)
- **BUNKER**: Concrete fortification (80x60, 150 HP, large explosion)
- **SILO**: Missile launch facility (56x72, 100 HP, large explosion)
- **TURRET_BASE**: Anti-aircraft turret (40x40, 60 HP, medium explosion)
- **POWER_STATION**: Power generator (72x48, 80 HP, large explosion)
- **WAREHOUSE**: Supply storage (96x64, 120 HP, medium explosion)
- **COMM_TOWER**: Communication antenna (32x80, 40 HP, small explosion)
- **HANGAR**: Aircraft storage (120x80, 200 HP, large explosion)
- **SMALL_BUILDING**: Basic structure (40x32, 30 HP, small explosion)

### Properties
Each environment object type has:
- **Health**: How much damage it can take before being destroyed
- **Score Value**: Points awarded when destroyed
- **Explosion Size**: Visual effect size (small/medium/large)
- **Dimensions**: Width and height in pixels

## Positioning Guidelines

### Coordinate System
- **X**: Horizontal position (0 = left edge, 800 = right edge)
- **Y**: Vertical position (0 = top of screen, positive = down)
- Environment objects are typically placed at Y > 150 to be on the ground

### Placement Tips
1. **Spacing**: Leave enough space between objects for player movement
2. **Strategic Placement**: Place high-value targets in challenging positions
3. **Visual Balance**: Distribute objects across the level for visual appeal
4. **Gameplay Flow**: Consider how objects affect player movement and strategy

## Example Wave with Environment Objects

```json
{
  "id": 2,
  "name": "Industrial Complex",
  "duration": 15000,
  "enemies": [
    { "type": "fighter", "x": 300, "y": -50, "delay": 1000 },
    { "type": "turret", "x": 600, "y": -50, "delay": 2000 }
  ],
  "environment_objects": [
    { "type": "FUEL_TANK", "x": 150, "y": 200 },
    { "type": "RADAR_DISH", "x": 400, "y": 250 },
    { "type": "BUNKER", "x": 650, "y": 180 },
    { "type": "POWER_STATION", "x": 300, "y": 300 }
  ]
}
```

## Implementation Notes

### Loading
Environment objects are loaded when a wave starts and placed on the environment canvas layer.

### Collision
- Player projectiles can damage and destroy environment objects
- Environment objects are static and don't move
- Destroyed objects create explosions and award score points

### Performance
- Environment objects are rendered on a separate canvas layer
- Objects are automatically cleaned up when destroyed
- No limit on number of objects per wave (within reason)

## Best Practices

1. **Start Simple**: Begin with a few small objects and gradually increase complexity
2. **Test Balance**: Ensure objects don't make levels too easy or too difficult
3. **Visual Variety**: Use different object types to create interesting landscapes
4. **Strategic Depth**: Place valuable targets in positions that require skill to reach
5. **Chain Reactions**: Group explosive objects for dramatic chain reaction effects

