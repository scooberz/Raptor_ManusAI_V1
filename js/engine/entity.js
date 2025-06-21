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
        this.layer = null; // Should be set by subclasses
        this.id = Math.random(); // A simple unique identifier
        
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
            // Use the 5-argument version of drawImage for non-spritesheet images
            context.drawImage(
                this.sprite,
                Math.floor(this.x),
                Math.floor(this.y),
                this.width,
                this.height
            );
        } else {
            // Default rendering for debugging
            context.fillStyle = 'magenta';
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
}

/**
 * EntityManager class
 * Manages all game entities
 */
class EntityManager {
    constructor(game) {
        this.game = game;
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
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            
            if (entity.active) {
                entity.update(deltaTime);
            }
            
            if (!entity.active) {
                // Also remove from collision system when destroyed
                if (this.game.collision) {
                    this.game.collision.remove(entity);
                }
                this.entities.splice(i, 1);
            }
        }
    }
    
    /**
     * Render all active entities on their appropriate canvas layers
     * @param {Object} contexts - The canvas rendering contexts
     */
    render(contexts) {
        // Render entities based on their layer property
        this.entities.forEach(entity => {
            if (entity.active && entity.layer && contexts[entity.layer]) {
                entity.render(contexts[entity.layer]);
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
}

export { Entity, EntityManager };