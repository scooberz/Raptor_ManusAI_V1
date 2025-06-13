/**
 * Explosion class
 * Represents explosion effects
 */
class Explosion extends Entity {
    constructor(game, x, y, width, height) {
        super(game, x, y, width, height);
        this.layer = 'explosion';
        
        // Animation properties
        this.sprites = [];
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrames = 8;
        this.frameTimer = 0;
        this.frameInterval = 80; // Faster animation for explosions
        this.currentFrame = 0;
        
        // Load explosion sprites
        this.loadSprites();
    }
    
    /**
     * Load explosion sprites
     */
    loadSprites() {
        // In a real implementation, we would load multiple explosion frames
        // For now, we'll use the two frames we have
        this.sprites.push(this.game.assets.getImage('explosion1'));
        this.sprites.push(this.game.assets.getImage('explosion2'));
    }
    
    /**
     * Update explosion state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Update animation
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.currentFrame++;
            
            // Destroy when animation is complete
            if (this.currentFrame >= this.sprites.length) {
                this.destroy();
            }
        }
    }
    
    /**
     * Render the explosion
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    render(context) {
        if (this.currentFrame < this.sprites.length) {
            const sprite = this.sprites[this.currentFrame];
            
            if (sprite) {
                // Add light blend mode for more dramatic effect
                context.globalCompositeOperation = 'lighter';
                
                context.drawImage(
                    sprite,
                    0,
                    0,
                    sprite.width,
                    sprite.height,
                    Math.floor(this.x),
                    Math.floor(this.y),
                    this.width,
                    this.height
                );
                
                // Reset composite operation
                context.globalCompositeOperation = 'source-over';
            }
        }
    }
}

