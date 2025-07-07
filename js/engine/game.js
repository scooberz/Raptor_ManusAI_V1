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
import { TouchHandler } from './touchHandler.js';
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

class Game {
    constructor() {
        // --- TIMING & FPS LOCK ---
        this.fps = 30;
        this.frameInterval = 1000 / this.fps;
        this.lastTime = 0;
        this.timer = 0;

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

        // --- Touch Support Detection ---
        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        this.touchHandler = null;

        if (this.isTouchDevice) {
            console.log("Touch device detected. Initializing touch controls.");
            this.touchHandler = new TouchHandler(this);
        } else {
            console.log("Keyboard and mouse controls enabled.");
        }
        // --- End Touch Support ---

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
        this.lastTime = 0;
        this.running = true; // Add a running flag
        this.gameLoop(0);
    }

    /**
     * Resize all canvas layers to match window size
     */
    resize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const minWidth = 800;
        const minHeight = 600;
        const targetAspectRatio = 16 / 9;
        let gameWidth, gameHeight;

        if (windowWidth / windowHeight > targetAspectRatio) {
            gameHeight = Math.max(minHeight, windowHeight);
            gameWidth = gameHeight * targetAspectRatio;
        } else {
            gameWidth = Math.max(minWidth, windowWidth);
            gameHeight = gameWidth / targetAspectRatio;
        }
        
        this.width = gameWidth;
        this.height = gameHeight;
        
        const scaleX = windowWidth / gameWidth;
        const scaleY = windowHeight / gameHeight;
        const scale = Math.min(scaleX, scaleY);
        
        for (const key in this.layers) {
            const canvas = this.layers[key];
            canvas.width = gameWidth;
            canvas.height = gameHeight;
            
            const scaledWidth = gameWidth * scale;
            const scaledHeight = gameHeight * scale;
            
            canvas.style.width = `${scaledWidth}px`;
            canvas.style.height = `${scaledHeight}px`;
            canvas.style.position = 'absolute';
            canvas.style.left = `${(windowWidth - scaledWidth) / 2}px`;
            canvas.style.top = `${(windowHeight - scaledHeight) / 2}px`;
            
            const ctx = this.contexts[key];
            ctx.imageSmoothingEnabled = false;
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
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.timer += deltaTime;

        // If enough time has passed, update the game logic
        if (this.timer > this.frameInterval) {
            // Use the fixed frameInterval for the update to ensure consistency
            this.update(this.frameInterval);
            this.timer = 0; // Reset the timer
        }

        // Render every frame, regardless of logic update
        this.render();

        // Request the next frame
        if (this.running) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    /**
     * Change the current game state
     * @param {string} stateName - The name of the state to switch to
     */
    async changeState(stateName) {
        console.log(`Changing state from ${this.currentState ? this.currentState.constructor.name : 'null'} to ${stateName}`);
        
        if (this.currentState && typeof this.currentState.exit === 'function') {
            console.log(`Exiting current state: ${this.currentState.constructor.name}`);
            this.currentState.exit();
        }

        const newState = this.states[stateName];
        if (newState) {
            console.log(`Found new state: ${stateName}, entering...`);
            this.currentState = newState;
            if (typeof this.currentState.enter === 'function') {
                const result = this.currentState.enter();
                if (result && typeof result.then === 'function') {
                    await result;
                }
            }
            console.log(`Successfully entered state: ${stateName}`);
        } else {
            console.error(`State "${stateName}" not found!`);
        }
    }
}

export { Game };