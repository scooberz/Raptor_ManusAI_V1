/**
 * HangarState class
 * Represents the hangar screen between missions.
 */
import { logger } from '../utils/logger.js';

class HangarState {
    constructor(game) {
        this.game = game;
        this.name = 'hangar';
        this.background = null;
        this.completedLevel = 0;
        this.missionResult = null;
        this.showHotspotDebug = false;
    }

    enter(context = {}) {
        this.completedLevel = Number(context.completedLevel) || 0;
        this.missionResult = context.missionResult || null;
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
        button.className = 'dos-hotspot';
        button.style.left = position.left;
        button.style.top = position.top;
        button.style.width = position.width;
        button.style.height = position.height;
        button.style.zIndex = '4';
        if (this.showHotspotDebug) {
            button.style.background = 'rgba(255, 204, 0, 0.08)';
            button.style.border = '1px dashed rgba(255, 204, 0, 0.4)';
        }

        const badge = document.createElement('span');
        badge.className = 'dos-hotspot-badge';
        badge.textContent = label;
        button.appendChild(badge);

        button.addEventListener('mouseover', () => this.game.audio.playSound('uiMove'));
        button.addEventListener('focus', () => this.game.audio.playSound('uiMove'));
        button.addEventListener('click', () => {
            this.game.audio.playSound('uiConfirm');
            onClick();
        });

        return button;
    }

    buildSystemsSummary(playerData) {
        const systems = [];
        if (playerData.ownedSystems.bossHealthIndicator) systems.push('Boss Readout');
        if (playerData.ownedSystems.targetingHud) systems.push('Targeting HUD');
        if (playerData.ownedSystems.threatComputer) systems.push('Threat Computer');
        if (playerData.ownedSystems.reactiveShieldEmitter) systems.push('Shield Emitter');
        if (playerData.ownedSystems.damageControlKit) systems.push('Damage Control');
        if (playerData.ownedSystems.salvageUplink) systems.push(`Salvage Uplink Mk ${playerData.ownedSystems.salvageUplink}`);
        return systems.length ? systems.join('<br>') : 'No fitted systems';
    }

