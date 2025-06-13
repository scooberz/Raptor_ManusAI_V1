/**
 * InputHandler class
 * Handles keyboard and mouse input with state tracking
 */
class InputHandler {
    constructor() {
        this.keys = {};
        // NEW: An object to store the key states from the previous frame
        this.previousKeys = {}; 

        this.mousePosition = { x: 0, y: 0 };
        this.mouseButtons = { left: false, middle: false, right: false };
        
        // Set up event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mousedown', this.handleMouseDown.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        window.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }

    // NEW: The update method, to be called once per game loop
    // This is how we track the state between frames.
    update() {
        // Copy the current key states to the previous key states
        this.previousKeys = { ...this.keys };
    }
    
    handleKeyDown(event) {
        this.keys[event.key] = true;
    }
    
    handleKeyUp(event) {
        this.keys[event.key] = false;
    }
    
    handleMouseMove(event) {
        const rect = document.querySelector('#game-container canvas').getBoundingClientRect();
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

    // NEW: The function we will use for single-press actions like pausing
    wasKeyJustPressed(key) {
        // A key was "just pressed" if it's down now AND it was not down last frame.
        return this.keys[key] === true && this.previousKeys[key] !== true;
    }
    
    isMouseButtonPressed(button) {
        return this.mouseButtons[button] === true;
    }
    
    getMousePosition() {
        return this.mousePosition;
    }
    
    anyKeyPressed(keys) {
        return keys.some(key => this.isKeyPressed(key));
    }
    
    reset() {
        this.keys = {};
        this.previousKeys = {};
        this.mouseButtons = { left: false, middle: false, right: false };
    }
}