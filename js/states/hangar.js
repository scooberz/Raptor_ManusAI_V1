/**
 * HangarState class
 * Represents the hangar screen between missions
 */
import { logger } from '../utils/logger.js';
class HangarState {
    constructor(game) {
        this.game = game;
        this.background = null;
        this.menuOptions = [
            { text: 'Choose Mission', action: () => this.chooseNextMission() },
            { text: 'Shop (Upgrades & Repairs)', action: () => this.openShop() },
            { text: 'Save Game', action: () => this.saveGame() },
            { text: 'Exit to Main Menu', action: () => this.exitToMenu() }
        ];
        this.selectedOption = 0;
        this.playerMoney = 0;
    }

    /**
     * Enter the hangar state
     */
    enter() {
        this.playerMoney = this.game.playerData.money;
        document.getElementById('hangar-screen').style.display = 'flex';
        
        // Get background from assets
        this.background = this.game.assets.getImage('hangarBackground');
        
        this.setupHangarScreen();
    }

    setupHangarScreen() {
        const hangarScreen = document.getElementById('hangar-screen');
        hangarScreen.innerHTML = '';

        // Main container
        const mainContainer = document.createElement('div');
        mainContainer.style.display = 'flex';
        mainContainer.style.flexDirection = 'column';
        mainContainer.style.alignItems = 'center';
        mainContainer.style.justifyContent = 'center';
        mainContainer.style.width = '100%';
        mainContainer.style.height = '100%';
        mainContainer.style.position = 'relative';
        mainContainer.style.overflow = 'hidden';

        // Add background image if available
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

        // Create overlay for better text readability
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '2';
        mainContainer.appendChild(overlay);

        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.style.display = 'flex';
        contentContainer.style.flexDirection = 'column';
        contentContainer.style.alignItems = 'center';
        contentContainer.style.justifyContent = 'center';
        contentContainer.style.position = 'absolute';
        contentContainer.style.top = '0';
        contentContainer.style.left = '0';
        contentContainer.style.width = '100%';
        contentContainer.style.height = '100%';
        contentContainer.style.zIndex = '3';

        // Choose Mission button - left lower third
        const chooseMissionBtn = document.createElement('div');
        chooseMissionBtn.textContent = 'Choose Mission';
        chooseMissionBtn.style.color = 'white';
        chooseMissionBtn.style.fontSize = '32px';
        chooseMissionBtn.style.padding = '15px 30px';
        chooseMissionBtn.style.cursor = 'pointer';
        chooseMissionBtn.style.borderRadius = '8px';
        chooseMissionBtn.style.transition = 'all 0.2s';
        chooseMissionBtn.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        chooseMissionBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        chooseMissionBtn.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        chooseMissionBtn.style.position = 'absolute';
        chooseMissionBtn.style.bottom = '33%';
        chooseMissionBtn.style.left = '20%';
        chooseMissionBtn.style.transform = 'translateX(-50%)';
        chooseMissionBtn.style.zIndex = '3';

        chooseMissionBtn.addEventListener('mouseover', () => {
            chooseMissionBtn.style.color = '#ffcc00';
            chooseMissionBtn.style.textShadow = '0 0 15px #ffcc00';
            chooseMissionBtn.style.borderColor = '#ffcc00';
        });
        
        chooseMissionBtn.addEventListener('mouseout', () => {
            chooseMissionBtn.style.color = 'white';
            chooseMissionBtn.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            chooseMissionBtn.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        });
        
        chooseMissionBtn.addEventListener('click', () => this.chooseNextMission());
        contentContainer.appendChild(chooseMissionBtn);

        // Shop button - right lower third
        const shopBtn = document.createElement('div');
        shopBtn.textContent = 'Shop';
        shopBtn.style.color = 'white';
        shopBtn.style.fontSize = '32px';
        shopBtn.style.padding = '15px 30px';
        shopBtn.style.cursor = 'pointer';
        shopBtn.style.borderRadius = '8px';
        shopBtn.style.transition = 'all 0.2s';
        shopBtn.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        shopBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        shopBtn.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        shopBtn.style.position = 'absolute';
        shopBtn.style.bottom = '33%';
        shopBtn.style.right = '20%';
        shopBtn.style.transform = 'translateX(50%)';
        shopBtn.style.zIndex = '3';

        shopBtn.addEventListener('mouseover', () => {
            shopBtn.style.color = '#ffcc00';
            shopBtn.style.textShadow = '0 0 15px #ffcc00';
            shopBtn.style.borderColor = '#ffcc00';
        });
        
        shopBtn.addEventListener('mouseout', () => {
            shopBtn.style.color = 'white';
            shopBtn.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            shopBtn.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        });
        
        shopBtn.addEventListener('click', () => this.openShop());
        contentContainer.appendChild(shopBtn);

        // Save Game button - right upper third
        const saveGameBtn = document.createElement('div');
        saveGameBtn.textContent = 'Save Game';
        saveGameBtn.style.color = 'white';
        saveGameBtn.style.fontSize = '32px';
        saveGameBtn.style.padding = '15px 30px';
        saveGameBtn.style.cursor = 'pointer';
        saveGameBtn.style.borderRadius = '8px';
        saveGameBtn.style.transition = 'all 0.2s';
        saveGameBtn.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        saveGameBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        saveGameBtn.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        saveGameBtn.style.position = 'absolute';
        saveGameBtn.style.top = '33%';
        saveGameBtn.style.right = '20%';
        saveGameBtn.style.transform = 'translateX(50%)';
        saveGameBtn.style.zIndex = '3';

        saveGameBtn.addEventListener('mouseover', () => {
            saveGameBtn.style.color = '#ffcc00';
            saveGameBtn.style.textShadow = '0 0 15px #ffcc00';
            saveGameBtn.style.borderColor = '#ffcc00';
        });
        
        saveGameBtn.addEventListener('mouseout', () => {
            saveGameBtn.style.color = 'white';
            saveGameBtn.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            saveGameBtn.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        });
        
        saveGameBtn.addEventListener('click', () => this.saveGame());
        contentContainer.appendChild(saveGameBtn);

        // Exit to Main Menu button - moved down slightly
        const exitBtn = document.createElement('div');
        exitBtn.textContent = 'Exit to Main Menu';
        exitBtn.style.color = 'white';
        exitBtn.style.fontSize = '32px';
        exitBtn.style.padding = '15px 30px';
        exitBtn.style.cursor = 'pointer';
        exitBtn.style.borderRadius = '8px';
        exitBtn.style.transition = 'all 0.2s';
        exitBtn.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        exitBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        exitBtn.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        exitBtn.style.position = 'absolute';
        exitBtn.style.bottom = '15%';
        exitBtn.style.left = '50%';
        exitBtn.style.transform = 'translateX(-50%)';
        exitBtn.style.zIndex = '3';

        exitBtn.addEventListener('mouseover', () => {
            exitBtn.style.color = '#ffcc00';
            exitBtn.style.textShadow = '0 0 15px #ffcc00';
            exitBtn.style.borderColor = '#ffcc00';
        });
        
        exitBtn.addEventListener('mouseout', () => {
            exitBtn.style.color = 'white';
            exitBtn.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            exitBtn.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        });
        
        exitBtn.addEventListener('click', () => this.exitToMenu());
        contentContainer.appendChild(exitBtn);

        // Instructions
        const instructions = document.createElement('div');
        instructions.style.position = 'absolute';
        instructions.style.bottom = '20px';
        instructions.style.right = '20px';
        instructions.style.color = '#aaa';
        instructions.style.fontSize = '16px';
        instructions.style.textAlign = 'right';
        instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        instructions.style.padding = '10px';
        instructions.style.borderRadius = '5px';
        instructions.style.border = '1px solid #333';
        instructions.style.zIndex = '4';
        instructions.innerHTML = 'Click buttons to navigate';
        mainContainer.appendChild(instructions);

        // Add contentContainer to mainContainer
        mainContainer.appendChild(contentContainer);
        hangarScreen.appendChild(mainContainer);
    }

    /**
     * Update the hangar state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Keyboard shortcuts for direct navigation
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

    /**
     * Render the hangar screen
     * @param {Object} contexts - Object containing all canvas contexts
     */
    render(contexts) {
        // Hangar is rendered using HTML/CSS in the hangar-screen element
    }

    chooseNextMission() {
        document.getElementById('hangar-screen').style.display = 'none';
        this.game.changeState('game');
    }

    openShop() {
        document.getElementById('hangar-screen').style.display = 'none';
        this.game.changeState('shop');
    }

    saveGame() {
        alert('Game saved! (Stub)');
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