    setupHangarScreen() {
        const playerData = this.game.playerData || this.game.getDefaultPlayerData();
        const ship = this.game.getPlayerShipProfile(playerData.shipId);
        const difficulty = this.game.getDifficultyProfile(playerData.difficulty);
        const hangarScreen = document.getElementById('hangar-screen');
        hangarScreen.innerHTML = '';

        const shell = document.createElement('div');
        shell.className = 'dos-shell';
        shell.style.background = 'radial-gradient(circle at center, rgba(24, 32, 38, 0.34), rgba(4, 8, 12, 0.98) 74%)';

        if (this.background) {
            const bgImg = document.createElement('img');
            bgImg.className = 'dos-bg-image';
            bgImg.src = this.background.src;
            bgImg.style.filter = 'brightness(0.5) contrast(1.02) saturate(0.78)';
            shell.appendChild(bgImg);
        }

        const overlay = document.createElement('div');
        overlay.className = 'dos-overlay';
        overlay.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.35)), repeating-linear-gradient(180deg, rgba(255,255,255,0.028) 0, rgba(255,255,255,0.028) 1px, transparent 1px, transparent 6px)';
        shell.appendChild(overlay);

        const statsPanel = document.createElement('div');
        statsPanel.className = 'dos-frame compact';
        statsPanel.style.position = 'absolute';
        statsPanel.style.left = '3.5%';
        statsPanel.style.top = '5.5%';
        statsPanel.style.width = '22%';
        statsPanel.style.minWidth = '270px';
        statsPanel.style.padding = '14px 16px';
        statsPanel.style.zIndex = '3';
        statsPanel.innerHTML = `
            <div class="dos-kicker">Base Operations</div>
            <div class="dos-title" style="font-size:28px; margin:8px 0 10px;">Hangar</div>
            <div class="dos-subtitle" style="font-size:20px; color:#ffffff;">${playerData.name}</div>
            <div class="dos-subtitle" style="color:#9fd7ff; margin-bottom:10px;">Callsign ${playerData.callsign}</div>
            <div class="dos-copy">
                Airframe ${ship.displayName}<br>
                Difficulty ${difficulty.displayName}<br>
                Funds $${playerData.money}<br>
                Hull ${playerData.health}/${playerData.maxHealth || ship.maxHealth}<br>
                Shield ${playerData.shield || 0}/${playerData.maxShield || 0}<br>
                Main Gun Mk ${playerData.primaryWeaponLevel || 1}<br>
                Secondary ${playerData.equippedSecondaryWeapon || 'None'}<br>
                Megabombs ${playerData.megabombs ?? 3}<br>
                Cleared Missions ${playerData.lastCompletedLevel || 0}
            </div>
        `;
        shell.appendChild(statsPanel);

        const status = document.createElement('div');
        status.className = 'dos-chip';
        status.style.position = 'absolute';
        status.style.left = '50%';
        status.style.top = '6%';
        status.style.transform = 'translateX(-50%)';
        status.style.zIndex = '3';
        status.style.color = this.completedLevel ? '#ffcc00' : '#d7d7d7';
        status.textContent = this.completedLevel
            ? `Mission ${this.completedLevel} complete. Craft recovered and debrief filed.`
            : 'Select the next sortie from the hangar.';
        shell.appendChild(status);

        const systemsPanel = document.createElement('div');
        systemsPanel.className = 'dos-frame compact';
        systemsPanel.style.position = 'absolute';
        systemsPanel.style.right = '3.5%';
        systemsPanel.style.top = '7.5%';
        systemsPanel.style.width = '22%';
        systemsPanel.style.minWidth = '250px';
        systemsPanel.style.padding = '14px 16px';
        systemsPanel.style.zIndex = '3';
        systemsPanel.innerHTML = `
            <div class="dos-kicker">Systems Board</div>
            <div class="dos-copy" style="margin-top:10px; line-height:1.8;">${this.buildSystemsSummary(playerData)}</div>
        `;
        shell.appendChild(systemsPanel);

        if (this.missionResult) {
            const debriefBadge = document.createElement('div');
            debriefBadge.className = 'dos-frame compact';
            debriefBadge.style.position = 'absolute';
            debriefBadge.style.left = '3.5%';
            debriefBadge.style.bottom = '8%';
            debriefBadge.style.width = '24%';
            debriefBadge.style.minWidth = '280px';
            debriefBadge.style.padding = '12px 14px';
            debriefBadge.style.zIndex = '3';
            debriefBadge.innerHTML = `
                <div class="dos-kicker">Latest Debrief</div>
                <div class="dos-copy" style="margin-top:10px; line-height:1.8;">
                    Cash Earned $${this.missionResult.moneyEarned || 0}<br>
                    Air / Ground ${this.missionResult.airTargetsDestroyed || 0} / ${this.missionResult.groundTargetsDestroyed || 0}<br>
                    Route ${(this.missionResult.sectionsVisited || []).join(' / ') || 'Bravo Sector'}
                </div>
            `;
            shell.appendChild(debriefBadge);
        }

        const hotspots = [
            this.createHotspot(this.getMissionLabel(), { left: '6%', top: '57%', width: '20%', height: '14%' }, () => this.chooseNextMission()),
            this.createHotspot("Harold's Shop", { left: '76%', top: '59%', width: '14%', height: '10%' }, () => this.openShop()),
            this.createHotspot('Save Game', { left: '73%', top: '26%', width: '17%', height: '9%' }, () => this.saveGame()),
            this.createHotspot('Main Menu', { left: '42%', top: '88%', width: '16%', height: '6%' }, () => this.exitToMenu())
        ];
        hotspots.forEach((hotspot) => shell.appendChild(hotspot));

        const hint = document.createElement('div');
        hint.className = 'dos-frame compact';
        hint.style.position = 'absolute';
        hint.style.right = '18px';
        hint.style.bottom = '16px';
        hint.style.padding = '8px 12px';
        hint.style.zIndex = '3';
        hint.innerHTML = '<div class="dos-footer-hint">Hotkeys: 1 Launch // 2 Shop // 3 Save // 4 Menu</div>';
        shell.appendChild(hint);

        hangarScreen.appendChild(shell);
    }

    update() {
        if (this.game.input.wasKeyJustPressed('1') || this.game.input.wasKeyJustPressed('m')) {
            this.game.audio.playSound('uiConfirm');
            this.chooseNextMission();
        }
        if (this.game.input.wasKeyJustPressed('2') || this.game.input.wasKeyJustPressed('s')) {
            this.game.audio.playSound('uiConfirm');
            this.openShop();
        }
        if (this.game.input.wasKeyJustPressed('3')) {
            this.game.audio.playSound('uiConfirm');
            this.saveGame();
        }
        if (this.game.input.wasKeyJustPressed('4') || this.game.input.wasKeyJustPressed('e') || this.game.input.wasKeyJustPressed('Escape')) {
            this.game.audio.playSound('uiBack');
            this.exitToMenu();
        }
    }

    render() {}

    chooseNextMission() {
        const gameState = this.game.states.game;
        const missionLevel = gameState ? gameState.getRequestedMissionLevel(this.game.playerData?.level || 1) : 1;
        document.getElementById('hangar-screen').style.display = 'none';
        this.game.changeState('sectorBriefing', { missionLevel });
    }

    openShop() {
        document.getElementById('hangar-screen').style.display = 'none';
        this.game.changeState('shop');
    }

    saveGame() {
        this.game.saveManager.saveGame();
        this.game.audio.playSound('saveConfirm');
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
