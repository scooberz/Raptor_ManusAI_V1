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
import { SupplyState } from '../states/supply.js';
import ShopState from '../states/shop.js';
import { CharacterSelectState } from '../states/characterSelect.js';
import { logger } from '../utils/logger.js';

class Game {
    constructor() {
        // --- TIMING & FPS LOCK ---
        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / 60;
        this.currentFPS = 0;
        this.debugMode = false; // Enable debug logging for the game loop

        // --- BIND THE GAME LOOP'S CONTEXT ---
        this.gameLoop = this.gameLoop.bind(this);

        // Find all the canvas layers from the HTML
        this.layers = {
            background: document.getElementById('background-layer'),
            enemy: document.getElementById('enemy-layer'),
            projectile: document.getElementById('projectile-layer'),
            player: document.getElementById('player-layer'),
            explosion: document.getElementById('explosion-layer'),
            ui: document.getElementById('ui-layer')
        };

        // Get the 2D rendering contexts for each layer
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

        this.playerData = { score: 0, money: 0 };

        // --- Core Engine Components ---
        this.input = new InputHandler();
        // --- NEW: The AssetManager now correctly receives the game instance ---
        this.assets = new AssetManager(this);
        // --- NEW: The AudioManager is now initialized with assets ---
        this.audio = new AudioManager(this.assets);

        this.collision = new CollisionSystem(this);
        this.entityManager = new EntityManager(this);
        this.saveManager = new SaveManager(this);
        this.projectilePool = new ObjectPool(() => new Projectile(this), 50); // Creates a pool of 50 projectiles
        this.missilePool = new ObjectPool(() => new Missile(this), 20); // Creates a pool of 20 missiles

        // --- State Management ---
        this.states = {
            boot: new BootState(this),
            loading: new LoadingState(this),
            introCutscene: new IntroCutsceneState(this),
            menu: new MenuState(this),
            game: new GameState(this),
            pause: new PauseState(this),
            gameover: new GameOverState(this),
            hangar: new HangarState(this),
            supply: new SupplyState(this),
            shop: new ShopState(this),
            characterSelect: new CharacterSelectState(this)
        };
        this.currentState = null;

        // --- Start the Game ---
        (async () => {
            await this.changeState('boot');
        })();

        // Start the main game loop
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Resize all canvas layers to match window size
     */
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

    /**
     * Update the game logic with a fixed timestep
     * @param {number} deltaTime - Fixed time step in milliseconds
     */
    update(deltaTime) {
        if (this.currentState) {
            this.currentState.update(deltaTime);
        }
        this.input.update();

        // Handle debug inputs
        if (this.input.skipWavePressed) {
            logger.debug("DEBUG: Skip Wave Pressed!");
            if (this.currentState && typeof this.currentState.skipWave === 'function') {
                this.currentState.skipWave();
            }
        }

        if (this.input.restartLevelPressed) {
            logger.debug("DEBUG: Restart Level Pressed!");
            if (this.currentState && typeof this.currentState.restartLevel === 'function') {
                this.currentState.restartLevel();
            }
        }

        if (this.input.cycleLevelPressed) {
            logger.debug("DEBUG: Cycle Level Pressed!");
            this.cycleLevel();
        }
    }

    /**
     * Render the game as fast as possible
     */
    render() {
        // --- SYSTEMIC STATE RESET ---
        for (const key in this.contexts) {
            const ctx = this.contexts[key];
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, this.width, this.height);
        }
        // Now that all layers are clean and reset, proceed with rendering the current state.
        if (this.currentState) {
            this.currentState.render(this.contexts);
        }
    }

    /**
     * The main game loop, called for every frame
     * @param {number} timestamp - The current time provided by the browser
     */
    gameLoop(timestamp) {
        // Fallback for the first frame to prevent a large deltaTime
        if (!this.lastTime) {
            this.lastTime = timestamp;
        }

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // For the debug overlay
        this.currentFPS = Math.round(1000 / deltaTime);

        this.accumulator += deltaTime;

        // Run the fixed-step update loop for game logic
        while (this.accumulator >= this.timeStep) {
            this.update(this.timeStep);
            this.accumulator -= this.timeStep;
        }

        // Render graphics as fast as possible
        this.render();

        // Request the next frame
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Cycles through game levels for debugging purposes.
     * This method is intended for development and testing.
     */
    cycleLevel() {
        logger.debug("Attempting to cycle level...");
        // Implement level cycling logic here
        // For example, if you have a GameState that manages levels:
        if (this.currentState instanceof GameState) {
            this.currentState.cycleLevel();
        } else {
            logger.debug("Cannot cycle level: Not in GameState.");
        }
    }

    /**
     * Change the current game state
     * @param {string} stateName - The name of the state to switch to
     */
    async changeState(stateName) {
        logger.info(`Changing state from ${this.currentState ? this.currentState.constructor.name : 'null'} to ${stateName}`);

        if (this.currentState && typeof this.currentState.exit === 'function') {
            logger.info(`Exiting current state: ${this.currentState.constructor.name}`);
            this.currentState.exit();
        }

        const newState = this.states[stateName];
        if (newState) {
            logger.info(`Found new state: ${stateName}, entering...`);
            this.currentState = newState;
            if (typeof this.currentState.enter === 'function') {
                const result = this.currentState.enter();
                if (result && typeof result.then === 'function') {
                    await result;
                }
            }
            logger.info(`Successfully entered state: ${stateName}`);
        } else {
            logger.error(`State "${stateName}" not found!`);
        }
    }
}

export { Game };