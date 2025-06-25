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
import { BootState } from '../states/boot.js';
import { LoadingState } from '../states/loading.js';
import { MenuState } from '../states/menu.js';
import { GameState } from '../states/gameState.js';
import { PauseState } from '../states/pause.js';
import { GameOverState } from '../states/gameover.js';
import { HangarState } from '../states/hangar.js';
import { SupplyState } from '../states/supply.js';
import { IntroCutsceneState } from '../states/introCutscene.js';
import { CharacterSelectState } from '../states/characterSelect.js';
import { ShopState } from '../states/shop.js';

class Game {
    constructor() {
        // Find all the canvas layers from the HTML
        this.layers = {
            background: document.getElementById('background-layer'),
            environment: document.getElementById('environment-layer'), // NEW: Added environment layer
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
        this.assets = new AssetManager();
        this.audio = new AudioManager();
        this.collision = new CollisionSystem(this);
        this.entityManager = new EntityManager(this);
        this.saveManager = new SaveManager(this);

        // --- State Management ---
        this.states = {
            boot: new BootState(this),
            loading: new LoadingState(this),
            menu: new MenuState(this),
            game: new GameState(this),
            pause: new PauseState(this),
            gameover: new GameOverState(this),
            hangar: new HangarState(this),
            supply: new SupplyState(this),
            introCutscene: new IntroCutsceneState(this),
            characterSelect: new CharacterSelectState(this),
            shop: new ShopState(this)
        };
        this.currentState = null;

        // --- UPGRADE: Game Loop Properties for Fixed Timestep ---
        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / 60; // 60 updates per second

        // --- Start the Game ---
        (async () => {
            await this.changeState('boot');
        })();

        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Resize all canvas layers to match window size while enforcing a 4:3 aspect ratio.
     */
    resize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const targetAspectRatio = 4 / 3;

        let newWidth, newHeight;

        // Determine the largest possible 4:3 canvas that fits within the window
        if (windowWidth / windowHeight > targetAspectRatio) {
            // Window is wider than 4:3, so height is the limiting dimension
            newHeight = windowHeight;
            newWidth = newHeight * targetAspectRatio;
        } else {
            // Window is taller than 4:3, so width is the limiting dimension
            newWidth = windowWidth;
            newHeight = newWidth / targetAspectRatio;
        }

        // Set the internal game dimensions
        this.width = 800; // Set a fixed internal resolution
        this.height = 600; // 800x600 is a classic 4:3 resolution

        // Resize and position all canvas layers to be centered in the window
        for (const key in this.layers) {
            const canvas = this.layers[key];
            canvas.width = this.width;
            canvas.height = this.height;

            // Apply styles to center the canvas and scale it correctly
            canvas.style.width = `${newWidth}px`;
            canvas.style.height = `${newHeight}px`;
            canvas.style.position = 'absolute';
            canvas.style.left = `${(windowWidth - newWidth) / 2}px`;
            canvas.style.top = `${(windowHeight - newHeight) / 2}px`;
        }

        // Notify the current state of the resize if it has a resize handler
        if (this.currentState && typeof this.currentState.resize === 'function') {
            this.currentState.resize();
        }
    }

    // --- UPGRADE: Game Loop now uses a Fixed Timestep for stable physics ---
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.accumulator += deltaTime;

        // Update the game logic in fixed steps. This prevents physics from changing
        // based on the frame rate, which is more stable.
        while (this.accumulator >= this.timeStep) {
            if (this.currentState) {
                this.currentState.update(this.timeStep);
            }
            this.input.update(); // Input should also update on the fixed step
            this.accumulator -= this.timeStep;
        }

        // Render as fast as possible, independent of the logic update rate.
        if (this.currentState && this.width && this.height) {
            // Clear all canvas layers
            for (const key in this.contexts) {
                const ctx = this.contexts[key];
                if (ctx) {
                    ctx.clearRect(0, 0, this.width, this.height);
                }
            }
            this.currentState.render(this.contexts);
        }

        requestAnimationFrame(this.gameLoop);
    }
    
    // --- This is our current, correct, async-aware changeState method ---
    async changeState(stateName) {
        if (this.currentState && typeof this.currentState.exit === 'function') {
            this.currentState.exit();
        }

        const newState = this.states[stateName];
        if (newState) {
            this.currentState = newState;
            if (typeof this.currentState.enter === 'function') {
                const result = this.currentState.enter();
                // This correctly handles states with an async enter() method
                if (result && typeof result.then === 'function') {
                    await result;
                }
            }
        } else {
            console.error(`State "${stateName}" not found!`);
        }
    }
}

export { Game };