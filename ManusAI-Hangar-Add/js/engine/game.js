/**
 * Game class - Core game engine
 * Handles the game loop, state management, and rendering
 */
class Game {
    constructor() {
        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / 60; // 60 FPS
        
        // Initialize managers
        this.input = new InputHandler();
        this.assets = new AssetManager();
        this.audio = new AudioManager();
        this.collision = new CollisionSystem();
        this.entityManager = new EntityManager();
        
        // Game states
        this.currentState = null;
        this.states = {};
        
        // Game properties
        this.width = 800;
        this.height = 600;
        this.paused = false;
        
        // Initialize the game
        this.init();
    }
    
    init() {
        // Initialize canvas layers
        this.layers = {
            background: document.getElementById('background-layer').getContext('2d'),
            enemy: document.getElementById('enemy-layer').getContext('2d'),
            player: document.getElementById('player-layer').getContext('2d'),
            projectile: document.getElementById('projectile-layer').getContext('2d'),
            explosion: document.getElementById('explosion-layer').getContext('2d'),
            ui: document.getElementById('ui-layer').getContext('2d')
        };
        
        // Set canvas dimensions
        Object.values(this.layers).forEach(context => {
            context.canvas.width = this.width;
            context.canvas.height = this.height;
        });
        
        // Initialize states
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
        if (this.paused) return;
        
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
    
    togglePause() {
        this.paused = !this.paused;
        return this.paused;
    }
    
    resize() {
        // Handle window resize if needed
        // This could adjust canvas dimensions based on window size
    }
}

