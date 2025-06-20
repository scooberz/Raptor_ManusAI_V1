/**
 * Environment class
 * Represents background and environment elements
 */
class Environment extends Entity {
    constructor(game, x, y, width, height, type) {
        super(game, x, y, width, height);
        
        this.type = type;
        this.sprite = null;
        
        // Load appropriate sprite based on type
        this.loadSprite();
    }
    
    /**
     * Load the appropriate sprite based on type
     */
    loadSprite() {
        switch (this.type) {
            case 'background1':
                this.sprite = this.game.assets.getImage('backgroundLevel1');
                break;
            case 'background2':
                this.sprite = this.game.assets.getImage('backgroundLevel2');
                break;
            // Add more environment types as needed
        }
    }
    
    /**
     * Render the environment element
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    render(context) {
        if (this.sprite) {
            context.drawImage(
                this.sprite,
                Math.floor(this.x),
                Math.floor(this.y),
                this.width,
                this.height
            );
        }
    }
}

/**
 * ScrollingBackground class
 * Creates a vertically scrolling background
 */
class ScrollingBackground {
    constructor(game, speed, level) {
        this.game = game;
        this.speed = speed;
        this.level = level;
        this.backgrounds = [];
        this.backgroundHeight = 0;
        
        // Initialize backgrounds
        this.init();
    }
    
    /**
     * Initialize scrolling background
     */
    init() {
        // Load background image
        const backgroundImage = this.game.assets.getImage(`backgroundLevel${this.level}`);
        
        if (backgroundImage) {
            this.backgroundHeight = backgroundImage.height;
            
            // Create two background instances for seamless scrolling
            const bg1 = new Environment(
                this.game,
                0,
                0,
                this.game.width,
                backgroundImage.height,
                `background${this.level}`
            );
            
            const bg2 = new Environment(
                this.game,
                0,
                -backgroundImage.height,
                this.game.width,
                backgroundImage.height,
                `background${this.level}`
            );
            
            this.backgrounds.push(bg1, bg2);
        }
    }
    
    /**
     * Update scrolling background
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Move backgrounds down
        this.backgrounds.forEach(bg => {
            bg.y += this.speed * (deltaTime / 1000);
            
            // Reset position when off screen for seamless scrolling
            if (bg.y >= this.game.height) {
                bg.y = -this.backgroundHeight + (bg.y - this.game.height);
            }
        });
    }
    
    /**
     * Render scrolling background
     * @param {CanvasRenderingContext2D} context - The canvas context to render to
     */
    render(context) {
        this.backgrounds.forEach(bg => {
            bg.render(context);
        });
    }
}

