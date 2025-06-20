/**
 * CollisionSystem class
 * Handles collision detection between game entities
 */
class CollisionSystem {
    constructor() {
        this.collisionGroups = {
            player: [],
            playerProjectiles: [],
            enemies: [],
            enemyProjectiles: [],
            collectibles: []
        };
    }
    
    /**
     * Add an entity to a collision group
     * @param {Entity} entity - The entity to add
     * @param {string} groupName - The name of the group to add to
     */
    addToGroup(entity, groupName) {
        if (this.collisionGroups[groupName]) {
            this.collisionGroups[groupName].push(entity);
        }
    }
    
    /**
     * Remove an entity from a collision group
     * @param {Entity} entity - The entity to remove
     * @param {string} groupName - The name of the group to remove from
     */
    removeFromGroup(entity, groupName) {
        if (this.collisionGroups[groupName]) {
            const index = this.collisionGroups[groupName].indexOf(entity);
            if (index !== -1) {
                this.collisionGroups[groupName].splice(index, 1);
            }
        }
    }
    
    /**
     * Check for collisions between all relevant groups
     */
    checkCollisions() {
        // Player vs Enemy Projectiles
        this.checkGroupCollision(
            this.collisionGroups.player,
            this.collisionGroups.enemyProjectiles,
            this.handlePlayerEnemyProjectileCollision.bind(this)
        );
        
        // Player vs Enemies
        this.checkGroupCollision(
            this.collisionGroups.player,
            this.collisionGroups.enemies,
            this.handlePlayerEnemyCollision.bind(this)
        );
        
        // Player Projectiles vs Enemies
        this.checkGroupCollision(
            this.collisionGroups.playerProjectiles,
            this.collisionGroups.enemies,
            this.handlePlayerProjectileEnemyCollision.bind(this)
        );
        
        // Player vs Collectibles
        this.checkGroupCollision(
            this.collisionGroups.player,
            this.collisionGroups.collectibles,
            this.handlePlayerCollectibleCollision.bind(this)
        );
    }
    
    /**
     * Check for collisions between two groups of entities
     * @param {Array} groupA - First group of entities
     * @param {Array} groupB - Second group of entities
     * @param {Function} handler - Collision handler function
     */
    checkGroupCollision(groupA, groupB, handler) {
        for (let i = 0; i < groupA.length; i++) {
            for (let j = 0; j < groupB.length; j++) {
                if (groupA[i].active && groupB[j].active && this.checkAABBCollision(groupA[i], groupB[j])) {
                    handler(groupA[i], groupB[j]);
                }
            }
        }
    }
    
    /**
     * Check for Axis-Aligned Bounding Box collision between two entities
     * @param {Entity} entityA - First entity
     * @param {Entity} entityB - Second entity
     * @returns {boolean} True if collision detected, false otherwise
     */
    checkAABBCollision(entityA, entityB) {
        return (
            entityA.x < entityB.x + entityB.width &&
            entityA.x + entityA.width > entityB.x &&
            entityA.y < entityB.y + entityB.height &&
            entityA.y + entityA.height > entityB.y
        );
    }
    
    /**
     * Handle collision between player and enemy projectile
     * @param {Player} player - The player entity
     * @param {Projectile} projectile - The enemy projectile entity
     */
    handlePlayerEnemyProjectileCollision(player, projectile) {
        player.takeDamage(projectile.damage);
        this.removeFromGroup(projectile, 'enemyProjectiles');
        projectile.destroy();
    }
    
    /**
     * Handle collision between player and enemy
     * @param {Player} player - The player entity
     * @param {Enemy} enemy - The enemy entity
     */
    handlePlayerEnemyCollision(player, enemy) {
        player.takeDamage(enemy.collisionDamage);
        enemy.takeDamage(player.collisionDamage);
    }
    
    /**
     * Handle collision between player projectile and enemy
     * @param {Projectile} projectile - The player projectile entity
     * @param {Enemy} enemy - The enemy entity
     */
    handlePlayerProjectileEnemyCollision(projectile, enemy) {
        enemy.takeDamage(projectile.damage);
        this.removeFromGroup(projectile, 'playerProjectiles');
        projectile.destroy();
    }
    
    /**
     * Handle collision between player and collectible
     * @param {Player} player - The player entity
     * @param {Collectible} collectible - The collectible entity
     */
    handlePlayerCollectibleCollision(player, collectible) {
        collectible.collect(player);
        this.removeFromGroup(collectible, 'collectibles');
        collectible.destroy();
    }
    
    /**
     * Clear all collision groups
     */
    clearAll() {
        Object.keys(this.collisionGroups).forEach(key => {
            this.collisionGroups[key] = [];
        });
    }
}

