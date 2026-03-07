import { logger } from '../utils/logger.js';

export class HUD {
    constructor(game) {
        this.game = game;
        this.fontFamily = 'Helvetica';
    }

    renderPanel(context, x, y, width, height) {
        context.fillStyle = 'rgba(5, 8, 14, 0.72)';
        context.fillRect(x, y, width, height);
        context.strokeStyle = 'rgba(255, 204, 0, 0.28)';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height);
    }

    drawHealthTicks(context, player, playableRight) {
        const totalTicks = 30;
        const ticksToShow = Math.ceil(totalTicks * (player.health / Math.max(player.maxHealth, 1)));
        const tickWidth = 16;
        const tickHeight = 5;
        const tickGap = 5;
        const xPosition = playableRight - tickWidth - 42;
        const totalBarHeight = (tickHeight + tickGap) * totalTicks;
        const startY = (this.game.height - totalBarHeight) / 2;

        context.fillStyle = 'rgba(76, 28, 14, 0.55)';
        for (let i = 0; i < totalTicks; i++) {
            const yPosition = startY + i * (tickHeight + tickGap);
            context.fillRect(xPosition, yPosition, tickWidth, tickHeight);
        }

        context.fillStyle = '#ff9d2f';
        for (let i = 0; i < ticksToShow; i++) {
            const yPosition = startY + i * (tickHeight + tickGap);
            context.fillRect(xPosition, yPosition, tickWidth, tickHeight);
        }
    }

    draw(context) {
        const player = this.game.player;
        if (!player) {
            return;
        }

        const playableBounds = this.game.currentState && typeof this.game.currentState.getPlayableBounds === 'function'
            ? this.game.currentState.getPlayableBounds()
            : { left: 0, right: this.game.width };
        const ship = this.game.getPlayerShipProfile(this.game.playerData?.shipId);
        const difficulty = this.game.getDifficultyProfile(this.game.playerData?.difficulty);

        context.save();
        context.font = `18px ${this.fontFamily}`;
        context.textAlign = 'left';
        context.textBaseline = 'top';

        this.renderPanel(context, playableBounds.left + 18, 18, 320, 132);
        context.fillStyle = '#ffcc00';
        context.font = `bold 18px ${this.fontFamily}`;
        context.fillText(`${ship.displayName} | ${difficulty.displayName}`, playableBounds.left + 32, 30);

        context.fillStyle = '#ffffff';
        context.font = `16px ${this.fontFamily}`;
        context.fillText(`Funds $${player.money}`, playableBounds.left + 32, 60);
        context.fillText(`Hull ${player.health}/${player.maxHealth}`, playableBounds.left + 32, 84);
        context.fillText(`Main Gun Mk ${this.game.playerData?.primaryWeaponLevel || 1}`, playableBounds.left + 32, 108);
        context.fillText(`Secondary ${player.hasWeapon('MISSILE') ? 'Missiles' : 'None'}`, playableBounds.left + 170, 60);
        context.fillText(`Megabombs ${player.megabombs}`, playableBounds.left + 170, 84);
        context.fillText(`Route ${ship.storyTrack}`, playableBounds.left + 170, 108);

        this.drawHealthTicks(context, player, playableBounds.right);

        if (this.game.gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'white';
            context.font = `50px ${this.fontFamily}`;
            context.fillText('Game Over', this.game.width / 2, this.game.height / 2);
        }

        context.restore();
    }

    render(context) {
        this.draw(context);
    }
}
