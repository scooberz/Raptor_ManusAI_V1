import { logger } from '../utils/logger.js';

class SectorBriefingState {
    constructor(game) {
        this.game = game;
        this.name = 'sectorBriefing';
        this.missionLevel = 1;
        this.enteredAt = 0;
        this.autoLaunchDelay = 5000;
        this.hasLaunched = false;
        this.countdownElement = null;
        this.progressElement = null;
    }

    enter(context = {}) {
        this.missionLevel = context.missionLevel || this.game.playerData?.level || 1;
        this.enteredAt = performance.now();
        this.hasLaunched = false;
        this.setupScreen();
    }

    setupScreen() {
        const screen = document.getElementById('sector-briefing-screen');
        screen.style.display = 'flex';
        screen.innerHTML = '';

        const mission = this.game.getMissionProfile(this.missionLevel);
        const difficulty = this.game.getDifficultyProfile(this.game.playerData?.difficulty);
        const ship = this.game.getPlayerShipProfile(this.game.playerData?.shipId);
        const background = this.game.assets.getImage('backgroundLevel1');

        const shell = document.createElement('div');
        shell.className = 'dos-shell';
        shell.style.background = 'radial-gradient(circle at top, rgba(26, 56, 86, 0.42), rgba(4, 8, 12, 0.98) 66%)';

        if (background) {
            const bg = document.createElement('img');
            bg.className = 'dos-bg-image';
            bg.src = background.src;
            bg.style.filter = 'blur(3px) brightness(0.24) saturate(0.75)';
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
        header.innerHTML = `
            <div>
                <div class="dos-kicker">Contract Briefing // Sortie Prep</div>
                <div class="dos-title" style="margin:8px 0 6px;">${mission.title}</div>
                <div class="dos-subtitle">${mission.sectorLabel} // ${difficulty.displayName} // ${ship.displayName}</div>
            </div>
            <div class="dos-panel section">
                <div class="dos-label">Pilot Header</div>
                <div class="dos-copy" style="margin-top:10px; line-height:1.8;">
                    ${this.game.playerData?.callsign}<br>
                    Hull ${ship.maxHealth}<br>
                    Speed ${Math.round(ship.speed)}<br>
                    Route ${ship.storyTrack}<br>
                    Gun ${ship.startingPrimaryLabel || 'Machine Gun'}
                </div>
            </div>
        `;
        frame.appendChild(header);

        const mainGrid = document.createElement('div');
        mainGrid.className = 'dos-grid-2';
        mainGrid.style.marginTop = '18px';

        const briefingPanel = document.createElement('div');
        briefingPanel.className = 'dos-panel section';
        briefingPanel.innerHTML = `
            <div class="dos-label">Tactical Summary</div>
            <div class="dos-copy" style="margin-top:10px;">${mission.briefingText}</div>
        `;

        const objectivePanel = document.createElement('div');
        objectivePanel.className = 'dos-panel section';
        objectivePanel.innerHTML = `
            <div class="dos-label">Contract Objectives</div>
            <div class="dos-copy" style="margin-top:10px;">${mission.objectives.map((item, index) => `${index + 1}. ${item}`).join('<br>')}</div>
        `;

        mainGrid.appendChild(briefingPanel);
        mainGrid.appendChild(objectivePanel);
        frame.appendChild(mainGrid);

        const footer = document.createElement('div');
        footer.style.marginTop = '18px';
        footer.style.paddingTop = '14px';
        footer.style.borderTop = '1px solid rgba(255,255,255,0.08)';

        const countdownRow = document.createElement('div');
        countdownRow.style.display = 'flex';
        countdownRow.style.justifyContent = 'space-between';
        countdownRow.style.alignItems = 'center';
        countdownRow.style.gap = '12px';

        const countdown = document.createElement('div');
        countdown.className = 'dos-subtitle';
        this.countdownElement = countdown;

        const progressFrame = document.createElement('div');
        progressFrame.className = 'dos-progress';
        progressFrame.style.flex = '1';
        progressFrame.style.marginLeft = '16px';
        const progress = document.createElement('div');
        progress.className = 'dos-progress-bar';
        this.progressElement = progress;
        progressFrame.appendChild(progress);
        countdownRow.appendChild(countdown);
        countdownRow.appendChild(progressFrame);

        const hint = document.createElement('div');
        hint.className = 'dos-footer-hint';
        hint.style.marginTop = '10px';
        hint.textContent = 'Enter/Space launches // Esc returns to hangar';

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
        const remainingSeconds = Math.max(0, Math.ceil((this.autoLaunchDelay - elapsed) / 1000));
        const progress = Math.min(1, elapsed / this.autoLaunchDelay);
        this.countdownElement.textContent = `Launch Window T-${remainingSeconds}s`;
        this.progressElement.style.width = `${Math.round(progress * 100)}%`;
    }

    launchMission() {
        if (this.hasLaunched) {
            return;
        }
        this.hasLaunched = true;
        this.game.audio.playSound('uiConfirm');
        this.game.changeState('game', { missionLevel: this.missionLevel });
    }

    update() {
        const elapsed = performance.now() - this.enteredAt;
        this.updateCountdownDisplay();
        if (elapsed >= this.autoLaunchDelay) {
            this.launchMission();
            return;
        }
        if ((this.game.input.wasKeyJustPressed('Enter') || this.game.input.wasKeyJustPressed(' ')) && elapsed > 250) {
            this.launchMission();
        }
        if (this.game.input.wasKeyJustPressed('Escape')) {
            this.game.audio.playSound('uiBack');
            this.game.changeState('hangar');
        }
    }

    render() {}

    exit() {
        const screen = document.getElementById('sector-briefing-screen');
        if (screen) {
            screen.style.display = 'none';
        }
        logger.info('Exiting Sector Briefing State');
    }
}

export { SectorBriefingState };
