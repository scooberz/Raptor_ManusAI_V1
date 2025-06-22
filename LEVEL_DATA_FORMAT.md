# Level Data Format Documentation

## Overview
This document describes the level data format for Project Raptor, including the new destructible environment objects system.

## Level Data Structure

### Basic Level Properties
```json
{
  "level": 1,
  "name": "Level Display Name",
  "background": "backgroundAssetName",
  "music": "musicAssetName",
  "waves": [...],
  "collectibles": [...]
}
```

### Wave Structure
Each wave can contain enemies and environment objects:

```json
{
  "id": 1,
  "name": "Wave Display Name",
  "duration": 10000,
  "enemies": [...],
  "environment_objects": [...]
}
```

### Enemy Objects
```json
{
  "type": "fighter",
  "x": 100,
  "y": -50,
  "delay": 0
}
```

### Environment Objects (NEW)
```json
{
  "type": "FUEL_TANK",
  "x": 150,
  "y": 200
}
```

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

