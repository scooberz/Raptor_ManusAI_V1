/**
 * HUD class
 * Handles the heads-up display for the game
 */
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
        // Make sure we have a player reference
        if (!this.game.player) return;
        
        // Load assets if needed
        if (!this.healthBar) {
            this.loadAssets();
        }
        
        // Render health bar
        this.renderHealthBar(context);
        
        // Render shield bar
        this.renderShieldBar(context);
        
        // Render score and money
        this.renderStats(context);
        
        // Render weapon info
        this.renderWeaponInfo(context);
        
        // Render megabombs
        this.renderMegabombs(context);
    }
    
    /**
     * Render health bar
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderHealthBar(context) {
        const player = this.game.player;
        const barWidth = 200;
        const barHeight = 20;
        const barX = 20;
        const barY = 20;
        const healthPercent = player.health / player.maxHealth;
        
        if (this.healthBar) {
            // Draw health bar background
            context.drawImage(this.healthBar, barX, barY, barWidth, barHeight);
            
            // Draw health fill
            context.fillStyle = this.getHealthColor(healthPercent);
            context.fillRect(barX + 10, barY + 5, (barWidth - 20) * healthPercent, barHeight - 10);
        } else {
            // Fallback rendering if image not loaded
            // Background
            context.fillStyle = '#333';
            context.fillRect(barX, barY, barWidth, barHeight);
            
            // Health
            context.fillStyle = this.getHealthColor(healthPercent);
            context.fillRect(barX, barY, barWidth * healthPercent, barHeight);
            
            // Border
            context.strokeStyle = 'white';
            context.lineWidth = 2;
            context.strokeRect(barX, barY, barWidth, barHeight);
        }
        
        // Health text
        context.fillStyle = 'white';
        context.font = '14px Arial';
        context.textAlign = 'left';
        context.fillText(`Health: ${Math.floor(player.health)}/${player.maxHealth}`, barX + 10, barY + barHeight + 15);
    }
    
    /**
     * Render shield bar
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderShieldBar(context) {
        const player = this.game.player;
        const barWidth = 200;
        const barHeight = 20;
        const barX = 20;
        const barY = 60;
        const shieldPercent = player.shield / player.maxShield;
        
        if (this.shieldBar) {
            // Draw shield bar background
            context.drawImage(this.shieldBar, barX, barY, barWidth, barHeight);
            
            // Draw shield fill
            context.fillStyle = 'rgba(0, 100, 255, 0.8)';
            context.fillRect(barX + 10, barY + 5, (barWidth - 20) * shieldPercent, barHeight - 10);
        } else {
            // Fallback rendering if image not loaded
            // Background
            context.fillStyle = '#333';
            context.fillRect(barX, barY, barWidth, barHeight);
            
            // Shield
            context.fillStyle = 'rgba(0, 100, 255, 0.8)';
            context.fillRect(barX, barY, barWidth * shieldPercent, barHeight);
            
            // Border
            context.strokeStyle = 'white';
            context.lineWidth = 2;
            context.strokeRect(barX, barY, barWidth, barHeight);
        }
        
        // Shield text
        context.fillStyle = 'white';
        context.font = '14px Arial';
        context.textAlign = 'left';
        context.fillText(`Shield: ${Math.floor(player.shield)}/${player.maxShield}`, barX + 10, barY + barHeight + 15);
    }
    
    /**
     * Render score and money
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderStats(context) {
        const player = this.game.player;
        
        // Score
        context.fillStyle = 'white';
        context.font = '18px Arial';
        context.textAlign = 'right';
        context.fillText(`Score: ${player.score}`, this.game.width - 20, 30);
        
        // Money
        context.fillStyle = '#ffcc00';
        context.fillText(`$${player.money}`, this.game.width - 20, 60);
    }
    
    /**
     * Render weapon information
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    renderWeaponInfo(context) {
        const player = this.game.player;
        const x = 20;
        const y = this.game.height - 60;
        
        // Primary weapon
        context.fillStyle = 'white';
        context.font = '16px Arial';
        context.textAlign = 'left';
        context.fillText(`Primary: ${this.getWeaponName(player.weapons.primary.type)} Lv.${player.weapons.primary.level}`, x, y);
        
        // Special weapon
        const specialWeapon = player.weapons.special.type ? this.getWeaponName(player.weapons.special.type) : 'None';
        context.fillText(`Special: ${specialWeapon}`, x, y + 25);
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
            case 'laser': return 'Laser';
            case 'missile': return 'Missile';
            case 'plasma': return 'Plasma Cannon';
            default: return type;
        }
    }
}

