import { logger } from '../utils/logger.js';

class SectorBriefingState {
    constructor(game) {
        this.game = game;
        this.name = 'sectorBriefing';
        this.missionLevel = 1;
        this.enteredAt = 0;
        this.autoLaunchDelay = 5000;
        this.hasLaunched = false;
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

        if (background) {
            const bg = document.createElement('img');
            bg.src = background.src;
            bg.style.position = 'absolute';
            bg.style.inset = '0';
            bg.style.width = '100%';
            bg.style.height = '100%';
            bg.style.objectFit = 'cover';
            bg.style.filter = 'blur(2px) brightness(0.45) saturate(0.9)';
            wrapper.appendChild(bg);
        }

        const panel = document.createElement('div');
        panel.style.position = 'relative';
        panel.style.zIndex = '2';
        panel.style.width = 'min(900px, 86%)';
        panel.style.padding = '28px 34px';
        panel.style.background = 'rgba(6, 10, 16, 0.88)';
        panel.style.border = '2px solid rgba(255, 204, 0, 0.42)';
        panel.style.borderRadius = '12px';
        panel.style.boxShadow = '0 24px 80px rgba(0, 0, 0, 0.45)';
        panel.innerHTML = `
            <div style="font-size: 16px; color: #8fb6d8; letter-spacing: 0.16em; margin-bottom: 10px;">SECTOR BRIEFING</div>
            <div style="font-size: 42px; color: #ffcc00; margin-bottom: 6px;">${mission.title}</div>
            <div style="font-size: 18px; color: #dce5ee; margin-bottom: 18px;">${mission.sectorLabel} | ${difficulty.displayName} | Airframe: ${ship.displayName}</div>
            <div style="font-size: 16px; color: #d4dde8; line-height: 1.7; margin-bottom: 22px;">${mission.briefingText}</div>
            <div style="font-size: 18px; color: #ffcc00; margin-bottom: 10px;">Objectives</div>
            <div style="font-size: 16px; color: white; line-height: 1.8; margin-bottom: 22px;">${mission.objectives.map((item) => `- ${item}`).join('<br>')}</div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; color: #92a6ba; gap: 16px; flex-wrap: wrap;">
                <div>Craft Route: ${ship.storyTrack}</div>
                <div>Auto launch in 5 seconds or press Enter</div>
            </div>
        `;
        wrapper.appendChild(panel);
        screen.appendChild(wrapper);
    }

    launchMission() {
        if (this.hasLaunched) {
            return;
        }
        this.hasLaunched = true;
        this.game.changeState('game', { missionLevel: this.missionLevel });
    }

    update() {
        const elapsed = performance.now() - this.enteredAt;
        if (elapsed >= this.autoLaunchDelay) {
            this.launchMission();
            return;
        }
        if ((this.game.input.wasKeyJustPressed('Enter') || this.game.input.wasKeyJustPressed(' ')) && elapsed > 250) {
            this.launchMission();
        }
        if (this.game.input.wasKeyJustPressed('Escape')) {
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
