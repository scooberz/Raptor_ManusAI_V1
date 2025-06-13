# Raptor: Call of the Shadows Reimagining - Technical Specification

## Project Overview

This document provides the technical specifications for reimagining the first two levels of Raptor: Call of the Shadows as a web-based game. The implementation will use HTML5 Canvas and JavaScript to ensure compatibility with modern browsers and smooth performance on a Dell laptop.

## Directory Structure

```
raptor-game/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── engine/
│   │   ├── game.js
│   │   ├── input.js
│   │   ├── assets.js
│   │   ├── audio.js
│   │   ├── collision.js
│   │   └── entity.js
│   ├── entities/
│   │   ├── player.js
│   │   ├── enemy.js
│   │   ├── projectile.js
│   │   ├── collectible.js
│   │   ├── explosion.js
│   │   └── environment.js
│   ├── states/
│   │   ├── boot.js
│   │   ├── loading.js
│   │   ├── menu.js
│   │   ├── hangar.js
│   │   ├── supply.js
│   │   ├── game.js
│   │   ├── pause.js
│   │   └── gameover.js
│   ├── levels/
│   │   ├── level1.js
│   │   └── level2.js
│   └── ui/
│       ├── hud.js
│       └── menu.js
├── assets/
│   ├── images/
│   │   ├── player/
│   │   ├── enemies/
│   │   ├── projectiles/
│   │   ├── explosions/
│   │   ├── collectibles/
│   │   ├── environment/
│   │   └── ui/
│   ├── audio/
│   │   ├── sfx/
│   │   └── music/
│   └── data/
│       ├── level1.json
│       └── level2.json
└── README.md
```

## HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Raptor: Call of the Shadows Reimagined</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="game-container">
        <canvas id="background-layer" class="game-canvas"></canvas>
        <canvas id="environment-layer" class="game-canvas"></canvas>
        <canvas id="enemy-layer" class="game-canvas"></canvas>
        <canvas id="player-layer" class="game-canvas"></canvas>
        <canvas id="projectile-layer" class="game-canvas"></canvas>
        <canvas id="explosion-layer" class="game-canvas"></canvas>
        <canvas id="ui-layer" class="game-canvas"></canvas>
        <div id="loading-screen">Loading...</div>
        <div id="menu-screen"></div>
        <div id="game-over-screen"></div>
    </div>
    
    <!-- Engine Scripts -->
    <script src="js/engine/game.js"></script>
    <script src="js/engine/input.js"></script>
    <script src="js/engine/assets.js"></script>
    <script src="js/engine/audio.js"></script>
    <script src="js/engine/collision.js"></script>
    <script src="js/engine/entity.js"></script>
    
    <!-- Entity Scripts -->
    <script src="js/entities/player.js"></script>
    <script src="js/entities/enemy.js"></script>
    <script src="js/entities/projectile.js"></script>
    <script src="js/entities/collectible.js"></script>
    <script src="js/entities/explosion.js"></script>
    <script src="js/entities/environment.js"></script>
    
    <!-- State Scripts -->
    <script src="js/states/boot.js"></script>
    <script src="js/states/loading.js"></script>
    <script src="js/states/menu.js"></script>
    <script src="js/states/hangar.js"></script>
    <script src="js/states/supply.js"></script>
    <script src="js/states/game.js"></script>
    <script src="js/states/pause.js"></script>
    <script src="js/states/gameover.js"></script>
    
    <!-- Level Scripts -->
    <script src="js/levels/level1.js"></script>
    <script src="js/levels/level2.js"></script>
    
    <!-- UI Scripts -->
    <script src="js/ui/hud.js"></script>
    <script src="js/ui/menu.js"></script>
    
    <!-- Main Script -->
    <script src="js/main.js"></script>
</body>
</html>
```

## CSS Structure

```css
/* Base Styles */
body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #000;
    font-family: 'Arial', sans-serif;
}

/* Game Container */
#game-container {
    position: relative;
    width: 100%;
    height: 100%;
    max-width: 800px;
    max-height: 600px;
    margin: 0 auto;
    overflow: hidden;
}

/* Canvas Layers */
.game-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/* UI Elements */
#loading-screen, #menu-screen, #game-over-screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 24px;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 100;
}

