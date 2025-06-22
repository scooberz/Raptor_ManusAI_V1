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
            collectibles: [],
            environment: [] // NEW from ManusAI
        };
    }
    
    addToGroup(entity, groupName) {
        if (this.collisionGroups[groupName]) {
            this.collisionGroups[groupName].push(entity);
        }
    }
    
    removeFromGroup(entity, groupName) {
        if (this.collisionGroups[groupName]) {
            const index = this.collisionGroups[groupName].indexOf(entity);
            if (index !== -1) {
                this.collisionGroups[groupName].splice(index, 1);
            }
        }
    }
    
    // This is the essential remove function from your existing code
    remove(entity) {
        for (const groupName in this.collisionGroups) {
            this.removeFromGroup(entity, groupName);
        }
    }
    
    checkCollisions() {
        // Player vs Enemy Projectiles
        this.checkGroupCollision(this.collisionGroups.player, this.collisionGroups.enemyProjectiles, this.handlePlayerEnemyProjectileCollision.bind(this));
        
        // Player vs Enemies
        this.checkGroupCollision(this.collisionGroups.player, this.collisionGroups.enemies, this.handlePlayerEnemyCollision.bind(this));
        
        // Player Projectiles vs Enemies (including missiles)
        this.checkGroupCollision(this.collisionGroups.playerProjectiles, this.collisionGroups.enemies, this.handlePlayerProjectileEnemyCollision.bind(this));
        
        // Regular Player Projectiles vs Environment Objects (excluding missiles)
        this.checkGroupCollision(this.collisionGroups.playerProjectiles, this.collisionGroups.environment, this.handlePlayerProjectileEnvironmentCollision.bind(this));

        // Player vs Collectibles
        this.checkGroupCollision(this.collisionGroups.player, this.collisionGroups.collectibles, this.handlePlayerCollectibleCollision.bind(this));
    }
    
    // This is your superior, backward-looping version of this method
    checkGroupCollision(groupA, groupB, handler) {
        for (let i = groupA.length - 1; i >= 0; i--) {
            for (let j = groupB.length - 1; j >= 0; j--) {
                const entityA = groupA[i];
                const entityB = groupB[j];
                if (entityA && entityB && entityA.active && entityB.active) {
                    if (this.checkAABBCollision(entityA, entityB)) {
                        handler(entityA, entityB);
                    }
                }
            }
        }
    }
    
    checkAABBCollision(entityA, entityB) {
        return (
            entityA.x < entityB.x + entityB.width &&
            entityA.x + entityA.width > entityB.x &&
            entityA.y < entityB.y + entityB.height &&
            entityA.y + entityA.height > entityB.y
        );
    }
    
    handlePlayerEnemyProjectileCollision(player, projectile) {
        player.takeDamage(projectile.damage);
        this.removeFromGroup(projectile, 'enemyProjectiles');
        projectile.destroy();
    }
    
    handlePlayerEnemyCollision(player, enemy) {
        player.takeDamage(enemy.collisionDamage);
        enemy.takeDamage(player.collisionDamage);
    }
    
    handlePlayerProjectileEnemyCollision(projectile, enemy) {
        enemy.takeDamage(projectile.damage);
        
        // Check if this is a missile and handle special missile behavior
        if (projectile.onHitTarget && typeof projectile.onHitTarget === 'function') {
            projectile.onHitTarget(enemy);
        } else {
            // Standard projectile behavior
            this.removeFromGroup(projectile, 'playerProjectiles');
            projectile.destroy();
        }
    }
    
    // This new handler function is from ManusAI
    handlePlayerProjectileEnvironmentCollision(projectile, envObject) {
        // Skip missiles - they only affect air targets
        if (projectile.constructor.name === 'Missile') {
            return;
        }
        
        envObject.takeDamage(projectile.damage, projectile);
        this.removeFromGroup(projectile, 'playerProjectiles');
        projectile.destroy();
    }

    handlePlayerCollectibleCollision(player, collectible) {
        collectible.collect(player);
        this.removeFromGroup(collectible, 'collectibles');
        collectible.destroy();
    }
    
    // Added this useful utility method from the AI's version
    clearAll() {
        Object.keys(this.collisionGroups).forEach(key => {
            this.collisionGroups[key] = [];
        });
    }
}

export { CollisionSystem };