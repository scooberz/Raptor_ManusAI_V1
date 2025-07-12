/**
 * Manages the scrolling background by pre-rendering it to an off-screen buffer
 * for improved performance.
 */
export class BackgroundManager {
    constructor(game, backgroundImage, scrollSpeed) {
        this.game = game;
        this.image = backgroundImage;
        this.scrollSpeed = scrollSpeed;

        // Create an off-screen canvas (the buffer)
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvas.width = this.game.width;
        this.bufferCanvas.height = this.game.height;
        this.bufferCtx = this.bufferCanvas.getContext('2d');

        // Set initial positions for the two scrolling images
        this.y1 = 0;
        this.y2 = -this.image.height;
    }

    update(deltaTime) {
        // Update the positions of the two images
        const scrollAmount = this.scrollSpeed * (deltaTime / 1000);
        this.y1 += scrollAmount;
        this.y2 += scrollAmount;

        // If an image has scrolled completely off the bottom of the screen,
        // wrap it back to the top.
        if (this.y1 >= this.game.height) {
            this.y1 = this.y2 - this.image.height;
        }
        if (this.y2 >= this.game.height) {
            this.y2 = this.y1 - this.image.height;
        }
    }

    /**
     * Draws the scrolling images to the off-screen buffer first,
     * then draws the buffer to the main visible canvas.
     * @param {CanvasRenderingContext2D} mainContext
     * @param {number} [x=0] - X offset to draw the background
     * @param {number} [y=0] - Y offset to draw the background
     * @param {number} [width=this.game.width] - Width of the background
     * @param {number} [height=this.game.height] - Height of the background
     */
    render(mainContext, x = 0, y = 0, width = this.game.width, height = this.game.height) {
        // Clear the off-screen buffer
        this.bufferCtx.clearRect(0, 0, this.game.width, this.game.height);

        // Draw the two background images onto the buffer
        this.bufferCtx.drawImage(this.image, 0, this.y1, this.game.width, this.image.height);
        this.bufferCtx.drawImage(this.image, 0, this.y2, this.game.width, this.image.height);

        // Now, draw the buffer canvas to the main visible canvas at the specified position and size
        mainContext.drawImage(this.bufferCanvas, x, y, width, height);
    }

    /**
     * Reset the background positions
     */
    reset() {
        this.y1 = 0;
        this.y2 = -this.image.height;
    }

    resize() {
        this.bufferCanvas.width = this.game.width;
        this.bufferCanvas.height = this.game.height;
    }
} 