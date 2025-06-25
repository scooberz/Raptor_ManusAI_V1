/**
 * HangarState class
 * Represents the hangar screen between missions
 */
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

        // Title
        const title = document.createElement('h1');
        title.textContent = 'HANGAR';
        title.style.color = 'white';
        title.style.fontSize = '48px';
        title.style.marginBottom = '20px';
        title.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        contentContainer.appendChild(title);

        // Credits
        const credits = document.createElement('div');
        credits.textContent = `CREDITS: $${this.playerMoney}`;
        credits.style.color = '#ffcc00';
        credits.style.fontSize = '24px';
        credits.style.marginBottom = '40px';
        credits.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        contentContainer.appendChild(credits);

        // Menu options
        this.menuOptions.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.textContent = option.text;
            optionElement.style.color = index === this.selectedOption ? '#ffcc00' : 'white';
            optionElement.style.fontSize = '32px';
            optionElement.style.margin = '12px';
            optionElement.style.padding = '8px 24px';
            optionElement.style.cursor = 'pointer';
            optionElement.style.borderRadius = '6px';
            optionElement.style.transition = 'all 0.2s';
            optionElement.style.textShadow = index === this.selectedOption ? '0 0 15px #ffcc00' : '2px 2px 4px rgba(0,0,0,0.8)';
            optionElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            optionElement.style.border = '1px solid rgba(255, 255, 255, 0.3)';

            optionElement.addEventListener('mouseover', () => {
                this.selectedOption = index;
                this.updateMenuSelection();
            });
            optionElement.addEventListener('click', option.action);
            contentContainer.appendChild(optionElement);
        });

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
        instructions.innerHTML = 'Use Arrow Keys to navigate<br>Enter to select';
        mainContainer.appendChild(instructions);

        // Assemble the layout
        mainContainer.appendChild(contentContainer);
        hangarScreen.appendChild(mainContainer);
    }

    updateMenuSelection() {
        const hangarScreen = document.getElementById('hangar-screen');
        const options = hangarScreen.querySelectorAll('div > div > div');
        // Skip title and credits (first two divs)
        options.forEach((option, index) => {
            if (index < 2) return;
            const menuIndex = index - 2;
            option.style.color = menuIndex === this.selectedOption ? '#ffcc00' : 'white';
            option.style.textShadow = menuIndex === this.selectedOption ? '0 0 15px #ffcc00' : '2px 2px 4px rgba(0,0,0,0.8)';
        });
    }

    /**
     * Update the hangar state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        if (this.game.input.wasKeyJustPressed('ArrowUp') || this.game.input.wasKeyJustPressed('w')) {
            this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
            this.updateMenuSelection();
        }
        if (this.game.input.wasKeyJustPressed('ArrowDown') || this.game.input.wasKeyJustPressed('s')) {
            this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
            this.updateMenuSelection();
        }
        if (this.game.input.wasKeyJustPressed('Enter') || this.game.input.wasKeyJustPressed(' ')) {
            this.menuOptions[this.selectedOption].action();
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
        this.game.changeState('characterSelect');
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
        console.log('Exiting Hangar State');
    }
}

export { HangarState };

