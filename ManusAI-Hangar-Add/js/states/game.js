/**
 * GameState class
 * Handles the main gameplay state
 */
class GameState {
    constructor(game) {
        this.game = game;
        this.level = 1;
        this.player = null;
        this.currentLevel = null;
        this.hud = null;
        this.gameTime = 0;
        this.levelComplete = false;
        this.levelCompleteTime = 0;
        this.levelCompleteDelay = 3000; // 3 seconds before next level
    }
    
    /**
     * Enter the game state
     */
    enter() {
        console.log('Entering Game State');
        
        // Initialize game components
        this.initializeGame();
    }
    
    /**
     * Initialize game components
     */
    initializeGame() {
        // Clear any existing entities
        this.game.entityManager.clear();
        this.game.collision.clearAll();
        
        // Create player
        this.player = new Player(this.game, this.game.width / 2 - 32, this.game.height - 100);
        this.player.loadSprites();
        this.game.entityManager.add(this.player);
        this.game.collision.addToGroup(this.player, 'player');
        
        // Store player reference in game for easy access
        this.game.player = this.player;
        
        // Create HUD
        this.hud = new HUD(this.game);
        
        // Initialize the current level
        this.initializeLevel();
        
        // Reset game state
        this.gameTime = 0;
        this.levelComplete = false;
    }
    
    /**
     * Initialize the current level
     */
    initializeLevel() {
        // Create the appropriate level based on the current level number
        if (this.level === 1) {
            this.currentLevel = new Level1(this.game);
        } else if (this.level === 2) {
            this.currentLevel = new Level2(this.game);
        } else {
            console.error(`Invalid level number: ${this.level}`);
            return;
        }
        
        // Initialize the level
        this.currentLevel.init();
    }
    
    /**
     * Update the game state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Update game time
        this.gameTime += deltaTime;
        
        // Update current level
        if (this.currentLevel) {
            this.currentLevel.update(deltaTime);
        }
        
        // Update entities
        this.game.entityManager.update(deltaTime);
        
        // Check collisions
        this.game.collision.checkCollisions();
        
        // Check for level completion
        if (this.currentLevel && this.currentLevel.isComplete() && !this.levelComplete) {
            this.levelComplete = true;
            this.levelCompleteTime = this.gameTime;
        }
        
        // Handle level completion
        if (this.levelComplete) {
            if (this.gameTime - this.levelCompleteTime > this.levelCompleteDelay) {
                this.completeLevel();
            }
        }
        
        // Check for game over
        if (!this.player.active) {
            this.game.changeState('gameover');
        }
        
        // Check for pause
        if (this.game.input.isKeyPressed('Escape') || this.game.input.isKeyPressed('p')) {
            this.game.changeState('pause');
        }
    }
    
    /**
     * Render the game state
     */
    render() {
        // Render current level
        if (this.currentLevel) {
            this.currentLevel.render();
        }
        
        // Render entities using appropriate layers
        // Enemies
        const enemies = this.game.collision.collisionGroups.enemies;
        enemies.forEach(enemy => {
            enemy.render(this.game.layers.enemy);
        });
        
        // Player
        if (this.player.active) {
            this.player.render(this.game.layers.player);
        }
        
        // Projectiles
        const playerProjectiles = this.game.collision.collisionGroups.playerProjectiles;
        const enemyProjectiles = this.game.collision.collisionGroups.enemyProjectiles;
        
        playerProjectiles.forEach(projectile => {
            projectile.render(this.game.layers.projectile);
        });
        
        enemyProjectiles.forEach(projectile => {
            projectile.render(this.game.layers.projectile);
        });
        
        // Collectibles
        const collectibles = this.game.collision.collisionGroups.collectibles;
        collectibles.forEach(collectible => {
            collectible.render(this.game.layers.projectile);
        });
        
        // Explosions
        const explosions = this.game.entityManager.getEntitiesByType(Explosion);
        explosions.forEach(explosion => {
            explosion.render(this.game.layers.explosion);
        });
        
        // Render HUD
        this.hud.render(this.game.layers.ui);
        
        // Render level complete message if needed
        if (this.levelComplete) {
            this.renderLevelComplete();
        }
    }
    
    /**
     * Render level complete message
     */
    renderLevelComplete() {
        const ctx = this.game.layers.ui;
        
        // Create semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw level complete message
        ctx.fillStyle = '#ffcc00';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Level ${this.level} Complete!`, this.game.width / 2, this.game.height / 2 - 20);
        
        // Draw loading next level message
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('Loading next level...', this.game.width / 2, this.game.height / 2 + 30);
    }
    
    /**
     * Complete the current level and move to the next
     */
    completeLevel() {
        // Clean up current level
        if (this.currentLevel) {
            this.currentLevel.cleanup();
        }
        
        this.level++;
        
        if (this.level > 2) {
            // Game complete - only implementing 2 levels for now
            this.game.changeState('gameover');
        } else {
            // Start next level
            this.initializeGame();
        }
    }
    
    /**
     * Exit the game state
     */
    exit() {
        console.log('Exiting Game State');
        
        // Clean up current level
        if (this.currentLevel) {
            this.currentLevel.cleanup();
        }
        
        // Clear references
        this.game.player = null;
        this.currentLevel = null;
    }
}

