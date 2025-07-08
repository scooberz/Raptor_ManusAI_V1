/**
 * Enemy Behavior Library
 * Contains reusable movement and firing pattern functions for enemies
 */
import { Projectile } from './projectile.js';
import { Missile } from './missile.js';
import { logger } from '../utils/logger.js';

export const movementPatterns = {
    // Enemy just moves based on its default velocity (usually straight down)
    default: function(enemy, deltaTime) {
        // This function is intentionally empty.
        // The base velocity is applied by the parent Entity's update loop.
    },

    // Enemy moves down in a gentle sine wave
    sine_wave_slow: function(enemy, deltaTime) {
        // Initialize pattern state on the enemy if it doesn't exist
        if (enemy.patternState === undefined) {
            enemy.patternState = { initialX: enemy.x, angle: 0 };
        }
        enemy.patternState.angle += 0.02; // Controls speed of oscillation
        enemy.x = enemy.patternState.initialX + Math.sin(enemy.patternState.angle) * 50; // Controls width of oscillation
    },

    // A faster sine wave for more agile enemies.
    sine_wave_fast: function(enemy, deltaTime) {
        // Initialize pattern state on the enemy if it doesn't exist
        if (enemy.patternState === undefined) {
            enemy.patternState = { initialX: enemy.x, angle: 0 };
        }
        // Increase angle faster for more rapid oscillation
        enemy.patternState.angle += 0.05; 
        // Increase amplitude for wider weaving
        enemy.x = enemy.patternState.initialX + Math.sin(enemy.patternState.angle) * 80; 
    },

    // A customizable sine wave pattern with configurable frequency and amplitude
    sine_wave_custom: function(enemy, deltaTime) {
        // Initialize pattern state on the enemy if it doesn't exist
        if (enemy.patternState === undefined) {
            enemy.patternState = { initialX: enemy.x, angle: 0 };
        }
        // Get customizable parameters from overrides, with sensible defaults
        const frequency = enemy.overrides.sine_frequency || 0.03; // Controls oscillation speed
        const amplitude = enemy.overrides.sine_amplitude || 60;   // Controls width of oscillation
        
        enemy.patternState.angle += frequency;
        enemy.x = enemy.patternState.initialX + Math.sin(enemy.patternState.angle) * amplitude;
    },

    // Enemy starts from the left and swoops towards the center, then straightens out.
    swoop_from_left: function(enemy, deltaTime) {
        // Set a high constant downward speed (use override if provided)
        enemy.velocityY = enemy.velocityY || 400;

        // On the first frame, set an initial horizontal speed
        if (enemy.patternState === undefined) {
            enemy.patternState = { initialDx: 250 };
            enemy.velocityX = enemy.patternState.initialDx;
            logger.debug(`Swoop from left initialized: ${enemy.x}, ${enemy.y}, ${enemy.velocityX}, ${enemy.velocityY}`);
        }

        // As the enemy moves down the first 300 pixels of the screen, gradually reduce its horizontal speed to 0.
        // This creates the "swooping in" effect.
        if (enemy.y < 300) {
            // This calculation smoothly reduces velocity from 100% to 0% over 300px.
            const decayFactor = Math.max(0, (300 - enemy.y) / 300);
            enemy.velocityX = enemy.patternState.initialDx * decayFactor;
        } else {
            enemy.velocityX = 0; // Straighten out after the swoop
        }
    },

    // Enemy starts from the right and swoops towards the center.
    swoop_from_right: function(enemy, deltaTime) {
        // Set a high constant downward speed (use override if provided)
        enemy.velocityY = enemy.velocityY || 400;

        // On the first frame, set an initial horizontal speed (negative to move left)
        if (enemy.patternState === undefined) {
            enemy.patternState = { initialDx: -250 };
            enemy.velocityX = enemy.patternState.initialDx;
            logger.debug(`Swoop from right initialized: ${enemy.x}, ${enemy.y}, ${enemy.velocityX}, ${enemy.velocityY}`);
        }

        // As the enemy moves down the first 300 pixels of the screen, gradually reduce its horizontal speed to 0.
        if (enemy.y < 300) {
            const decayFactor = Math.max(0, (300 - enemy.y) / 300);
            enemy.velocityX = enemy.patternState.initialDx * decayFactor;
        } else {
            enemy.velocityX = 0; // Straighten out after the swoop
        }
    },

    /**
     * A more aggressive version of the swoop pattern.
     * The enemy enters from the side in an arc, then dramatically
     * accelerates downwards, "dashing" past the player.
     */
    swoop_and_dash: function(enemy, deltaTime) {
        // Ensure behaviorState exists
        if (!enemy.behaviorState) {
            enemy.behaviorState = {};
        }
        // --- Initial Swoop Phase ---
        // This part is the same as the original swoop.
        // It runs as long as the enemy is in its initial arcing movement.
        if (!enemy.behaviorState.swoop_finished) {
            if (enemy.behaviorState.initialX === undefined) {
                enemy.behaviorState.initialX = enemy.x;
                enemy.behaviorState.initialY = enemy.y;
                // Set the arc distance and initial speed
                enemy.behaviorState.swoopArcDistance = 250; // How far it moves horizontally
                enemy.behaviorState.time = 0;
                enemy.speed = enemy.speed || 100; // Use default speed if none is set
            }

            const state = enemy.behaviorState;
            const elapsedTime = (state.time += deltaTime / 1000);

            // Calculate horizontal movement (arc)
            const arcProgress = Math.sin(elapsedTime * (Math.PI / 2));
            if (state.initialX < enemy.game.width / 2) { // Coming from left
                enemy.x = state.initialX + arcProgress * state.swoopArcDistance;
            } else { // Coming from right
                enemy.x = state.initialX - arcProgress * state.swoopArcDistance;
            }

            // Standard downward movement during the arc
            enemy.y += enemy.speed * (deltaTime / 1000);

            // Check if the arc is complete (when arcProgress reaches its peak)
            if (arcProgress >= 1.0) {
                state.swoop_finished = true;
            }
        }
        // --- Dash Phase ---
        // Once the swoop is finished, we override the velocity.
        else {
            // SET THE NEW, FASTER SPEED HERE!
            // This makes the enemy "roar past the player".
            // A value of 800 is 4x the default speed.
            enemy.velocityY = 800;

            // Apply the new velocity
            enemy.y += enemy.velocityY * (deltaTime / 1000);

            // We don't need to update velocityX, so it continues straight down.
            enemy.velocityX = 0;
        }
    },

    // Enemy moves straight down using its base velocity
    move_straight_down: function(enemy, deltaTime) {
        // The base velocityY from the entity's stats will handle the movement.
    },

    // Enemy moves to a specific point, holds position, then descends
    move_to_point_and_hold: function(enemy, deltaTime) {
        if (!enemy.patternState) {
            enemy.patternState = {
                phase: 'approaching', // Phases: approaching, holding, descending
                target: enemy.overrides.formation_point || { x: enemy.x, y: 150 },
                holdTimer: enemy.overrides.hold_duration_ms || 4000
            };
        }

        const state = enemy.patternState;
        const speed = enemy.speed || 150;

        switch (state.phase) {
            case 'approaching':
                const dx = state.target.x - enemy.x;
                const dy = state.target.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 5) {
                    state.phase = 'holding';
                    enemy.velocityX = 0;
                    enemy.velocityY = 0;
                } else {
                    enemy.velocityX = (dx / distance) * speed;
                    enemy.velocityY = (dy / distance) * speed;
                }
                break;
            case 'holding':
                state.holdTimer -= deltaTime;
                if (state.holdTimer <= 0) {
                    state.phase = 'descending';
                }
                break;
            case 'descending':
                enemy.velocityX = 0;
                enemy.velocityY = speed * 0.75;
                break;
        }
    },

    // Enemy moves from side to side in a wide sweep as it moves down.
    sweep: function(enemy, deltaTime) {
        // Initialize pattern state on the enemy if it doesn't exist
        if (enemy.patternState === undefined) {
            const direction = (enemy.x < enemy.game.width / 2) ? 1 : -1; // 1 for right, -1 for left
            enemy.patternState = {
                direction: direction,
                speedX: enemy.overrides.speedX || 75
            };
            enemy.velocityX = enemy.patternState.speedX * enemy.patternState.direction;
            enemy.velocityY = enemy.speed || 80; // Standard downward speed
        }

        // Reverse horizontal direction if the enemy hits the screen edges
        if (enemy.x <= 0 || enemy.x + enemy.width >= enemy.game.width) {
            enemy.patternState.direction *= -1;
            enemy.velocityX = enemy.patternState.speedX * enemy.patternState.direction;
        }
    },

    // A complex pattern where the enemy flies to a patrol altitude, moves
    // back and forth, and can even retreat upwards slightly before exiting.
    patrol_and_strafe: function(enemy, deltaTime) {
        // Initialize the state for this pattern on the enemy object
        if (!enemy.patternState) {
            enemy.patternState = {
                phase: 'entering', // Phases: entering, patrolling, exiting
                patrol_y: enemy.overrides.patrol_y || 150,
                patrol_duration: enemy.overrides.patrol_duration_ms || 8000,
                direction: (enemy.x < enemy.game.width / 2) ? 1 : -1
            };
        }

        const state = enemy.patternState;
        const speed = enemy.speed || 100;

        switch (state.phase) {
            case 'entering':
                // Move down to the patrol altitude
                enemy.velocityY = speed;
                enemy.velocityX = 0;
                if (enemy.y >= state.patrol_y) {
                    state.phase = 'patrolling';
                }
                break;

            case 'patrolling':
                // Move back and forth and count down the patrol timer
                enemy.velocityY = 0;
                enemy.velocityX = speed * state.direction;
                state.patrol_duration -= deltaTime;

                // Reverse direction at screen edges
                if (enemy.x <= 0 || enemy.x + enemy.width >= enemy.game.width) {
                    state.direction *= -1;
                }

                if (state.patrol_duration <= 0) {
                    state.phase = 'exiting';
                }
                break;

            case 'exiting':
                // Briefly move up and back before flying down off-screen
                enemy.velocityX = -speed * state.direction; // Move backward horizontally
                enemy.velocityY = -speed * 0.5; // Move up slowly
                
                // After a short time, just fly down
                setTimeout(() => {
                    if (enemy.active) {
                        enemy.movementUpdate = movementPatterns['move_straight_down'];
                        enemy.speed = 200; // Exit quickly
                    }
                }, 1000);
                break;
        }
    },

    // Enemy moves straight down, performs a quick horizontal strafe, then continues down.
    strafe_and_descend: function(enemy, deltaTime) {
        // Initialize the state for this pattern
        if (!enemy.patternState) {
            enemy.patternState = {
                phase: 'descending1', // Phases: descending1, strafing, descending2
                strafe_y_trigger: enemy.overrides.strafe_y || 200,
                strafe_duration: enemy.overrides.strafe_duration_ms || 1000,
                strafe_direction: Math.random() < 0.5 ? 1 : -1 // Randomly choose to strafe left or right
            };
            enemy.velocityY = enemy.speed || 120; // Initial descent speed
            enemy.velocityX = 0;
        }

        const state = enemy.patternState;
        const speed = enemy.speed || 120;

        switch (state.phase) {
            case 'descending1':
                // Move down until the trigger Y-coordinate is reached
                if (enemy.y >= state.strafe_y_trigger) {
                    state.phase = 'strafing';
                    enemy.velocityY = 0; // Stop vertical movement
                    enemy.velocityX = speed * 2 * state.strafe_direction; // Strafe quickly
                }
                break;

            case 'strafing':
                // Strafe for a set duration
                state.strafe_duration -= deltaTime;
                if (state.strafe_duration <= 0) {
                    state.phase = 'descending2';
                }
                break;

            case 'descending2':
                // Resume downward movement off the screen
                enemy.velocityX = 0;
                enemy.velocityY = speed;
                break;
        }
    },

    // Enemy moves straight down for a period, then angles towards the center of the screen.
    descend_and_converge: function(enemy, deltaTime) {
        // Initialize the state for this pattern
        if (!enemy.patternState) {
            enemy.patternState = {
                phase: 'descending', // Phases: descending, converging
                descend_duration: enemy.overrides.descend_duration_ms || 2000 // Descend for 2 seconds
            };
            enemy.velocityY = enemy.speed || 80;
            enemy.velocityX = 0;
        }

        const state = enemy.patternState;

        if (state.phase === 'descending') {
            state.descend_duration -= deltaTime;
            if (state.descend_duration <= 0) {
                state.phase = 'converging';
            }
        }
        
        if (state.phase === 'converging') {
            // Once converging, it maintains its downward speed but adds horizontal speed
            // towards the center of the screen.
            const targetX = enemy.game.width / 2;
            const dx = targetX - enemy.x;
            const convergeSpeed = enemy.overrides.converge_speed || 40;
            
            enemy.velocityX = Math.sign(dx) * convergeSpeed;
            enemy.velocityY = enemy.speed || 80;
        }
    },

    // Enemy moves straight down to a certain point, then veers towards the center.
    descend_and_veer: function(enemy, deltaTime) {
        // Initialize the state for this pattern
        if (!enemy.patternState) {
            enemy.patternState = {
                phase: 'descending', // Phases: descending, veering
                veer_y_trigger: enemy.overrides.veer_y || 450, // 3/4 down a 600px screen
                initial_direction: (enemy.x < enemy.game.width / 2) ? 1 : -1 // 1 for right, -1 for left
            };
            enemy.velocityY = enemy.speed || 250; // Descend quickly
            enemy.velocityX = 0;
        }

        const state = enemy.patternState;

        // When the enemy reaches the "veer point", change its phase.
        if (state.phase === 'descending' && enemy.y >= state.veer_y_trigger) {
            state.phase = 'veering';
            const convergeSpeed = enemy.overrides.converge_speed || 100;
            // Set horizontal velocity to move towards the center
            enemy.velocityX = convergeSpeed * state.initial_direction;
        }
    },

    // Enemy moves straight down to a Y position, then hard right.
    descend_and_strafe_right: function(enemy, deltaTime) {
        if (!enemy.patternState) {
            enemy.patternState = { phase: 'descending', trigger_y: enemy.overrides.trigger_y || 350 };
            enemy.velocityY = enemy.speed || 150;
            enemy.velocityX = 0;
        }
        if (enemy.patternState.phase === 'descending' && enemy.y >= enemy.patternState.trigger_y) {
            enemy.patternState.phase = 'strafing';
            enemy.velocityY = 0;
            enemy.velocityX = (enemy.speed || 150) * 1.5; // Strafe faster
        }
    },

    // Enemy moves straight down to a Y position, then hard left.
    descend_and_strafe_left: function(enemy, deltaTime) {
        if (!enemy.patternState) {
            enemy.patternState = { phase: 'descending', trigger_y: enemy.overrides.trigger_y || 350 };
            enemy.velocityY = enemy.speed || 150;
            enemy.velocityX = 0;
        }
        if (enemy.patternState.phase === 'descending' && enemy.y >= enemy.patternState.trigger_y) {
            enemy.patternState.phase = 'strafing';
            enemy.velocityY = 0;
            enemy.velocityX = -(enemy.speed || 150) * 1.5; // Strafe faster
        }
    },

    // Enemy moves in a constant diagonal line.
    move_diagonal: function(enemy, deltaTime) {
        if (!enemy.patternState) {
            enemy.patternState = { initialized: true };
            const direction = (enemy.x < enemy.game.width / 2) ? 1 : -1; // Determine direction based on start side
            enemy.velocityX = (enemy.speed || 200) * direction;
            enemy.velocityY = (enemy.speed || 200) * 0.75; // Make it move down slightly slower than sideways
        }
    },

    // Enemy slowly homes in on the player with drag applied
    slow_homing: function(enemy, deltaTime) {
        if (!enemy.patternState) {
            enemy.patternState = {
                // Initialize angle to point mostly downwards, with a slight random spread.
                currentAngle: Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 4)
            };
        }

        const player = enemy.game.player;

        if (player) {
            const speed = enemy.speed || 50;
            const turnSpeed = enemy.overrides.turn_speed || 1.0;

            // 1. Calculate the direct angle to the player
            let targetAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);

            // 2. Constrain the target angle to prevent upward movement
            // If the player is above the mine, the target angle will be negative.
            // In this case, we prevent the mine from turning upwards.
            if (targetAngle < 0) {
                // Instead, steer hard left or right to get under the player again.
                // The angle is clamped to be slightly more than 0 or slightly less than PI
                // to ensure there's always some downward velocity.
                targetAngle = (player.x > enemy.x) ? 0.1 : Math.PI - 0.1;
            }
            
            // 3. Use the persistent angle from the state
            let currentAngle = enemy.patternState.currentAngle;

            // 4. Find the shortest turning path
            let angleDifference = targetAngle - currentAngle;
            while (angleDifference < -Math.PI) angleDifference += 2 * Math.PI;
            while (angleDifference > Math.PI) angleDifference -= 2 * Math.PI;

            // 5. Apply the turn
            const turnAmount = turnSpeed * (deltaTime / 1000);
            currentAngle += Math.sign(angleDifference) * Math.min(Math.abs(angleDifference), turnAmount);

            // 6. Save the new angle back to the state
            enemy.patternState.currentAngle = currentAngle;

            // 7. Recalculate velocity based on the new angle
            enemy.velocityX = Math.cos(currentAngle) * speed;
            enemy.velocityY = Math.sin(currentAngle) * speed;
        }
    },

    // A classic zigzag pattern.
    zigzag: function(enemy, deltaTime) {
        if (!enemy.patternState) {
            enemy.patternState = {
                direction: Math.random() < 0.5 ? 1 : -1
            };
            enemy.velocityY = enemy.speed || 100;
        }
        const state = enemy.patternState;
        const speedX = enemy.overrides.horizontal_speed || 150;

        enemy.velocityX = speedX * state.direction;

        // Reverse direction at screen edges
        if (enemy.x <= 0 && state.direction === -1) {
            state.direction = 1;
        } else if (enemy.x + enemy.width >= enemy.game.width && state.direction === 1) {
            state.direction = -1;
        }
    },

    // Enemy descends while strafing to a target X coordinate, then continues straight down.
    strafe_to_x_position: function(enemy, deltaTime) {
        if (!enemy.patternState) {
            enemy.patternState = {
                phase: 'strafing', // Phases: strafing, descending
                target_x: enemy.overrides.target_x || (enemy.game.width / 2)
            };
            enemy.velocityY = enemy.speed || 180;
        }

        const state = enemy.patternState;
        const speedX = enemy.overrides.strafe_speed || 100;

        if (state.phase === 'strafing') {
            const dx = state.target_x - enemy.x;
            
            // If close enough to the target X, stop strafing.
            if (Math.abs(dx) < 5) {
                state.phase = 'descending';
                enemy.velocityX = 0;
            } else {
                enemy.velocityX = Math.sign(dx) * speedX;
            }
        }
    },

    // Enemy strafes from the center to the edge, then back to the center, then descends.
    strafe_out_and_in: function(enemy, deltaTime) {
        if (!enemy.patternState) {
            enemy.patternState = {
                phase: 'strafing_out', // Phases: strafing_out, strafing_in, descending
                direction: Math.random() < 0.5 ? 1 : -1, // Randomly pick initial side
                speedX: enemy.overrides.speedX || 120
            };
            enemy.velocityY = enemy.speed || 60; // Slow descent while strafing
        }

        const state = enemy.patternState;
        enemy.velocityX = state.speedX * state.direction;

        switch (state.phase) {
            case 'strafing_out':
                if (enemy.x <= 0 || enemy.x + enemy.width >= enemy.game.width) {
                    state.phase = 'strafing_in';
                    state.direction *= -1; // Reverse direction
                }
                break;
            case 'strafing_in':
                // Check if it has returned to the center
                if ((state.direction === 1 && enemy.x >= enemy.game.width / 2) || (state.direction === -1 && enemy.x <= enemy.game.width / 2)) {
                    state.phase = 'descending';
                }
                break;
            case 'descending':
                enemy.velocityX = 0;
                enemy.velocityY = (enemy.speed || 60) * 2; // Descend faster to exit
                break;
        }
    },

    // For a V-formation leader. The back two enemies will use this pattern.
    // It moves straight down, then "splits" off towards the side of the screen.
    split_and_descend: function(enemy, deltaTime) {
        if (!enemy.patternState) {
            enemy.patternState = {
                phase: 'descending', // Phases: descending, splitting
                split_y_trigger: enemy.overrides.split_y || 150,
                // The direction of the split is passed in the overrides
                split_direction: enemy.overrides.split_direction || 1 
            };
            enemy.velocityY = enemy.speed || 100;
            enemy.velocityX = 0;
        }

        const state = enemy.patternState;
        if (state.phase === 'descending' && enemy.y >= state.split_y_trigger) {
            state.phase = 'splitting';
            // Keep downward velocity, but add a strong horizontal velocity
            enemy.velocityX = (enemy.speed || 100) * 1.5 * state.split_direction;
        }
    },

    // Enemy moves straight down, then angles away from the center of the screen.
    descend_and_diverge: function(enemy, deltaTime) {
        if (!enemy.patternState) {
            enemy.patternState = {
                phase: 'descending',
                diverge_y_trigger: enemy.overrides.diverge_y || 250
            };
            enemy.velocityY = enemy.speed || 90;
            enemy.velocityX = 0;
        }

        const state = enemy.patternState;
        if (state.phase === 'descending' && enemy.y >= state.diverge_y_trigger) {
            state.phase = 'diverging';
            // Determine direction based on which side of the screen it's on
            const direction = (enemy.x < enemy.game.width / 2) ? -1 : 1;
            enemy.velocityX = (enemy.speed || 90) * direction;
        }
    },

    // Enemy flies diagonally towards a target point, then continues on that path. Used for crossing patterns.
    criss_cross: function(enemy, deltaTime) {
        if (!enemy.patternState) {
            enemy.patternState = { initialized: true };
            // Target the opposite side of the screen at a lower point
            const targetX = enemy.game.width - enemy.x; 
            const targetY = enemy.game.height * 0.6;
            
            const dx = targetX - enemy.x;
            const dy = targetY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const speed = enemy.speed || 200;
            enemy.velocityX = (dx / distance) * speed;
            enemy.velocityY = (dy / distance) * speed;
        }
        // No phase changes, it just moves in a straight diagonal line.
    },

    // A multi-phase pattern for a final boss.
    boss_movement: function(enemy, deltaTime) {
        if (!enemy.patternState) {
            enemy.patternState = {
                phase: 'entering', // entering, patrolling, repositioning
                phaseTimer: 3000, // Time until next phase change
                targetX: enemy.game.width / 2,
                targetY: 100
            };
        }
        const state = enemy.patternState;
        const speed = enemy.speed || 60;
        state.phaseTimer -= deltaTime;

        // --- Phase Changing Logic ---
        if (state.phaseTimer <= 0) {
            if (state.phase === 'entering' || state.phase === 'repositioning') {
                state.phase = 'patrolling';
                state.phaseTimer = 5000 + Math.random() * 3000; // Patrol for 5-8 seconds
            } else if (state.phase === 'patrolling') {
                state.phase = 'repositioning';
                state.phaseTimer = 2000; // Time to move to new spot
                // Pick a new spot in the upper-middle of the screen
                state.targetX = (enemy.game.width / 2) + (Math.random() - 0.5) * 300;
                state.targetY = 100 + Math.random() * 150;
            }
        }
        
        // --- Movement Execution Logic ---
        const dx = state.targetX - enemy.x;
        const dy = state.targetY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
            enemy.velocityX = (dx / distance) * speed;
            enemy.velocityY = (dy / distance) * speed;
        } else {
            enemy.velocityX = 0;
            enemy.velocityY = 0;
        }
    },

    // A multi-phase pattern for a final boss, moving between waypoints.
    boss_patrol: function(enemy, deltaTime) {
        if (!enemy.patternState) {
            enemy.patternState = {
                // Define 3 patrol points in the upper half of the screen
                waypoints: [
                    { x: enemy.game.width * 0.2, y: 120 },
                    { x: enemy.game.width * 0.8, y: 120 },
                    { x: enemy.game.width * 0.5, y: 180 }
                ],
                currentWaypointIndex: 0,
                initialMove: true
            };
             // Initial movement onto the screen
            enemy.velocityY = (enemy.speed || 60);
        }

        const state = enemy.patternState;
        const speed = enemy.speed || 60;
        
        if (state.initialMove) {
            if (enemy.y >= 80) { // Stop initial descent at y=80
                state.initialMove = false;
            }
            return;
        }

        let target = state.waypoints[state.currentWaypointIndex];
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
            // Arrived at waypoint, pick the next one
            state.currentWaypointIndex = (state.currentWaypointIndex + 1) % state.waypoints.length;
        } else {
            // Move towards the target waypoint
            enemy.velocityX = (dx / distance) * speed;
            enemy.velocityY = (dy / distance) * speed;
        }
    }
};

