/**
 * Game class
 * The main engine that runs the entire game, manages the canvas layers,
 * the game loop, and the state machine.
 */
import { InputHandler } from './input.js';
import { AssetManager } from './assets.js';
import { AudioManager } from './audio.js';
import { CollisionSystem } from './collision.js';
import { EntityManager } from './entity.js';
import { SaveManager } from './saveManager.js';
import { ObjectPool } from './ObjectPool.js';
import { Projectile } from '../entities/projectile.js';
import { Missile } from '../entities/missile.js';
import { BootState } from '../states/boot.js';
import { LoadingState } from '../states/LoadingState.js';
import { IntroCutsceneState } from '../states/introCutscene.js';
import { MenuState } from '../states/menu.js';
import { GameState } from '../states/gameState.js';
import { PauseState } from '../states/pause.js';
import { GameOverState } from '../states/gameover.js';
import { HangarState } from '../states/hangar.js';
import ShopState from '../states/shop.js';
import { CharacterSelectState } from '../states/characterSelect.js';
import { logger } from '../utils/logger.js';

class Game {
    constructor() {
        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / 60;
        this.currentFPS = 0;
        this.debugMode = false;

        this.gameLoop = this.gameLoop.bind(this);

        this.layers = {
            background: document.getElementById('background-layer'),
            environment: document.getElementById('environment-layer'),
            enemy: document.getElementById('enemy-layer'),
            projectile: document.getElementById('projectile-layer'),
            player: document.getElementById('player-layer'),
            explosion: document.getElementById('explosion-layer'),
            ui: document.getElementById('ui-layer')
        };

        this.contexts = {};
        for (const key in this.layers) {
            const canvas = this.layers[key];
            const ctx = canvas.getContext('2d', { alpha: true });
            ctx.globalCompositeOperation = 'source-over';
            ctx.imageSmoothingEnabled = true;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.contexts[key] = ctx;
        }

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.playerData = this.getDefaultPlayerData();
        this.player = null;
        this.mainScrollSpeed = 50;

        this.input = new InputHandler();
        this.assets = new AssetManager(this);
        this.audio = new AudioManager(this.assets);
        this.collision = new CollisionSystem(this);
        this.entityManager = new EntityManager(this);
        this.saveManager = new SaveManager(this);
        this.projectilePool = new ObjectPool(() => new Projectile(this), 50);
        this.missilePool = new ObjectPool(() => new Missile(this), 20);

        this.states = {
            boot: new BootState(this),
            loading: new LoadingState(this),
            introCutscene: new IntroCutsceneState(this),
            menu: new MenuState(this),
            game: new GameState(this),
            pause: new PauseState(this),
            gameover: new GameOverState(this),
            hangar: new HangarState(this),
            shop: new ShopState(this),
            characterSelect: new CharacterSelectState(this)
        };
        this.currentState = null;

        (async () => {
            await this.changeState('boot');
        })();

        requestAnimationFrame(this.gameLoop);
    }

    getDefaultPlayerData() {
        return {
            name: 'Pilot',
            callsign: 'RAPTOR',
            money: 10000,
            level: 1,
            score: 0,
            lives: 3,
            health: 75,
            maxHealth: 100,
            shield: 0,
            megabombs: 3,
            unlockedWeapons: [],
            lastCompletedLevel: 0,
            timestamp: Date.now()
        };
    }

