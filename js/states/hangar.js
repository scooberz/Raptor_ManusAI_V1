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

    setupHangarScreen() {
        const playerData = this.game.playerData || this.game.getDefaultPlayerData();
        const hangarScreen = document.getElementById('hangar-screen');
        hangarScreen.innerHTML = '';

        const mainContainer = document.createElement('div');
        mainContainer.style.display = 'flex';
        mainContainer.style.flexDirection = 'column';
        mainContainer.style.alignItems = 'center';
        mainContainer.style.justifyContent = 'center';
        mainContainer.style.width = '100%';
        mainContainer.style.height = '100%';
        mainContainer.style.position = 'relative';
        mainContainer.style.overflow = 'hidden';

        if (this.background) {
            const bgImg = document.createElement('img');
            bgImg.src = this.background.src;
            bgImg.style.width = '100%';
            bgImg.style.height = '100%';
            bgImg.style.objectFit = 'cover';
            bgImg.style.position = 'absolute';
            bgImg.style.top = '0';
            bgImg.style.left = '0';
            bgImg.style.zIndex = '1';
            mainContainer.appendChild(bgImg);
        }

        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.55)';
        overlay.style.zIndex = '2';
        mainContainer.appendChild(overlay);

        const content = document.createElement('div');
        content.style.position = 'relative';
        content.style.zIndex = '3';
        content.style.display = 'grid';
        content.style.gridTemplateColumns = 'minmax(280px, 360px) minmax(280px, 420px)';
        content.style.gap = '32px';
        content.style.alignItems = 'stretch';
        content.style.width = 'min(1000px, 92vw)';
        content.style.maxWidth = '1000px';

        const pilotCard = document.createElement('div');
        pilotCard.style.backgroundColor = 'rgba(0, 0, 0, 0.78)';
        pilotCard.style.border = '2px solid rgba(255, 204, 0, 0.55)';
        pilotCard.style.borderRadius = '10px';
        pilotCard.style.padding = '28px';
        pilotCard.style.color = 'white';
        pilotCard.innerHTML = `
            <div style="font-size: 36px; color: #ffcc00; margin-bottom: 20px;">HANGAR</div>
            <div style="font-size: 28px; margin-bottom: 10px;">${playerData.name}</div>
            <div style="font-size: 20px; color: #9fd7ff; margin-bottom: 24px;">Callsign: ${playerData.callsign}</div>
            <div style="font-size: 18px; line-height: 1.8;">
                <div>Funds: $${playerData.money}</div>
                <div>Score: ${playerData.score}</div>
                <div>Hull: ${playerData.health}/${playerData.maxHealth || 100}</div>
                <div>Megabombs: ${playerData.megabombs ?? 3}</div>
                <div>Completed Missions: ${playerData.lastCompletedLevel || 0}</div>
            </div>
        `;

        const actionCard = document.createElement('div');
        actionCard.style.backgroundColor = 'rgba(0, 0, 0, 0.78)';
        actionCard.style.border = '2px solid rgba(255, 255, 255, 0.24)';
        actionCard.style.borderRadius = '10px';
        actionCard.style.padding = '28px';
        actionCard.style.color = 'white';
        actionCard.style.display = 'flex';
        actionCard.style.flexDirection = 'column';
        actionCard.style.gap = '14px';

        const status = document.createElement('div');
        status.style.fontSize = '20px';
        status.style.lineHeight = '1.5';
        status.style.minHeight = '72px';
        status.style.color = this.completedLevel ? '#ffcc00' : '#d0d0d0';
        status.textContent = this.completedLevel
            ? `Mission ${this.completedLevel} complete. The pilot has returned to base and the ship is ready for another sortie.`
            : 'Choose your next sortie, visit the shop, or save progress before leaving the hangar.';
        actionCard.appendChild(status);

        const makeButton = (label, onClick) => {
            const button = document.createElement('button');
            button.textContent = label;
            button.style.padding = '16px 20px';
            button.style.fontSize = '22px';
            button.style.backgroundColor = 'rgba(20, 20, 20, 0.92)';
            button.style.color = 'white';
            button.style.border = '2px solid rgba(255, 255, 255, 0.25)';
            button.style.borderRadius = '8px';
            button.style.cursor = 'pointer';
            button.style.textAlign = 'left';
            button.style.transition = 'all 0.15s ease';
            button.addEventListener('mouseover', () => {
                button.style.color = '#ffcc00';
                button.style.borderColor = '#ffcc00';
            });
            button.addEventListener('mouseout', () => {
                button.style.color = 'white';
                button.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            });
            button.addEventListener('click', onClick);
            return button;
        };

        actionCard.appendChild(makeButton(this.getMissionLabel(), () => this.chooseNextMission()));
        actionCard.appendChild(makeButton('Open Shop', () => this.openShop()));
        actionCard.appendChild(makeButton('Save Game', () => this.saveGame()));
        actionCard.appendChild(makeButton('Exit to Main Menu', () => this.exitToMenu()));

        const hint = document.createElement('div');
        hint.style.marginTop = '8px';
        hint.style.color = '#a6a6a6';
        hint.style.fontSize = '14px';
        hint.textContent = 'Hotkeys: 1 launch, 2 shop, 3 save, 4 menu';
        actionCard.appendChild(hint);

        content.appendChild(pilotCard);
        content.appendChild(actionCard);
        mainContainer.appendChild(content);
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
