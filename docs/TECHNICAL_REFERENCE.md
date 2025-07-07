# TECHNICAL REFERENCE

## 1. Level Data Format (v2.0)

### Overview
This document describes the data-driven format for level files (e.g., `level1.json`). This structure allows for maximum creative flexibility in level design without needing to change game engine code.

### Root Object Structure
Each level file is a single JSON object with the following top-level properties.
```json
{
  "levelName": "Bravo Sector - The Gauntlet",
  "waves": [ ... ]
}
```
- `levelName`: (String) The name of the level, displayed for debugging.
- `waves`: (Array) An array of Wave Objects that defines the entire sequence of the level.

### Wave Object Structure
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

### Enemy Object Structure
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

#### Available Overrides
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

### Environment Object Structure
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

### Positioning Guidelines

#### Coordinate System
- **X**: Horizontal position (0 = left edge, 800 = right edge)
- **Y**: Vertical position (0 = top of screen, positive = down)
- Environment objects are typically placed at Y > 150 to be on the ground

#### Placement Tips
1. **Spacing**: Leave enough space between objects for player movement
2. **Strategic Placement**: Place high-value targets in challenging positions
3. **Visual Balance**: Distribute objects across the level for visual appeal
4. **Gameplay Flow**: Consider how objects affect player movement and strategy

### Example Wave with Environment Objects

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

### Implementation Notes

#### Loading
Environment objects are loaded when a wave starts and placed on the environment canvas layer.

#### Collision
- Player projectiles can damage and destroy environment objects
- Environment objects are static and don't move
- Destroyed objects create explosions and award score points

#### Performance
- Environment objects are rendered on a separate canvas layer
- Objects are automatically cleaned up when destroyed
- No limit on number of objects per wave (within reason)

### Best Practices

1. **Start Simple**: Begin with a few small objects and gradually increase complexity
2. **Test Balance**: Ensure objects don't make levels too easy or too difficult
3. **Visual Variety**: Use different object types to create interesting landscapes
4. **Strategic Depth**: Place valuable targets in positions that require skill to reach
5. **Chain Reactions**: Group explosive objects for dramatic chain reaction effects

### Boss Behavior Example
To assign advanced boss behaviors in a level JSON wave:

```
{
  "type": "boss1",
  "spawn_x": 272,
  "spawn_y": -150,
  "delay": 2000,
  "overrides": {
    "health": 2500,
    "speed": 90,
    "movementPattern": "boss_patrol",
    "firingPattern": "boss_multi_weapon_fire",
    "straightFireRate": 2000,
    "aimedFireRate": 3200
  }
}
```

- `movementPattern`: Use `boss_patrol` for dynamic waypoint patrol.
- `firingPattern`: Use `boss_multi_weapon_fire` for rapid missiles, burst-aimed shots, reposition pauses, and desperation attack.
- `straightFireRate`, `aimedFireRate`: Control the base fire rates (actual rates are 3x faster in this pattern).

## 2. Asset & Behavior Inventory

### Image Assets
- **Player:** `/assets/images/player/player_ship_base.png`, `/assets/images/player/player_ship_thrust.png`
- **Enemies:** `/assets/images/enemies/enemy_fighter.png`, `/assets/images/enemies/enemy_turret.png`, `/assets/images/enemies/boss_level1.png`
- **Projectiles:** `/assets/images/projectiles/player_bullet.png`, `/assets/images/projectiles/enemy_bullet.png`
- **Explosions:** `/assets/images/explosions/explosion_1.png`, `/assets/images/explosions/explosion_2.png`
- **Collectibles:** `/assets/images/collectibles/health_pickup.png`, `/assets/images/collectibles/shield_pickup.png`, `/assets/images/collectibles/megabomb_pickup.png`
- **Environment:** `/assets/images/environment/background_level1.png`, `/assets/images/environment/background_level2.png`
- **UI:** `/assets/images/ui/health_bar.png`, `/assets/images/ui/shield_bar.png`, `/assets/images/ui/game_logo.png`

### Audio Assets
- **Sound Effects:** `player_shoot.mp3`, `enemy_shoot.mp3`, `explosion.mp3`, `player_damage.mp3`, `pickup.mp3`, `megabomb.mp3`
- **Music:** `menu_music.mp3`, `game_music_1.mp3`, `game_music_2.mp3`

