# Raptor: Call of the Shadows Reimagining - Asset Inventory

## Player Assets
- `/assets/images/player/player_ship_base.png` - Base player ship sprite
- `/assets/images/player/player_ship_thrust.png` - Player ship with thruster animation

## Enemy Assets
- `/assets/images/enemies/enemy_fighter.png` - Basic enemy fighter sprite
- `/assets/images/enemies/enemy_turret.png` - Ground turret enemy sprite
- `/assets/images/enemies/boss_level1.png` - Level 1 boss sprite

## Projectile Assets
- `/assets/images/projectiles/player_bullet.png` - Player bullet sprite
- `/assets/images/projectiles/enemy_bullet.png` - Enemy bullet sprite

## Explosion Assets
- `/assets/images/explosions/explosion_1.png` - Explosion animation frame 1
- `/assets/images/explosions/explosion_2.png` - Explosion animation frame 2

## Collectible Assets
- `/assets/images/collectibles/health_pickup.png` - Health pickup sprite
- `/assets/images/collectibles/shield_pickup.png` - Shield pickup sprite
- `/assets/images/collectibles/megabomb_pickup.png` - Megabomb pickup sprite

## Environment Assets
- `/assets/images/environment/background_level1.png` - Level 1 background
- `/assets/images/environment/background_level2.png` - Level 2 background

## UI Assets
- `/assets/images/ui/health_bar.png` - Health bar UI element
- `/assets/images/ui/shield_bar.png` - Shield bar UI element
- `/assets/images/ui/game_logo.png` - Game logo for title screen

## Assets Still Needed

### Player Assets
- Additional weapon upgrade visuals
- Damage state sprites

### Enemy Assets
- Enemy bomber sprite
- Additional enemy types
- Level 2 boss sprite

### Projectile Assets
- Missile projectiles
- Special weapon projectiles

### Explosion Assets
- Additional explosion animation frames (3-8)
- Different sized explosions

### UI Assets
- Menu buttons
- Weapon selection icons
- Score/money display
- Game over screen
- Victory screen

### Audio Assets
- Background music for levels
- Weapon sound effects
- Explosion sound effects
- UI sound effects
- Engine sound effects

## Behavior & AI Assets

This lists the reusable "Lego bricks" in the `enemyBehaviors.js` library that can be assigned to any enemy in the level JSON data.

### Movement Patterns
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

### Firing Patterns
| Pattern Name | Description |
| :--- | :--- |
| `none` | The enemy does not fire. |
| `single_aimed_shot` | Aims and fires a single projectile at the player's current location. |
| `single_straight_shot` | Fires a single, un-aimed projectile straight down. |
| `three_round_spread` | Fires a 3-shot fan of projectiles. |
| `fire_straight_missile` | Fires a powerful, non-homing missile straight ahead. |
| `burst_fire` | Fires a quick volley of 3 aimed shots. Used by Cutters. |
| `wide_v_shot` | Fires two projectiles in a wide V-pattern. Used by Goliaths. |
| `boss_multi_weapon_fire` | The boss's advanced pattern: rapid straight missiles, burst-aimed shots (3-shot burst after a pause), periodic reposition pauses, and a desperation ring attack at 25% health. Fire rates are 3x faster than normal. |

### Projectile Asset Keys
- `enemyMissile`: Uses `ENEMY_MISSILE.png` (for boss and advanced enemy missiles)
- `enemyBullet`: Uses `enemy_bullet.png` (orange ball, for most enemy projectiles)

