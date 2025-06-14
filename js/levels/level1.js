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
        this.showBossWarning = false;
        this.bossWarningTimer = 0;
        this.bossWarningDuration = 3000;
        this.bossHealthBarFill = 0;
        this.transitioning = false;
    }
    
    /**
     * Initialize the level
     */
    init() {
        // Load level data
        this.loadLevelData();
        
        // Create scrolling background if it doesn't exist
        if (!this.background) {
            this.background = new ScrollingBackground(this.game, 50, 1);
        } else {
            // Reset background if it exists
            this.background.reset();
        }
        
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
        this.showBossWarning = false;
        this.bossWarningTimer = 0;
        this.bossHealthBarFill = 0;
        this.transitioning = false;
        
        // Play level music
        this.game.audio.playMusic('gameMusic1');
    }
    
    /**
     * Load level data
     */
    loadLevelData() {
        // Redesigned waves for a more engaging level 1 experience
        this.levelData = {
            "level": 1,
            "name": "Bravo Sector - Wave 1",
            "background": "backgroundLevel1",
            "music": "gameMusic1",
            "waves": [
                {
                    "id": 1,
                    "name": "Scout Formation",
                    "duration": 20000,
                    "enemies": [
                        // Initial gnat swarm
                        { "type": "gnat", "x": 100, "y": -50, "delay": 0 },
                        { "type": "gnat", "x": 200, "y": -50, "delay": 200 },
                        { "type": "gnat", "x": 300, "y": -50, "delay": 400 },
                        { "type": "gnat", "x": 400, "y": -50, "delay": 600 },
                        { "type": "gnat", "x": 500, "y": -50, "delay": 800 },
                        { "type": "gnat", "x": 600, "y": -50, "delay": 1000 },
                        { "type": "gnat", "x": 700, "y": -50, "delay": 1200 },
                        
                        // Dart flankers
                        { "type": "dart", "x": -48, "y": 100, "delay": 3000, "pattern": "straight", "patternParams": { "velocityX": 200, "velocityY": 0 } },
                        { "type": "dart", "x": 900, "y": 200, "delay": 3200, "pattern": "straight", "patternParams": { "velocityX": -200, "velocityY": 0 } },
                        
                        // Striker formation
                        { "type": "striker", "x": 200, "y": -100, "delay": 5000 },
                        { "type": "striker", "x": 400, "y": -120, "delay": 5200 },
                        { "type": "striker", "x": 600, "y": -100, "delay": 5400 }
                    ]
                },
                {
                    "id": 2,
                    "name": "Assault Wave",
                    "duration": 30000,
                    "enemies": [
                        // Cyclone sweepers
                        { "type": "cyclone", "x": 100, "y": -60, "delay": 0, "pattern": "sine", "patternParams": { "centerX": 100, "amplitude": 150, "frequency": 2 } },
                        { "type": "cyclone", "x": 700, "y": -60, "delay": 2000, "pattern": "sine", "patternParams": { "centerX": 700, "amplitude": 150, "frequency": 2 } },
                        
                        // Reaper ambush
                        { "type": "reaper", "x": 200, "y": -80, "delay": 4000, "pattern": "zigzag", "patternParams": { "speed": 180, "minX": 100, "maxX": 700 } },
                        { "type": "reaper", "x": 600, "y": -80, "delay": 6000, "pattern": "zigzag", "patternParams": { "speed": 180, "minX": 100, "maxX": 700 } },
                        
                        // Mine field
                        { "type": "mine", "x": 150, "y": -50, "delay": 8000 },
                        { "type": "mine", "x": 300, "y": -50, "delay": 8200 },
                        { "type": "mine", "x": 450, "y": -50, "delay": 8400 },
                        { "type": "mine", "x": 600, "y": -50, "delay": 8600 },
                        
                        // Cutter high-value target
                        { "type": "cutter", "x": 400, "y": -100, "delay": 12000, "pattern": "sine", "patternParams": { "centerX": 400, "amplitude": 200, "frequency": 1.5 } }
                    ]
                },
                {
                    "id": 3,
                    "name": "Heavy Assault",
                    "duration": 30000,
                    "enemies": [
                        // Goliath mini-boss
                        { "type": "goliath", "x": 400, "y": -150, "delay": 0 },
                        
                        // Support strikers
                        { "type": "striker", "x": 200, "y": -100, "delay": 2000 },
                        { "type": "striker", "x": 600, "y": -100, "delay": 2200 },
                        
                        // Dart escorts
                        { "type": "dart", "x": 150, "y": -80, "delay": 4000, "pattern": "protect" },
                        { "type": "dart", "x": 650, "y": -80, "delay": 4000, "pattern": "protect" },
                        
                        // Cyclone reinforcements
                        { "type": "cyclone", "x": 100, "y": -120, "delay": 8000, "pattern": "sine", "patternParams": { "centerX": 100, "amplitude": 120, "frequency": 2 } },
                        { "type": "cyclone", "x": 700, "y": -120, "delay": 8200, "pattern": "sine", "patternParams": { "centerX": 700, "amplitude": 120, "frequency": 2 } }
                    ]
                },
                {
                    "id": 4,
                    "name": "Final Assault",
                    "duration": 30000,
                    "enemies": [
                        // Mixed formation
                        { "type": "reaper", "x": 200, "y": -100, "delay": 0 },
                        { "type": "reaper", "x": 600, "y": -100, "delay": 1000 },
                        { "type": "cutter", "x": 400, "y": -150, "delay": 2000 },
                        
                        // Dart swarm
                        { "type": "dart", "x": 100, "y": -80, "delay": 4000 },
                        { "type": "dart", "x": 300, "y": -80, "delay": 4200 },
                        { "type": "dart", "x": 500, "y": -80, "delay": 4400 },
                        { "type": "dart", "x": 700, "y": -80, "delay": 4600 },
                        
                        // Mine field
                        { "type": "mine", "x": 150, "y": -50, "delay": 6000 },
                        { "type": "mine", "x": 450, "y": -50, "delay": 6200 },
                        { "type": "mine", "x": 750, "y": -50, "delay": 6400 }
                    ]
                },
                {
                    "id": 5,
                    "name": "Boss Wave",
                    "duration": 30000,
                    "enemies": [
                        { 
                            "type": "boss1", 
                            "x": 272, 
                            "y": -150, 
                            "delay": 2000,
                            "health": 750,
                            "scoreValue": 5000
                        }
                    ]
                }
            ]
        };
    }
    
   /**
 * Update the level
 * @param {number} deltaTime - Time since last update in milliseconds
 */
   update(deltaTime) {
    this.levelTime += deltaTime;
    this.background.update(deltaTime);

    // Handle the boss warning sequence
    if (this.showBossWarning) {
        this.bossWarningTimer += deltaTime;
        this.bossHealthBarFill = Math.min(1, this.bossWarningTimer / this.bossWarningDuration);

        if (this.bossWarningTimer >= this.bossWarningDuration) {
            this.showBossWarning = false;
            this.spawnBoss();
        }
    } else if (!this.bossSpawned) {
        // If no boss warning, update the regular enemy waves
        this.updateWave(deltaTime);
    }

    // This is the final, correct check for level completion.
    if (this.bossDefeated && !this.transitioning) {
        this.transitioning = true;

        // THE ULTIMATE FIX: Capture a direct reference to the state machine
        // BEFORE the delay starts. This prevents it from being lost.
        const stateMachine = this.game.stateMachine;
        
        setTimeout(() => {
            // Use the direct, "unbreakable" reference to change the state.
            this.game.changeState('hangar');
        }, 2000);
    }
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
                // Support for movement patterns
                this.spawnEnemy(enemy);
                enemy.spawned = true;
                // Do not set bossSpawned here; boss is spawned after warning
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
                
                // Check if we have now run out of normal waves
                const nextWave = this.levelData.waves[this.waveIndex];
                if (nextWave && nextWave.name === "Boss Wave") {
                    this.triggerBossWarning();
                }
            }
        }
    }
    
    /**
     * Spawn an enemy
     * @param {Object} enemyData - Enemy data object
     */
    spawnEnemy(enemyData) {
        // Extract stats from enemyData
        const stats = {
            health: enemyData.health,
            scoreValue: enemyData.scoreValue
        };

        // Pass pattern, patternParams, stats, and level reference to the factory
        this.enemyFactory.createEnemy(
            enemyData.type,
            enemyData.x,
            enemyData.y,
            enemyData.pattern,
            enemyData.patternParams,
            stats,
            this  // Pass the level instance
        );
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
        if (this.bossDefeated && !this.transitioning) {
            this.transitioning = true; // Use a flag to prevent multiple calls
            setTimeout(() => {
                this.game.stateMachine.changeState('Hangar');
            }, 3000); // 3 second delay
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
     * @param {object} contexts - Rendering contexts (e.g., { background, ui, ... })
     */
    render(contexts) {
        // Render background
        this.background.render(contexts.background);
        // Render boss warning UI
        if (this.showBossWarning) {
            const ctx = contexts.ui;
            ctx.save();
            ctx.font = 'bold 48px Arial';
            ctx.fillStyle = 'yellow';
            ctx.textAlign = 'center';
            ctx.fillText('BOSS APPROACHING', this.game.width / 2, 180);
            // Draw boss health bar at top of screen, animating fill
            const barWidth = 400;
            const barHeight = 20;
            const barX = (this.game.width - barWidth) / 2;
            const barY = 40;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            ctx.fillStyle = 'red';
            ctx.fillRect(barX, barY, barWidth * this.bossHealthBarFill, barHeight);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
            ctx.restore();
        }
    }
    
    /**
     * Clean up level resources
     */
    cleanup() {
        // Don't destroy the background, just reset it
        if (this.background) {
            this.background.reset();
        }
        
        // Clear other resources
        this.enemyFactory = null;
        this.spawnQueue = [];
        this.collectibleQueue = [];
    }
    
    // Boss warning sequence logic
    triggerBossWarning() {
        this.showBossWarning = true;
        this.bossWarningTimer = 0;
        this.bossWarningDuration = 3000; // 3 seconds
        this.bossHealthBarFill = 0;
        this.bossSpawned = false; // Ensure boss is not spawned yet
    }
    spawnBoss() {
        // Actually spawn the boss entity after warning
        const bossWave = this.levelData.waves.find(w => w.name === 'Boss Wave');
        if (bossWave && bossWave.enemies.length > 0) {
            const bossData = bossWave.enemies[0];
            this.spawnEnemy(bossData);
            this.bossSpawned = true;
        }
    }
}

