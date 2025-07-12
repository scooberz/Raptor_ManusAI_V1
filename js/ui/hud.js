import { logger } from '../utils/logger.js';

/**
 * Represents the Heads-Up Display (HUD) of the game, which shows player information
 * such as score, health, and other important game data.
 */
export class HUD {
    /**
     * @param {Game} game - The main game object, providing access to game state.
     */
    constructor(game) {
        this.game = game;
        this.fontSize = 25;
        this.fontFamily = 'Helvetica';
        this.color = 'white';
        // Cache the formatted high score string
        this.highScoreText = `High Score: ${this.game.highScore}`;
    }

    /**
     * Draws the entire HUD on the given rendering context.
     * @param {CanvasRenderingContext2D} context - The 2D rendering context to draw on.
     */
    draw(context) {
        context.save();
        context.fillStyle = this.color;
        context.font = `${this.fontSize}px ${this.fontFamily}`;

        // Score
        const scoreText = `Score: ${this.game.score}`;
        context.fillText(scoreText, 20, 40);

        // High Score display
        context.fillText(this.highScoreText, 20, 80);

        // --- START OF HEALTH VISUALIZATION CHANGE ---

        // Draw player health as vertical ticks on the right side
        const player = this.game.player;
        let rightEdge = this.game.width;
        if (this.game.currentState && typeof this.game.currentState.getPlayableBounds === 'function') {
            rightEdge = this.game.currentState.getPlayableBounds().right;
        }
        const TICK_RIGHT_MARGIN = 40; // Margin from the right edge to stay inside border
        if (player) {
            const maxHealth = player.maxHealth;
            const currentHealth = player.health;
            const healthPercentage = currentHealth / maxHealth;

            const totalTicks = 30; // The total number of ticks representing full health
            const ticksToShow = Math.ceil(totalTicks * healthPercentage);

            const tickWidth = 15;
            const tickHeight = 5;
            const tickGap = 5; // Space between ticks
            const xPosition = rightEdge - tickWidth - TICK_RIGHT_MARGIN; // Position from the right edge, inside border
            const totalBarHeight = (tickHeight + tickGap) * totalTicks;
            const startY = (this.game.height - totalBarHeight) / 2; // Center the bar vertically

            context.fillStyle = 'orange';
            for (let i = 0; i < ticksToShow; i++) {
                const yPosition = startY + i * (tickHeight + tickGap);
                context.fillRect(xPosition, yPosition, tickWidth, tickHeight);
            }
        }

        // --- END OF HEALTH VISUALIZATION CHANGE ---

        // Game Over message
        if (this.game.gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'white';
            context.font = `50px ${this.fontFamily}`;
            context.fillText('Game Over', this.game.width / 2, this.game.height / 2);
        }

        context.restore();
    }

    /**
     * Render the HUD (alias for draw)
     * @param {CanvasRenderingContext2D} context - The rendering context for the UI layer
     */
    render(context) {
        this.draw(context);
    }
}