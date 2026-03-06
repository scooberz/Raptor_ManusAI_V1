/**
 * HangarState class
 * Represents the hangar screen between missions.
 */
import { logger } from '../utils/logger.js';

class HangarState {
    constructor(game) {
        this.game = game;
        this.background = null;
        this.completedLevel = 0;
        this.showHotspotDebug = false;
    }

    enter(context = {}) {
        this.completedLevel = Number(context.completedLevel) || 0;
        this.game.setPlayerData(this.game.playerData || {});
        this.background = this.game.assets.getImage('hangarBackground');
        document.getElementById('hangar-screen').style.display = 'flex';
        this.setupHangarScreen();
    }

    getMissionLabel() {
        const gameState = this.game.states.game;
        const missionLevel = gameState ? gameState.getRequestedMissionLevel(this.game.playerData?.level || 1) : 1;
        const lastCompleted = this.game.playerData?.lastCompletedLevel || 0;
        return lastCompleted >= missionLevel ? `Replay Mission ${missionLevel}` : `Launch Mission ${missionLevel}`;
    }

    createHotspot(label, position, onClick) {
        const button = document.createElement('button');
        button.type = 'button';
        button.style.position = 'absolute';
        button.style.left = position.left;
        button.style.top = position.top;
        button.style.width = position.width;
        button.style.height = position.height;
        button.style.background = this.showHotspotDebug ? 'rgba(255, 204, 0, 0.08)' : 'transparent';
        button.style.border = this.showHotspotDebug ? '1px dashed rgba(255, 204, 0, 0.4)' : '1px solid transparent';
        button.style.borderRadius = '12px';
        button.style.cursor = 'pointer';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.transition = 'transform 0.15s ease, filter 0.15s ease, background 0.15s ease';
        button.style.zIndex = '4';

        const badge = document.createElement('span');
        badge.textContent = label;
        badge.style.display = 'inline-flex';
        badge.style.alignItems = 'center';
        badge.style.justifyContent = 'center';
        badge.style.padding = '9px 14px';
        badge.style.background = 'rgba(7, 10, 16, 0.8)';
        badge.style.border = '1px solid rgba(255, 204, 0, 0.45)';
        badge.style.borderRadius = '999px';
        badge.style.color = '#ffcc00';
        badge.style.fontSize = '15px';
        badge.style.fontWeight = 'bold';
        badge.style.letterSpacing = '0.04em';
        badge.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.9)';
        badge.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.35)';
        button.appendChild(badge);

        const setIdleState = () => {
            button.style.background = this.showHotspotDebug ? 'rgba(255, 204, 0, 0.08)' : 'transparent';
            button.style.borderColor = this.showHotspotDebug ? 'rgba(255, 204, 0, 0.4)' : 'transparent';
            button.style.transform = 'scale(1)';
            button.style.filter = 'brightness(1)';
            badge.style.background = 'rgba(7, 10, 16, 0.8)';
            badge.style.borderColor = 'rgba(255, 204, 0, 0.45)';
            badge.style.color = '#ffcc00';
        };

        const setHoverState = () => {
            button.style.background = 'rgba(255, 204, 0, 0.06)';
            button.style.borderColor = 'rgba(255, 204, 0, 0.3)';
            button.style.transform = 'scale(1.02)';
            button.style.filter = 'brightness(1.06)';
            badge.style.background = 'rgba(22, 18, 7, 0.9)';
            badge.style.borderColor = '#ffcc00';
            badge.style.color = '#fff3b0';
        };

        button.addEventListener('mouseover', setHoverState);
        button.addEventListener('mouseout', setIdleState);
        button.addEventListener('focus', setHoverState);
        button.addEventListener('blur', setIdleState);
        button.addEventListener('click', onClick);
        setIdleState();

        return button;
    }

    setupHangarScreen() {
        const playerData = this.game.playerData || this.game.getDefaultPlayerData();
        const hangarScreen = document.getElementById('hangar-screen');
        hangarScreen.innerHTML = '';

        const mainContainer = document.createElement('div');
        mainContainer.style.position = 'relative';
        mainContainer.style.width = '100%';
        mainContainer.style.height = '100%';
        mainContainer.style.overflow = 'hidden';
        mainContainer.style.backgroundColor = '#05070b';

        if (this.background) {
            const bgImg = document.createElement('img');
            bgImg.src = this.background.src;
            bgImg.style.position = 'absolute';
            bgImg.style.inset = '0';
            bgImg.style.width = '100%';
            bgImg.style.height = '100%';
            bgImg.style.objectFit = 'cover';
            bgImg.style.objectPosition = 'center center';
            bgImg.style.zIndex = '1';
            mainContainer.appendChild(bgImg);
        }

        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.08) 28%, rgba(0,0,0,0.3) 100%)';
        overlay.style.zIndex = '2';
        mainContainer.appendChild(overlay);

        const statsPanel = document.createElement('div');
        statsPanel.style.position = 'absolute';
        statsPanel.style.left = '3.5%';
        statsPanel.style.top = '5.5%';
        statsPanel.style.width = '20%';
        statsPanel.style.minWidth = '230px';
        statsPanel.style.padding = '14px 16px';
        statsPanel.style.background = 'rgba(8, 10, 14, 0.78)';
        statsPanel.style.border = '1px solid rgba(255, 204, 0, 0.28)';
        statsPanel.style.borderRadius = '8px';
        statsPanel.style.color = 'white';
        statsPanel.style.zIndex = '3';
        statsPanel.innerHTML = `
            <div style="font-size: 28px; color: #ffcc00; margin-bottom: 10px;">HANGAR</div>
            <div style="font-size: 22px; margin-bottom: 4px;">${playerData.name}</div>
            <div style="font-size: 15px; color: #9fd7ff; margin-bottom: 12px;">Callsign: ${playerData.callsign}</div>
            <div style="font-size: 14px; line-height: 1.7;">
                <div>Funds: $${playerData.money}</div>
                <div>Score: ${playerData.score}</div>
                <div>Hull: ${playerData.health}/${playerData.maxHealth || 100}</div>
                <div>Megabombs: ${playerData.megabombs ?? 3}</div>
                <div>Cleared Missions: ${playerData.lastCompletedLevel || 0}</div>
            </div>
        `;
        mainContainer.appendChild(statsPanel);

        const status = document.createElement('div');
        status.style.position = 'absolute';
        status.style.left = '50%';
        status.style.top = '6%';
        status.style.transform = 'translateX(-50%)';
        status.style.padding = '9px 15px';
        status.style.background = 'rgba(8, 10, 14, 0.72)';
        status.style.border = '1px solid rgba(255, 255, 255, 0.16)';
        status.style.borderRadius = '999px';
        status.style.color = this.completedLevel ? '#ffcc00' : '#d7d7d7';
        status.style.fontSize = '15px';
        status.style.zIndex = '3';
        status.textContent = this.completedLevel
            ? `Mission ${this.completedLevel} complete. The ship is back in the hangar.`
            : 'Select the next sortie from the hangar.';
        mainContainer.appendChild(status);

        const hotspots = [
            this.createHotspot(this.getMissionLabel(), { left: '6%', top: '57%', width: '20%', height: '14%' }, () => this.chooseNextMission()),
            this.createHotspot("Harold's Shop", { left: '76%', top: '59%', width: '14%', height: '10%' }, () => this.openShop()),
            this.createHotspot('Save Game', { left: '73%', top: '26%', width: '17%', height: '9%' }, () => this.saveGame()),
            this.createHotspot('Main Menu', { left: '42%', top: '88%', width: '16%', height: '6%' }, () => this.exitToMenu())
        ];

        hotspots.forEach((hotspot) => mainContainer.appendChild(hotspot));

        const hint = document.createElement('div');
        hint.style.position = 'absolute';
        hint.style.right = '18px';
        hint.style.bottom = '16px';
        hint.style.padding = '8px 12px';
        hint.style.background = 'rgba(8, 10, 14, 0.72)';
        hint.style.border = '1px solid rgba(255,255,255,0.12)';
        hint.style.borderRadius = '6px';
        hint.style.color = '#b7b7b7';
        hint.style.fontSize = '13px';
        hint.style.zIndex = '3';
        hint.textContent = 'Hotkeys: 1 launch, 2 shop, 3 save, 4 menu';
        mainContainer.appendChild(hint);

        hangarScreen.appendChild(mainContainer);
    }

    update(deltaTime) {
        if (this.game.input.wasKeyJustPressed('1') || this.game.input.wasKeyJustPressed('m')) {
            this.chooseNextMission();
        }
        if (this.game.input.wasKeyJustPressed('2') || this.game.input.wasKeyJustPressed('s')) {
            this.openShop();
        }
        if (this.game.input.wasKeyJustPressed('3')) {
            this.saveGame();
        }
        if (this.game.input.wasKeyJustPressed('4') || this.game.input.wasKeyJustPressed('e')) {
            this.exitToMenu();
        }
    }

    render(contexts) {}

    chooseNextMission() {
        const gameState = this.game.states.game;
        const missionLevel = gameState ? gameState.getRequestedMissionLevel(this.game.playerData?.level || 1) : 1;
        document.getElementById('hangar-screen').style.display = 'none';
        this.game.changeState('game', { missionLevel });
    }

    openShop() {
        document.getElementById('hangar-screen').style.display = 'none';
        this.game.changeState('shop');
    }

    saveGame() {
        this.game.saveManager.saveGame();
        this.setupHangarScreen();
    }

    exitToMenu() {
        document.getElementById('hangar-screen').style.display = 'none';
        this.game.changeState('menu');
    }

    exit() {
        document.getElementById('hangar-screen').style.display = 'none';
        logger.info('Exiting Hangar State');
    }
}

export { HangarState };