#loading-screen {
    z-index: 101;
}

#menu-screen, #game-over-screen {
    display: none;
}

/* Responsive Design */
@media (max-width: 800px) {
    #game-container {
        width: 100%;
        height: auto;
        aspect-ratio: 4/3;
    }
}
```

## Core Game Engine

### Game Loop (game.js)

```javascript
class Game {
    constructor() {
        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / 60; // 60 FPS
        
        this.currentState = null;
        this.states = {
            boot: new BootState(this),
            loading: new LoadingState(this),
            menu: new MenuState(this),
            hangar: new HangarState(this),
            supply: new SupplyState(this),
            game: new GameState(this),
            pause: new PauseState(this),
            gameover: new GameOverState(this)
        };
        
        this.input = new InputHandler();
        this.assets = new AssetManager();
        this.audio = new AudioManager();
        this.entityManager = new EntityManager();
        
        this.init();
    }
    
    init() {
        // Initialize canvas layers
        this.layers = {
            background: document.getElementById('background-layer').getContext('2d'),
            environment: document.getElementById('environment-layer').getContext('2d'),
            enemy: document.getElementById('enemy-layer').getContext('2d'),
            player: document.getElementById('player-layer').getContext('2d'),
            projectile: document.getElementById('projectile-layer').getContext('2d'),
            explosion: document.getElementById('explosion-layer').getContext('2d'),
            ui: document.getElementById('ui-layer').getContext('2d')
        };
        
        // Set canvas dimensions
        this.width = 800;
        this.height = 600;
        
        Object.values(this.layers).forEach(context => {
            context.canvas.width = this.width;
            context.canvas.height = this.height;
        });
        
        // Start with boot state
        this.changeState('boot');
        
        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Fixed time step update
        this.accumulator += deltaTime;
        
        while (this.accumulator >= this.timeStep) {
            this.update(this.timeStep);
            this.accumulator -= this.timeStep;
        }
        
        // Render
        this.render();
        
        // Next frame
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update(deltaTime) {
        if (this.currentState) {
            this.currentState.update(deltaTime);
        }
    }
    
    render() {
        // Clear all layers
        Object.values(this.layers).forEach(context => {
            context.clearRect(0, 0, this.width, this.height);
        });
        
        if (this.currentState) {
            this.currentState.render();
        }
    }
    
    changeState(stateName) {
        if (this.currentState) {
            this.currentState.exit();
        }
        
        this.currentState = this.states[stateName];
        
        if (this.currentState) {
            this.currentState.enter();
        }
    }
}
```

### Input Handler (input.js)

```javascript
class InputHandler {
    constructor() {
        this.keys = {};
        this.mousePosition = { x: 0, y: 0 };
        this.mouseButtons = { left: false, middle: false, right: false };
        
        // Set up event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mousedown', this.handleMouseDown.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
    
    handleKeyDown(event) {
        this.keys[event.key] = true;
    }
    
    handleKeyUp(event) {
        this.keys[event.key] = false;
    }
    
    handleMouseMove(event) {
        const rect = event.target.getBoundingClientRect();
        this.mousePosition.x = event.clientX - rect.left;
        this.mousePosition.y = event.clientY - rect.top;
    }
    
    handleMouseDown(event) {
        switch (event.button) {
            case 0: this.mouseButtons.left = true; break;
            case 1: this.mouseButtons.middle = true; break;
            case 2: this.mouseButtons.right = true; break;
        }
    }
    
    handleMouseUp(event) {
        switch (event.button) {
            case 0: this.mouseButtons.left = false; break;
            case 1: this.mouseButtons.middle = false; break;
            case 2: this.mouseButtons.right = false; break;
        }
    }
    
    isKeyPressed(key) {
        return this.keys[key] === true;
    }
    
    isMouseButtonPressed(button) {
        return this.mouseButtons[button] === true;
    }
}
```

### Asset Manager (assets.js)

```javascript
class AssetManager {
    constructor() {
        this.images = {};
        this.audio = {};
        this.data = {};
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }
    
