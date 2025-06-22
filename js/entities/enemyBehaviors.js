/**
 * Enemy Behavior Library
 * Contains reusable movement and firing pattern functions for enemies
 */
import { Projectile } from './projectile.js';

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

    // Enemy starts from the left and swoops towards the center, then straightens out.
    swoop_from_left: function(enemy, deltaTime) {
        // Set a high constant downward speed (use override if provided)
        enemy.velocityY = enemy.velocityY || 400;

        // On the first frame, set an initial horizontal speed
        if (enemy.patternState === undefined) {
            enemy.patternState = { initialDx: 250 };
            enemy.velocityX = enemy.patternState.initialDx;
            console.log('Swoop from left initialized:', enemy.x, enemy.y, enemy.velocityX, enemy.velocityY);
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
            console.log('Swoop from right initialized:', enemy.x, enemy.y, enemy.velocityX, enemy.velocityY);
        }

        // As the enemy moves down the first 300 pixels of the screen, gradually reduce its horizontal speed to 0.
        if (enemy.y < 300) {
            const decayFactor = Math.max(0, (300 - enemy.y) / 300);
            enemy.velocityX = enemy.patternState.initialDx * decayFactor;
        } else {
            enemy.velocityX = 0; // Straighten out after the swoop
        }
    }
};

export const firingPatterns = {
    // Enemy does not fire
    none: function(enemy, player, deltaTime) {
        // Intentionally empty.
    },

    // Enemy fires a single bullet aimed at the player's position when it fired
    single_aimed_shot: function(enemy, player, deltaTime) {
        // Initialize fire timer on the enemy if it doesn't exist
        if (enemy.fireTimer === undefined) {
            enemy.fireTimer = enemy.fireRate || 2000; // Use override or default to 2s
        }

        enemy.fireTimer -= deltaTime;

        if (enemy.fireTimer <= 0) {
            if (player) {
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const velocityX = (dx / distance) * 200;
                const velocityY = (dy / distance) * 200;

                // Assuming a Projectile class exists and can be instantiated like this
                enemy.game.entityManager.add(new Projectile(enemy.game, enemy.x, enemy.y, 8, 16, velocityX, velocityY, 10, 'enemy'));
            }
            enemy.fireTimer = enemy.fireRate || 2000; // Reset timer
        }
    },

    // Fires a single bullet straight down.
    single_straight_shot: function(enemy, player, deltaTime) {
        if (enemy.fireTimer === undefined) {
            enemy.fireTimer = enemy.fireRate || 3000; // Use override or default to 3s
        }
        enemy.fireTimer -= deltaTime;

        if (enemy.fireTimer <= 0) {
            const velocityX = 0;
            const velocityY = 150; // Straight down velocity
            enemy.game.entityManager.add(new Projectile(enemy.game, enemy.x, enemy.y, 8, 16, velocityX, velocityY, 10, 'enemy'));
            enemy.fireTimer = enemy.fireRate || 3000; // Reset timer
        }
    },

    // Fires three bullets in a fan pattern.
    three_round_spread: function(enemy, player, deltaTime) {
        if (enemy.fireTimer === undefined) {
            enemy.fireTimer = enemy.fireRate || 4000; // Use override or default to 4s
        }
        enemy.fireTimer -= deltaTime;

        if (enemy.fireTimer <= 0) {
            const projectileSpeed = 150;
            // Center bullet
            const centerVelocityX = 0;
            const centerVelocityY = projectileSpeed;
            // Left bullet (angled left by ~15 degrees)
            const leftVelocityX = -projectileSpeed * 0.26;
            const leftVelocityY = projectileSpeed * 0.96;
            // Right bullet (angled right by ~15 degrees)
            const rightVelocityX = projectileSpeed * 0.26;
            const rightVelocityY = projectileSpeed * 0.96;

            enemy.game.entityManager.add(new Projectile(enemy.game, enemy.x, enemy.y, 8, 16, centerVelocityX, centerVelocityY, 10, 'enemy'));
            enemy.game.entityManager.add(new Projectile(enemy.game, enemy.x, enemy.y, 8, 16, leftVelocityX, leftVelocityY, 10, 'enemy'));
            enemy.game.entityManager.add(new Projectile(enemy.game, enemy.x, enemy.y, 8, 16, rightVelocityX, rightVelocityY, 10, 'enemy'));
            
            enemy.fireTimer = enemy.fireRate || 4000; // Reset timer
        }
    }
}; 