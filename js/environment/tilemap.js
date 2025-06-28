/**
 * Tilemap class
 * Manages the game's tile-based background and environmental objects.
 */
import { Tileset } from './tileset.js';

export class Tilemap {
    constructor(game, tilemapData, scrollSpeed) {
        this.game = game;
        this.tilemapData = tilemapData;
        this.scrollSpeed = scrollSpeed;
        this.environmentObjects = [];
        this.y = 0;
    }

    // Register a destructible object to be managed by the grid
    registerObject(object) {
        this.environmentObjects.push(object);
    }

    update(deltaTime) {
        const scrollAmount = this.scrollSpeed * (deltaTime / 1000);
        this.y += scrollAmount;
        for (const obj of this.environmentObjects) {
            obj.y += scrollAmount;
        }
    }
}