    loadImage(key, src) {
        this.totalAssets++;
        
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                this.images[key] = image;
                this.loadedAssets++;
                resolve(image);
            };
            image.onerror = () => {
                reject(new Error(`Failed to load image: ${src}`));
            };
            image.src = src;
        });
    }
    
    loadAudio(key, src) {
        this.totalAssets++;
        
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.audio[key] = audio;
                this.loadedAssets++;
                resolve(audio);
            };
            audio.onerror = () => {
                reject(new Error(`Failed to load audio: ${src}`));
            };
            audio.src = src;
        });
    }
    
    loadJSON(key, src) {
        this.totalAssets++;
        
        return fetch(src)
            .then(response => response.json())
            .then(data => {
                this.data[key] = data;
                this.loadedAssets++;
                return data;
            });
    }
    
    getImage(key) {
        return this.images[key];
    }
    
    getAudio(key) {
        return this.audio[key];
    }
    
    getData(key) {
        return this.data[key];
    }
    
    getLoadingProgress() {
        return this.totalAssets > 0 ? this.loadedAssets / this.totalAssets : 0;
    }
}
```

### Audio Manager (audio.js)

```javascript
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.muted = false;
    }
    
    addSound(key, audio) {
        this.sounds[key] = audio;
    }
    
    playSound(key) {
        if (this.muted || !this.sounds[key]) return;
        
        const sound = this.sounds[key].cloneNode();
        sound.volume = this.sfxVolume;
        sound.play();
    }
    
    playMusic(key) {
        if (this.muted || !this.sounds[key]) return;
        
        if (this.music) {
            this.music.pause();
        }
        
        this.music = this.sounds[key];
        this.music.volume = this.musicVolume;
        this.music.loop = true;
        this.music.play();
    }
    
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.musicVolume;
        }
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    toggleMute() {
        this.muted = !this.muted;
        
        if (this.muted) {
            if (this.music) {
                this.music.pause();
            }
        } else {
            if (this.music) {
                this.music.play();
            }
        }
        
        return this.muted;
    }
}
```

### Collision System (collision.js)

```javascript
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
    
    checkGroupCollision(groupA, groupB, handler) {
        for (let i = 0; i < groupA.length; i++) {
            for (let j = 0; j < groupB.length; j++) {
                if (this.checkAABBCollision(groupA[i], groupB[j])) {
                    handler(groupA[i], groupB[j]);
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
        this.removeFromGroup(projectile, 'playerProjectiles');
        projectile.destroy();
    }
    
    handlePlayerCollectibleCollision(player, collectible) {
        collectible.collect(player);
        this.removeFromGroup(collectible, 'collectibles');
        collectible.destroy();
    }
}
```

### Entity Manager (entity.js)

```javascript
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
    }
    
    update(deltaTime) {
        // Update position based on velocity
        this.x += this.velocityX * (deltaTime / 1000);
        this.y += this.velocityY * (deltaTime / 1000);
    }
    
    render(context) {
        // Default rendering (for debugging)
        context.fillStyle = 'red';
        context.fillRect(this.x, this.y, this.width, this.height);
    }
    
    destroy() {
        this.active = false;
    }
}

class EntityManager {
    constructor() {
        this.entities = [];
    }
    
    add(entity) {
        this.entities.push(entity);
        return entity;
    }
    
    update(deltaTime) {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            
            if (entity.active) {
                entity.update(deltaTime);
            } else {
                this.entities.splice(i, 1);
            }
        }
    }
    
    render(context) {
        this.entities.forEach(entity => {
            if (entity.active) {
                entity.render(context);
            }
        });
    }
    
    clear() {
        this.entities = [];
    }
}
```

## Entity Classes

### Player (player.js)

```javascript
class Player extends Entity {
    constructor(game, x, y) {
        super(game, x, y, 64, 64);
        
        this.speed = 300;
        this.health = 100;
        this.maxHealth = 100;
        this.shield = 0;
        this.maxShield = 100;
        this.money = 0;
        
        this.weapons = {
            primary: {
                type: 'machineGun',
                level: 1,
                cooldown: 200,
                lastFired: 0
            },
            special: {
                type: null,
                count: 0,
                cooldown: 500,
                lastFired: 0
            }
        };
        
        this.megabombs = 0;
        this.collisionDamage = 20;
        
        // Animation properties
        this.sprite = null;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrames = 2;
        this.frameTimer = 0;
        this.frameInterval = 100;
    }
    
