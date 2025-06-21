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
                const velocity = { x: (dx / distance) * 200, y: (dy / distance) * 200 };

                // Assuming a Projectile class exists and can be instantiated like this
                enemy.game.entityManager.add(new Projectile(enemy.game, enemy.x, enemy.y, velocity, 'enemyBullet', enemy));
            }
            enemy.fireTimer = enemy.fireRate || 2000; // Reset timer
        }
    }
}; 