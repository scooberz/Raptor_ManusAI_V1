// js/ui/hud.js

export class HUD {
    constructor(game) {
        this.game = game;
        this.player = game.player;
    }

    /**
     * Draw the Heads-Up Display
     * @param {CanvasRenderingContext2D} context - The rendering context for the UI layer
     */
    draw(context) {
        // Draw Health Bar
        context.fillStyle = 'red';
        context.fillRect(20, 20, this.player.health * 2, 20);
        context.strokeStyle = 'white';
        context.strokeRect(20, 20, this.player.maxHealth * 2, 20);

        // Draw Score
        context.fillStyle = 'white';
        context.font = '20px Arial';
        context.fillText(`Score: ${this.player.score}`, 20, 60);

        // Draw Money
        context.fillText(`Money: $${this.player.money}`, 20, 90);

        // --- NEW ---
        // Draw the debug information if debug mode is active
        if (this.game.debugMode) {
            this.drawDebugInfo(context);
        }
        // --- END NEW ---
    }

    // --- NEW METHOD ---
    /**
     * Draws the on-screen information for debug tools.
     * @param {CanvasRenderingContext2D} context - The rendering context for the UI layer
     */
    drawDebugInfo(context) {
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(this.game.width - 250, 10, 240, 100);
        
        context.fillStyle = '#00FF00'; // Green terminal text
        context.font = '16px "Courier New", monospace';
        context.textAlign = 'left';

        const textLines = [
            '--- DEBUG MODE ON ---',
            '1: Toggle No Damage',
            '2: Skip Wave',
            '4: Cycle Log Level'
        ];

        for (let i = 0; i < textLines.length; i++) {
            context.fillText(textLines[i], this.game.width - 240, 30 + (i * 20));
        }
    }
    // --- END NEW METHOD ---
}