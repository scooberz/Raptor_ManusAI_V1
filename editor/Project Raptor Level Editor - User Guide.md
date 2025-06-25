# Project Raptor Level Editor - User Guide

## Overview

The Project Raptor Level Editor is a web-based, "Data-Pad" style tool that allows you to visually design levels by adding waves, enemies, and environment objects. The editor generates properly formatted JSON data that can be saved as level files (e.g., `level2.json`) and used directly by the game engine.

## Features

### Data-Driven Design
- Automatically reads enemy behavior patterns from the game's data files
- Smart dropdowns that update when new behaviors are added to the game
- Real-time JSON generation with proper formatting

### User-Friendly Interface
- Clean, form-based interface with retro terminal styling
- No complex drag-and-drop required
- Intuitive workflow for level creation

### Self-Contained
- Single HTML file contains all necessary code
- No external dependencies required
- Works in any modern web browser

## Getting Started

1. Open `editor.html` in your web browser
2. Enter a name for your level in the "Level Name" field
3. Click "Add New Wave" to create your first wave
4. Configure wave properties and add enemies/environment objects
5. Copy the generated JSON from the output panel

## Interface Layout

The editor is divided into two main panels:

### Left Panel - Level Configuration
- **Level Information**: Set the level name
- **Wave Configuration**: Manage waves, enemies, and environment objects

### Right Panel - JSON Output
- **Generated Level JSON**: Real-time display of the complete level data
- Properly formatted with 4-space indentation
- Ready to copy and save as a `.json` file

## Wave Configuration

### Creating Waves
1. Click "Add New Wave" to create a new wave
2. Set the Wave ID (descriptive name for the wave)
3. Set the delay after the previous wave in milliseconds

### Wave Properties
- **Wave ID**: Unique identifier for the wave (e.g., "wave_01_scouts")
- **Delay After Previous Wave**: Time in milliseconds to wait after the previous wave is cleared

## Enemy Configuration

### Adding Enemies
1. Click "Add Enemy" within a wave section
2. Configure the enemy properties
3. Set behavior overrides as needed

### Enemy Properties
- **Type**: Select from available enemy types (cutter, cyclone, dart, gnat, goliath, mine, reaper, striker, boss_level1)
- **Spawn X/Y**: Coordinates where the enemy appears (Y should be negative for off-screen spawning)
- **Delay**: Time in milliseconds to wait after the wave begins before spawning this enemy

### Behavior Overrides

#### Basic Overrides
- **Movement Pattern**: Choose from available movement patterns
- **Firing Pattern**: Choose from available firing patterns
- **Speed**: Override the enemy's default speed
- **Health**: Override the enemy's default health
- **Fire Rate**: Override the enemy's default firing rate (in milliseconds)

#### Dynamic Pattern Parameters
When you select specific movement or firing patterns, additional parameter fields will appear:

**Move to Point and Hold**:
- Formation Point X/Y: Target coordinates for the enemy to move to
- Hold Duration: Time in milliseconds to hold position

**Descend and Strafe Patterns**:
- Trigger Y: Y-coordinate that triggers the strafe behavior

**Split and Descend**:
- Split Direction: 1 for right, -1 for left
- Split Y: Y-coordinate that triggers the split

**Strafe to X Position**:
- Target X: Target X-coordinate to strafe to
- Strafe Speed: Speed of horizontal movement

**Slow Homing**:
- Turn Speed: Rate of turning toward the player

**Zigzag**:
- Horizontal Speed: Speed of horizontal oscillation

**Boss Multi-Weapon Fire**:
- Cannon Fire Rate: Time between cannon shots
- Missile Fire Rate: Time between missile volleys

## Environment Objects

### Adding Environment Objects
1. Click "Add Environment Object" within a wave section
2. Select the object type
3. Set spawn coordinates and delay

### Environment Object Types
- **FUEL_TANK**: Volatile fuel storage (48x48, 25 HP)
- **RADAR_DISH**: Communications array (64x64, 75 HP)
- **BUNKER**: Concrete fortification (80x60, 150 HP)
- **SILO**: Missile launch facility (56x72, 100 HP)
- **TURRET_BASE**: Anti-aircraft turret (40x40, 60 HP)
- **POWER_STATION**: Power generator (72x48, 80 HP)
- **WAREHOUSE**: Supply storage (96x64, 120 HP)
- **COMM_TOWER**: Communication antenna (32x80, 40 HP)
- **HANGAR**: Aircraft storage (120x80, 200 HP)
- **SMALL_BUILDING**: Basic structure (40x32, 30 HP)

### Environment Object Properties
- **Type**: Select from available environment object types
- **Spawn X/Y**: Coordinates where the object is placed (Y should be positive for on-screen placement)
- **Delay**: Time in milliseconds to wait after the wave begins before spawning this object

## JSON Output

The editor generates JSON that follows the exact format specified in `LEVEL_DATA_FORMAT.md`:

```json
{
    "levelName": "Your Level Name",
    "waves": [
        {
            "wave_id": "wave_01",
            "delay_after_previous_wave_ms": 3000,
            "enemies": [
                {
                    "type": "striker",
                    "spawn_x": 300,
                    "spawn_y": -50,
                    "delay": 1000,
                    "overrides": {
                        "movementPattern": "move_to_point_and_hold",
                        "formation_point": { "x": 400, "y": 150 },
                        "hold_duration_ms": 4000
                    }
                }
            ],
            "environment_objects": [
                {
                    "type": "FUEL_TANK",
                    "spawn_x": 150,
                    "spawn_y": 400,
                    "delay": 0
                }
            ]
        }
    ]
}
```

## Best Practices

### Level Design Tips
1. **Start Simple**: Begin with basic enemy types and movement patterns
2. **Test Incrementally**: Create small waves and test them before building complex sequences
3. **Use Delays Effectively**: Stagger enemy spawns to create interesting patterns
4. **Balance Difficulty**: Mix different enemy types and behaviors for varied gameplay

### Coordinate Guidelines
- **Screen Width**: 0-800 pixels (game canvas width)
- **Enemy Spawn Y**: Use negative values (-50 to -100) for off-screen spawning
- **Environment Object Y**: Use positive values (150-500) for on-screen placement
- **Formation Points**: Keep within screen bounds for movement patterns

### Performance Considerations
- Avoid spawning too many enemies simultaneously
- Use appropriate delays between waves to prevent overwhelming the player
- Consider the total number of entities active at once

## Troubleshooting

### Common Issues
- **Empty JSON**: Make sure you've added at least one wave
- **Missing Overrides**: Dynamic override fields only appear when specific patterns are selected
- **Invalid Coordinates**: Ensure spawn coordinates are within reasonable ranges

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript must be enabled
- No internet connection required

## Technical Details

### File Structure
The editor is contained in a single `editor.html` file that includes:
- HTML structure for the user interface
- CSS styling for the retro terminal appearance
- JavaScript for all functionality and data management

### Data Management
- Level data is stored in memory as a JavaScript object
- Real-time updates trigger JSON regeneration
- Empty override objects are automatically cleaned up

### Extensibility
The editor is designed to be easily extensible:
- New enemy types can be added to the `enemyTypes` array
- New environment objects can be added to the `environmentObjectTypes` array
- New behavior patterns are automatically detected from `enemyBehaviors.js`

## Support

For technical issues or feature requests, refer to the project documentation or contact the development team.

