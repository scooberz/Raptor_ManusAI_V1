/**
 * HUD class
 * Handles the heads-up display for the game
 * Updated to remove duplicate weapon displays
 */
import { Boss1 } from '../entities/boss1.js';
class HUD {
    constructor(game) {
        this.game = game;
        this.shieldBar = null;
    }
    
    /**
     * Load HUD assets
     */
    loadAssets() {
        this.shieldBar = this.game.assets.getImage('shieldBar');
    }
    
    /**
     * Render the HUD
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    render(context) {
        // Load assets if not already loaded
        this.loadAssets();
        
        // Render health bar
        this.renderHealthBar(context);
        
        // Render score and money
        this.renderStats(context);
        
        // Render megabomb count
        this.renderMegabombs(context);
        
        // Render missile UI
        this.renderMissileUI(context);
        
        // Render boss health bar if boss is active
        this.renderBossHealthBar(context);
        
        // Render boss approaching message if needed
        this.renderBossApproachingMessage(context);
        
        // Render touch control indicator if on touch device
        if (this.game.isTouchDevice) {
            this.renderTouchIndicator(context);
        }
    }
    
    /**
     * Render health bar
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderHealthBar(context) {
        if (!this.game.player) return;

        const player = this.game.player;
        const totalTicks = 50; // The total number of ticks when at full health
        const tickHeight = 8; // The height of a single tick
        const tickWidth = 7; // Thinner ticks
        const tickSpacing = 3; // Slightly reduced spacing
        const x = this.game.width - tickWidth; // Flush to the right edge
        const startY = this.game.height - 15; // Start drawing from the bottom

        const healthPercentage = player.health / player.maxHealth;
        const ticksToShow = Math.ceil(totalTicks * healthPercentage);

        context.save();
        context.strokeStyle = '#FFA500'; // Orange outline color
        context.fillStyle = 'rgba(255, 165, 0, 0.7)'; // Semi-transparent orange fill

        // Loop and draw the visible health ticks from bottom to top
        for (let i = 0; i < ticksToShow; i++) {
            const y = startY - (i * (tickHeight + tickSpacing));
            context.fillRect(x, y, tickWidth, tickHeight);
            context.strokeRect(x, y, tickWidth, tickHeight);
        }
        
        context.restore();
    }
    
    /**
     * Render money counter
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderStats(context) {
        const player = this.game.player;
        
        // Money - centered at top of screen
        context.fillStyle = '#ffcc00';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText(`$${player.money || 0}`, this.game.width / 2, 30);
    }
    
    /**
     * Render megabomb count
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderMegabombs(context) {
        const player = this.game.player;
        const x = this.game.width - 20;
        const y = this.game.height - 30;
        
        // Megabomb count
        context.fillStyle = '#ff6600';
        context.font = '16px Arial';
        context.textAlign = 'right';
        context.fillText(`Megabombs: ${player.megabombs}`, x, y);
    }
    
    /**
     * Render boss health bar
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderBossHealthBar(context) {
        // Find active boss in entity manager - try multiple detection methods
        let boss = this.game.entityManager.getEntitiesByType(Boss1).find(b => b.active);
        
        // Fallback: look for any entity with isBoss flag
        if (!boss) {
            boss = this.game.entityManager.entities.find(e => e.active && e.isBoss);
        }
        
        // Fallback: look for any entity with type 'boss1'
        if (!boss) {
            boss = this.game.entityManager.entities.find(e => e.active && e.type === 'boss1');
        }
        
        if (!boss) return;

        const barWidth = this.game.width * 0.8;
        const barHeight = 30;
        const barX = (this.game.width - barWidth) / 2;
        const barY = 5; // Moved to very top to avoid overlap with player health bar
        const healthPercent = boss.health / boss.maxHealth;

        // Background
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(barX, barY, barWidth, barHeight);

        // Health
        context.fillStyle = '#c00';
        context.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // Border
        context.strokeStyle = 'white';
        context.lineWidth = 2;
        context.strokeRect(barX, barY, barWidth, barHeight);

        // Boss name
        context.fillStyle = 'white';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.fillText('BOSS', this.game.width / 2, barY + barHeight + 20);
    }
    
    /**
     * Get color for health bar based on health percentage
     * @param {number} percent - Health percentage (0-1)
     * @returns {string} Color string
     */
    getHealthColor(percent) {
        if (percent > 0.6) return 'rgba(0, 200, 0, 0.8)';
        if (percent > 0.3) return 'rgba(255, 200, 0, 0.8)';
        return 'rgba(255, 50, 50, 0.8)';
    }
    
