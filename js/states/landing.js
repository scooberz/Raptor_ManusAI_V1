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

        if (background) {
            const bg = document.createElement('img');
            bg.src = background.src;
            bg.style.position = 'absolute';
            bg.style.inset = '0';
            bg.style.width = '100%';
            bg.style.height = '100%';
            bg.style.objectFit = 'cover';
            bg.style.filter = 'brightness(0.38)';
            wrapper.appendChild(bg);
        }

        const panel = document.createElement('div');
        panel.style.position = 'relative';
        panel.style.zIndex = '2';
        panel.style.width = 'min(860px, 84%)';
        panel.style.padding = '28px 34px';
        panel.style.background = 'rgba(7, 10, 16, 0.9)';
        panel.style.border = '2px solid rgba(255, 204, 0, 0.42)';
        panel.style.borderRadius = '12px';
        panel.innerHTML = `
            <div style="font-size: 16px; color: #8fb6d8; letter-spacing: 0.16em; margin-bottom: 10px;">LANDING COMPLETE</div>
            <div style="font-size: 42px; color: #ffcc00; margin-bottom: 6px;">Mission ${this.completedLevel} Debrief</div>
            <div style="font-size: 18px; color: #dce5ee; margin-bottom: 22px;">${result.missionTitle || 'Bravo Sector'} | ${difficulty.displayName} | ${ship.displayName}</div>
            <div style="display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 14px 24px; font-size: 17px; color: white; line-height: 1.7; margin-bottom: 24px;">
                <div>Cash Earned: $${result.moneyEarned ?? 0}</div>
                <div>Primary Gun Mk: ${result.primaryWeaponLevel ?? 1}</div>
                <div>Air Targets Destroyed: ${result.airTargetsDestroyed ?? 0}</div>
                <div>Ground Targets Destroyed: ${result.groundTargetsDestroyed ?? 0}</div>
                <div>Sector Route: ${(result.sectionsVisited || []).join(', ') || 'Bravo Sector'}</div>
                <div>Ending Track Seed: ${ship.endingKey}</div>
            </div>
            <div style="font-size: 16px; color: #d4dde8; line-height: 1.7; margin-bottom: 18px;">${result.landingText || 'Return to base for repair, rearm, and contract review.'}</div>
            <div style="font-size: 14px; color: #92a6ba;">Press Enter to return to hangar or wait a moment.</div>
        `;
        wrapper.appendChild(panel);
        screen.appendChild(wrapper);
    }

    returnToHangar() {
        if (this.hasReturned) {
            return;
        }
        this.hasReturned = true;
        this.game.changeState('hangar', { completedLevel: this.completedLevel, missionResult: this.missionResult });
    }

    update() {
        const elapsed = performance.now() - this.enteredAt;
        if (elapsed >= this.autoReturnDelay) {
            this.returnToHangar();
            return;
        }
        if ((this.game.input.wasKeyJustPressed('Enter') || this.game.input.wasKeyJustPressed(' ')) && elapsed > 350) {
            this.returnToHangar();
        }
        if (this.game.input.wasKeyJustPressed('Escape')) {
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
