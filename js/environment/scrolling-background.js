/**
 * Procedural Environment class
 * Represents a single piece of background terrain (e.g., a rock, a metal plate)
 */
class ProceduralEnvironment {
    constructor(game, y, speed, layer) {
        this.game = game;
        this.x = Math.random() * this.game.width;
        this.y = y;
        this.width = Math.random() * 100 + 50; // Increased width range: 50-150
        this.height = Math.random() * 120 + 60; // Increased height range: 60-180
        this.speed = speed;
        
        // Layer determines color and speed, creating parallax
        if (layer === 'far') {
            // Darker, slower rocks in the distance
            const darkShade = Math.floor(Math.random() * 30) + 30; // 30-60
            this.color = `rgba(${darkShade}, ${darkShade}, ${darkShade + 20}, 0.3)`; // Slight blue tint, semi-transparent
            this.speed *= 0.3; // Even slower speed for distant layer
        } else {
            // Lighter, faster plates/rocks in the foreground
            const lightShade = Math.floor(Math.random() * 40) + 60; // 60-100
            this.color = `rgba(${lightShade}, ${lightShade}, ${lightShade + 30}, 0.2)`; // More blue tint, more transparent
        }
    }

    update(deltaTime) {
        this.y += this.speed * (deltaTime / 1000);
        // Reset position when it scrolls off the bottom of the screen
        if (this.y > this.game.height) {
            this.y = -this.height;
            this.x = Math.random() * this.game.width;
        }
    }

    render(context) {
        context.fillStyle = this.color;
        // Draw a simple rectangle to represent a terrain piece
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    reset() {
        this.y = Math.random() * this.game.height;
        this.x = Math.random() * this.game.width;
    }
}

/**
 * ScrollingBackground class
 * Creates and manages a multi-layered, procedural, vertically scrolling background
 * to give a better "Raptor" feel.
 */
class ScrollingBackground {
    constructor(game, speed) {
        this.game = game;
        this.speed = speed;
        this.farLayerObjects = [];   // Slower, darker objects for parallax
        this.nearLayerObjects = [];  // Faster, lighter objects
        this.backgrounds = [];       // Original background images
        this.backgroundHeight = 0;
        
        // Initialize the background elements
        this.init();
    }

    /**
     * Initialize scrolling background by creating procedural objects
     */
    init() {
        // Initialize original background
        const backgroundImage = this.game.assets.getImage('backgroundLevel1');
        if (backgroundImage) {
            this.backgroundHeight = backgroundImage.height;
            
            // Create two background instances for seamless scrolling
            const bg1 = new Environment(
                this.game,
                0,
                0,
                this.game.width,
                backgroundImage.height,
                'background1'
            );
            
            const bg2 = new Environment(
                this.game,
                0,
                -backgroundImage.height,
                this.game.width,
                backgroundImage.height,
                'background1'
            );
            
            this.backgrounds.push(bg1, bg2);
        }

        const objectCount = 50; // Number of objects per layer

        // Create objects for the "far" layer (distant)
        for (let i = 0; i < objectCount; i++) {
            this.farLayerObjects.push(
                new ProceduralEnvironment(this.game, Math.random() * this.game.height, this.speed, 'far')
            );
        }
        
        // Create objects for the "near" layer (foreground)
        for (let i = 0; i < objectCount; i++) {
            this.nearLayerObjects.push(
                new ProceduralEnvironment(this.game, Math.random() * this.game.height, this.speed, 'near')
            );
        }
    }

    /**
     * Reset the background to its initial state
     */
    reset() {
        // Reset original backgrounds
        this.backgrounds.forEach(bg => {
            bg.y = bg === this.backgrounds[0] ? 0 : -this.backgroundHeight;
        });

        // Reset procedural objects
        this.farLayerObjects.forEach(obj => obj.reset());
        this.nearLayerObjects.forEach(obj => obj.reset());
    }

    /**
     * Update scrolling background elements
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Update original backgrounds
        this.backgrounds.forEach(bg => {
            bg.y += this.speed * (deltaTime / 1000);
            
            // Reset position when off screen for seamless scrolling
            if (bg.y >= this.game.height) {
                bg.y = -this.backgroundHeight + (bg.y - this.game.height);
            }
        });

        // Update procedural layers
        this.farLayerObjects.forEach(obj => obj.update(deltaTime));
        this.nearLayerObjects.forEach(obj => obj.update(deltaTime));
    }

    /**
     * Render scrolling background
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    render(context) {
        // Get the background context from the game
        const bgContext = this.game.contexts.background;
        
        // Clear the background canvas
        bgContext.clearRect(0, 0, this.game.width, this.game.height);

        // Render original background first
        this.backgrounds.forEach(bg => {
            bg.render(bgContext);
        });

        // Render the far layer on top
        this.farLayerObjects.forEach(obj => obj.render(bgContext));
        
        // Render the near layer last
        this.nearLayerObjects.forEach(obj => obj.render(bgContext));
    }
} 