    /**
     * Get weapon name from type
     * @param {string} type - Weapon type
     * @returns {string} Weapon name
     */
    getWeaponName(type) {
        switch (type) {
            case 'machineGun': return 'Machine Gun';
            case 'missile': return 'Missile';
            case 'CANNON': return 'Cannon';
            case 'MISSILE': return 'Missile';
            case 'laser': return 'Laser';
            case 'plasma': return 'Plasma Cannon';
            default: return type;
        }
    }
    
    /**
     * Render missile UI
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderMissileUI(context) {
        if (!this.game.player) return;
        
        const player = this.game.player;
        
        // Missile status - bottom left
        context.fillStyle = '#fff';
        context.font = '14px Arial';
        context.textAlign = 'left';
        
        // Show auto-fire mode status
        const isAutoFire = player.missileAutoFire || false;
        context.fillText(`Missiles: ${isAutoFire ? 'ON' : 'OFF'}`, 10, this.game.height - 30);
        
        // Controls hint
        context.fillStyle = '#888';
        context.font = '10px Arial';
        context.fillText('Right-click to toggle missiles', 10, this.game.height - 15);
    }
    
    /**
     * Render boss approaching message
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderBossApproachingMessage(context) {
        // Check if there's a boss currently active
        let boss = this.game.entityManager.getEntitiesByType(Boss1).find(b => b.active);
        if (!boss) {
            boss = this.game.entityManager.entities.find(e => e.active && e.isBoss);
        }
        if (!boss) {
            boss = this.game.entityManager.entities.find(e => e.active && e.type === 'boss1');
        }
        
        // If no boss is currently active, check if we're approaching the boss wave
        if (!boss) {
            // Check if we're in the last wave (boss wave is always last)
            const currentLevel = this.game.currentState?.currentLevel;
            if (currentLevel && currentLevel.levelData?.waves) {
                const totalWaves = currentLevel.levelData.waves.length;
                const currentWaveIndex = currentLevel.currentWaveIndex;
                
                // Show boss approaching when we're in the last wave (boss wave)
                if (currentWaveIndex === totalWaves - 1) {
                    this.renderBossMessage(context, 'BOSS APPROACHING');
                }
            }
        }
    }
    
    /**
     * Render a boss-related message
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     * @param {string} message - The message to display
     */
    renderBossMessage(context, message) {
        // Semi-transparent background
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, this.game.height / 2 - 50, this.game.width, 100);
        
        // Message text
        context.fillStyle = '#ff0000';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.shadowColor = 'black';
        context.shadowBlur = 5;
        context.fillText(message, this.game.width / 2, this.game.height / 2);
        
        // Reset shadow
        context.shadowBlur = 0;
    }
    
    /**
     * Render touch control indicator
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderTouchIndicator(context) {
        const touchHandler = this.game.touchHandler;
        if (!touchHandler) return;
        
        // Show touch status in top-left corner
        context.fillStyle = touchHandler.isTouching ? '#00ff00' : '#666';
        context.font = '12px Arial';
        context.textAlign = 'left';
        context.fillText('TOUCH', 10, 20);
        
        // Show firing indicator
        if (touchHandler.isTouching) {
            context.fillStyle = '#ff0000';
            context.fillText('FIRING', 10, 35);
        }
    }
}

export { HUD };

