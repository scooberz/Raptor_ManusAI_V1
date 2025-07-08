/**
 * InputHandler class
 * Handles keyboard and mouse input with state tracking for a single frame.
 */
import { logger } from '../utils/logger.js';
class InputHandler {
    constructor() {
        // Keyboard state
        this.keys = {};
        this.previousKeys = {};

        // Mouse state
        this.mousePosition = { x: 0, y: 0 };
        this.mouseButtons = { left: false, middle: false, right: false };
        this.previousMouseButtons = { left: false, middle: false, right: false };

        // Mouse wheel state
        this.wheelDeltaY = 0;

        // Debug-specific flags
        this.skipWavePressed = false;
        this.restartLevelPressed = false;
        this.cycleLevelPressed = false;

        // Bind 'this' context once to prevent issues in event listeners
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleWheel = this.handleWheel.bind(this);

        // Set up event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('wheel', this.handleWheel);
    }

    // This method MUST be called once per game loop (from game.js)
    update() {
        // Copy the current key states to the previous key states for wasKeyJustPressed logic
        this.previousKeys = { ...this.keys };
        
        // Copy the current mouse button states to the previous mouse button states for wasMouseButtonJustPressed logic
        this.previousMouseButtons = { ...this.mouseButtons };
        
        // Reset wheel delta each frame after it's been processed
        this.wheelDeltaY = 0;
    }

    // Replace your existing handleKeyDown method with this one

    handleKeyDown(event) {
        // For debugging, let's see every key press
        logger.spam(`Key pressed: ${event.key}`);

        // Set the state for continuous-press keys
        this.keys[event.key] = true;

        // --- Handle single-press debug flags ---
        if (event.key === '2' || event.key === 'Numpad2') {
            this.skipWavePressed = true;
            logger.debug(`INPUT_HANDLER: skipWavePressed flag SET to: ${this.skipWavePressed}`);
        }
        
        if (event.key === '3' || event.key === 'Numpad3') {
            this.restartLevelPressed = true;
            logger.debug(`INPUT_HANDLER: restartLevelPressed flag SET to: ${this.restartLevelPressed}`);
        }
        
        if (event.key === '4' || event.key === 'Numpad4') {
            this.cycleLevelPressed = true;
            logger.debug(`INPUT_HANDLER: cycleLevelPressed flag SET to: ${this.cycleLevelPressed}`);
        }

        // Prevent default browser actions for game keys to stop the window from scrolling
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
            event.preventDefault();
        }
    }

    handleKeyUp(event) {
        this.keys[event.key] = false;

        if (event.key === '2' || event.key === 'Numpad2') {
            this.skipWavePressed = false;
        }
        
        if (event.key === '3' || event.key === 'Numpad3') {
            this.restartLevelPressed = false;
        }
        
        if (event.key === '4' || event.key === 'Numpad4') {
            this.cycleLevelPressed = false;
        }
    }

    handleMouseMove(event) {
        // Get the first canvas (they should all have the same scaling)
        const canvas = document.querySelector('#game-container canvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        
        // Get the scaled mouse position relative to the canvas
        const scaledX = event.clientX - rect.left;
        const scaledY = event.clientY - rect.top;
        
        // Convert from scaled canvas coordinates to internal game coordinates
        // Use the actual game dimensions instead of hardcoded values
        const gameWidth = canvas.width;   // Internal game width
        const gameHeight = canvas.height; // Internal game height
        
        const scaleX = gameWidth / rect.width;   // Internal width / scaled width
        const scaleY = gameHeight / rect.height; // Internal height / scaled height
        
        this.mousePosition.x = scaledX * scaleX;
        this.mousePosition.y = scaledY * scaleY;
        
        // Clamp to game boundaries
        this.mousePosition.x = Math.max(0, Math.min(gameWidth, this.mousePosition.x));
        this.mousePosition.y = Math.max(0, Math.min(gameHeight, this.mousePosition.y));
    }

    handleMouseDown(event) {
        switch (event.button) {
            case 0: this.mouseButtons.left = true; break;
            case 1: this.mouseButtons.middle = true; break;
            case 2: this.mouseButtons.right = true; break;
        }
    }

    handleMouseUp(event) {
        switch (event.button) {
            case 0: this.mouseButtons.left = false; break;
            case 1: this.mouseButtons.middle = false; break;
            case 2: this.mouseButtons.right = false; break;
        }
    }

    handleWheel(event) {
        this.wheelDeltaY = Math.sign(event.deltaY);
    }

    isKeyPressed(key) {
        return this.keys[key] === true;
    }

    wasKeyJustPressed(key) {
        return this.isKeyPressed(key) && !this.previousKeys[key];
    }

    isMouseButtonPressed(button) {
        return this.mouseButtons[button] === true;
    }

    wasMouseButtonJustPressed(button) {
        return this.isMouseButtonPressed(button) && !this.previousMouseButtons[button];
    }

    getMousePosition() {
        return this.mousePosition;
    }

    getWheelDeltaY() {
        return this.wheelDeltaY;
    }
}

export { InputHandler };