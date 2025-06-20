/**
 * Entity class
 * Base class for all game entities
 */
class Entity {
    constructor(game, x, y, width, height) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.active = true;
        
        // Animation properties
        this.sprite = null;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrames = 1;
        this.frameTimer = 0;
        this.frameInterval = 100; // milliseconds
    }
    
    /**
     * Update the entity state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Update position based on velocity
        this.x += this.velocityX * (deltaTime / 1000);
        this.y += this.velocityY * (deltaTime / 1000);
        
        // Update animation if sprite exists
        if (this.sprite && this.maxFrames > 1) {
            this.frameTimer += deltaTime;
            if (this.frameTimer >= this.frameInterval) {
                this.frameTimer = 0;
                this.frameX = (this.frameX + 1) % this.maxFrames;
            }
        }
    }
    
    /**
     * Render the entity
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    render(context) {
        if (this.sprite) {
            context.drawImage(
                this.sprite,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width,
                this.height,
                Math.floor(this.x),
                Math.floor(this.y),
                this.width,
                this.height
            );
        } else {
            // Default rendering for debugging
            context.fillStyle = 'red';
            context.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
        }
    }
    
    /**
     * Mark the entity for destruction
     */
    destroy() {
        this.active = false;
    }
    
    /**
     * Get the center position of the entity
     * @returns {Object} The center position {x, y}
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
    
    /**
     * Check if the entity is off screen
     * @returns {boolean} True if off screen, false otherwise
     */
    isOffScreen() {
        return (
            this.x + this.width < 0 ||
            this.x > this.game.width ||
            this.y + this.height < 0 ||
            this.y > this.game.height + 100 // Allow some extra space below screen
        );
    }
}

/**
 * EntityManager class
 * Manages all game entities
 */
class EntityManager {
    constructor() {
        this.entities = [];
    }
    
    /**
     * Add an entity to the manager
     * @param {Entity} entity - The entity to add
     * @returns {Entity} The added entity
     */
    add(entity) {
        this.entities.push(entity);
        return entity;
    }
    
    /**
     * Update all entities
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Update entities and remove inactive ones
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            
            if (entity.active) {
                entity.update(deltaTime);
                
                // Remove entities that are off screen
                if (entity.isOffScreen && entity.isOffScreen()) {
                    entity.destroy();
                }
            }
            
            if (!entity.active) {
                this.entities.splice(i, 1);
            }
        }
    }
    
    /**
     * Render all entities
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    render(context) {
        this.entities.forEach(entity => {
            if (entity.active) {
                entity.render(context);
            }
        });
    }
    
    /**
     * Get all entities of a specific type
     * @param {Function} type - The constructor function of the entity type
     * @returns {Array} Array of entities of the specified type
     */
    getEntitiesByType(type) {
        return this.entities.filter(entity => entity instanceof type && entity.active);
    }
    
    /**
     * Clear all entities
     */
    clear() {
        this.entities = [];
    }
    
    /**
     * Get the count of active entities
     * @returns {number} The count of active entities
     */
    getActiveCount() {
        return this.entities.filter(entity => entity.active).length;
    }
}

