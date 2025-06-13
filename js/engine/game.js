/**
 * Game class
 * The main engine that runs the entire game, manages the canvas layers,
 * the game loop, and the state machine.
 */
class Game {
    constructor() {
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
            
            // Enable transparency
            ctx.globalCompositeOperation = 'source-over';
            ctx.imageSmoothingEnabled = true;
            
            // Clear the canvas with transparency
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            this.contexts[key] = ctx;
        }

        // Set initial game dimensions
        this.resize();

        // Handle window resize
        window.addEventListener('resize', () => this.resize());

        // Initialize persistent player data
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
            supply: new SupplyState(this)
        };
        this.currentState = null;

        // --- Start the Game ---
        this.changeState('boot'); // Start with the boot state

        // Start the main game loop
        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / 60; // 60 FPS
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Resize all canvas layers to match window size
     */
    resize() {
        // Get the window dimensions
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Set a minimum game size
        const minWidth = 800;
        const minHeight = 600;
        
        // Calculate the game dimensions while maintaining aspect ratio
        const targetAspectRatio = 16 / 9; // Standard widescreen aspect ratio
        let gameWidth, gameHeight;
        
        // Calculate dimensions based on window size
        if (windowWidth / windowHeight > targetAspectRatio) {
            // Window is wider than target aspect ratio
            gameHeight = Math.max(minHeight, windowHeight);
            gameWidth = gameHeight * targetAspectRatio;
        } else {
            // Window is taller than target aspect ratio
            gameWidth = Math.max(minWidth, windowWidth);
            gameHeight = gameWidth / targetAspectRatio;
        }
        
        // Update game dimensions
        this.width = gameWidth;
        this.height = gameHeight;
        
        // Calculate scale factor for pixel-perfect rendering
        const scaleX = windowWidth / gameWidth;
        const scaleY = windowHeight / gameHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // Resize all canvas layers
        for (const key in this.layers) {
            const canvas = this.layers[key];
            
            // Set the canvas size to the game dimensions
            canvas.width = gameWidth;
            canvas.height = gameHeight;
            
            // Scale the canvas to fit the window while maintaining aspect ratio
            const scaledWidth = gameWidth * scale;
            const scaledHeight = gameHeight * scale;
            
            // Center the canvas in the window
            canvas.style.width = `${scaledWidth}px`;
            canvas.style.height = `${scaledHeight}px`;
            canvas.style.position = 'absolute';
            canvas.style.left = `${(windowWidth - scaledWidth) / 2}px`;
            canvas.style.top = `${(windowHeight - scaledHeight) / 2}px`;
            
            // Enable pixel-perfect rendering
            const ctx = this.contexts[key];
            ctx.imageSmoothingEnabled = false;
        }
        
        // Notify current state of resize if it has a resize handler
        if (this.currentState && typeof this.currentState.resize === 'function') {
            this.currentState.resize();
        }
    }

    /**
     * The main game loop, called for every frame
     * @param {number} timestamp - The current time provided by the browser
     */
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (this.currentState) {
            // Clear all canvas layers using their contexts
            for (const key in this.contexts) {
                this.contexts[key].clearRect(0, 0, this.width, this.height);
            }

            // 1. Update game logic based on the current state
            this.currentState.update(deltaTime);

            // 2. Render game objects, passing the contexts object
            this.currentState.render(this.contexts);
            this.input.update();
        }

        // Request the next frame to continue the loop
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Change the current game state
     * @param {string} stateName - The name of the state to switch to
     */
    changeState(stateName) {
        if (this.currentState && typeof this.currentState.exit === 'function') {
            this.currentState.exit();
        }

        const newState = this.states[stateName];
        if (newState) {
            this.currentState = newState;
            if (typeof this.currentState.enter === 'function') {
                this.currentState.enter();
            }
        } else {
            console.error(`State "${stateName}" not found!`);
        }
    }
}