    update(deltaTime) {
        // Handle movement
        this.velocityX = 0;
        this.velocityY = 0;
        
        if (this.game.input.isKeyPressed('ArrowLeft') || this.game.input.isKeyPressed('a')) {
            this.velocityX = -this.speed;
        }
        
        if (this.game.input.isKeyPressed('ArrowRight') || this.game.input.isKeyPressed('d')) {
            this.velocityX = this.speed;
        }
        
        if (this.game.input.isKeyPressed('ArrowUp') || this.game.input.isKeyPressed('w')) {
            this.velocityY = -this.speed;
        }
        
        if (this.game.input.isKeyPressed('ArrowDown') || this.game.input.isKeyPressed('s')) {
            this.velocityY = this.speed;
        }
        
        // Keep player within game boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.width) this.x = this.game.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > this.game.height) this.y = this.game.height - this.height;
        
        // Handle firing
        if (this.game.input.isKeyPressed('Control')) {
            this.firePrimary();
        }
        
        if (this.game.input.isKeyPressed('Alt')) {
            this.cycleSpecialWeapon();
        }
        
        if (this.game.input.isKeyPressed(' ')) {
            this.fireMegabomb();
        }
        
        // Update animation
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = (this.frameX + 1) % this.maxFrames;
        }
        
        super.update(deltaTime);
    }
    
    render(context) {
        if (this.sprite) {
            context.drawImage(
                this.sprite,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } else {
            super.render(context);
        }
    }
    
    firePrimary() {
        const now = Date.now();
        
        if (now - this.weapons.primary.lastFired > this.weapons.primary.cooldown) {
            this.weapons.primary.lastFired = now;
            
            // Create projectile based on weapon type and level
            switch (this.weapons.primary.type) {
                case 'machineGun':
                    this.createMachineGunProjectile();
                    break;
                // Add more weapon types as needed
            }
            
            // Play sound effect
            this.game.audio.playSound('playerShoot');
        }
    }
    
    createMachineGunProjectile() {
        const projectile = new Projectile(
            this.game,
            this.x + this.width / 2 - 5,
            this.y,
            10,
            20,
            0,
            -600,
            10 * this.weapons.primary.level,
            'player'
        );
        
        this.game.entityManager.add(projectile);
        this.game.collision.addToGroup(projectile, 'playerProjectiles');
    }
    
    cycleSpecialWeapon() {
        // Implement special weapon cycling logic
    }
    
    fireSpecial() {
        // Implement special weapon firing logic
    }
    
    fireMegabomb() {
        if (this.megabombs > 0) {
            this.megabombs--;
            
            // Create megabomb effect
            // Clear all enemies and enemy projectiles
            
            // Play sound effect
            this.game.audio.playSound('megabomb');
        }
    }
    
    takeDamage(amount) {
        // Apply damage to shield first, then health
        if (this.shield > 0) {
            if (this.shield >= amount) {
                this.shield -= amount;
                amount = 0;
            } else {
                amount -= this.shield;
                this.shield = 0;
            }
        }
        
        if (amount > 0) {
            this.health -= amount;
            
            if (this.health <= 0) {
                this.health = 0;
                this.destroy();
                this.game.changeState('gameover');
            }
        }
        
        // Play damage sound
        this.game.audio.playSound('playerDamage');
    }
    
    addHealth(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }
    
    addShield(amount) {
        this.shield = Math.min(this.shield + amount, this.maxShield);
    }
    
    addMoney(amount) {
        this.money += amount;
    }
    
    addMegabomb() {
        this.megabombs++;
    }
}
```

### Enemy (enemy.js)

```javascript
class Enemy extends Entity {
    constructor(game, x, y, width, height, type, health, points, collisionDamage) {
        super(game, x, y, width, height);
        
        this.type = type;
        this.health = health;
        this.maxHealth = health;
        this.points = points;
        this.collisionDamage = collisionDamage;
        
        // Movement pattern
        this.pattern = 'straight';
        this.patternParams = {};
        
        // Weapon properties
        this.canFire = false;
        this.fireRate = 0;
        this.lastFired = 0;
        
        // Animation properties
        this.sprite = null;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrames = 1;
        this.frameTimer = 0;
        this.frameInterval = 200;
    }
    
