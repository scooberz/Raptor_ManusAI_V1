/**
 * InputHandler class
 * Handles keyboard and mouse input with state tracking for a single frame.
 */
import { logger } from '../utils/logger.js';

class InputHandler {
    constructor() {
        this.keys = {};
        this.previousKeys = {};

        this.mousePosition = { x: 0, y: 0 };
        this.mouseButtons = { left: false, middle: false, right: false };
        this.previousMouseButtons = { left: false, middle: false, right: false };
        this.hasMouseMoved = false;

        this.wheelDeltaY = 0;

        this.skipWavePressed = false;
        this.restartLevelPressed = false;
        this.cycleLevelPressed = false;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('wheel', this.handleWheel);
        window.addEventListener('contextmenu', this.handleContextMenu);
    }

    update() {
        this.previousKeys = { ...this.keys };
        this.previousMouseButtons = { ...this.mouseButtons };
        this.wheelDeltaY = 0;
    }

    handleKeyDown(event) {
        logger.spam(`Key pressed: ${event.key}`);
        this.keys[event.key] = true;

        if (event.key === '2' || event.key === 'Numpad2') {
            this.skipWavePressed = true;
        }

        if (event.key === '3' || event.key === 'Numpad3') {
            this.restartLevelPressed = true;
        }

        if (event.key === '4' || event.key === 'Numpad4') {
            this.cycleLevelPressed = true;
        }

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Tab'].includes(event.key)) {
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
        const canvas = document.querySelector('#game-container canvas');
        if (!canvas) {
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const scaledX = event.clientX - rect.left;
        const scaledY = event.clientY - rect.top;
        const gameWidth = canvas.width;
        const gameHeight = canvas.height;
        const scaleX = gameWidth / rect.width;
        const scaleY = gameHeight / rect.height;

        this.mousePosition.x = Math.max(0, Math.min(gameWidth, scaledX * scaleX));
        this.mousePosition.y = Math.max(0, Math.min(gameHeight, scaledY * scaleY));
        this.hasMouseMoved = true;
    }

    handleMouseDown(event) {
        switch (event.button) {
            case 0:
                this.mouseButtons.left = true;
                break;
            case 1:
                this.mouseButtons.middle = true;
                break;
            case 2:
                this.mouseButtons.right = true;
                break;
            default:
                break;
        }
    }

    handleMouseUp(event) {
        switch (event.button) {
            case 0:
                this.mouseButtons.left = false;
                break;
            case 1:
                this.mouseButtons.middle = false;
                break;
            case 2:
                this.mouseButtons.right = false;
                break;
            default:
                break;
        }
    }

    handleWheel(event) {
        this.wheelDeltaY = Math.sign(event.deltaY);
    }

    handleContextMenu(event) {
        event.preventDefault();
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
