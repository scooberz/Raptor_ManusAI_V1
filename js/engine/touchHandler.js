/**
 * TouchHandler class
 * Handles touch input for mobile devices, providing touch position tracking
 * and preventing default browser behaviors that could interfere with the game.
 */
export class TouchHandler {
    constructor(game) {
        this.game = game;
        this.isTouching = false;
        this.touchX = 0;
        this.touchY = 0;

        // The vertical offset to keep the player's finger from hiding the ship
        this.yOffset = 150; 

        const canvas = this.game.layers.ui;

        // Add touch event listeners to the UI canvas
        canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.handleTouch(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });

        console.log('TouchHandler initialized');
    }

    handleTouch(e) {
        e.preventDefault(); // Prevents screen scrolling and zooming
        this.isTouching = true;
        
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const rect = e.target.getBoundingClientRect();
            
            // Get the scaled touch position relative to the canvas
            const scaledX = touch.clientX - rect.left;
            const scaledY = touch.clientY - rect.top;
            
            // Convert from scaled canvas coordinates to internal game coordinates
            const gameWidth = e.target.width;   // Internal game width
            const gameHeight = e.target.height; // Internal game height
            
            const scaleX = gameWidth / rect.width;   // Internal width / scaled width
            const scaleY = gameHeight / rect.height; // Internal height / scaled height
            
            this.touchX = scaledX * scaleX;
            this.touchY = (scaledY * scaleY) - this.yOffset; // Apply the offset here
            
            // Clamp to game boundaries
            this.touchX = Math.max(0, Math.min(gameWidth, this.touchX));
            this.touchY = Math.max(0, Math.min(gameHeight, this.touchY));
            
            // Debug logging for touch position
            if (this.game.debugMode) {
                console.log(`Touch position: ${this.touchX}, ${this.touchY}`);
            }
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.isTouching = false;
    }

    /**
     * Get the current touch position
     * @returns {Object} Object with x and y coordinates
     */
    getTouchPosition() {
        return { x: this.touchX, y: this.touchY };
    }

    /**
     * Check if the screen is currently being touched
     * @returns {boolean} True if touching, false otherwise
     */
    isScreenTouched() {
        return this.isTouching;
    }
} 