    normalizePlayerData(data = {}) {
        const defaults = this.getDefaultPlayerData();
        const merged = { ...defaults, ...data };
        merged.level = Math.max(1, Number(merged.level) || 1);
        merged.money = Number(merged.money) || 0;
        merged.score = Number(merged.score) || 0;
        merged.lives = Math.max(1, Number(merged.lives) || defaults.lives);
        merged.maxHealth = Math.max(1, Number(merged.maxHealth) || defaults.maxHealth);
        merged.health = Math.min(merged.maxHealth, Math.max(0, Number(merged.health) || defaults.health));
        merged.shield = Math.max(0, Number(merged.shield) || 0);
        merged.megabombs = Math.max(0, Number(merged.megabombs) || defaults.megabombs);
        merged.lastCompletedLevel = Math.max(0, Number(merged.lastCompletedLevel) || 0);
        merged.unlockedWeapons = Array.isArray(merged.unlockedWeapons) && merged.unlockedWeapons.length > 0
            ? [...new Set(merged.unlockedWeapons)]
            : [...defaults.unlockedWeapons];
        merged.timestamp = Date.now();
        return merged;
    }

    setPlayerData(data = {}) {
        this.playerData = this.normalizePlayerData(data);
        return this.playerData;
    }

    resize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        this.width = windowWidth;
        this.height = windowHeight;

        for (const key in this.layers) {
            const canvas = this.layers[key];
            canvas.width = windowWidth;
            canvas.height = windowHeight;
            canvas.style.width = windowWidth + 'px';
            canvas.style.height = windowHeight + 'px';
            canvas.style.position = 'absolute';
            canvas.style.left = '0';
            canvas.style.top = '0';
            canvas.style.transform = '';
        }

        if (this.currentState && typeof this.currentState.resize === 'function') {
            this.currentState.resize();
        }
    }

    update(deltaTime) {
        if (this.currentState) {
            this.currentState.update(deltaTime);
        }
        this.input.update();

        if (this.input.skipWavePressed) {
            logger.debug('DEBUG: Skip Wave Pressed!');
            if (this.currentState && typeof this.currentState.skipWave === 'function') {
                this.currentState.skipWave();
            }
        }

        if (this.input.restartLevelPressed) {
            logger.debug('DEBUG: Restart Level Pressed!');
            if (this.currentState && typeof this.currentState.restartLevel === 'function') {
                this.currentState.restartLevel();
            }
        }

        if (this.input.cycleLevelPressed) {
            logger.debug('DEBUG: Cycle Level Pressed!');
            this.cycleLevel();
        }
    }

    render() {
        for (const key in this.contexts) {
            const ctx = this.contexts[key];
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, this.width, this.height);
        }

        if (this.currentState) {
            this.currentState.render(this.contexts);
        }
    }

    gameLoop(timestamp) {
        if (!this.lastTime) {
            this.lastTime = timestamp;
        }

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.currentFPS = Math.round(1000 / Math.max(deltaTime, 1));
        this.accumulator += deltaTime;

        while (this.accumulator >= this.timeStep) {
            this.update(this.timeStep);
            this.accumulator -= this.timeStep;
        }

        this.render();
        requestAnimationFrame(this.gameLoop);
    }

    cycleLevel() {
        logger.debug('Attempting to cycle level...');
        if (this.currentState instanceof GameState) {
            this.currentState.cycleLevel();
        } else {
            logger.debug('Cannot cycle level: Not in GameState.');
        }
    }

    async changeState(stateName, context = {}) {
        logger.info(`Changing state from ${this.currentState ? this.currentState.constructor.name : 'null'} to ${stateName}`);

        const previousState = this.currentState;
        if (previousState && typeof previousState.exit === 'function') {
            logger.info(`Exiting current state: ${previousState.constructor.name}`);
            previousState.exit();
        }

        const newState = this.states[stateName];
        if (!newState) {
            logger.error(`State \"${stateName}\" not found!`);
            return;
        }

        logger.info(`Found new state: ${stateName}, entering...`);
        this.currentState = newState;

        if (typeof this.currentState.enter === 'function') {
            const result = this.currentState.enter({
                ...context,
                fromState: previousState,
                fromStateName: previousState?.name || previousState?.constructor?.name || null
            });
            if (result && typeof result.then === 'function') {
                await result;
            }
        }

        logger.info(`Successfully entered state: ${stateName}`);
    }
}

export { Game };

