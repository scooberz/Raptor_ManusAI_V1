import { logger } from '../utils/logger.js';

class LandingState {
    constructor(game) {
        this.game = game;
        this.name = 'landing';
        this.completedLevel = 0;
        this.missionResult = null;
        this.enteredAt = 0;
        this.autoReturnDelay = 5500;
        this.hasReturned = false;
        this.countdownElement = null;
        this.progressElement = null;
    }

    enter(context = {}) {
        this.completedLevel = context.completedLevel || 0;
        this.missionResult = context.missionResult || null;
        this.enteredAt = performance.now();
        this.hasReturned = false;
        this.setupScreen();
    }

    setupScreen() {
        const screen = document.getElementById('landing-screen');
        screen.style.display = 'flex';
        screen.innerHTML = '';

        const result = this.missionResult || {};
        const difficulty = this.game.getDifficultyProfile(result.difficulty || this.game.playerData?.difficulty);
        const ship = this.game.getPlayerShipProfile(result.shipId || this.game.playerData?.shipId);
        const background = this.game.assets.getImage('hangarBackground');

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.overflow = 'hidden';
        wrapper.style.background = 'radial-gradient(circle at center, rgba(30,44,52,0.4), rgba(4,8,12,0.98) 70%)';

        if (background) {
            const bg = document.createElement('img');
            bg.src = background.src;
            bg.style.position = 'absolute';
            bg.style.inset = '0';
            bg.style.width = '100%';
            bg.style.height = '100%';
            bg.style.objectFit = 'cover';
            bg.style.filter = 'brightness(0.26) contrast(1.05)';
            wrapper.appendChild(bg);
        }

        const scan = document.createElement('div');
        scan.style.position = 'absolute';
        scan.style.inset = '0';
        scan.style.background = 'repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 6px)';
        scan.style.opacity = '0.15';
        wrapper.appendChild(scan);

        const frame = document.createElement('div');
        frame.style.position = 'relative';
        frame.style.zIndex = '2';
        frame.style.width = 'min(960px, 88%)';
        frame.style.padding = '22px';
        frame.style.border = '2px solid rgba(255, 204, 0, 0.34)';
        frame.style.background = 'rgba(6, 11, 18, 0.9)';
        frame.style.boxShadow = '0 28px 90px rgba(0,0,0,0.45)';

        const routeLabel = (result.sectionsVisited || []).join(' / ') || 'Bravo Sector';

        frame.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:18px;">
                <div>
                    <div style="font: 13px Consolas, monospace; color: #8fb6d8; letter-spacing: 0.16em; margin-bottom: 10px;">LANDING DEBRIEF // CONTRACT FILED</div>
                    <div style="font: bold 40px Consolas, monospace; color: #ffcc00; margin-bottom: 6px;">Mission ${this.completedLevel} Complete</div>
                    <div style="font: 16px Consolas, monospace; color: #dce5ee;">${result.missionTitle || 'Bravo Sector'} // ${difficulty.displayName} // ${ship.displayName}</div>
                </div>
                <div style="min-width:240px; border:1px solid rgba(143,182,216,0.22); padding:12px 14px; background:rgba(2,8,14,0.72); font:14px Consolas, monospace; color:#d4dde8; line-height:1.7;">
                    Craft Route ${ship.storyTrack}<br>
                    Ending Seed ${ship.endingKey}<br>
                    Sector Route ${routeLabel}
                </div>
            </div>
        `;

        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
        grid.style.gap = '14px';

        const cards = [
            { label: 'Cash Earned', value: `$${result.moneyEarned ?? 0}`, color: '#ffffff' },
            { label: 'Air Targets', value: `${result.airTargetsDestroyed ?? 0}`, color: '#dce5ee' },
            { label: 'Ground Targets', value: `${result.groundTargetsDestroyed ?? 0}`, color: '#dce5ee' },
            { label: 'Main Gun', value: `MK ${result.primaryWeaponLevel ?? 1}`, color: '#ffcc00' },
            { label: 'Difficulty', value: difficulty.displayName, color: '#8fd7ff' },
            { label: 'Craft', value: ship.displayName, color: '#dce5ee' }
        ];

        cards.forEach((card) => {
            const el = document.createElement('div');
            el.style.padding = '14px';
            el.style.border = '1px solid rgba(255,255,255,0.08)';
            el.style.background = 'rgba(3, 9, 14, 0.76)';
            el.innerHTML = `
                <div style="font: 12px Consolas, monospace; color: #8fb6d8; letter-spacing: 0.12em; margin-bottom: 8px;">${card.label}</div>
                <div style="font: bold 24px Consolas, monospace; color: ${card.color};">${card.value}</div>
            `;
            grid.appendChild(el);
        });
        frame.appendChild(grid);

        const narrative = document.createElement('div');
        narrative.style.marginTop = '18px';
        narrative.style.padding = '14px 16px';
        narrative.style.border = '1px solid rgba(255,255,255,0.08)';
        narrative.style.background = 'rgba(3, 9, 14, 0.72)';
        narrative.innerHTML = `
            <div style="font: bold 16px Consolas, monospace; color: #ffcc00; margin-bottom: 10px;">POST-SORTIE NOTES</div>
            <div style="font: 15px Consolas, monospace; color: #d4dde8; line-height: 1.8;">${result.landingText || 'Return to base for repair, rearm, and contract review.'}</div>
        `;
        frame.appendChild(narrative);

        const footer = document.createElement('div');
        footer.style.marginTop = '16px';
        footer.style.paddingTop = '14px';
        footer.style.borderTop = '1px solid rgba(255,255,255,0.08)';

        const countdownRow = document.createElement('div');
        countdownRow.style.display = 'flex';
        countdownRow.style.alignItems = 'center';
        countdownRow.style.gap = '12px';

        const countdown = document.createElement('div');
        countdown.style.font = '14px Consolas, monospace';
        countdown.style.color = '#dce5ee';
        this.countdownElement = countdown;

        const progressFrame = document.createElement('div');
        progressFrame.style.flex = '1';
        progressFrame.style.height = '12px';
        progressFrame.style.background = 'rgba(10, 18, 26, 0.9)';
        progressFrame.style.border = '1px solid rgba(143,182,216,0.22)';
        const progress = document.createElement('div');
        progress.style.height = '100%';
        progress.style.width = '0%';
        progress.style.background = 'linear-gradient(90deg, rgba(143,215,255,0.5), rgba(255,204,0,0.8))';
        this.progressElement = progress;
        progressFrame.appendChild(progress);
        countdownRow.appendChild(countdown);
        countdownRow.appendChild(progressFrame);

        const hint = document.createElement('div');
        hint.style.font = '13px Consolas, monospace';
        hint.style.color = '#92a6ba';
        hint.style.marginTop = '10px';
        hint.textContent = 'ENTER/SPACE: return to hangar // ESC: skip';

        footer.appendChild(countdownRow);
        footer.appendChild(hint);
        frame.appendChild(footer);

        wrapper.appendChild(frame);
        screen.appendChild(wrapper);
        this.updateCountdownDisplay();
    }

    updateCountdownDisplay() {
        if (!this.countdownElement || !this.progressElement) {
            return;
        }
        const elapsed = performance.now() - this.enteredAt;
        const remainingSeconds = Math.max(0, Math.ceil((this.autoReturnDelay - elapsed) / 1000));
        const progress = Math.min(1, elapsed / this.autoReturnDelay);
        this.countdownElement.textContent = `HANGAR RETURN T-${remainingSeconds}s`;
        this.progressElement.style.width = `${Math.round(progress * 100)}%`;
    }

    returnToHangar() {
        if (this.hasReturned) {
            return;
        }
        this.hasReturned = true;
        this.game.audio.playSound('uiConfirm');
        this.game.changeState('hangar', { completedLevel: this.completedLevel, missionResult: this.missionResult });
    }

    update() {
        const elapsed = performance.now() - this.enteredAt;
        this.updateCountdownDisplay();
        if (elapsed >= this.autoReturnDelay) {
            this.returnToHangar();
            return;
        }
        if ((this.game.input.wasKeyJustPressed('Enter') || this.game.input.wasKeyJustPressed(' ')) && elapsed > 350) {
            this.returnToHangar();
        }
        if (this.game.input.wasKeyJustPressed('Escape')) {
            this.game.audio.playSound('uiBack');
            this.returnToHangar();
        }
    }

    render() {}

    exit() {
        const screen = document.getElementById('landing-screen');
        if (screen) {
            screen.style.display = 'none';
        }
        logger.info('Exiting Landing State');
    }
}

export { LandingState };
