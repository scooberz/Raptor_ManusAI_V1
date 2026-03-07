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

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.overflow = 'hidden';
        wrapper.style.background = 'radial-gradient(circle at top, rgba(26, 56, 86, 0.42), rgba(4, 8, 12, 0.98) 66%)';

        if (background) {
            const bg = document.createElement('img');
            bg.src = background.src;
            bg.style.position = 'absolute';
            bg.style.inset = '0';
            bg.style.width = '100%';
            bg.style.height = '100%';
            bg.style.objectFit = 'cover';
            bg.style.filter = 'blur(3px) brightness(0.28) saturate(0.75)';
            wrapper.appendChild(bg);
        }

        const scan = document.createElement('div');
        scan.style.position = 'absolute';
        scan.style.inset = '0';
        scan.style.background = 'repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 5px)';
        scan.style.opacity = '0.18';
        wrapper.appendChild(scan);

        const frame = document.createElement('div');
        frame.style.position = 'relative';
        frame.style.zIndex = '2';
        frame.style.width = 'min(980px, 88%)';
        frame.style.padding = '22px';
        frame.style.border = '2px solid rgba(255, 204, 0, 0.38)';
        frame.style.background = 'rgba(6, 11, 18, 0.88)';
        frame.style.boxShadow = '0 28px 90px rgba(0,0,0,0.45)';

        const header = document.createElement('div');
        header.style.display = 'grid';
        header.style.gridTemplateColumns = '1.2fr 0.8fr';
        header.style.gap = '18px';

        const left = document.createElement('div');
        left.innerHTML = `
            <div style="font: 13px Consolas, monospace; color: #8fb6d8; letter-spacing: 0.18em; margin-bottom: 10px;">CONTRACT BRIEFING // SORTIE PREP</div>
            <div style="font: bold 42px Consolas, monospace; color: #ffcc00; margin-bottom: 6px;">${mission.title}</div>
            <div style="font: 16px Consolas, monospace; color: #dce5ee; line-height: 1.7;">${mission.sectorLabel} // ${difficulty.displayName} // ${ship.displayName}</div>
        `;

        const right = document.createElement('div');
        right.style.border = '1px solid rgba(143, 182, 216, 0.22)';
        right.style.padding = '12px 14px';
        right.style.background = 'rgba(2, 8, 14, 0.72)';
        right.innerHTML = `
            <div style="font: 12px Consolas, monospace; color: #8fb6d8; letter-spacing: 0.12em; margin-bottom: 8px;">PILOT HEADER</div>
            <div style="font: bold 18px Consolas, monospace; color: #ffffff; margin-bottom: 6px;">${this.game.playerData?.callsign}</div>
            <div style="font: 14px Consolas, monospace; color: #d4dde8; line-height: 1.6;">
                Hull ${ship.maxHealth}<br>
                Speed ${Math.round(ship.speed)}<br>
                Route ${ship.storyTrack}<br>
                Gun ${ship.startingPrimaryLabel || 'Machine Gun'}
            </div>
        `;

        header.appendChild(left);
        header.appendChild(right);
        frame.appendChild(header);

        const mainGrid = document.createElement('div');
        mainGrid.style.display = 'grid';
        mainGrid.style.gridTemplateColumns = '1.1fr 0.9fr';
        mainGrid.style.gap = '20px';
        mainGrid.style.marginTop = '18px';

        const briefingPanel = document.createElement('div');
        briefingPanel.style.border = '1px solid rgba(255,255,255,0.08)';
        briefingPanel.style.background = 'rgba(3, 9, 14, 0.76)';
        briefingPanel.style.padding = '16px';
        briefingPanel.innerHTML = `
            <div style="font: bold 16px Consolas, monospace; color: #ffcc00; margin-bottom: 10px;">TACTICAL SUMMARY</div>
            <div style="font: 15px Consolas, monospace; color: #d4dde8; line-height: 1.8;">${mission.briefingText}</div>
        `;

        const objectivePanel = document.createElement('div');
        objectivePanel.style.border = '1px solid rgba(143, 182, 216, 0.18)';
        objectivePanel.style.background = 'rgba(3, 9, 14, 0.72)';
        objectivePanel.style.padding = '16px';
        objectivePanel.innerHTML = `
            <div style="font: bold 16px Consolas, monospace; color: #8fd7ff; margin-bottom: 10px;">CONTRACT OBJECTIVES</div>
            <div style="font: 14px Consolas, monospace; color: #f1f6fb; line-height: 1.9;">${mission.objectives.map((item, index) => `${index + 1}. ${item}`).join('<br>')}</div>
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
        countdown.style.font = '14px Consolas, monospace';
        countdown.style.color = '#dce5ee';
        this.countdownElement = countdown;

        const progressFrame = document.createElement('div');
        progressFrame.style.flex = '1';
        progressFrame.style.height = '12px';
        progressFrame.style.background = 'rgba(10, 18, 26, 0.9)';
        progressFrame.style.border = '1px solid rgba(255,204,0,0.22)';
        progressFrame.style.marginLeft = '16px';
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
        hint.textContent = 'ENTER/SPACE: launch immediately // ESC: abort to hangar';

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
        const remainingSeconds = Math.max(0, Math.ceil((this.autoLaunchDelay - elapsed) / 1000));
        const progress = Math.min(1, elapsed / this.autoLaunchDelay);
        this.countdownElement.textContent = `LAUNCH WINDOW T-${remainingSeconds}s`;
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
