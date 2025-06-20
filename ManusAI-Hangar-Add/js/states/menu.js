/**
 * MenuState class
 * Handles the main menu of the game
 */
class MenuState {
    constructor(game) {
        this.game = game;
        this.logo = null;
        this.menuOptions = [
            { text: 'Start Game', action: () => this.startGame() },
            { text: 'Instructions', action: () => this.showInstructions() },
            { text: 'Credits', action: () => this.showCredits() }
        ];
        this.selectedOption = 0;
        this.keyDelay = 200;
        this.lastKeyTime = 0;
    }
    
    /**
     * Enter the menu state
     */
    enter() {
        console.log('Entering Menu State');
        
        // Show menu screen
        document.getElementById('menu-screen').style.display = 'flex';
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('game-over-screen').style.display = 'none';
        
        // Get logo from assets
        this.logo = this.game.assets.getImage('logo');
        
        // Play menu music
        this.game.audio.playMusic('menuMusic');
        
        // Set up menu screen
        this.setupMenuScreen();
    }
    
    /**
     * Set up the menu screen
     */
    setupMenuScreen() {
        const menuScreen = document.getElementById('menu-screen');
        menuScreen.innerHTML = '';
        
        // Create menu container
        const menuContainer = document.createElement('div');
        menuContainer.style.display = 'flex';
        menuContainer.style.flexDirection = 'column';
        menuContainer.style.alignItems = 'center';
        menuContainer.style.justifyContent = 'center';
        menuContainer.style.width = '100%';
        menuContainer.style.height = '100%';
        
        // Add logo if available
        if (this.logo) {
            const logoImg = document.createElement('img');
            logoImg.src = this.logo.src;
            logoImg.style.maxWidth = '80%';
            logoImg.style.marginBottom = '40px';
            menuContainer.appendChild(logoImg);
        }
        
        // Add menu options
        this.menuOptions.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.textContent = option.text;
            optionElement.style.color = index === this.selectedOption ? '#ffcc00' : 'white';
            optionElement.style.fontSize = '24px';
            optionElement.style.margin = '10px';
            optionElement.style.cursor = 'pointer';
            optionElement.style.textShadow = index === this.selectedOption ? '0 0 10px #ffcc00' : 'none';
            
            // Add hover effect
            optionElement.addEventListener('mouseover', () => {
                this.selectedOption = index;
                this.updateMenuSelection();
            });
            
            // Add click handler
            optionElement.addEventListener('click', option.action);
            
            menuContainer.appendChild(optionElement);
        });
        
        // Add instructions
        const instructions = document.createElement('div');
        instructions.style.position = 'absolute';
        instructions.style.bottom = '20px';
        instructions.style.color = '#aaa';
        instructions.style.fontSize = '16px';
        instructions.textContent = 'Use Arrow Keys to navigate, Enter to select';
        menuContainer.appendChild(instructions);
        
        menuScreen.appendChild(menuContainer);
    }
    
    /**
     * Update menu selection highlighting
     */
    updateMenuSelection() {
        const menuScreen = document.getElementById('menu-screen');
        const options = menuScreen.querySelectorAll('div > div:not(:last-child)');
        
        options.forEach((option, index) => {
            option.style.color = index === this.selectedOption ? '#ffcc00' : 'white';
            option.style.textShadow = index === this.selectedOption ? '0 0 10px #ffcc00' : 'none';
        });
    }
    
    /**
     * Start the game
     */
    startGame() {
        this.game.changeState('game');
    }
    
    /**
     * Show game instructions
     */
    showInstructions() {
        // Create instructions screen
        const menuScreen = document.getElementById('menu-screen');
        menuScreen.innerHTML = '';
        
        const instructionsContainer = document.createElement('div');
        instructionsContainer.style.display = 'flex';
        instructionsContainer.style.flexDirection = 'column';
        instructionsContainer.style.alignItems = 'center';
        instructionsContainer.style.justifyContent = 'center';
        instructionsContainer.style.width = '80%';
        instructionsContainer.style.height = '80%';
        instructionsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        instructionsContainer.style.padding = '20px';
        instructionsContainer.style.borderRadius = '10px';
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Instructions';
        title.style.color = '#ffcc00';
        title.style.marginBottom = '20px';
        instructionsContainer.appendChild(title);
        
        // Add instructions text
        const instructions = document.createElement('div');
        instructions.style.color = 'white';
        instructions.style.fontSize = '18px';
        instructions.style.lineHeight = '1.5';
        instructions.style.textAlign = 'left';
        instructions.style.marginBottom = '30px';
        instructions.innerHTML = `
            <p><strong>Movement:</strong> Arrow Keys or WASD</p>
            <p><strong>Fire Primary Weapon:</strong> Space or Ctrl</p>
            <p><strong>Fire Special Weapon:</strong> Shift</p>
            <p><strong>Cycle Special Weapons:</strong> Alt</p>
            <p><strong>Megabomb:</strong> B</p>
            <p><strong>Pause:</strong> P or Esc</p>
        `;
        instructionsContainer.appendChild(instructions);
        
        // Add back button
        const backButton = document.createElement('button');
        backButton.textContent = 'Back to Menu';
        backButton.style.padding = '10px 20px';
        backButton.style.backgroundColor = '#333';
        backButton.style.color = 'white';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '5px';
        backButton.style.cursor = 'pointer';
        backButton.addEventListener('click', () => {
            this.setupMenuScreen();
        });
        instructionsContainer.appendChild(backButton);
        
        menuScreen.appendChild(instructionsContainer);
    }
    
    /**
     * Show credits
     */
    showCredits() {
        // Create credits screen
        const menuScreen = document.getElementById('menu-screen');
        menuScreen.innerHTML = '';
        
        const creditsContainer = document.createElement('div');
        creditsContainer.style.display = 'flex';
        creditsContainer.style.flexDirection = 'column';
        creditsContainer.style.alignItems = 'center';
        creditsContainer.style.justifyContent = 'center';
        creditsContainer.style.width = '80%';
        creditsContainer.style.height = '80%';
        creditsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        creditsContainer.style.padding = '20px';
        creditsContainer.style.borderRadius = '10px';
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Credits';
        title.style.color = '#ffcc00';
        title.style.marginBottom = '20px';
        creditsContainer.appendChild(title);
        
        // Add credits text
        const credits = document.createElement('div');
        credits.style.color = 'white';
        credits.style.fontSize = '18px';
        credits.style.lineHeight = '1.5';
        credits.style.textAlign = 'center';
        credits.style.marginBottom = '30px';
        credits.innerHTML = `
            <p><strong>Raptor: Call of the Shadows Reimagined</strong></p>
            <p>A fan project created as a tribute to the original game</p>
            <p>Original game by Cygnus Studios / Apogee Software (1994)</p>
            <p>This reimagining created by Manus AI (2025)</p>
            <p>All assets and code created for educational purposes</p>
        `;
        creditsContainer.appendChild(credits);
        
        // Add back button
        const backButton = document.createElement('button');
        backButton.textContent = 'Back to Menu';
        backButton.style.padding = '10px 20px';
        backButton.style.backgroundColor = '#333';
        backButton.style.color = 'white';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '5px';
        backButton.style.cursor = 'pointer';
        backButton.addEventListener('click', () => {
            this.setupMenuScreen();
        });
        creditsContainer.appendChild(backButton);
        
        menuScreen.appendChild(creditsContainer);
    }
    
    /**
     * Update the menu state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        const now = Date.now();
        
        // Handle keyboard navigation with delay
        if (now - this.lastKeyTime > this.keyDelay) {
            if (this.game.input.isKeyPressed('ArrowUp') || this.game.input.isKeyPressed('w')) {
                this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
                this.updateMenuSelection();
                this.lastKeyTime = now;
            }
            
            if (this.game.input.isKeyPressed('ArrowDown') || this.game.input.isKeyPressed('s')) {
                this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
                this.updateMenuSelection();
                this.lastKeyTime = now;
            }
            
            if (this.game.input.isKeyPressed('Enter') || this.game.input.isKeyPressed(' ')) {
                this.menuOptions[this.selectedOption].action();
                this.lastKeyTime = now;
            }
        }
    }
    
    /**
     * Render the menu state
     */
    render() {
        // Menu is rendered using HTML/CSS in the menu-screen element
    }
    
    /**
     * Exit the menu state
     */
    exit() {
        console.log('Exiting Menu State');
        
        // Hide menu screen
        document.getElementById('menu-screen').style.display = 'none';
        
        // Stop menu music
        this.game.audio.stopMusic();
    }
}

