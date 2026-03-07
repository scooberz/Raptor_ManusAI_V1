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

    drawShieldBar(context, player, panelX, panelY) {
        if (player.maxShield <= 0) {
            return;
        }

        const barWidth = 126;
        const barHeight = 10;
        context.fillStyle = 'rgba(18, 45, 76, 0.72)';
        context.fillRect(panelX, panelY, barWidth, barHeight);
        context.fillStyle = '#52b8ff';
        context.fillRect(panelX, panelY, barWidth * (player.shield / Math.max(player.maxShield, 1)), barHeight);
        context.strokeStyle = 'rgba(255,255,255,0.28)';
        context.strokeRect(panelX, panelY, barWidth, barHeight);
    }

    drawThreatPanel(context, playableRight) {
        if (!this.game.hasSystem('threatComputer')) {
            return;
        }

        const level = this.game.currentState?.currentLevel;
        const panelWidth = 240;
        const panelX = playableRight - panelWidth - 64;
        const panelY = 18;
        this.renderPanel(context, panelX, panelY, panelWidth, 76);
        context.fillStyle = '#ffcc00';
        context.font = `bold 15px ${this.fontFamily}`;
        context.fillText('THREAT COMPUTER', panelX + 14, panelY + 12);
        context.fillStyle = '#dbe6ef';
        context.font = `14px ${this.fontFamily}`;
        const sectionLabel = level?.currentTerrainSection?.title || 'Sector Sweep';
        const waveLabel = level?.getCurrentWaveLabel?.() || 'Wave 1';
        const threatLabel = level?.getCurrentThreatLabel?.() || 'Contract Airspace';
        context.fillText(sectionLabel, panelX + 14, panelY + 34);
        context.fillText(`${waveLabel} | ${threatLabel}`, panelX + 14, panelY + 54);
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

        this.renderPanel(context, playableBounds.left + 18, 18, 340, player.maxShield > 0 ? 150 : 132);
        context.fillStyle = '#ffcc00';
        context.font = `bold 18px ${this.fontFamily}`;
        context.fillText(`${ship.displayName} | ${difficulty.displayName}`, playableBounds.left + 32, 30);

        context.fillStyle = '#ffffff';
        context.font = `16px ${this.fontFamily}`;
        context.fillText(`Funds $${player.money}`, playableBounds.left + 32, 60);
        context.fillText(`Hull ${player.health}/${player.maxHealth}`, playableBounds.left + 32, 84);
        context.fillText(`Main Gun Mk ${this.game.playerData?.primaryWeaponLevel || 1}`, playableBounds.left + 32, 108);

        context.fillText(`Secondary ${player.equippedSecondaryWeapon || 'None'}`, playableBounds.left + 182, 60);
        context.fillText(`Megabombs ${player.megabombs}`, playableBounds.left + 182, 84);
        context.fillText(`Salvage +${this.game.getSystemRank('salvageUplink') * 15}%`, playableBounds.left + 182, 108);

        if (player.maxShield > 0) {
            context.fillStyle = '#9fd7ff';
            context.fillText(`Shield ${player.shield}/${player.maxShield}`, playableBounds.left + 32, 132);
            this.drawShieldBar(context, player, playableBounds.left + 118, 136);
        }

        this.drawHealthTicks(context, player, playableBounds.right);
        this.drawThreatPanel(context, playableBounds.right);

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