// Helper to determine projectile sprite for enemy
function getEnemyProjectileSprite(enemy) {
    // Reaper and Cyclone use enemyMissile.png
    if (enemy.type === 'reaper' || enemy.type === 'cyclone') {
        return 'enemyMissile';
    }
    // All others use enemy_projectile.png
    return 'enemyBullet';
}

export const firingPatterns = {
    // Enemy does not fire
    none: function(enemy, player, deltaTime) {
        // Intentionally empty.
    },

    // Enemy fires a single bullet aimed at the player's position when it fired
    single_aimed_shot: function(enemy, player, deltaTime) {
        // Initialize fire timer on the enemy if it doesn't exist
        if (enemy.fireTimer === undefined) {
            enemy.fireTimer = 500; // Start shooting almost immediately (was 2000)
        }

        enemy.fireTimer -= deltaTime;

        if (enemy.fireTimer <= 0) {
            if (player) {
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const velocityX = (dx / distance) * 250; // Increased by 25% (was 200)
                const velocityY = (dy / distance) * 250; // Increased by 25% (was 200)
                const spriteName = getEnemyProjectileSprite(enemy);
                const sprite = enemy.game.assets.getImage(spriteName);
                const projectile = enemy.game.projectilePool.get();
                projectile.activate(enemy.x, enemy.y, velocityX, velocityY, 10, 'enemy', sprite);
                enemy.game.entityManager.add(projectile);
                enemy.game.collision.addToGroup(projectile, 'enemyProjectiles');
            }
            enemy.fireTimer = enemy.fireRate || 1500; // Faster default rate (was 2000)
        }
    },

    // Fires a single bullet straight down.
    single_straight_shot: function(enemy, player, deltaTime) {
        if (enemy.fireTimer === undefined) {
            enemy.fireTimer = 300; // Start shooting almost immediately (was 3000)
        }
        enemy.fireTimer -= deltaTime;

        if (enemy.fireTimer <= 0) {
            const velocityX = 0;
            const velocityY = 188; // Increased by 25% (was 150)
            const spriteName = getEnemyProjectileSprite(enemy);
            const sprite = enemy.game.assets.getImage(spriteName);
            const projectile = enemy.game.projectilePool.get();
            projectile.activate(enemy.x, enemy.y, velocityX, velocityY, 10, 'enemy', sprite);
            enemy.game.entityManager.add(projectile);
            enemy.game.collision.addToGroup(projectile, 'enemyProjectiles');
            enemy.fireTimer = enemy.fireRate || 1200; // Faster default rate (was 3000)
        }
    },

    // Fires three bullets in a fan pattern.
    three_round_spread: function(enemy, player, deltaTime) {
        if (enemy.fireTimer === undefined) {
            enemy.fireTimer = 800; // Start shooting almost immediately (was 4000)
        }
        enemy.fireTimer -= deltaTime;

        if (enemy.fireTimer <= 0) {
            const projectileSpeed = 188; // Increased by 25% (was 150)
            const spriteName = getEnemyProjectileSprite(enemy);
            const sprite = enemy.game.assets.getImage(spriteName);
            
            // Center bullet
            const centerVelocityX = 0;
            const centerVelocityY = projectileSpeed;
            // Left bullet (angled left by ~15 degrees)
            const leftVelocityX = -projectileSpeed * 0.26;
            const leftVelocityY = projectileSpeed * 0.96;
            // Right bullet (angled right by ~15 degrees)
            const rightVelocityX = projectileSpeed * 0.26;
            const rightVelocityY = projectileSpeed * 0.96;
            
            const centerProjectile = enemy.game.projectilePool.get();
            centerProjectile.activate(enemy.x, enemy.y, centerVelocityX, centerVelocityY, 10, 'enemy', sprite);
            const leftProjectile = enemy.game.projectilePool.get();
            leftProjectile.activate(enemy.x, enemy.y, leftVelocityX, leftVelocityY, 10, 'enemy', sprite);
            const rightProjectile = enemy.game.projectilePool.get();
            rightProjectile.activate(enemy.x, enemy.y, rightVelocityX, rightVelocityY, 10, 'enemy', sprite);
            
            enemy.game.entityManager.add(centerProjectile);
            enemy.game.entityManager.add(leftProjectile);
            enemy.game.entityManager.add(rightProjectile);
            
            enemy.game.collision.addToGroup(centerProjectile, 'enemyProjectiles');
            enemy.game.collision.addToGroup(leftProjectile, 'enemyProjectiles');
            enemy.game.collision.addToGroup(rightProjectile, 'enemyProjectiles');
            
            enemy.fireTimer = enemy.fireRate || 2000; // Faster default rate (was 4000)
        }
    },

    // Fires a missile straight down with constant high speed
    fire_straight_missile: function(enemy, player, deltaTime) {
        if (enemy.fireTimer === undefined) {
            enemy.fireTimer = 1000; // Start shooting almost immediately (was 5000)
        }
        enemy.fireTimer -= deltaTime;

        if (enemy.fireTimer <= 0) {
            const missileDamage = 40;
            // Enemy missiles get a high, constant velocity and do not accelerate.
            const missileVelocity = { x: 0, y: 375 }; // Increased by 25% (was 300)
            const missile = new Missile(enemy.game, enemy.x, enemy.y, missileDamage, 'enemy', missileVelocity);
            enemy.game.entityManager.add(missile);
            enemy.game.collision.addToGroup(missile, 'enemyProjectiles');
            enemy.fireTimer = enemy.fireRate || 2500; // Faster default rate (was 5000)
        }
    },

    // Fires a quick burst of 3 projectiles.
    burst_fire: function(enemy, player, deltaTime) {
        // Initialize pattern state if it doesn't exist
        if (enemy.fireState === undefined) {
            enemy.fireState = {
                mainTimer: 600, // Start shooting almost immediately (was 4000)
                isBursting: false,
                burstShotsFired: 0,
                burstShotDelay: 80 // Faster burst shots (was 100)
            };
        }
        
        const state = enemy.fireState;
        state.mainTimer -= deltaTime;

        // If not currently bursting and the main timer is ready, start a burst.
        if (!state.isBursting && state.mainTimer <= 0) {
            state.isBursting = true;
            state.burstShotsFired = 0;
            state.interShotTimer = 0;
        }

        // If currently bursting, handle the firing of individual shots.
        if (state.isBursting) {
            state.interShotTimer -= deltaTime;
            if (state.interShotTimer <= 0 && state.burstShotsFired < 3) {
                // Fire a single aimed shot
                if (player) {
                    const dx = player.x - enemy.x;
                    const dy = player.y - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const velocity = { x: (dx / distance) * 375, y: (dy / distance) * 375 }; // Increased by 25% (was 300)
                    const spriteName = getEnemyProjectileSprite(enemy);
                    const sprite = enemy.game.assets.getImage(spriteName);
                    const projectile = enemy.game.projectilePool.get();
                    projectile.activate(enemy.x, enemy.y, velocity.x, velocity.y, 5, 'enemy', sprite);
                    enemy.game.entityManager.add(projectile);
                    enemy.game.collision.addToGroup(projectile, 'enemyProjectiles');
                }
                state.burstShotsFired++;
                state.interShotTimer = state.burstShotDelay; // Reset inter-shot timer
            }

            // If burst is finished, reset for the next main cooldown period.
            if (state.burstShotsFired >= 3) {
                state.isBursting = false;
                state.mainTimer = enemy.fireRate || 2000; // Faster default rate (was 4000)
            }
        }
    },

    // Fires two projectiles simultaneously in a wide V-shape (approx. 90 degrees).
    wide_v_shot: function(enemy, player, deltaTime) {
        if (enemy.fireTimer === undefined) {
            enemy.fireTimer = 400; // Start shooting almost immediately (was 3000)
        }
        enemy.fireTimer -= deltaTime;

        if (enemy.fireTimer <= 0) {
            const projectileSpeed = 275; // Increased by 25% (was 220)
            const damage = 20;

            // Create the left-moving projectile (down and left at 45 degrees)
            const leftVelocity = { x: -projectileSpeed * 0.707, y: projectileSpeed * 0.707 };
            const spriteName = getEnemyProjectileSprite(enemy);
            const sprite = enemy.game.assets.getImage(spriteName);
            const leftProjectile = enemy.game.projectilePool.get();
            leftProjectile.activate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, leftVelocity.x, leftVelocity.y, damage, 'enemy', sprite);
            enemy.game.entityManager.add(leftProjectile);
            enemy.game.collision.addToGroup(leftProjectile, 'enemyProjectiles');
            
            // Create the right-moving projectile (down and right at 45 degrees)
            const rightVelocity = { x: projectileSpeed * 0.707, y: projectileSpeed * 0.707 };
            const rightProjectile = enemy.game.projectilePool.get();
            rightProjectile.activate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, rightVelocity.x, rightVelocity.y, damage, 'enemy', sprite);
            enemy.game.entityManager.add(rightProjectile);
            enemy.game.collision.addToGroup(rightProjectile, 'enemyProjectiles');

            enemy.fireTimer = enemy.fireRate || 1500; // Faster default rate (was 3000)
        }
    },

    // A complex pattern that controls two separate weapon systems.
    boss_multi_weapon_fire: function(enemy, player, deltaTime) {
        if (!enemy.fireState) {
            enemy.fireState = {
                straightShotTimer: (enemy.overrides.straightFireRate || 2000) / 3,
                aimedShotTimer: (enemy.overrides.aimedFireRate || 3200) / 3,
                aimedBurstPause: false,
                aimedBurstShots: 0,
                aimedBurstDelay: 0,
                repositionPause: false,
                repositionTimer: 0,
                desperationTriggered: false,
                desperationTimer: 0
            };
        }
        const state = enemy.fireState;
        // Desperation attack trigger
        if (!state.desperationTriggered && enemy.health / enemy.maxHealth <= 0.25) {
            state.desperationTriggered = true;
            state.desperationTimer = 0;
        }
        // Desperation attack (massive spread)
        if (state.desperationTriggered && state.desperationTimer <= 0) {
            // Fire a ring of projectiles
            for (let i = 0; i < 16; i++) {
                const angle = (Math.PI * 2 * i) / 16;
                const velocityX = Math.cos(angle) * 313; // Increased by 25% (was 250)
                const velocityY = Math.sin(angle) * 313; // Increased by 25% (was 250)
                const sprite = enemy.game.assets.getImage('enemyBullet');
                const projectile = enemy.game.projectilePool.get();
                projectile.activate(enemy.x + enemy.width/2, enemy.y + enemy.height/2, velocityX, velocityY, 15, 'enemy', sprite);
                enemy.game.entityManager.add(projectile);
                enemy.game.collision.addToGroup(projectile, 'enemyProjectiles');
            }
            state.desperationTimer = 3500; // 3.5s between desperation attacks
        }
        if (state.desperationTriggered) {
            state.desperationTimer -= deltaTime;
        }
        // Reposition pause logic
        if (state.repositionPause) {
            state.repositionTimer -= deltaTime;
            if (state.repositionTimer <= 0) {
                state.repositionPause = false;
            } else {
                return; // Paused, don't fire
            }
        }
        // --- Firing Straight Shooters ---
        state.straightShotTimer -= deltaTime;
        if (state.straightShotTimer <= 0) {
            const sprite = enemy.game.assets.getImage('enemyMissile');
            const missile = new Missile(enemy.game, enemy.x + 20, enemy.y + enemy.height - 20, 20, 'enemy', { x: 0, y: 438 });
            missile.sprite = sprite;
            enemy.game.entityManager.add(missile);
            enemy.game.collision.addToGroup(missile, 'enemyProjectiles');
            state.straightShotTimer = ((enemy.overrides.straightFireRate || 2000) / 3);
            // After every 4 straight shots, pause to reposition
            state.straightShotsFired = (state.straightShotsFired || 0) + 1;
            if (state.straightShotsFired % 4 === 0) {
                state.repositionPause = true;
                state.repositionTimer = 1200; // 1.2s pause
            }
        }
        // --- Firing Aimed Burst ---
        state.aimedShotTimer -= deltaTime;
        if (!state.aimedBurstPause && state.aimedShotTimer <= 0) {
            state.aimedBurstPause = true;
            state.aimedBurstShots = 0;
            state.aimedBurstDelay = 0;
        }
        if (state.aimedBurstPause) {
            state.aimedBurstDelay -= deltaTime;
            if (state.aimedBurstShots < 3 && state.aimedBurstDelay <= 0) {
                if (player) {
                    const sprite = enemy.game.assets.getImage('enemyBullet');
                    const dx = player.x - (enemy.x + enemy.width / 2);
                    const dy = player.y - (enemy.y + enemy.height / 2);
                    const angle = Math.atan2(dy, dx);
                    const velocityX = Math.cos(angle) * 375; // Increased by 25% (was 300)
                    const velocityY = Math.sin(angle) * 375; // Increased by 25% (was 300)
                    const projectile = enemy.game.projectilePool.get();
                    projectile.activate(enemy.x + enemy.width/2, enemy.y + enemy.height/2, velocityX, velocityY, 15, 'enemy', sprite);
                    enemy.game.entityManager.add(projectile);
                    enemy.game.collision.addToGroup(projectile, 'enemyProjectiles');
                }
                state.aimedBurstShots++;
                state.aimedBurstDelay = 120; // 120ms between burst shots
            }
            if (state.aimedBurstShots >= 3) {
                state.aimedBurstPause = false;
                state.aimedShotTimer = ((enemy.overrides.aimedFireRate || 3200) / 3) + 500; // Add a small delay after burst
            }
        }
    },

    // --- BOSS MIXED ARMAMENT ---
    boss_mixed_armament: function(enemy, player, deltaTime) {
        if (!enemy.fireState) {
            enemy.fireState = {
                cannonTimer: enemy.overrides.cannonFireRate || 1200,
                missileTimer: enemy.overrides.missileFireRate || 4000
            };
        }
        const state = enemy.fireState;
        state.cannonTimer -= deltaTime;
        state.missileTimer -= deltaTime;

        // Firing Cannons (spread shot aimed at player)
        if (state.cannonTimer <= 0) {
            if (player) {
                const sprite = enemy.game.assets.getImage('enemyBullet');
                for (let i = -1; i <= 1; i++) {
                    const angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                    const angle = angleToPlayer + (i * 0.2); // 0.2 radians spread
                    const velocityX = Math.cos(angle) * 375; // Increased by 25% (was 300)
                    const velocityY = Math.sin(angle) * 375; // Increased by 25% (was 300)
                    const projectile = enemy.game.projectilePool.get();
                    projectile.activate(enemy.x + enemy.width/2, enemy.y + enemy.height/2, velocityX, velocityY, 10, 'enemy', sprite);
                    enemy.game.entityManager.add(projectile);
                    enemy.game.collision.addToGroup(projectile, 'enemyProjectiles');
                }
            }
            state.cannonTimer = enemy.overrides.cannonFireRate || 1200;
        }

        // Firing Missiles (straight forward)
        if (state.missileTimer <= 0) {
            const sprite = enemy.game.assets.getImage('enemyMissile');
            const missile = new Missile(enemy.game, enemy.x + enemy.width/2, enemy.y + enemy.height, 40, 'enemy', { x: 0, y: 375 });
            missile.sprite = sprite;
            enemy.game.entityManager.add(missile);
            enemy.game.collision.addToGroup(missile, 'enemyProjectiles'); // CRUCIAL STEP
            state.missileTimer = enemy.overrides.missileFireRate || 4000;
        }
    }
}; 