    update(deltaTime) {
        // Update movement based on pattern
        this.updateMovement(deltaTime);
        
        // Handle firing
        if (this.canFire) {
            this.updateFiring(deltaTime);
        }
        
        // Update animation
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = (this.frameX + 1) % this.maxFrames;
        }
        
        // Remove if off screen
        if (this.y > this.game.height + 100) {
            this.destroy();
        }
        
        super.update(deltaTime);
    }
    
    render(context) {
        if (this.sprite) {
            context.drawImage(
                this.sprite,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } else {
            super.render(context);
        }
    }
    
    updateMovement(deltaTime) {
        switch (this.pattern) {
            case 'straight':
                // Continue with current velocity
                break;
            case 'sine':
                // Sine wave movement
                this.x = this.patternParams.centerX + Math.sin(this.patternParams.time) * this.patternParams.amplitude;
                this.patternParams.time += deltaTime / 1000 * this.patternParams.frequency;
                break;
            case 'circle':
                // Circular movement
                this.x = this.patternParams.centerX + Math.cos(this.patternParams.time) * this.patternParams.radius;
                this.y = this.patternParams.centerY + Math.sin(this.patternParams.time) * this.patternParams.radius;
                this.patternParams.time += deltaTime / 1000 * this.patternParams.speed;
                break;
            // Add more patterns as needed
        }
    }
    
    updateFiring(deltaTime) {
        const now = Date.now();
        
        if (now - this.lastFired > this.fireRate) {
            this.lastFired = now;
            this.fire();
        }
    }
    
    fire() {
        // Create enemy projectile
        const projectile = new Projectile(
            this.game,
            this.x + this.width / 2 - 5,
            this.y + this.height,
            10,
            20,
            0,
            300,
            10,
            'enemy'
        );
        
        this.game.entityManager.add(projectile);
        this.game.collision.addToGroup(projectile, 'enemyProjectiles');
        
        // Play sound effect
        this.game.audio.playSound('enemyShoot');
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        if (this.health <= 0) {
            this.destroy();
            this.dropLoot();
            this.game.player.addMoney(this.points);
            
            // Create explosion
            const explosion = new Explosion(
                this.game,
                this.x + this.width / 2 - 32,
                this.y + this.height / 2 - 32,
                64,
                64
            );
            
            this.game.entityManager.add(explosion);
            
            // Play explosion sound
            this.game.audio.playSound('explosion');
        }
    }
    
    dropLoot() {
        // Random chance to drop collectibles
        const roll = Math.random();
        
        if (roll < 0.1) {
            // 10% chance to drop health
            const healthPickup = new Collectible(
                this.game,
                this.x + this.width / 2 - 15,
                this.y + this.height / 2 - 15,
                30,
                30,
                'health',
                20
            );
            
            this.game.entityManager.add(healthPickup);
            this.game.collision.addToGroup(healthPickup, 'collectibles');
        } else if (roll < 0.15) {
            // 5% chance to drop shield
            const shieldPickup = new Collectible(
                this.game,
                this.x + this.width / 2 - 15,
                this.y + this.height / 2 - 15,
                30,
                30,
                'shield',
                20
            );
            
            this.game.entityManager.add(shieldPickup);
            this.game.collision.addToGroup(shieldPickup, 'collectibles');
        } else if (roll < 0.17) {
            // 2% chance to drop megabomb
            const megabombPickup = new Collectible(
                this.game,
                this.x + this.width / 2 - 15,
                this.y + this.height / 2 - 15,
                30,
                30,
                'megabomb',
                1
            );
            
            this.game.entityManager.add(megabombPickup);
            this.game.collision.addToGroup(megabombPickup, 'collectibles');
        }
    }
}

// Enemy Factory
class EnemyFactory {
    constructor(game) {
        this.game = game;
    }
    
