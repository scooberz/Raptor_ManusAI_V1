/**
 * Level2 class
 * Implements the second level of the game with more advanced enemy patterns
 */
import { EnemyFactory } from '../entities/enemyFactory.js';
import { Projectile } from '../entities/projectile.js';
import { HomingProjectile } from '../entities/homingProjectile.js';
import { BackgroundManager } from '../environment/BackgroundManager.js';
import { Collectible } from '../entities/collectible.js';
import { Enemy } from '../entities/enemy.js';
import { logger } from '../utils/logger.js';

class Level2 {
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
        this.terrainElements = [];
    }
    
    /**
     * Initialize the level
     */
    init() {
        // Load level data
        this.loadLevelData();
        
        // Create scrolling background
        const bgImage = this.game.assets.getImage('backgroundLevel2'); // Use the correct key
        this.background = new BackgroundManager(this.game, bgImage, 60); // Slightly faster scrolling
        
        // Create enemy factory
        this.enemyFactory = new EnemyFactory(this.game);
        
        // Create terrain elements
        this.createTerrainElements();
        
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
        this.game.audio.playMusic('gameMusic2');
    }
    
    /**
     * Create terrain elements for level 2
     */
    createTerrainElements() {
        // Create terrain obstacles
        const terrainData = [
            { type: 'building', x: 100, y: -300, width: 80, height: 120, delay: 5000 },
            { type: 'building', x: 600, y: -400, width: 80, height: 120, delay: 8000 },
            { type: 'radar', x: 300, y: -600, width: 60, height: 60, delay: 12000 },
            { type: 'bunker', x: 450, y: -800, width: 100, height: 80, delay: 15000 }
        ];
        
        this.terrainElements = terrainData.map(data => {
            return {
                ...data,
                spawned: false,
                active: true
            };
        });
    }
    
    /**
     * Load level data
     */
    loadLevelData() {
        // In a real implementation, this would load from the JSON file
        // For now, we'll use the hardcoded data with enhanced patterns
        this.levelData = {
            "level": 2,
            "name": "Bravo Sector - Wave 2",
            "background": "backgroundLevel2",
            "music": "gameMusic2",
            "waves": [
                {
                    "id": 1,
                    "name": "Fighter Formation",
                    "duration": 12000,
                    "enemies": [
                        // V formation
                        { "type": "fighter", "x": 400, "y": -50, "delay": 0, "pattern": "zigzag" },
                        { "type": "fighter", "x": 350, "y": -100, "delay": 300, "pattern": "zigzag" },
                        { "type": "fighter", "x": 450, "y": -100, "delay": 300, "pattern": "zigzag" },
                        { "type": "fighter", "x": 300, "y": -150, "delay": 600, "pattern": "zigzag" },
                        { "type": "fighter", "x": 500, "y": -150, "delay": 600, "pattern": "zigzag" },
                        
                        // Side attackers
                        { "type": "fighter", "x": 100, "y": -200, "delay": 2000, "pattern": "sweep" },
                        { "type": "fighter", "x": 700, "y": -200, "delay": 2000, "pattern": "sweep" },
                        
                        // Delayed reinforcements
                        { "type": "fighter", "x": 200, "y": -250, "delay": 4000, "pattern": "dive" },
                        { "type": "fighter", "x": 600, "y": -250, "delay": 4000, "pattern": "dive" },
                        { "type": "fighter", "x": 400, "y": -300, "delay": 5000, "pattern": "dive" }
                    ]
                },
                {
                    "id": 2,
                    "name": "Turret Defense",
                    "duration": 18000,
                    "enemies": [
                        // Turret line
                        { "type": "turret", "x": 150, "y": -50, "delay": 0 },
                        { "type": "turret", "x": 300, "y": -50, "delay": 500 },
                        { "type": "turret", "x": 450, "y": -50, "delay": 1000 },
                        { "type": "turret", "x": 600, "y": -50, "delay": 1500 },
                        
                        // Bomber support
                        { "type": "bomber", "x": 250, "y": -200, "delay": 3000, "pattern": "horizontal" },
                        { "type": "bomber", "x": 550, "y": -200, "delay": 3000, "pattern": "horizontal" },
                        
                        // Advanced turret
                        { "type": "advancedTurret", "x": 400, "y": -150, "delay": 6000 },
                        
                        // Fighter reinforcements
                        { "type": "fighter", "x": 200, "y": -300, "delay": 8000, "pattern": "dive" },
                        { "type": "fighter", "x": 600, "y": -300, "delay": 8000, "pattern": "dive" }
                    ]
                },
                {
                    "id": 3,
                    "name": "Mixed Attack Force",
                    "duration": 25000,
                    "enemies": [
                        // Initial wave
                        { "type": "bomber", "x": 200, "y": -100, "delay": 0, "pattern": "horizontal" },
                        { "type": "bomber", "x": 600, "y": -100, "delay": 0, "pattern": "horizontal" },
                        { "type": "turret", "x": 400, "y": -50, "delay": 1000 },
                        
                        // Fighter squadrons
                        { "type": "fighter", "x": 100, "y": -150, "delay": 3000, "pattern": "sweep" },
                        { "type": "fighter", "x": 200, "y": -200, "delay": 3300, "pattern": "sweep" },
                        { "type": "fighter", "x": 300, "y": -250, "delay": 3600, "pattern": "sweep" },
                        
                        { "type": "fighter", "x": 700, "y": -150, "delay": 6000, "pattern": "sweep" },
                        { "type": "fighter", "x": 600, "y": -200, "delay": 6300, "pattern": "sweep" },
                        { "type": "fighter", "x": 500, "y": -250, "delay": 6600, "pattern": "sweep" },
                        
                        // Advanced enemies
                        { "type": "advancedTurret", "x": 300, "y": -300, "delay": 10000 },
                        { "type": "advancedTurret", "x": 500, "y": -300, "delay": 10000 },
                        { "type": "heavyBomber", "x": 400, "y": -350, "delay": 12000, "pattern": "vertical" }
                    ]
                },
                {
                    "id": 4,
                    "name": "Boss Wave",
                    "duration": 40000,
                    "enemies": [
                        // Boss escort
                        { "type": "fighter", "x": 200, "y": -100, "delay": 0, "pattern": "protect" },
                        { "type": "fighter", "x": 600, "y": -100, "delay": 0, "pattern": "protect" },
                        { "type": "turret", "x": 300, "y": -50, "delay": 1000 },
                        { "type": "turret", "x": 500, "y": -50, "delay": 1000 },
                        
                        // Level 2 boss
                        { "type": "boss2", "x": 336, "y": -200, "delay": 5000 }
                    ]
                }
            ],
            "collectibles": [
                { "type": "health", "x": 200, "y": -200, "delay": 5000 },
                { "type": "shield", "x": 600, "y": -300, "delay": 10000 },
                { "type": "megabomb", "x": 400, "y": -400, "delay": 15000 },
                { "type": "health", "x": 300, "y": -500, "delay": 20000 },
                { "type": "shield", "x": 500, "y": -600, "delay": 25000 },
                { "type": "weapon", "x": 400, "y": -700, "delay": 30000, "weaponType": "laser" }
            ]
        };
    }
    
    /**
     * Update the level
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Check for wave-skipper debug feature
        if (this.game.input.skipWavePressed) {
            this.forceNextWave();
            this.game.input.skipWavePressed = false; // Reset the flag
        }

        // Update level time
        this.levelTime += deltaTime;
        
        // Update background
        this.background.update(deltaTime);
        
        // Process current wave
        this.updateWave(deltaTime);
        
        // Process collectibles
        this.updateCollectibles(deltaTime);
        
        // Process terrain elements
        this.updateTerrainElements(deltaTime);
        
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
     * Update terrain elements
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateTerrainElements(deltaTime) {
        this.terrainElements.forEach(terrain => {
            if (terrain.delay <= this.levelTime && !terrain.spawned && terrain.active) {
                this.spawnTerrainElement(terrain);
                terrain.spawned = true;
            }
        });
    }
    
    /**
     * Spawn a terrain element
     * @param {Object} terrainData - Terrain element data
     */
    spawnTerrainElement(terrainData) {
        // Create a destructible terrain element
        const terrain = new Enemy(
            this.game,
            terrainData.x,
            terrainData.y,
            terrainData.width,
            terrainData.height,
            terrainData.type
        );
        
        // Set terrain properties based on type
        switch (terrainData.type) {
            case 'building':
                terrain.health = 50;
                terrain.score = 50;
                terrain.velocityY = 50; // Move with background
                terrain.sprite = this.game.assets.getImage('enemyTurret'); // Reuse turret sprite for now
                break;
                
            case 'radar':
                terrain.health = 30;
                terrain.score = 100;
                terrain.velocityY = 50;
                terrain.sprite = this.game.assets.getImage('enemyTurret'); // Reuse turret sprite for now
                
                // Add radar scanning behavior
                const originalUpdate = terrain.update.bind(terrain);
                terrain.update = function(deltaTime) {
                    originalUpdate(deltaTime);
                    
                    // Periodically spawn enemies if radar is active
                    if (Math.random() < 0.005) {
                        const fighter = this.game.enemyFactory.createEnemy(
                            'fighter',
                            this.x + this.width / 2,
                            this.y - 50
                        );
                        
                        if (fighter) {
                            fighter.setMovementPattern('dive');
                        }
                    }
                };
                break;
                
            case 'bunker':
                terrain.health = 100;
                terrain.score = 200;
                terrain.velocityY = 50;
                terrain.sprite = this.game.assets.getImage('enemyTurret'); // Reuse turret sprite for now
                
                // Add bunker firing behavior
                const bunkerUpdate = terrain.update.bind(terrain);
                terrain.update = function(deltaTime) {
                    bunkerUpdate(deltaTime);
                    
                    // Fire periodically
                    if (Math.random() < 0.01) {
                        // Create projectile
                        const projectile = new Projectile(
                            this.game,
                            this.x + this.width / 2 - 5,
                            this.y + this.height,
                            10,
                            10,
                            0,
                            300,
                            15,
                            'enemy',
                            'enemyBullet'
                        );
                        
                        this.game.entityManager.add(projectile);
                        this.game.collision.addToGroup(projectile, 'enemyProjectiles');
                    }
                };
                break;
        }
        
        // Add to game
        this.game.entityManager.add(terrain);
        this.game.collision.addToGroup(terrain, 'enemies');
    }
    
    /**
     * Spawn an enemy
     * @param {Object} enemyData - Enemy data object
     */
    spawnEnemy(enemyData) {
        // Create the enemy
        let enemy;
        
        switch (enemyData.type) {
            case 'advancedTurret':
                enemy = this.createAdvancedTurret(enemyData.x, enemyData.y);
                break;
                
            case 'heavyBomber':
                enemy = this.createHeavyBomber(enemyData.x, enemyData.y);
                break;
                
            case 'boss2':
                enemy = this.createBoss2(enemyData.x, enemyData.y);
                break;
                
            default:
                // Use the new factory signature with the entire enemyData object
                enemy = this.enemyFactory.createEnemy(enemyData);
                break;
        }
        
        // Apply movement pattern if specified (legacy support)
        if (enemy && enemyData.pattern && !enemyData.overrides?.movementPattern) {
            this.applyMovementPattern(enemy, enemyData.pattern);
        }
        
        return enemy;
    }
    
    /**
     * Create an advanced turret enemy
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Enemy} The created advanced turret
     */
    createAdvancedTurret(x, y) {
        const turret = this.enemyFactory.createEnemy('turret', x, y);
        
        // Enhance turret properties
        turret.health = 60;
        turret.score = 300;
        turret.fireRate = 1500;
        
        // Override fire method to fire multiple projectiles
        turret.fire = function() {
            // Calculate angle to player
            const player = this.game.player;
            if (!player || !player.active) return;
            
            const dx = player.x + player.width / 2 - (this.x + this.width / 2);
            const dy = player.y + player.height / 2 - (this.y + this.height / 2);
            const angle = Math.atan2(dy, dx);
            
            // Fire three projectiles in a spread
            const speed = 250;
            const spreadAngle = Math.PI / 12; // 15 degrees
            
            for (let i = -1; i <= 1; i++) {
                const projectileAngle = angle + i * spreadAngle;
                const projectile = new Projectile(
                    this.game,
                    this.x + this.width / 2 - 5,
                    this.y + this.height / 2,
                    10,
                    10,
                    Math.cos(projectileAngle) * speed,
                    Math.sin(projectileAngle) * speed,
                    15,
                    'enemy',
                    'enemyBullet'
                );
                
                this.game.entityManager.add(projectile);
                this.game.collision.addToGroup(projectile, 'enemyProjectiles');
            }
            
            // Play sound
            this.game.audio.playSound('enemyShoot');
        };
        
        return turret;
    }
    
    /**
     * Create a heavy bomber enemy
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Enemy} The created heavy bomber
     */
    createHeavyBomber(x, y) {
        const bomber = this.enemyFactory.createEnemy('bomber', x, y);
        
        // Enhance bomber properties
        bomber.health = 80;
        bomber.score = 400;
        bomber.width = 80;
        bomber.height = 60;
        bomber.dropRate = 1000;
        
        // Override drop bomb method to drop multiple bombs
        bomber.dropBomb = function() {
            // Drop three bombs in a spread
            for (let i = -1; i <= 1; i++) {
                const bomb = new Projectile(
                    this.game,
                    this.x + this.width / 2 - 10 + i * 20,
                    this.y + this.height,
                    20,
                    20,
                    0,
                    200,
                    20,
                    'enemy',
                    'enemyBullet'
                );
                
                this.game.entityManager.add(bomb);
                this.game.collision.addToGroup(bomb, 'enemyProjectiles');
            }
        };
        
        return bomber;
    }
    
    /**
     * Create the level 2 boss
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Enemy} The created boss
     */
    createBoss2(x, y) {
        // Start with the level 1 boss as a base
        const boss = this.enemyFactory.createBoss1(x, y);
        
        // Enhance boss properties for level 2
        boss.type = 'boss2';
        boss.health = 800;
        boss.phaseHealth = 800;
        boss.score = 5000;
        boss.fireRate = 800;
        
        // Override fire spread method for more projectiles
        boss.fireSpread = function() {
            const numProjectiles = 8;
            const spreadAngle = Math.PI * 2 / 3; // 120 degrees
            const startAngle = Math.PI / 2 - spreadAngle / 2; // Center at bottom
            
            for (let i = 0; i < numProjectiles; i++) {
                const angle = startAngle + (spreadAngle * i) / (numProjectiles - 1);
                const speed = 250;
                
                const projectile = new Projectile(
                    this.game,
                    this.x + this.width / 2 - 5,
                    this.y + this.height / 2,
                    10,
                    10,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    10,
                    'enemy',
                    'enemyBullet'
                );
                
                this.game.entityManager.add(projectile);
                this.game.collision.addToGroup(projectile, 'enemyProjectiles');
            }
        };
        
        // Add special attack for phase 3
        boss.specialAttack = function() {
            // Create homing missile
            const player = this.game.player;
            if (!player || !player.active) return;
            
            const missile = new HomingProjectile(
                this.game,
                this.x + this.width / 2 - 10,
                this.y + this.height,
                20,
                20,
                30,
                'enemy',
                player,
                200,
                Math.PI / 4 // 45 degrees per second turning rate
            );
            
            this.game.entityManager.add(missile);
            this.game.collision.addToGroup(missile, 'enemyProjectiles');
            
            // Play sound
            this.game.audio.playSound('enemyShoot');
        };
        
        // Override update phase method to include special attack
        const originalUpdatePhase = boss.updatePhase.bind(boss);
        boss.updatePhase = function() {
            originalUpdatePhase();
            
            // Special attack in phase 3
            if (this.phase === 3) {
                const now = Date.now();
                if (now - this.lastSpecialTime > 3000) {
                    this.lastSpecialTime = now;
                    this.specialAttack();
                }
            }
        };
        
        // Initialize last special attack time
        boss.lastSpecialTime = 0;
        
        return boss;
    }
    
    /**
     * Apply a movement pattern to an enemy
     * @param {Enemy} enemy - The enemy to apply the pattern to
     * @param {string} pattern - The pattern to apply
     */
    applyMovementPattern(enemy, pattern) {
        switch (pattern) {
            case 'zigzag':
                // Zigzag pattern
                enemy.setMovementPattern = function(pattern, options = {}) {
                    this.movementPattern = pattern;
                    this.patternOptions = {
                        minX: options.minX || 50,
                        maxX: options.maxX || this.game.width - 50,
                        speed: options.speed || 100,
                        direction: options.direction || 1
                    };
                    
                    // Override update method
                    const originalUpdate = this.update.bind(this);
                    this.update = function(deltaTime) {
                        // Apply zigzag movement
                        this.velocityX = this.patternOptions.speed * this.patternOptions.direction;
                        
                        // Reverse direction at edges
                        if (this.x <= this.patternOptions.minX) {
                            this.patternOptions.direction = 1;
                        } else if (this.x + this.width >= this.patternOptions.maxX) {
                            this.patternOptions.direction = -1;
                        }
                        
                        // Call original update
                        originalUpdate(deltaTime);
                    };
                };
                
                enemy.setMovementPattern('zigzag', {
                    minX: 50,
                    maxX: this.game.width - 50,
                    speed: 100,
                    direction: Math.random() > 0.5 ? 1 : -1
                });
                break;
                
            case 'sweep':
                // Sweep across screen
                enemy.setMovementPattern = function(pattern, options = {}) {
                    this.movementPattern = pattern;
                    this.patternOptions = {
                        startX: this.x,
                        endX: options.endX || (this.x < this.game.width / 2 ? this.game.width - 50 : 50),
                        speed: options.speed || 150,
                        verticalSpeed: options.verticalSpeed || 80
                    };
                    
                    // Calculate direction
                    this.patternOptions.direction = this.patternOptions.startX < this.patternOptions.endX ? 1 : -1;
                    
                    // Override update method
                    const originalUpdate = this.update.bind(this);
                    this.update = function(deltaTime) {
                        // Apply sweep movement
                        this.velocityX = this.patternOptions.speed * this.patternOptions.direction;
                        this.velocityY = this.patternOptions.verticalSpeed;
                        
                        // Call original update
                        originalUpdate(deltaTime);
                    };
                };
                
                enemy.setMovementPattern('sweep', {
                    endX: enemy.x < this.game.width / 2 ? this.game.width - 50 : 50,
                    speed: 150,
                    verticalSpeed: 80
                });
                break;
                
            case 'dive':
                // Dive toward player
                enemy.setMovementPattern = function(pattern, options = {}) {
                    this.movementPattern = pattern;
                    this.patternOptions = {
                        speed: options.speed || 200,
                        delay: options.delay || 1000
                    };
                    
                    this.patternState = {
                        waiting: true,
                        startTime: Date.now()
                    };
                    
                    // Override update method
                    const originalUpdate = this.update.bind(this);
                    this.update = function(deltaTime) {
                        const now = Date.now();
                        
                        if (this.patternState.waiting) {
                            // Wait before diving
                            this.velocityY = 50;
                            this.velocityX = 0;
                            
                            if (now - this.patternState.startTime > this.patternOptions.delay) {
                                this.patternState.waiting = false;
                                
                                // Target player position
                                const player = this.game.player;
                                if (player && player.active) {
                                    const dx = player.x - this.x;
                                    const dy = player.y - this.y;
                                    const distance = Math.sqrt(dx * dx + dy * dy);
                                    
                                    this.velocityX = (dx / distance) * this.patternOptions.speed;
                                    this.velocityY = (dy / distance) * this.patternOptions.speed;
                                } else {
                                    // No player, just dive down
                                    this.velocityY = this.patternOptions.speed;
                                }
                            }
                        }
                        
                        // Call original update
                        originalUpdate(deltaTime);
                    };
                };
                
                enemy.setMovementPattern('dive', {
                    speed: 200,
                    delay: 1000 + Math.random() * 1000
                });
                break;
                
            case 'horizontal':
                // Horizontal movement
                enemy.setMovementPattern = function(pattern, options = {}) {
                    this.movementPattern = pattern;
                    this.patternOptions = {
                        minX: options.minX || 50,
                        maxX: options.maxX || this.game.width - 50,
                        speed: options.speed || 80,
                        direction: options.direction || 1,
                        verticalSpeed: options.verticalSpeed || 50
                    };
                    
                    // Override update method
                    const originalUpdate = this.update.bind(this);
                    this.update = function(deltaTime) {
                        // Apply horizontal movement
                        this.velocityX = this.patternOptions.speed * this.patternOptions.direction;
                        this.velocityY = this.patternOptions.verticalSpeed;
                        
                        // Reverse direction at edges
                        if (this.x <= this.patternOptions.minX) {
                            this.patternOptions.direction = 1;
                        } else if (this.x + this.width >= this.patternOptions.maxX) {
                            this.patternOptions.direction = -1;
                        }
                        
                        // Call original update
                        originalUpdate(deltaTime);
                    };
                };
                
                enemy.setMovementPattern('horizontal', {
                    minX: 50,
                    maxX: this.game.width - 50,
                    speed: 80,
                    direction: Math.random() > 0.5 ? 1 : -1,
                    verticalSpeed: 50
                });
                break;
                
            case 'vertical':
                // Vertical movement with slight horizontal drift
                enemy.setMovementPattern = function(pattern, options = {}) {
                    this.movementPattern = pattern;
                    this.patternOptions = {
                        minY: options.minY || 50,
                        maxY: options.maxY || 200,
                        speed: options.speed || 60,
                        direction: options.direction || 1,
                        horizontalSpeed: options.horizontalSpeed || 20
                    };
                    
                    this.patternState = {
                        baseY: this.y,
                        time: 0
                    };
                    
                    // Override update method
                    const originalUpdate = this.update.bind(this);
                    this.update = function(deltaTime) {
                        // Apply vertical oscillation
                        this.patternState.time += deltaTime / 1000;
                        const offsetY = Math.sin(this.patternState.time) * 50;
                        this.velocityY = 50 + offsetY;
                        
                        // Apply slight horizontal drift
                        this.velocityX = Math.sin(this.patternState.time * 0.5) * this.patternOptions.horizontalSpeed;
                        
                        // Call original update
                        originalUpdate(deltaTime);
                    };
                };
                
                enemy.setMovementPattern('vertical', {
                    minY: 50,
                    maxY: 200,
                    speed: 60,
                    horizontalSpeed: 20
                });
                break;
                
            case 'protect':
                // Protect the boss
                enemy.setMovementPattern = function(pattern, options = {}) {
                    this.movementPattern = pattern;
                    this.patternOptions = {
                        radius: options.radius || 100,
                        speed: options.speed || 1,
                        offset: options.offset || Math.random() * Math.PI * 2
                    };
                    
                    this.patternState = {
                        time: 0,
                        baseX: this.x,
                        baseY: this.y
                    };
                    
                    // Override update method
                    const originalUpdate = this.update.bind(this);
                    this.update = function(deltaTime) {
                        // Find boss
                        const boss = this.game.collision.collisionGroups.enemies.find(e => e.type.includes('boss'));
                        
                        if (boss && boss.active) {
                            // Orbit around boss
                            this.patternState.time += deltaTime / 1000 * this.patternOptions.speed;
                            
                            const angle = this.patternState.time + this.patternOptions.offset;
                            const targetX = boss.x + boss.width / 2 + Math.cos(angle) * this.patternOptions.radius - this.width / 2;
                            const targetY = boss.y + boss.height / 2 + Math.sin(angle) * this.patternOptions.radius - this.height / 2;
                            
                            // Calculate velocity to move toward target position
                            const dx = targetX - this.x;
                            const dy = targetY - this.y;
                            
                            this.velocityX = dx * 5;
                            this.velocityY = dy * 5;
                        } else {
                            // No boss, just move down
                            this.velocityY = 100;
                        }
                        
                        // Call original update
                        originalUpdate(deltaTime);
                    };
                };
                
                enemy.setMovementPattern('protect', {
                    radius: 100,
                    speed: 1,
                    offset: Math.random() * Math.PI * 2
                });
                break;
        }
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
        
        // Set weapon type for weapon collectibles
        if (collectibleData.type === 'weapon' && collectibleData.weaponType) {
            collectible.weaponType = collectibleData.weaponType;
            
            // Override collect method to upgrade specific weapon
            const originalCollect = collectible.collect.bind(collectible);
            collectible.collect = function(player) {
                if (this.type === 'weapon' && this.weaponType) {
                    player.upgradeWeapon(this.weaponType);
                } else {
                    originalCollect(player);
                }
            };
        }
        
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
            logger.info(`Starting Wave ${this.waveIndex + 1}: ${this.levelData.waves[this.waveIndex].name}`);
        }
    }
    
    /**
     * Force advance to the next wave (debug feature)
     */
    forceNextWave() {
        logger.debug("DEBUG: Forcing next wave.");
        
        // Clear out any remaining enemies from the current wave
        const enemies = this.game.collision.collisionGroups.enemies;
        enemies.forEach(enemy => {
            if (enemy.active) {
                enemy.destroy();
            }
        });
        
        if (this.waveIndex < this.levelData.waves.length - 1) {
            this.waveIndex++;
            this.waveStartTime = this.levelTime;
            logger.debug(`DEBUG: Advanced to wave index ${this.waveIndex + 1}: ${this.levelData.waves[this.waveIndex].name}`);
        } else {
            logger.debug("DEBUG: Already on the last wave.");
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
                return enemy.type.includes('boss') && enemy.active;
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
    render(contexts) {
        // Render background
        if (this.background) {
            this.background.render(contexts.background);
        }
    }
    
    /**
     * Clean up the level
     */
    cleanup() {
        // Stop music
        this.game.audio.stopMusic();
    }
}

export { Level2 };

