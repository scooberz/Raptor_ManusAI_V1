/**
 * MenuState class
 * Handles the main menu of the game
 */
class MenuState {
    constructor(game) {
        this.game = game;
        this.background = null;
        this.menuOptions = [
            { text: 'Start New Game', action: () => this.startNewGame() },
            { text: 'Load Game', action: () => this.loadGame() },
            { text: 'Readme', action: () => this.showReadme() },
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
        
        // Get background from assets
        this.background = this.game.assets.getImage('menuBackground');
        
        // Set up callback to update menu when assets finish loading
        this.game.assets.setGameplayAssetsLoadedCallback(() => {
            this.updateMenuForLoadedAssets();
        });
        
        // Play menu music
        // this.game.audio.playMusic('menuMusic'); // Commented out - no audio assets defined yet
        
        // Set up menu screen
        this.setupMenuScreen();
    }
    
    /**
     * Set up the menu screen
     */
    setupMenuScreen() {
        const menuScreen = document.getElementById('menu-screen');
        menuScreen.innerHTML = '';
        
        // Create main container
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
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
        overlay.style.zIndex = '2';
        mainContainer.appendChild(overlay);
        
        // Create menu container - positioned on top of background
        const menuContainer = document.createElement('div');
        menuContainer.style.display = 'flex';
        menuContainer.style.flexDirection = 'column';
        menuContainer.style.alignItems = 'center';
        menuContainer.style.justifyContent = 'center';
        menuContainer.style.position = 'absolute';
        menuContainer.style.bottom = '20%';
        menuContainer.style.left = '50%';
        menuContainer.style.transform = 'translateX(-50%)';
        menuContainer.style.zIndex = '3';
        
        // Add menu options with improved styling
        this.menuOptions.forEach((option, index) => {
            const optionElement = document.createElement('div');
            
            // Check if this is the Start New Game option and assets are still loading
            if (option.text === 'Start New Game' && !this.game.assets.gameplayAssetsLoaded) {
                optionElement.textContent = 'Start New Game (Loading...)';
                optionElement.style.color = '#888'; // Grayed out
                optionElement.style.cursor = 'not-allowed';
            } else {
                optionElement.textContent = option.text;
                optionElement.style.color = index === this.selectedOption ? '#ffcc00' : 'white';
                optionElement.style.cursor = 'pointer';
            }
            
            optionElement.style.fontSize = '28px';
            optionElement.style.margin = '8px';
            optionElement.style.padding = '8px 20px';
            optionElement.style.transition = 'all 0.2s ease';
            optionElement.style.textShadow = index === this.selectedOption ? '0 0 15px #ffcc00' : '2px 2px 4px rgba(0,0,0,0.8)';
            optionElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            optionElement.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            optionElement.style.borderRadius = '6px';
            
            // Add hover effect
            optionElement.addEventListener('mouseover', () => {
                this.selectedOption = index;
                this.updateMenuSelection();
            });
            
            // Add click handler
            optionElement.addEventListener('click', option.action);
            
            menuContainer.appendChild(optionElement);
        });
        
        // Add instructions - positioned at top right
        const instructions = document.createElement('div');
        instructions.style.position = 'absolute';
        instructions.style.top = '20px';
        instructions.style.right = '20px';
        instructions.style.color = '#aaa';
        instructions.style.fontSize = '14px';
        instructions.style.textAlign = 'right';
        instructions.style.maxWidth = '200px';
        instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        instructions.style.padding = '10px';
        instructions.style.borderRadius = '5px';
        instructions.style.border = '1px solid #333';
        instructions.style.zIndex = '4';
        instructions.innerHTML = 'Use Arrow Keys to navigate<br>Enter to select';
        mainContainer.appendChild(instructions);
        
        // Add loading indicator for background assets - only show if assets are still loading
        if (!this.game.assets.gameplayAssetsLoaded) {
            const loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'background-loading-indicator';
            loadingIndicator.style.position = 'absolute';
            loadingIndicator.style.bottom = '20px';
            loadingIndicator.style.left = '20px';
            loadingIndicator.style.color = '#666';
            loadingIndicator.style.fontSize = '14px';
            loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            loadingIndicator.style.padding = '8px 12px';
            loadingIndicator.style.borderRadius = '5px';
            loadingIndicator.style.border = '1px solid #333';
            loadingIndicator.style.zIndex = '4';
            loadingIndicator.textContent = 'Loading game assets...';
            mainContainer.appendChild(loadingIndicator);
        }
        
        // Assemble the layout
        mainContainer.appendChild(menuContainer);
        menuScreen.appendChild(mainContainer);
    }
    
    /**
     * Update menu selection highlighting
     */
    updateMenuSelection() {
        const menuScreen = document.getElementById('menu-screen');
        const options = menuScreen.querySelectorAll('div > div > div');
        
        options.forEach((option, index) => {
            if (option.textContent.includes('(')) return; // Skip loading text
            
            option.style.color = index === this.selectedOption ? '#ffcc00' : 'white';
            option.style.textShadow = index === this.selectedOption ? '0 0 15px #ffcc00' : '2px 2px 4px rgba(0,0,0,0.8)';
        });
    }
    
    /**
     * Start a new game
     */
    startNewGame() {
        // Check if gameplay assets are loaded
        if (this.game.assets.gameplayAssetsLoaded) {
            console.log('Starting new game - all assets loaded');
            this.game.changeState('characterSelect');
        } else {
            console.log('Cannot start game - gameplay assets still loading');
            // Optionally show a message to the user
            this.showLoadingMessage();
        }
    }
    
    /**
     * Load a saved game
     */
    loadGame() {
        // Check if gameplay assets are loaded
        if (this.game.assets.gameplayAssetsLoaded) {
            console.log('Loading saved game');
            // TODO: Implement save/load functionality
            this.showLoadGameScreen();
        } else {
            console.log('Cannot load game - gameplay assets still loading');
            this.showLoadingMessage();
        }
    }
    
    /**
     * Show load game screen
     */
    showLoadGameScreen() {
        const menuScreen = document.getElementById('menu-screen');
        menuScreen.innerHTML = '';
        
        const loadContainer = document.createElement('div');
        loadContainer.style.display = 'flex';
        loadContainer.style.flexDirection = 'column';
        loadContainer.style.alignItems = 'center';
        loadContainer.style.justifyContent = 'center';
        loadContainer.style.width = '80%';
        loadContainer.style.height = '80%';
        loadContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        loadContainer.style.padding = '20px';
        loadContainer.style.borderRadius = '10px';
        loadContainer.style.border = '2px solid #ffcc00';
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Load Game';
        title.style.color = '#ffcc00';
        title.style.marginBottom = '20px';
        loadContainer.appendChild(title);
        
        // Add message
        const message = document.createElement('div');
        message.style.color = 'white';
        message.style.fontSize = '18px';
        message.style.textAlign = 'center';
        message.style.marginBottom = '30px';
        message.innerHTML = 'Save/Load functionality is coming soon!<br><br>For now, use "Start New Game" to begin playing.';
        loadContainer.appendChild(message);
        
        // Add back button
        const backButton = document.createElement('button');
        backButton.textContent = 'Back to Menu';
        backButton.style.padding = '10px 20px';
        backButton.style.backgroundColor = '#333';
        backButton.style.color = 'white';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '5px';
        backButton.style.cursor = 'pointer';
        backButton.style.fontSize = '16px';
        backButton.addEventListener('click', () => {
            this.setupMenuScreen();
        });
        loadContainer.appendChild(backButton);
        
        menuScreen.appendChild(loadContainer);
    }
    
    /**
     * Show game readme
     */
    showReadme() {
        const menuScreen = document.getElementById('menu-screen');
        menuScreen.innerHTML = '';
        
        const readmeContainer = document.createElement('div');
        readmeContainer.style.display = 'flex';
        readmeContainer.style.flexDirection = 'column';
        readmeContainer.style.alignItems = 'center';
        readmeContainer.style.justifyContent = 'center';
        readmeContainer.style.width = '80%';
        readmeContainer.style.height = '80%';
        readmeContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        readmeContainer.style.padding = '20px';
        readmeContainer.style.borderRadius = '10px';
        readmeContainer.style.border = '2px solid #ffcc00';
        readmeContainer.style.overflowY = 'auto';
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Raptor: Call of the Shadows - Readme';
        title.style.color = '#ffcc00';
        title.style.marginBottom = '20px';
        title.style.textAlign = 'center';
        readmeContainer.appendChild(title);
        
        // Add readme content
        const content = document.createElement('div');
        content.style.color = 'white';
        content.style.fontSize = '16px';
        content.style.lineHeight = '1.6';
        content.style.textAlign = 'left';
        content.style.marginBottom = '30px';
        content.innerHTML = `
            <h3 style="color: #ffcc00;">About This Game</h3>
            <p>This is a reimagined version of the classic 1994 vertical shooter "Raptor: Call of the Shadows" by Cygnus Studios. 
            This fan project was created as a tribute to the original game using modern web technologies.</p>
            
            <h3 style="color: #ffcc00;">Controls</h3>
            <p><strong>Movement:</strong> Arrow Keys or WASD</p>
            <p><strong>Fire Primary Weapon:</strong> Space or Ctrl</p>
            <p><strong>Fire Special Weapon:</strong> Shift</p>
            <p><strong>Cycle Special Weapons:</strong> Alt</p>
            <p><strong>Megabomb:</strong> B</p>
            <p><strong>Pause:</strong> P or Esc</p>
            
            <h3 style="color: #ffcc00;">Gameplay</h3>
            <p>Navigate through enemy formations, collect power-ups, and defeat bosses to progress through the game. 
            Your ship has both health and shield systems - manage them carefully!</p>
            
            <h3 style="color: #ffcc00;">Features</h3>
            <ul>
                <li>Classic 4:3 aspect ratio gameplay</li>
                <li>Multiple enemy types with unique behaviors</li>
                <li>Power-up collection system</li>
                <li>Boss battles</li>
                <li>Progressive difficulty</li>
                <li>Score tracking</li>
            </ul>
            
            <h3 style="color: #ffcc00;">Technical Notes</h3>
            <p>This game is built using vanilla JavaScript and HTML5 Canvas. All assets have been recreated for this project. 
            The game runs entirely in your browser - no downloads required!</p>
        `;
        readmeContainer.appendChild(content);
        
        // Add back button
        const backButton = document.createElement('button');
        backButton.textContent = 'Back to Menu';
        backButton.style.padding = '10px 20px';
        backButton.style.backgroundColor = '#333';
        backButton.style.color = 'white';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '5px';
        backButton.style.cursor = 'pointer';
        backButton.style.fontSize = '16px';
        backButton.addEventListener('click', () => {
            this.setupMenuScreen();
        });
        readmeContainer.appendChild(backButton);
        
        menuScreen.appendChild(readmeContainer);
    }
    
    /**
     * Show loading message when trying to start game before assets are ready
     */
    showLoadingMessage() {
        // Create a temporary loading message
        const menuScreen = document.getElementById('menu-screen');
        const loadingMsg = document.createElement('div');
        loadingMsg.style.position = 'fixed';
        loadingMsg.style.top = '50%';
        loadingMsg.style.left = '50%';
        loadingMsg.style.transform = 'translate(-50%, -50%)';
        loadingMsg.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        loadingMsg.style.color = 'white';
        loadingMsg.style.padding = '20px';
        loadingMsg.style.borderRadius = '10px';
        loadingMsg.style.zIndex = '1000';
        loadingMsg.textContent = 'Loading game assets... Please wait.';
        
        menuScreen.appendChild(loadingMsg);
        
        // Remove message after 2 seconds
        setTimeout(() => {
            if (loadingMsg.parentNode) {
                loadingMsg.parentNode.removeChild(loadingMsg);
            }
        }, 2000);
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
     * Update menu when gameplay assets finish loading
     */
    updateMenuForLoadedAssets() {
        // Update loading indicator if it exists
        const loadingIndicator = document.getElementById('background-loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.textContent = 'Game assets loaded!';
            loadingIndicator.style.color = '#4CAF50';
            
            // Remove indicator after 2 seconds
            setTimeout(() => {
                if (loadingIndicator.parentNode) {
                    loadingIndicator.parentNode.removeChild(loadingIndicator);
                }
            }, 2000);
        }
        
        // Update the Start Game option to be clickable
        const menuScreen = document.getElementById('menu-screen');
        const options = menuScreen.querySelectorAll('div > div');
        options.forEach((option, index) => {
            if (option.textContent.includes('Start New Game')) {
                option.textContent = 'Start New Game';
                option.style.color = index === this.selectedOption ? '#ffcc00' : 'white';
                option.style.cursor = 'pointer';
            }
        });
    }
    
    /**
     * Update the menu state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // We no longer need the time-based delay check, because wasKeyJustPressed handles it.
        
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
        // this.game.audio.stopMusic(); // Commented out - no audio assets defined yet
    }
}

export { MenuState };