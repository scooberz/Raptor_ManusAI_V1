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
     */
    render(mainContext) {
        // Clear the off-screen buffer
        this.bufferCtx.clearRect(0, 0, this.game.width, this.game.height);

        // Draw the two background images onto the buffer
        this.bufferCtx.drawImage(this.image, 0, this.y1);
        this.bufferCtx.drawImage(this.image, 0, this.y2);

        // Now, draw the entire buffer canvas to the main visible canvas in one go
        mainContext.drawImage(this.bufferCanvas, 0, 0);
    }

    /**
     * Reset the background positions
     */
    reset() {
        this.y1 = 0;
        this.y2 = -this.image.height;
    }
} 