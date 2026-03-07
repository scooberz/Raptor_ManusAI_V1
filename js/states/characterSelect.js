/**
 * CharacterSelectState class
 * Handles pilot creation and ship selection.
 */
import { logger } from '../utils/logger.js';

class CharacterSelectState {
    constructor(game) {
        this.game = game;
        this.name = 'characterSelect';
        this.background = null;
        this.selectedShipId = 'raptor';
    }

    enter() {
        logger.info('Entering Character Select State');
        document.getElementById('character-select-screen').style.display = 'flex';
        this.background = this.game.assets.getImage('characterSelectBackground');
        this.selectedShipId = this.game.playerData?.shipId || 'raptor';
        this.setupCharacterSelectScreen();
    }

    buildShipCard(ship, isSelected) {
        const card = document.createElement('button');
        card.type = 'button';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'stretch';
        card.style.gap = '10px';
        card.style.padding = '14px';
        card.style.minHeight = '220px';
        card.style.background = isSelected ? 'rgba(32, 24, 8, 0.9)' : 'rgba(10, 14, 20, 0.86)';
        card.style.border = isSelected ? '2px solid #ffcc00' : '1px solid rgba(255,255,255,0.18)';
        card.style.borderRadius = '10px';
        card.style.color = 'white';
        card.style.cursor = 'pointer';
        card.style.textAlign = 'left';
        card.style.boxShadow = isSelected ? '0 0 22px rgba(255, 204, 0, 0.18)' : 'none';

        const preview = document.createElement('div');
        preview.style.position = 'relative';
        preview.style.height = '72px';
        preview.style.borderRadius = '8px';
        preview.style.background = 'linear-gradient(135deg, rgba(16,24,34,0.95), rgba(5,8,12,0.95))';
        preview.style.border = '1px solid rgba(255,255,255,0.08)';
        preview.style.overflow = 'hidden';

        const shipSprite = this.game.assets.getImage('playerShipBase');
        if (shipSprite) {
            const img = document.createElement('img');
            img.src = shipSprite.src;
            img.style.position = 'absolute';
            img.style.left = '18px';
            img.style.top = '8px';
            img.style.height = '56px';
            img.style.imageRendering = 'auto';
            preview.appendChild(img);

            if (ship.tint) {
                const tint = document.createElement('div');
                tint.style.position = 'absolute';
                tint.style.left = '18px';
                tint.style.top = '8px';
                tint.style.width = '56px';
                tint.style.height = '56px';
                tint.style.background = ship.tint;
                tint.style.mixBlendMode = 'screen';
                tint.style.pointerEvents = 'none';
                preview.appendChild(tint);
            }
        }

        const roleTag = document.createElement('div');
        roleTag.textContent = ship.role;
        roleTag.style.position = 'absolute';
        roleTag.style.right = '12px';
        roleTag.style.top = '12px';
        roleTag.style.padding = '5px 8px';
        roleTag.style.borderRadius = '999px';
        roleTag.style.background = 'rgba(0,0,0,0.5)';
        roleTag.style.color = '#9fd7ff';
        roleTag.style.fontSize = '12px';
        roleTag.style.letterSpacing = '0.04em';
        preview.appendChild(roleTag);

        const title = document.createElement('div');
        title.innerHTML = `
            <div style="font-size: 24px; color: ${isSelected ? '#ffcc00' : '#ffffff'}; margin-bottom: 4px;">${ship.displayName}</div>
            <div style="font-size: 13px; color: #7ea6c8; letter-spacing: 0.05em;">${ship.manufacturer}</div>
        `;

        const description = document.createElement('div');
        description.style.fontSize = '14px';
        description.style.lineHeight = '1.6';
        description.style.color = '#d3dce6';
        description.textContent = ship.description;

        const stats = document.createElement('div');
        stats.style.fontSize = '13px';
        stats.style.lineHeight = '1.8';
        stats.style.color = '#c6d4e1';
        stats.innerHTML = `
            Hull: ${ship.maxHealth}<br>
            Speed: ${ship.speed}<br>
            Opening Gun: ${ship.cannonDamage} dmg @ ${ship.cannonFireRate}ms<br>
            Story Route Seed: ${ship.storyTrack}
        `;

        card.appendChild(preview);
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(stats);

        card.addEventListener('click', () => {
            this.selectedShipId = ship.id;
            this.setupCharacterSelectScreen();
        });

        return card;
    }

