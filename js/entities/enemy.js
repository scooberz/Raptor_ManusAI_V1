class Enemy extends Entity {
    constructor(game, x, y, type, health, scoreValue, collisionDamage) {
        // This is a static map to hold default stats for different enemy types
        // We will define it outside the constructor after the class definition
        const stats = Enemy.stats[type] || {};
        const width = stats.width || 48;
        const height = stats.height || 48;

        super(game, x, y, width, height);
        this.layer = 'enemy';
        this.game = game; // Ensure game context is set

        // Assign properties, prioritizing data passed from the spawner
        this.type = type;
        this.health = health !== undefined ? health : (stats.health || 20);
        this.maxHealth = this.health;
        this.scoreValue = scoreValue !== undefined ? scoreValue : (stats.points || 100);
        this.moneyValue = stats.moneyValue || 25;
        this.collisionDamage = collisionDamage !== undefined ? collisionDamage : (stats.collisionDamage || 20);

        // Default movement and weapon properties
        this.velocityY = 100;
        this.pattern = 'straight';
        this.patternParams = {};
        this.canFire = false;
        this.fireRate = 0;
        this.lastFired = 0;

        // Visual effect properties
        this.hitTime = 0;
        this.hitDuration = 100;
        this.hit = false;
    }
/**
     * Sets the movement pattern for the enemy.
     * This method is called by the EnemyFactory after the enemy is created.
     * @param {string} pattern - The name of the pattern (e.g., 'straight', 'zigzag').
     * @param {Object} params - An object containing specific parameters for that pattern.
     */
setMovementPattern(pattern, params) {
    this.pattern = pattern;
    this.patternParams = params || {};
}
    // This method is called by the collision handler
    takeDamage(damage) {
        this.health -= damage;
        this.hit = true;
        this.hitTime = 0;
    }

    update(deltaTime) {
        // --- PRIMARY LOGIC ---

        // 1. Check for death. This is the single source of truth for the death sequence.
        if (this.health <= 0 && this.active) {
            // Deactivate first to prevent this code from running more than once.
            this.active = false;

            // Add score and money to the player
            if (this.game && this.game.player) {
                this.game.player.addScore(this.scoreValue);
                this.game.player.addMoney(this.moneyValue);
            }

            // Create an explosion at this enemy's position
            this.game.entityManager.add(new Explosion(this.game, this.x, this.y, this.width, this.height));

            // THIS IS THE FIX: Use the direct this.level reference to set the flag.
            if (this.isBoss && this.level) {
                this.level.bossDefeated = true;
            }

            // Stop any further updates for this dead enemy
            return;
        }

        // 2. If not dead, update movement and firing
        this.updateMovement(deltaTime);
        if (this.canFire) {
            this.updateFiring(deltaTime);
        }

        // 3. Update visual hit effect
        if (this.hit) {
            this.hitTime += deltaTime;
            if (this.hitTime >= this.hitDuration) {
                this.hit = false;
                this.hitTime = 0; // Reset timer
            }
        }

        // 4. Remove if far off-screen
        if (this.y > this.game.height + 200) {
            this.destroy();
        }

        // --- LAST STEP: Call the base Entity's update method ---
        // This is moved to the end to fix the race condition.
        super.update(deltaTime);
    }

    // Placeholder methods for movement and firing - assuming these exist elsewhere
    // If they don't, this code won't error out.
    updateMovement(deltaTime) {
        // Your existing movement logic (straight, zigzag, etc.) goes here.
        // For now, we'll just use the basic velocity from the parent.
    }

    updateFiring(deltaTime) {
        // Your existing firing logic goes here.
    }
}

// Define the static stats object for different enemy types
// This should eventually be loaded from a JSON file, but is here for now.
Enemy.stats = {
    fighter: {
        health: 20,
        points: 100,
        collisionDamage: 20,
        width: 48,
        height: 48
    }
    // Add other enemy types here, e.g., 'bomber', 'interceptor'
};