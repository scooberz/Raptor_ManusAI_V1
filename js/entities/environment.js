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
     * Load the appropriate sprit based on type
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