    createEnemy(type, x, y) {
        let enemy;
        
        switch (type) {
            case 'fighter':
                enemy = new Enemy(this.game, x, y, 48, 48, 'fighter', 30, 100, 20);
                enemy.velocityY = 150;
                enemy.canFire = true;
                enemy.fireRate = 2000;
                break;
            case 'bomber':
                enemy = new Enemy(this.game, x, y, 64, 64, 'bomber', 50, 200, 30);
                enemy.velocityY = 100;
                enemy.canFire = false;
                break;
            case 'turret':
                enemy = new Enemy(this.game, x, y, 48, 48, 'turret', 40, 150, 0);
                enemy.velocityY = 50;
                enemy.canFire = true;
                enemy.fireRate = 1500;
                break;
            case 'boss1':
                enemy = new Enemy(this.game, x, y, 128, 128, 'boss1', 500, 1000, 50);
                enemy.velocityY = 30;
                enemy.canFire = true;
                enemy.fireRate = 1000;
                break;
            // Add more enemy types as needed
        }
        
        if (enemy) {
            this.game.entityManager.add(enemy);
            this.game.collision.addToGroup(enemy, 'enemies');
        }
        
        return enemy;
    }
}
```

### Projectile (projectile.js)

```javascript
class Projectile extends Entity {
    constructor(game, x, y, width, height, velocityX, velocityY, damage, owner) {
        super(game, x, y, width, height);
        
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = damage;
        this.owner = owner; // 'player' or 'enemy'
        
        // Animation properties
        this.sprite = null;
        this.frameX = 0;
        this.frameY = 0;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Remove if off screen
        if (
            this.y < -this.height ||
            this.y > this.game.height + this.height ||
            this.x < -this.width ||
            this.x > this.game.width + this.width
        ) {
            this.destroy();
        }
    }
    
