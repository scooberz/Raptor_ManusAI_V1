/**
 * Tileset class
 * Manages a tileset image and provides methods to extract individual tiles
 */
class Tileset {
    constructor(image) {
        this.image = image;
        
        // Default tile dimensions (can be overridden)
        this.tileWidth = 32;
        this.tileHeight = 32;
        
        // Calculate tiles per row based on image width
        if (this.image) {
            this.tilesPerRow = Math.floor(this.image.width / this.tileWidth);
        } else {
            this.tilesPerRow = 0;
        }
    }

    /**
     * Get the source rectangle for a specific tile ID
     * @param {number} tileId - The tile ID (0-based)
     * @returns {Object} Object containing sx, sy, sWidth, sHeight
     */
    getTileRect(tileId) {
        if (!this.image || tileId < 0) {
            return { sx: 0, sy: 0, sWidth: this.tileWidth, sHeight: this.tileHeight };
        }

        const row = Math.floor(tileId / this.tilesPerRow);
        const col = tileId % this.tilesPerRow;

        return {
            sx: col * this.tileWidth,
            sy: row * this.tileHeight,
            sWidth: this.tileWidth,
            sHeight: this.tileHeight
        };
    }

    /**
     * Set custom tile dimensions
     * @param {number} width - Tile width in pixels
     * @param {number} height - Tile height in pixels
     */
    setTileSize(width, height) {
        this.tileWidth = width;
        this.tileHeight = height;
        
        if (this.image) {
            this.tilesPerRow = Math.floor(this.image.width / this.tileWidth);
        }
    }

    /**
     * Check if the tileset is ready (image loaded)
     * @returns {boolean} True if the tileset is ready
     */
    isReady() {
        return this.image && this.image.complete;
    }
}

export { Tileset }; 