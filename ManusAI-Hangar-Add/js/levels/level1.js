/**
 * Level1 class
 * Implements the first level of the game
 */
class Level1 {
    constructor(game) {
        this.game = game;
        this.levelData = null;
        this.background = null;
        this.enemyFactory = null;
        this.spawnQueue = [];
        this.collectibleQueue = [];
        this.waveIndex = 0;
        this.levelTime = 0;
        this.waveStartTime = 0;
        this.bossSpawned = false;
        this.bossDefeated = false;
        this.levelComplete = false;
    }
    
    /**
     * Initialize the level
     */
    init() {
        // Load level data
        this.loadLevelData();
        
        // Create scrolling background
        this.background = new ScrollingBackground(this.game, 50, 1);
        
        // Create enemy factory
        this.enemyFactory = new EnemyFactory(this.game);
        
        // Reset level state
        this.spawnQueue = [];
        this.collectibleQueue = [];
        this.waveIndex = 0;
        this.levelTime = 0;
        this.waveStartTime = 0;
        this.bossSpawned = false;
        this.bossDefeated = false;
        this.levelComplete = false;
        
        // Play level music
        this.game.audio.playMusic('gameMusic1');
    }
    
    /**
     * Load level data
     */
    loadLevelData() {
        // In a real implementation, this would load from the JSON file
        // For now, we'll use the hardcoded data
        this.levelData = {
            "level": 1,
            "name": "Bravo Sector - Wave 1",
            "background": "backgroundLevel1",
            "music": "gameMusic1",
            "waves": [
                {
                    "id": 1,
                    "name": "Initial Fighters",
                    "duration": 10000,
                    "enemies": [
                        { "type": "fighter", "x": 100, "y": -50, "delay": 0 },
                        { "type": "fighter", "x": 300, "y": -50, "delay": 500 },
                        { "type": "fighter", "x": 500, "y": -50, "delay": 1000 },
                        { "type": "fighter", "x": 700, "y": -50, "delay": 1500 }
                    ]
                },
                {
                    "id": 2,
                    "name": "Fighters and Turrets",
                    "duration": 15000,
                    "enemies": [
                        { "type": "turret", "x": 200, "y": -50, "delay": 0 },
                        { "type": "turret", "x": 600, "y": -50, "delay": 0 },
                        { "type": "fighter", "x": 300, "y": -100, "delay": 2000 },
                        { "type": "fighter", "x": 500, "y": -100, "delay": 2000 },
                        { "type": "fighter", "x": 400, "y": -150, "delay": 4000 }
                    ]
                },
                {
                    "id": 3,
                    "name": "Boss Wave",
                    "duration": 30000,
                    "enemies": [
                        { "type": "boss1", "x": 336, "y": -150, "delay": 2000 }
                    ]
                }
            ],
            "collectibles": [
                { "type": "health", "x": 200, "y": -200, "delay": 5000 },
                { "type": "shield", "x": 600, "y": -300, "delay": 10000 },
                { "type": "megabomb", "x": 400, "y": -400, "delay": 15000 }
            ]
        };
    }
    
    /**
     * Update the level
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Update level time
        this.levelTime += deltaTime;
        
        // Update background
        this.background.update(deltaTime);
        
        // Process current wave
        this.updateWave(deltaTime);
        
        // Process collectibles
        this.updateCollectibles(deltaTime);
        
        // Check for level completion
        this.checkLevelCompletion();
    }
    
    /**
     * Update the current wave
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateWave(deltaTime) {
        if (this.waveIndex >= this.levelData.waves.length) {
            return;
        }
        
        const currentWave = this.levelData.waves[this.waveIndex];
        const waveTime = this.levelTime - this.waveStartTime;
        
        // Process enemy spawns for current wave
        currentWave.enemies.forEach(enemy => {
            if (enemy.delay <= waveTime && !enemy.spawned) {
                this.spawnEnemy(enemy);
                enemy.spawned = true;
                
                // Check if boss was spawned
                if (enemy.type.includes('boss')) {
                    this.bossSpawned = true;
                }
            }
        });
        
        // Check if wave is complete
        if (waveTime >= currentWave.duration) {
            // Check if all enemies from this wave are defeated
            const allEnemiesDefeated = currentWave.enemies.every(enemy => {
                return enemy.spawned && !this.isEnemyActive(enemy);
            });
            
            if (allEnemiesDefeated) {
                this.advanceToNextWave();
            }
        }
    }
    
    /**
     * Update collectibles
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateCollectibles(deltaTime) {
        this.levelData.collectibles.forEach(collectible => {
            if (collectible.delay <= this.levelTime && !collectible.spawned) {
                this.spawnCollectible(collectible);
                collectible.spawned = true;
            }
        });
    }
    
    /**
     * Spawn an enemy
     * @param {Object} enemyData - Enemy data object
     */
    spawnEnemy(enemyData) {
        this.enemyFactory.createEnemy(enemyData.type, enemyData.x, enemyData.y);
    }
    
    /**
     * Spawn a collectible
     * @param {Object} collectibleData - Collectible data object
     */
    spawnCollectible(collectibleData) {
        const collectible = new Collectible(
            this.game,
            collectibleData.x,
            collectibleData.y,
            30,
            30,
            collectibleData.type,
            collectibleData.type === 'megabomb' ? 1 : 20
        );
        
        this.game.entityManager.add(collectible);
        this.game.collision.addToGroup(collectible, 'collectibles');
    }
    
    /**
     * Check if an enemy is still active
     * @param {Object} enemyData - Enemy data object
     * @returns {boolean} True if enemy is active, false otherwise
     */
    isEnemyActive(enemyData) {
        // Check if any enemies of this type are still active at the spawn position
        const enemies = this.game.collision.collisionGroups.enemies;
        return enemies.some(enemy => {
            return enemy.type === enemyData.type && 
                   Math.abs(enemy.x - enemyData.x) < 10 && 
                   enemy.active;
        });
    }
    
    /**
     * Advance to the next wave
     */
    advanceToNextWave() {
        this.waveIndex++;
        this.waveStartTime = this.levelTime;
        
        // Log wave change
        if (this.waveIndex < this.levelData.waves.length) {
            console.log(`Starting Wave ${this.waveIndex + 1}: ${this.levelData.waves[this.waveIndex].name}`);
        }
    }
    
    /**
     * Check if the level is complete
     */
    checkLevelCompletion() {
        // Level is complete when all waves are processed and boss is defeated
        if (this.waveIndex >= this.levelData.waves.length && this.bossSpawned) {
            // Check if boss is defeated
            const bossAlive = this.game.collision.collisionGroups.enemies.some(enemy => {
                return enemy.type === 'boss1' && enemy.active;
            });
            
            if (!bossAlive) {
                this.bossDefeated = true;
                this.levelComplete = true;
            }
        }
    }
    
    /**
     * Check if the level is complete
     * @returns {boolean} True if level is complete, false otherwise
     */
    isComplete() {
        return this.levelComplete;
    }
    
    /**
     * Render the level
     */
    render() {
        // Render background
        this.background.render(this.game.layers.background);
    }
    
    /**
     * Clean up the level
     */
    cleanup() {
        // Stop music
        this.game.audio.stopMusic();
    }
}

