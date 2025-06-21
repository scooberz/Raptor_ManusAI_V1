/**
 * InputHandler class
 * Handles keyboard and mouse input with state tracking for a single frame.
 */
class InputHandler {
    constructor() {
        // Keyboard state
        this.keys = {};
        this.previousKeys = {};

        // Mouse state
        this.mousePosition = { x: 0, y: 0 };
        this.mouseButtons = { left: false, middle: false, right: false };

        // Debug-specific flags
        this.skipWavePressed = false;

        // Bind 'this' context once to prevent issues in event listeners
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        // Set up event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    // This method MUST be called once per game loop (from game.js)
    update() {
        // Copy the current key states to the previous key states for wasKeyJustPressed logic
        this.previousKeys = { ...this.keys };
    }

    // Replace your existing handleKeyDown method with this one

    handleKeyDown(event) {
        // For debugging, let's see every key press
        console.log(`Key pressed: ${event.key}`);

        // Set the state for continuous-press keys
        this.keys[event.key] = true;

        // --- Handle single-press debug flags ---
        if (event.key === '2' || event.key === 'Numpad2') {
            this.skipWavePressed = true;
            console.log(`INPUT_HANDLER: skipWavePressed flag SET to: ${this.skipWavePressed}`);
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
    }

    handleMouseMove(event) {
        const canvas = document.querySelector('#game-container canvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        this.mousePosition.x = event.clientX - rect.left;
        this.mousePosition.y = event.clientY - rect.top;
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

    isKeyPressed(key) {
        return this.keys[key] === true;
    }

    wasKeyJustPressed(key) {
        return this.isKeyPressed(key) && !this.previousKeys[key];
    }

    isMouseButtonPressed(button) {
        return this.mouseButtons[button] === true;
    }

    getMousePosition() {
        return this.mousePosition;
    }
}

export { InputHandler };