    setupCharacterSelectScreen() {
        const characterSelectScreen = document.getElementById('character-select-screen');
        characterSelectScreen.innerHTML = '';

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
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'linear-gradient(180deg, rgba(4,6,10,0.65), rgba(4,6,10,0.82))';
        overlay.style.zIndex = '2';
        mainContainer.appendChild(overlay);

        const contentContainer = document.createElement('div');
        contentContainer.style.display = 'flex';
        contentContainer.style.flexDirection = 'column';
        contentContainer.style.alignItems = 'center';
        contentContainer.style.justifyContent = 'center';
        contentContainer.style.position = 'absolute';
        contentContainer.style.inset = '0';
        contentContainer.style.padding = '32px 36px';
        contentContainer.style.zIndex = '3';
        contentContainer.style.gap = '24px';

        const title = document.createElement('h1');
        title.textContent = 'PILOT AND AIRFRAME ASSIGNMENT';
        title.style.color = '#ffcc00';
        title.style.fontSize = '42px';
        title.style.margin = '0';
        title.style.letterSpacing = '0.08em';
        title.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        contentContainer.appendChild(title);

        const formRow = document.createElement('div');
        formRow.style.display = 'grid';
        formRow.style.gridTemplateColumns = 'repeat(2, minmax(260px, 320px))';
        formRow.style.gap = '16px';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Pilot name';
        nameInput.maxLength = '20';
        nameInput.value = this.game.playerData?.name && this.game.playerData.name !== 'Pilot' ? this.game.playerData.name : '';

        const callsignInput = document.createElement('input');
        callsignInput.type = 'text';
        callsignInput.placeholder = 'Callsign';
        callsignInput.maxLength = '12';
        callsignInput.value = this.game.playerData?.callsign && this.game.playerData.callsign !== 'RAPTOR' ? this.game.playerData.callsign : '';

        [nameInput, callsignInput].forEach((input) => {
            input.style.fontSize = '20px';
            input.style.padding = '14px 18px';
            input.style.backgroundColor = 'rgba(0, 0, 0, 0.72)';
            input.style.border = '2px solid rgba(255, 255, 255, 0.22)';
            input.style.borderRadius = '8px';
            input.style.color = 'white';
            input.style.outline = 'none';
            input.addEventListener('focus', () => {
                input.style.borderColor = '#ffcc00';
            });
            input.addEventListener('blur', () => {
                input.style.borderColor = 'rgba(255, 255, 255, 0.22)';
            });
        });

        nameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                callsignInput.focus();
            }
        });
        callsignInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.createPilot(nameInput.value, callsignInput.value);
            }
        });

        formRow.appendChild(nameInput);
        formRow.appendChild(callsignInput);
        contentContainer.appendChild(formRow);

        const shipGrid = document.createElement('div');
        shipGrid.style.display = 'grid';
        shipGrid.style.gridTemplateColumns = 'repeat(3, minmax(240px, 280px))';
        shipGrid.style.gap = '18px';
        shipGrid.style.width = '100%';
        shipGrid.style.maxWidth = '980px';
        this.game.getAllPlayerShips().forEach((ship) => {
            shipGrid.appendChild(this.buildShipCard(ship, ship.id === this.selectedShipId));
        });
        contentContainer.appendChild(shipGrid);

        const footerRow = document.createElement('div');
        footerRow.style.display = 'flex';
        footerRow.style.alignItems = 'center';
        footerRow.style.gap = '18px';
        footerRow.style.marginTop = '4px';

        const fundsDisplay = document.createElement('div');
        fundsDisplay.textContent = 'STARTING FUNDS: $10,000';
        fundsDisplay.style.color = '#ffcc00';
        fundsDisplay.style.fontSize = '18px';
        fundsDisplay.style.padding = '10px 14px';
        fundsDisplay.style.background = 'rgba(0,0,0,0.55)';
        fundsDisplay.style.borderRadius = '6px';

        const createButton = document.createElement('button');
        createButton.type = 'button';
        createButton.textContent = 'CONTINUE TO CONTRACT SETTINGS';
        createButton.style.color = 'white';
        createButton.style.fontSize = '22px';
        createButton.style.padding = '14px 24px';
        createButton.style.border = '2px solid rgba(255, 255, 255, 0.28)';
        createButton.style.borderRadius = '8px';
        createButton.style.backgroundColor = 'rgba(0, 0, 0, 0.72)';
        createButton.style.cursor = 'pointer';
        createButton.addEventListener('mouseover', () => {
            createButton.style.borderColor = '#ffcc00';
            createButton.style.color = '#ffcc00';
        });
        createButton.addEventListener('mouseout', () => {
            createButton.style.borderColor = 'rgba(255, 255, 255, 0.28)';
            createButton.style.color = 'white';
        });
        createButton.addEventListener('click', () => {
            this.createPilot(nameInput.value, callsignInput.value);
        });

        footerRow.appendChild(fundsDisplay);
        footerRow.appendChild(createButton);
        contentContainer.appendChild(footerRow);

        const instructions = document.createElement('div');
        instructions.style.position = 'absolute';
        instructions.style.bottom = '18px';
        instructions.style.right = '20px';
        instructions.style.color = '#aaa';
        instructions.style.fontSize = '14px';
        instructions.style.textAlign = 'right';
        instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.68)';
        instructions.style.padding = '10px 12px';
        instructions.style.borderRadius = '5px';
        instructions.style.border = '1px solid #333';
        instructions.style.zIndex = '4';
        instructions.innerHTML = 'Click an airframe to select it<br>Enter: create pilot<br>Esc: back to menu';
        mainContainer.appendChild(instructions);

        mainContainer.appendChild(contentContainer);
        characterSelectScreen.appendChild(mainContainer);
        nameInput.focus();
    }

    createPilot(name, callsign) {
        if (!name.trim()) {
            alert('Please enter a pilot name.');
            return;
        }

        if (!callsign.trim()) {
            alert('Please enter a callsign.');
            return;
        }

        const ship = this.game.getPlayerShipProfile(this.selectedShipId);
        const playerData = this.game.setPlayerData({
            ...this.game.getDefaultPlayerData(),
            name: name.trim(),
            callsign: callsign.trim(),
            money: 10000,
            level: 1,
            score: 0,
            lives: 3,
            health: ship.maxHealth,
            maxHealth: ship.maxHealth,
            shield: 0,
            megabombs: 3,
            unlockedWeapons: [],
            shipId: ship.id,
            difficulty: 'rookie',
            primaryWeaponLevel: 1,
            lastCompletedLevel: 0,
            eventFlags: {},
            endingFlags: {},
            missionResults: []
        });

        try {
            localStorage.setItem('raptor_manus_save', JSON.stringify(playerData));
            logger.info('Pilot created and saved:', playerData);
        } catch (error) {
            logger.error('Error saving pilot data:', error);
        }

        this.continueToContractSettings();
    }

    continueToContractSettings() {
        document.getElementById('character-select-screen').style.display = 'none';
        this.game.changeState('difficultySelect');
    }

    update() {
        if (this.game.input.wasKeyJustPressed('Escape')) {
            document.getElementById('character-select-screen').style.display = 'none';
            this.game.changeState('menu');
        }
    }

    render() {}

    exit() {
        document.getElementById('character-select-screen').style.display = 'none';
        logger.info('Exiting Character Select State');
    }
}

export { CharacterSelectState };

