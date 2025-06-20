class PlayState extends GameState {
    constructor(game) {
        super(game);
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.powerups = [];
        this.explosions = [];
        this.score = 0;
        this.level = 1;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 2000; // 2 seconds
        this.background = null;
        this.backgroundSpeed = 100; // pixels per second
    }

    forceNextWave() {
        console.log("DEBUG: Forcing next wave.");
        this.enemies.forEach(enemy => enemy.destroy());
        this.enemies = [];
        this.level++;
        this.enemySpawnTimer = 0;
        console.log(`DEBUG: Advanced to level ${this.level}`);
    }

    enter() {
        console.log('Entering play state');
        // Initialize player
        this.player = new Player(this.game);
        
        // Initialize scrolling background
        this.background = new ScrollingBackground(this.game, this.backgroundSpeed);
        
        // Start spawning enemies
        this.enemySpawnTimer = 0;
    }

    update(deltaTime) {
        if (this.game.input.skipWavePressed) {
            this.forceNextWave();
            this.game.input.skipWavePressed = false;
        }

        // Update background
        this.background.update(deltaTime);
        
        // Update player
        this.player.update(deltaTime);
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        
        // Update projectiles
        this.projectiles.forEach(projectile => projectile.update(deltaTime));
        
        // Update powerups
        this.powerups.forEach(powerup => powerup.update(deltaTime));
        
        // Update explosions
        this.explosions.forEach(explosion => explosion.update(deltaTime));
        
        // Spawn enemies
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
        
        // Check collisions
        this.checkCollisions();
        
        // Remove dead entities
        this.cleanupEntities();
    }

    render() {
        const backgroundCtx = this.game.getContext('background');
        const gameCtx = this.game.getContext('game');
        const uiCtx = this.game.getContext('ui');
        
        // Clear all layers
        backgroundCtx.clearRect(0, 0, this.game.width, this.game.height);
        gameCtx.clearRect(0, 0, this.game.width, this.game.height);
        uiCtx.clearRect(0, 0, this.game.width, this.game.height);
        
        // Render background
        this.background.render(backgroundCtx);
        
        // Render game objects
        this.player.render(gameCtx);
        this.enemies.forEach(enemy => enemy.render(gameCtx));
        this.projectiles.forEach(projectile => projectile.render(gameCtx));
        this.powerups.forEach(powerup => powerup.render(gameCtx));
        this.explosions.forEach(explosion => explosion.render(gameCtx));
        
        // Render UI
        this.renderUI(uiCtx);
    }

    // ... rest of the PlayState class implementation ...
} 