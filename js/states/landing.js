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
        const routeLabel = (result.sectionsVisited || []).join(' / ') || 'Bravo Sector';

        const shell = document.createElement('div');
        shell.className = 'dos-shell';
        shell.style.background = 'radial-gradient(circle at center, rgba(30,44,52,0.4), rgba(4,8,12,0.98) 70%)';

        if (background) {
            const bg = document.createElement('img');
            bg.className = 'dos-bg-image';
            bg.src = background.src;
            bg.style.filter = 'brightness(0.26) contrast(1.05)';
            shell.appendChild(bg);
        }

        const overlay = document.createElement('div');
        overlay.className = 'dos-overlay';
        shell.appendChild(overlay);

        const layout = document.createElement('div');
        layout.className = 'dos-screen-layout';
        layout.style.display = 'flex';
        layout.style.alignItems = 'center';
        layout.style.justifyContent = 'center';
        layout.style.height = '100%';

        const frame = document.createElement('div');
        frame.className = 'dos-frame compact';
        frame.style.width = 'min(980px, 88%)';
        frame.style.padding = '22px';

        const header = document.createElement('div');
        header.className = 'dos-grid-2';
        header.style.alignItems = 'start';
        header.innerHTML = `
            <div>
                <div class="dos-kicker">Landing Debrief // Contract Filed</div>
                <div class="dos-title" style="margin:8px 0 6px;">Mission ${this.completedLevel} Complete</div>
                <div class="dos-subtitle">${result.missionTitle || 'Bravo Sector'} // ${difficulty.displayName} // ${ship.displayName}</div>
            </div>
            <div class="dos-panel section">
                <div class="dos-label">Route Archive</div>
                <div class="dos-copy" style="margin-top:10px; line-height:1.8;">
                    Craft Route ${ship.storyTrack}<br>
                    Ending Seed ${ship.endingKey}<br>
                    Sector Route ${routeLabel}
                </div>
            </div>
        `;
        frame.appendChild(header);

        const metricsGrid = document.createElement('div');
        metricsGrid.className = 'dos-grid-3';
        metricsGrid.style.marginTop = '18px';

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
            el.className = 'dos-panel section';
            el.innerHTML = `
                <div class="dos-label">${card.label}</div>
                <div style="font: bold 24px var(--dos-font); color:${card.color}; margin-top:8px;">${card.value}</div>
            `;
            metricsGrid.appendChild(el);
        });
        frame.appendChild(metricsGrid);

        const narrativeGrid = document.createElement('div');
        narrativeGrid.className = 'dos-grid-2';
        narrativeGrid.style.marginTop = '18px';

        const notesPanel = document.createElement('div');
        notesPanel.className = 'dos-panel section';
        notesPanel.innerHTML = `
            <div class="dos-label">Post-Sortie Notes</div>
            <div class="dos-copy" style="margin-top:10px;">${result.landingText || 'Return to base for repair, rearm, and contract review.'}</div>
        `;
        narrativeGrid.appendChild(notesPanel);

        const outcomePanel = document.createElement('div');
        outcomePanel.className = 'dos-panel section';
        outcomePanel.innerHTML = `
            <div class="dos-label">Contract Summary</div>
            <div class="dos-copy" style="margin-top:10px; line-height:1.8;">
                Completion Status FILED<br>
                Cash Transfer VERIFIED<br>
                Repair Cycle PENDING<br>
                Next Destination HANGAR
            </div>
        `;
        narrativeGrid.appendChild(outcomePanel);
        frame.appendChild(narrativeGrid);

        const footer = document.createElement('div');
        footer.style.marginTop = '16px';
        footer.style.paddingTop = '14px';
        footer.style.borderTop = '1px solid rgba(255,255,255,0.08)';

        const countdownRow = document.createElement('div');
        countdownRow.style.display = 'flex';
        countdownRow.style.alignItems = 'center';
        countdownRow.style.gap = '12px';

        const countdown = document.createElement('div');
        countdown.className = 'dos-subtitle';
        this.countdownElement = countdown;

        const progressFrame = document.createElement('div');
        progressFrame.className = 'dos-progress';
        progressFrame.style.flex = '1';
        const progress = document.createElement('div');
        progress.className = 'dos-progress-bar';
        this.progressElement = progress;
        progressFrame.appendChild(progress);
        countdownRow.appendChild(countdown);
        countdownRow.appendChild(progressFrame);

        const hint = document.createElement('div');
        hint.className = 'dos-footer-hint';
        hint.style.marginTop = '10px';
        hint.textContent = 'Enter/Space returns to hangar // Esc skips';

        footer.appendChild(countdownRow);
        footer.appendChild(hint);
        frame.appendChild(footer);

        layout.appendChild(frame);
        shell.appendChild(layout);
        screen.appendChild(shell);
        this.updateCountdownDisplay();
    }

    updateCountdownDisplay() {
        if (!this.countdownElement || !this.progressElement) {
            return;
        }
        const elapsed = performance.now() - this.enteredAt;
        const remainingSeconds = Math.max(0, Math.ceil((this.autoReturnDelay - elapsed) / 1000));
        const progress = Math.min(1, elapsed / this.autoReturnDelay);
        this.countdownElement.textContent = `Hangar Return T-${remainingSeconds}s`;
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
