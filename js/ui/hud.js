import { logger } from '../utils/logger.js';

export class HUD {
    constructor(game) {
        this.game = game;
        this.fontFamily = 'Consolas, "Lucida Console", monospace';
    }

    renderPanel(context, x, y, width, height, accent = '#ffcc00') {
        const gradient = context.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, 'rgba(8, 14, 22, 0.86)');
        gradient.addColorStop(1, 'rgba(3, 8, 14, 0.92)');
        context.fillStyle = gradient;
        context.fillRect(x, y, width, height);

        context.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        context.lineWidth = 1;
        context.strokeRect(x + 1, y + 1, width - 2, height - 2);

        context.strokeStyle = accent;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(x + 10, y);
        context.lineTo(x + 44, y);
        context.moveTo(x, y + 10);
        context.lineTo(x, y + 34);
        context.moveTo(x + width - 44, y);
        context.lineTo(x + width - 10, y);
        context.moveTo(x + width, y + 10);
        context.lineTo(x + width, y + 34);
        context.moveTo(x + 10, y + height);
        context.lineTo(x + 44, y + height);
        context.moveTo(x, y + height - 10);
        context.lineTo(x, y + height - 34);
        context.moveTo(x + width - 44, y + height);
        context.lineTo(x + width - 10, y + height);
        context.moveTo(x + width, y + height - 10);
        context.lineTo(x + width, y + height - 34);
        context.stroke();

        context.strokeStyle = 'rgba(120, 170, 210, 0.14)';
        context.lineWidth = 1;
        for (let scanY = y + 4; scanY < y + height; scanY += 6) {
            context.beginPath();
            context.moveTo(x + 4, scanY);
            context.lineTo(x + width - 4, scanY);
            context.stroke();
        }
    }

    drawLabelValue(context, label, value, x, y, valueColor = '#f2f7fb') {
        context.fillStyle = '#88b3d1';
        context.font = `12px ${this.fontFamily}`;
        context.fillText(label, x, y);
        context.fillStyle = valueColor;
        context.font = `bold 16px ${this.fontFamily}`;
        context.fillText(value, x, y + 16);
    }

    drawHealthTicks(context, player, playableRight) {
        const totalTicks = 30;
        const ticksToShow = Math.ceil(totalTicks * (player.health / Math.max(player.maxHealth, 1)));
        const tickWidth = 18;
        const tickHeight = 5;
        const tickGap = 4;
        const xPosition = playableRight - tickWidth - 44;
        const totalBarHeight = (tickHeight + tickGap) * totalTicks;
        const startY = (this.game.height - totalBarHeight) / 2;

        context.save();
        for (let i = 0; i < totalTicks; i += 1) {
            const yPosition = startY + i * (tickHeight + tickGap);
            context.fillStyle = 'rgba(76, 28, 14, 0.42)';
            context.fillRect(xPosition, yPosition, tickWidth, tickHeight);
        }

        for (let i = 0; i < ticksToShow; i += 1) {
            const yPosition = startY + i * (tickHeight + tickGap);
            context.fillStyle = '#ff9d2f';
            context.fillRect(xPosition, yPosition, tickWidth, tickHeight);
        }

        context.fillStyle = '#ffcc00';
        context.font = `bold 11px ${this.fontFamily}`;
        context.fillText('HULL', xPosition - 2, startY - 16);
        context.restore();
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
        const panelWidth = 270;
        const panelX = playableRight - panelWidth - 56;
        const panelY = 18;
        this.renderPanel(context, panelX, panelY, panelWidth, 88, '#8fd7ff');
        context.fillStyle = '#8fd7ff';
        context.font = `bold 13px ${this.fontFamily}`;
        context.fillText('THREAT COMPUTER', panelX + 14, panelY + 12);
        context.fillStyle = '#dbe6ef';
        context.font = `14px ${this.fontFamily}`;
        const sectionLabel = level?.currentTerrainSection?.title || 'Sector Sweep';
        const waveLabel = level?.getCurrentWaveLabel?.() || 'Wave 1';
        const threatLabel = level?.getCurrentThreatLabel?.() || 'Contract Airspace';
        context.fillText(sectionLabel, panelX + 14, panelY + 34);
        context.fillStyle = '#ffcc00';
        context.fillText(waveLabel, panelX + 14, panelY + 54);
        context.fillStyle = '#c6d5e2';
        context.fillText(threatLabel, panelX + 14, panelY + 70);
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
        context.textAlign = 'left';
        context.textBaseline = 'top';

        const panelHeight = player.maxShield > 0 ? 164 : 142;
        this.renderPanel(context, playableBounds.left + 18, 18, 380, panelHeight);
        context.fillStyle = '#ffcc00';
        context.font = `bold 14px ${this.fontFamily}`;
        context.fillText('CRAFT STATUS', playableBounds.left + 32, 28);
        context.fillStyle = '#e8f1f7';
        context.font = `bold 18px ${this.fontFamily}`;
        context.fillText(`${ship.displayName} / ${difficulty.displayName}`, playableBounds.left + 32, 48);

        this.drawLabelValue(context, 'FUNDS', `$${player.money}`, playableBounds.left + 32, 80, '#ffffff');
        this.drawLabelValue(context, 'HULL', `${player.health}/${player.maxHealth}`, playableBounds.left + 32, 112, '#ffffff');
        this.drawLabelValue(context, 'MAIN GUN', `MK ${this.game.playerData?.primaryWeaponLevel || 1}`, playableBounds.left + 32, 144, '#ffffff');

        this.drawLabelValue(context, 'SECONDARY', player.equippedSecondaryWeapon || 'NONE', playableBounds.left + 198, 80, '#dce5ee');
        this.drawLabelValue(context, 'MEGABOMBS', `${player.megabombs}`, playableBounds.left + 198, 112, '#dce5ee');
        this.drawLabelValue(context, 'SALVAGE', `+${this.game.getSystemRank('salvageUplink') * 15}%`, playableBounds.left + 198, 144, '#9fd7ff');

        if (player.maxShield > 0) {
            context.fillStyle = '#88b3d1';
            context.font = `12px ${this.fontFamily}`;
            context.fillText('SHIELD', playableBounds.left + 32, 176);
            context.fillStyle = '#dcefff';
            context.font = `bold 14px ${this.fontFamily}`;
            context.fillText(`${player.shield}/${player.maxShield}`, playableBounds.left + 84, 176);
            this.drawShieldBar(context, player, playableBounds.left + 170, 180);
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