    render(context) {
        if (this.sprite) {
            context.drawImage(
                this.sprite,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } else {
            context.fillStyle = this.owner === 'player' ? 'blue' : 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
```

### Collectible (collectible.js)

```javascript
class Collectible extends Entity {
    constructor(game, x, y, width, height, type, value) {
        super(game, x, y, width, height);
        
        this.type = type;
        this.value = value;
        this.velocityY = 100;
        
        // Animation properties
        this.sprite = null;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrames = 4;
        this.frameTimer = 0;
        this.frameInterval = 150;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Update animation
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = (this.frameX + 1) % this.maxFrames;
        }
        
        // Remove if off screen
        if (this.y > this.game.height + this.height) {
            this.destroy();
        }
    }
    
    render(context) {
        if (this.sprite) {
            context.drawImage(
                this.sprite,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } else {
            context.fillStyle = this.getColorByType();
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    
    getColorByType() {
        switch (this.type) {
            case 'health': return 'green';
            case 'shield': return 'blue';
            case 'megabomb': return 'orange';
            case 'weapon': return 'purple';
            case 'money': return 'gold';
            default: return 'white';
        }
    }
    
    collect(player) {
        switch (this.type) {
            case 'health':
                player.addHealth(this.value);
                break;
            case 'shield':
                player.addShield(this.value);
                break;
            case 'megabomb':
                player.addMegabomb();
                break;
            case 'weapon':
                // Handle weapon upgrade
                break;
            case 'money':
                player.addMoney(this.value);
                break;
        }
        
        // Play pickup sound
        this.game.audio.playSound('pickup');
    }
}
```

### Explosion (explosion.js)

```javascript
class Explosion extends Entity {
    constructor(game, x, y, width, height) {
        super(game, x, y, width, height);
        
        // Animation properties
        this.sprite = null;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrames = 8;
        this.frameTimer = 0;
        this.frameInterval = 50;
        this.animationComplete = false;
    }
    
    update(deltaTime) {
        // Update animation
        this.frameTimer += deltaTime;
        
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX++;
            
            if (this.frameX >= this.maxFrames) {
                this.animationComplete = true;
                this.destroy();
            }
        }
    }
    
    render(context) {
        if (this.sprite) {
            context.drawImage(
                this.sprite,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } else {
            context.fillStyle = 'orange';
            context.beginPath();
            context.arc(
                this.x + this.width / 2,
                this.y + this.height / 2,
                (this.width / 2) * (this.frameX / this.maxFrames),
                0,
                Math.PI * 2
            );
            context.fill();
        }
    }
}
```

### Environment (environment.js)

```javascript
class ScrollingBackground {
    constructor(game, image, scrollSpeed) {
        this.game = game;
        this.image = image;
        this.scrollSpeed = scrollSpeed;
        this.width = game.width;
        this.height = image ? image.height : game.height;
        this.y1 = 0;
        this.y2 = -this.height;
    }
    
    update(deltaTime) {
        this.y1 += this.scrollSpeed * (deltaTime / 1000);
        this.y2 += this.scrollSpeed * (deltaTime / 1000);
        
        if (this.y1 >= this.game.height) {
            this.y1 = this.y2 - this.height;
        }
        
        if (this.y2 >= this.game.height) {
            this.y2 = this.y1 - this.height;
        }
    }
    
    render(context) {
        if (this.image) {
            context.drawImage(this.image, 0, this.y1, this.width, this.height);
            context.drawImage(this.image, 0, this.y2, this.width, this.height);
        } else {
            context.fillStyle = 'black';
            context.fillRect(0, this.y1, this.width, this.height);
            context.fillRect(0, this.y2, this.width, this.height);
        }
    }
}
```

## Game States

### Game State (game.js)

```javascript
class GameState {
    constructor(game) {
        this.game = game;
        this.player = null;
        this.enemyFactory = null;
        this.background = null;
        this.level = null;
        this.levelData = null;
        this.spawnTimer = 0;
        this.spawnIndex = 0;
        this.paused = false;
    }
    
    enter() {
        // Create player
        this.player = new Player(this.game, this.game.width / 2 - 32, this.game.height - 100);
        this.game.entityManager.add(this.player);
        this.game.collision.addToGroup(this.player, 'player');
        this.game.player = this.player;
        
        // Create enemy factory
        this.enemyFactory = new EnemyFactory(this.game);
        
        // Create background
        this.background = new ScrollingBackground(
            this.game,
            this.game.assets.getImage('background'),
            100
        );
        
        // Load level data
        this.loadLevel(1); // Start with level 1
        
        // Start level music
        this.game.audio.playMusic('level1Music');
    }
    
    exit() {
        // Clean up entities
        this.game.entityManager.clear();
        
        // Stop music
        this.game.audio.stopMusic();
    }
    
    update(deltaTime) {
        if (this.paused) return;
        
        // Update background
        this.background.update(deltaTime);
        
        // Update entities
        this.game.entityManager.update(deltaTime);
        
        // Check collisions
        this.game.collision.checkCollisions();
        
        // Handle enemy spawning
        this.updateEnemySpawning(deltaTime);
        
        // Check for level completion
        this.checkLevelCompletion();
        
        // Check for pause input
        if (this.game.input.isKeyPressed('Escape')) {
            this.paused = true;
            this.game.changeState('pause');
        }
    }
    
    render() {
        // Render background
        this.background.render(this.game.layers.background);
        
        // Render entities
        this.game.entityManager.render(this.game.layers.player);
        
        // Render UI
        this.renderUI();
    }
    
    renderUI() {
        const context = this.game.layers.ui;
        
        // Health bar
        context.fillStyle = 'black';
        context.fillRect(10, 10, 204, 24);
        context.fillStyle = 'red';
        context.fillRect(12, 12, 200 * (this.player.health / this.player.maxHealth), 20);
        
        // Shield bar
        context.fillStyle = 'black';
        context.fillRect(10, 40, 204, 24);
        context.fillStyle = 'blue';
        context.fillRect(12, 42, 200 * (this.player.shield / this.player.maxShield), 20);
        
        // Money
        context.fillStyle = 'white';
        context.font = '20px Arial';
        context.fillText(`$${this.player.money}`, 10, 90);
        
        // Megabombs
        context.fillText(`Bombs: ${this.player.megabombs}`, 10, 120);
    }
    
    loadLevel(levelNumber) {
        this.level = levelNumber;
        this.levelData = this.game.assets.getData(`level${levelNumber}`);
        this.spawnTimer = 0;
        this.spawnIndex = 0;
    }
    
    updateEnemySpawning(deltaTime) {
        if (!this.levelData || this.spawnIndex >= this.levelData.enemies.length) return;
        
        this.spawnTimer += deltaTime;
        
        while (
            this.spawnIndex < this.levelData.enemies.length &&
            this.spawnTimer >= this.levelData.enemies[this.spawnIndex].time
        ) {
            const enemyData = this.levelData.enemies[this.spawnIndex];
            this.enemyFactory.createEnemy(enemyData.type, enemyData.x, enemyData.y);
            this.spawnIndex++;
        }
    }
    
    checkLevelCompletion() {
        // Check if all enemies are spawned and destroyed
        if (
            this.spawnIndex >= this.levelData.enemies.length &&
            this.game.collision.collisionGroups.enemies.length === 0
        ) {
            // Level complete
            if (this.level === 1) {
                // Load next level
                this.loadLevel(2);
            } else {
                // Game complete
                this.game.changeState('gameover');
            }
        }
    }
}
```

## Level Data

### Level 1 (level1.js)

```javascript
const level1Data = {
    name: "Bravo Sector - Wave 1",
    background: "background1",
    music: "level1Music",
    enemies: [
        { time: 1000, type: "fighter", x: 100, y: -50 },
        { time: 1500, type: "fighter", x: 300, y: -50 },
        { time: 2000, type: "fighter", x: 500, y: -50 },
        { time: 3000, type: "bomber", x: 200, y: -70 },
        { time: 3500, type: "bomber", x: 400, y: -70 },
        { time: 5000, type: "turret", x: 150, y: -50 },
        { time: 5500, type: "turret", x: 450, y: -50 },
        { time: 7000, type: "fighter", x: 100, y: -50 },
        { time: 7200, type: "fighter", x: 200, y: -50 },
        { time: 7400, type: "fighter", x: 300, y: -50 },
        { time: 7600, type: "fighter", x: 400, y: -50 },
        { time: 7800, type: "fighter", x: 500, y: -50 },
        { time: 10000, type: "boss1", x: 300, y: -150 }
    ],
    collectibles: [
        { time: 4000, type: "health", x: 300, y: -30, value: 20 },
        { time: 6000, type: "shield", x: 200, y: -30, value: 20 },
        { time: 8000, type: "megabomb", x: 400, y: -30, value: 1 }
    ]
};
```

### Level 2 (level2.js)

```javascript
const level2Data = {
    name: "Bravo Sector - Wave 2",
    background: "background2",
    music: "level2Music",
    enemies: [
        { time: 1000, type: "fighter", x: 150, y: -50 },
        { time: 1200, type: "fighter", x: 250, y: -50 },
        { time: 1400, type: "fighter", x: 350, y: -50 },
        { time: 1600, type: "fighter", x: 450, y: -50 },
        { time: 2500, type: "bomber", x: 100, y: -70 },
        { time: 2700, type: "bomber", x: 300, y: -70 },
        { time: 2900, type: "bomber", x: 500, y: -70 },
        { time: 4000, type: "turret", x: 200, y: -50 },
        { time: 4200, type: "turret", x: 400, y: -50 },
        { time: 5000, type: "fighter", x: 100, y: -50 },
        { time: 5100, type: "fighter", x: 200, y: -50 },
        { time: 5200, type: "fighter", x: 300, y: -50 },
        { time: 5300, type: "fighter", x: 400, y: -50 },
        { time: 5400, type: "fighter", x: 500, y: -50 },
        { time: 7000, type: "bomber", x: 150, y: -70 },
        { time: 7200, type: "bomber", x: 350, y: -70 },
        { time: 7400, type: "bomber", x: 550, y: -70 },
        { time: 8000, type: "turret", x: 100, y: -50 },
        { time: 8200, type: "turret", x: 300, y: -50 },
        { time: 8400, type: "turret", x: 500, y: -50 },
        { time: 10000, type: "boss2", x: 300, y: -150 }
    ],
    collectibles: [
        { time: 3000, type: "health", x: 250, y: -30, value: 20 },
        { time: 6000, type: "shield", x: 350, y: -30, value: 20 },
        { time: 9000, type: "megabomb", x: 300, y: -30, value: 1 }
    ]
};
```

## Main Script (main.js)

```javascript
window.addEventListener('load', () => {
    // Create and start the game
    const game = new Game();
    
    // Expose game to window for debugging
    window.game = game;
});
```

This technical specification provides a comprehensive framework for implementing the Raptor: Call of the Shadows reimagining. The modular architecture allows for easy extension and maintenance, while the entity-component system provides flexibility for creating various game elements. The implementation follows modern JavaScript practices and ensures compatibility with modern browsers.

