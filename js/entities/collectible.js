/**
 * Collectible class
 * Represents collectible items like power-ups and pickups
 */
class Collectible extends Entity {
    constructor(game, x, y, width, height, type, value) {
        super(game, x, y, width, height);
        this.layer = 'projectile'; // Render on the same layer as projectiles
        
        this.type = type;
        this.value = value;
        this.velocityY = 100; // Collectibles drift downward
        
        // Animation properties
        this.sprite = null;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrames = 4;
        this.frameTimer = 0;
        this.frameInterval = 150;
        
        // Floating effect
        this.floatOffset = 0;
        this.floatSpeed = 2;
        this.floatAmount = 5;
        
        // Load appropriate sprite based on type
        this.loadSprite();
    }
    
    /**
     * Load the appropriate sprite based on type
     */
    loadSprite() {
        switch (this.type) {
            case 'health':
                this.sprite = this.game.assets.getImage('healthPickup');
                break;
            case 'shield':
                this.sprite = this.game.assets.getImage('shieldPickup');
                break;
            case 'megabomb':
                this.sprite = this.game.assets.getImage('megabombPickup');
                break;
            case 'weapon':
                // Different weapon pickups would have different sprites
                break;
            case 'money':
                // Money pickup sprite
                break;
        }
    }
    
    /**
     * Update collectible state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Update animation
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = (this.frameX + 1) % this.maxFrames;
        }
        
        // Update floating effect
        this.floatOffset = Math.sin(Date.now() / 200) * this.floatAmount;
        
        super.update(deltaTime);
        
        // Check if collectible is off screen
        if (this.y > this.game.height + this.height) {
            this.destroy();
        }
    }
    
    /**
     * Render the collectible
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    render(context) {
        const renderX = Math.floor(this.x);
        const renderY = Math.floor(this.y + this.floatOffset);
        
        if (this.sprite) {
            context.drawImage(
                this.sprite,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width,
                this.height,
                renderX,
                renderY,
                this.width,
                this.height
            );
            
            // Add glow effect
            this.renderGlow(context, renderX, renderY);
        } else {
            // Default rendering if no sprite is available
            context.fillStyle = this.getColorByType();
            context.fillRect(renderX, renderY, this.width, this.height);
        }
    }
    
    /**
     * Render glow effect around collectible
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     * @param {number} x - X position to render at
     * @param {number} y - Y position to render at
     */
    renderGlow(context, x, y) {
        const glowColor = this.getGlowColor();
        const glowSize = 10;
        
        // Save context state
        context.save();
        
        // Set composite operation for glow
        context.globalCompositeOperation = 'lighter';
        
        // Create radial gradient for glow
        const gradient = context.createRadialGradient(
            x + this.width / 2,
            y + this.height / 2,
            this.width / 3,
            x + this.width / 2,
            y + this.height / 2,
            this.width / 2 + glowSize
        );
        
        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        // Draw glow
        context.fillStyle = gradient;
        context.fillRect(
            x - glowSize,
            y - glowSize,
            this.width + glowSize * 2,
            this.height + glowSize * 2
        );
        
        // Restore context state
        context.restore();
    }
    
    /**
     * Get color based on collectible type
     * @returns {string} Color string
     */
    getColorByType() {
        switch (this.type) {
            case 'health': return 'green';
            case 'shield': return 'blue';
            case 'megabomb': return 'orange';
            case 'weapon': return 'purple';
            case 'money': return 'gold';
            default: return 'white';
        }
    }
    
    /**
     * Get glow color based on collectible type
     * @returns {string} Color string with alpha
     */
    getGlowColor() {
        switch (this.type) {
            case 'health': return 'rgba(0, 255, 0, 0.5)';
            case 'shield': return 'rgba(0, 100, 255, 0.5)';
            case 'megabomb': return 'rgba(255, 100, 0, 0.5)';
            case 'weapon': return 'rgba(200, 0, 255, 0.5)';
            case 'money': return 'rgba(255, 215, 0, 0.5)';
            default: return 'rgba(255, 255, 255, 0.5)';
        }
    }
    
    /**
     * Apply collectible effect to player
     * @param {Player} player - The player entity
     */
    collect(player) {
        switch (this.type) {
            case 'health':
                player.addHealth(this.value);
                break;
            case 'shield':
                player.addShield(this.value);
                break;
            case 'megabomb':
                player.addMegabomb();
                break;
            case 'weapon':
                // Handle weapon upgrade
                player.upgradePrimaryWeapon();
                break;
            case 'money':
                player.addMoney(this.value);
                break;
        }
        
        // Play pickup sound
        this.game.audio.playSound('pickup');
    }
}

