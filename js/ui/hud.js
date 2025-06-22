/**
 * HUD class
 * Handles the heads-up display for the game
 * Updated to remove duplicate weapon displays
 */
import { Boss1 } from '../entities/boss1.js';
class HUD {
    constructor(game) {
        this.game = game;
        this.healthBar = null;
        this.shieldBar = null;
    }
    
    /**
     * Load HUD assets
     */
    loadAssets() {
        this.healthBar = this.game.assets.getImage('healthBar');
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
        
        // Render shield bar
        this.renderShieldBar(context);
        
        // Render score and money
        this.renderStats(context);
        
        // Render megabomb count
        this.renderMegabombs(context);
        
        // Render missile UI
        this.renderMissileUI(context);
    }
    
    /**
     * Render health bar
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderHealthBar(context) {
        const player = this.game.player;
        const healthBarWidth = 200;
        const healthBarHeight = 20;
        const healthBarX = 10; // Top left
        const healthBarY = 10;
        
        // Health bar background
        context.fillStyle = '#333';
        context.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Health bar fill
        const healthPercentage = player.health / player.maxHealth;
        context.fillStyle = healthPercentage > 0.5 ? '#0f0' : healthPercentage > 0.25 ? '#ff0' : '#f00';
        context.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
        
        // Health text
        context.fillStyle = '#fff';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText(`Health: ${player.health}/${player.maxHealth}`, healthBarX + healthBarWidth / 2, healthBarY + 15);
    }
    
    /**
     * Render shield bar
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderShieldBar(context) {
        const player = this.game.player;
        const shieldBarWidth = 200;
        const shieldBarHeight = 20;
        const shieldBarX = 10; // Top left
        const shieldBarY = 40; // Below health bar
        
        // Shield bar background
        context.fillStyle = '#333';
        context.fillRect(shieldBarX, shieldBarY, shieldBarWidth, shieldBarHeight);
        
        // Shield bar fill
        const shieldPercentage = player.shield / player.maxShield;
        context.fillStyle = '#00f';
        context.fillRect(shieldBarX, shieldBarY, shieldBarWidth * shieldPercentage, shieldBarHeight);
        
        // Shield text
        context.fillStyle = '#fff';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText(`Shield: ${player.shield}/${player.maxShield}`, shieldBarX + shieldBarWidth / 2, shieldBarY + 15);
    }
    
    /**
     * Render score and money
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderStats(context) {
        const player = this.game.player;
        
        // Score and Money - top right
        context.fillStyle = '#fff';
        context.font = '20px Arial';
        context.textAlign = 'right';
        context.fillText(`Score: ${this.game.score || 0}`, this.game.width - 10, 25);
        
        // Money - top right below score
        context.fillStyle = '#ffcc00';
        context.fillText(`$${player.money || 0}`, this.game.width - 10, 50);
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
        // Find active boss in entity manager
        const boss = this.game.entityManager.getEntitiesByType(Boss1).find(b => b.active);
        if (!boss) return;

        const barWidth = this.game.width * 0.8;
        const barHeight = 30;
        const barX = (this.game.width - barWidth) / 2;
        const barY = 20;
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
}

export { HUD };