### Behavior Library (`enemyBehaviors.js`)

#### Movement Patterns
| Pattern Name | Description |
| :--- | :--- |
| `default` | Enemy moves straight down at its base velocity. |
| `sine_wave_slow` | Enemy moves in a slow sine wave. |
| `sine_wave_fast` | Enemy moves in a fast sine wave. |
| `swoop_from_left` / `swoop_from_right` | Enters from the side and arcs towards the center. Used by Darts. |
| `move_straight_down` | Moves straight down using base velocity. |
| `move_to_point_and_hold` | Flies to a specific point, holds for a duration, then descends. Used by Formation Strikers. |
| `sweep` | Sweeps side-to-side as it descends. |
| `patrol_and_strafe` | Flies to a patrol altitude, moves side-to-side, then retreats. Used by Cyclones. |
| `strafe_and_descend` | Descends, strafes horizontally, then continues down. |
| `descend_and_converge` | Flies down, then angles towards the center of the screen. |
| `descend_and_veer` | Flies down, then veers towards the center. |
| `descend_and_strafe_right` / `descend_and_strafe_left` | Flies down, then strafes hard right or left. |
| `move_diagonal` | Flies in a constant diagonal line. |
| `slow_homing` | Slowly drifts and steers towards the player. Used by Mines. |
| `zigzag` | Moves back and forth horizontally while descending. |
| `strafe_to_x_position` | Descends while strafing to a target X, then continues down. |
| `strafe_out_and_in` | Strafes out to the edge, back to center, then descends. |
| `split_and_descend` | Descends, then splits off to the side. Used by V-formation followers. |
| `descend_and_diverge` | Flies down, then angles away from the center of the screen. |
| `criss_cross` | Flies in a straight diagonal line, intended for coordinated group attacks. |
| `boss_patrol` | Boss enters, then patrols between three upper-screen waypoints, pausing initial descent at y=80. |

#### Firing Patterns
| Pattern Name | Description |
| :--- | :--- |
| `none` | The enemy does not fire. |
| `single_aimed_shot` | Aims and fires a single projectile at the player'''s current location. |
| `single_straight_shot` | Fires a single, un-aimed projectile straight down. |
| `three_round_spread` | Fires a 3-shot fan of projectiles. |
| `fire_straight_missile` | Fires a powerful, non-homing missile straight ahead. |
| `burst_fire` | Fires a quick volley of 3 aimed shots. Used by Cutters. |
| `wide_v_shot` | Fires two projectiles in a wide V-pattern. Used by Goliaths. |
| `boss_multi_weapon_fire` | The boss'''s advanced pattern: rapid straight missiles, burst-aimed shots (3-shot burst after a pause), periodic reposition pauses, and a desperation ring attack at 25% health. Fire rates are 3x faster than normal. |

#### Projectile Asset Keys
- `enemyMissile`: Uses `ENEMY_MISSILE.png` (for boss and advanced enemy missiles)
- `enemyBullet`: Uses `enemy_bullet.png` (orange ball, for most enemy projectiles)

## 3. Known Issues & Best Practices

- **Rendering: The "White Box" Bug**
  - **Symptom:** A sprite renders with a solid white box behind it.
  - **Root Cause:** Canvas `globalCompositeOperation` is not being reset.
  - **Solution:** The `Game.render()` loop now includes a "Systemic State Reset" that explicitly sets `globalCompositeOperation = 'source-over'` for all canvas layers on every frame.

- **Asset Loading: The "Stale Script" Bug**
  - **Symptom:** Code changes do not seem to apply.
  - **Root Cause:** Aggressive browser caching.
  - **Solution:** When testing, always have the browser'''s Developer Tools open (F12) with the "Disable cache" option checked in the "Network" tab.

- **Assets: The "Corrupted PNG" Bug**
  - **Symptom:** An asset fails to load or renders incorrectly.
  - **Root Cause:** A script with pixel-processing logic accidentally overwrote an original PNG file.
  - **Solution:** Manually restore the asset by opening it in an image editor, removing the background, and re-exporting with a proper alpha channel.
