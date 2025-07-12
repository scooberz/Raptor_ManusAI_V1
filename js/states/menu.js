/**
 * MenuState class
 * Handles the main menu of the game
 */
import { logger } from '../utils/logger.js';
class MenuState {
    constructor(game) {
        this.game = game;
        this.background = null;
        this.menuOptions = [
            { text: 'Start New Game', action: () => this.startNewGame() },
            { text: 'Load Game', action: () => this.loadGame() },
            { text: 'Readme', action: () => this.showReadme() },
            { text: 'Options', action: () => this.showOptionsMenu() }, // <-- Added Options button
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
        logger.info('Entering Menu State');
        
        try {
            // Show menu screen, hide others
            const menuScreen = document.getElementById('menu-screen');
            const loadingScreen = document.getElementById('loading-screen');
            const gameOverScreen = document.getElementById('game-over-screen');
            
            if (menuScreen) menuScreen.style.display = 'flex';
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (gameOverScreen) gameOverScreen.style.display = 'none';
            
            logger.debug('Menu screen elements updated');
            
            // Get background from assets
            this.background = this.game.assets.getImage('menuBackground');
            logger.debug('Menu background loaded:', !!this.background);
            
            // Assets are now loaded upfront in LoadingState, so no need for callbacks
            
            // Play menu music
            // this.game.audio.playMusic('menuMusic'); // Commented out - no audio assets defined yet
            
            // Set up menu screen
            this.setupMenuScreen();
            logger.info('Menu screen setup complete');
        } catch (error) {
            logger.error('Error in MenuState.enter():', error);
        }
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
            
            optionElement.textContent = option.text;
            optionElement.style.color = 'white';
            optionElement.style.cursor = 'pointer';
            
            optionElement.style.fontSize = '28px';
            optionElement.style.margin = '8px';
            optionElement.style.padding = '8px 20px';
            optionElement.style.transition = 'all 0.2s ease';
            optionElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            optionElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            optionElement.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            optionElement.style.borderRadius = '6px';
            
            // Add hover effect
            optionElement.addEventListener('mouseover', () => {
                optionElement.style.color = '#ffcc00';
                optionElement.style.textShadow = '0 0 15px #ffcc00';
            });
            
            optionElement.addEventListener('mouseout', () => {
                optionElement.style.color = 'white';
                optionElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
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
        
        // Assemble the layout
        mainContainer.appendChild(menuContainer);
        menuScreen.appendChild(mainContainer);
    }
    
    /**
     * Start a new game
     */
    startNewGame() {
        logger.info('Starting new game - all assets loaded');
        this.game.changeState('characterSelect');
    }
    
    /**
     * Load a saved game
     */
    loadGame() {
        logger.info('Loading saved game');
        // TODO: Implement save/load functionality
        this.showLoadGameScreen();
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
        
        // Check for saved game data
        const savedData = localStorage.getItem('raptor_manus_save');
        let playerData = null;
        let hasValidSave = false;
        
        if (savedData) {
            try {
                playerData = JSON.parse(savedData);
                // Validate that we have the required fields
                if (playerData && playerData.name && playerData.callsign) {
                    hasValidSave = true;
                }
            } catch (error) {
                logger.error('Error parsing saved data:', error);
                hasValidSave = false;
            }
        }
        
        if (hasValidSave && playerData) {
            // Add saved pilot info
            const pilotInfo = document.createElement('div');
            pilotInfo.style.color = 'white';
            pilotInfo.style.fontSize = '18px';
            pilotInfo.style.textAlign = 'center';
            pilotInfo.style.marginBottom = '20px';
            pilotInfo.innerHTML = `
                <strong>Saved Pilot:</strong><br>
                ${playerData.name} (${playerData.callsign})<br>
                Level: ${playerData.level || 1} | Credits: $${playerData.money || 0}<br>
                Score: ${playerData.score || 0}
            `;
            loadContainer.appendChild(pilotInfo);
            
            // Add load button
            const loadButton = document.createElement('button');
            loadButton.textContent = 'Load Saved Game';
            loadButton.style.padding = '15px 30px';
            loadButton.style.backgroundColor = '#4CAF50';
            loadButton.style.color = 'white';
            loadButton.style.border = 'none';
            loadButton.style.borderRadius = '5px';
            loadButton.style.cursor = 'pointer';
            loadButton.style.fontSize = '18px';
            loadButton.style.marginBottom = '20px';
            loadButton.addEventListener('click', () => {
                this.game.playerData = playerData;
                this.game.changeState('hangar');
            });
            loadContainer.appendChild(loadButton);
            
            // Add delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete Save';
            deleteButton.style.padding = '10px 20px';
            deleteButton.style.backgroundColor = '#f44336';
            deleteButton.style.color = 'white';
            deleteButton.style.border = 'none';
            deleteButton.style.borderRadius = '5px';
            deleteButton.style.cursor = 'pointer';
            deleteButton.style.fontSize = '16px';
            deleteButton.style.marginBottom = '20px';
            deleteButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete your saved game?')) {
                    localStorage.removeItem('raptor_manus_save');
                    this.showLoadGameScreen(); // Refresh the screen
                }
            });
            loadContainer.appendChild(deleteButton);
            
        } else {
            // Add message for no save
            const message = document.createElement('div');
            message.style.color = 'white';
            message.style.fontSize = '18px';
            message.style.textAlign = 'center';
            message.style.marginBottom = '30px';
            message.innerHTML = '<strong>No Pilots Saved</strong><br><br>Use "Start New Game" to create a new pilot.';
            loadContainer.appendChild(message);
            
            // Add disabled load button with tooltip
            const loadButton = document.createElement('button');
            loadButton.textContent = 'Load Saved Game';
            loadButton.style.padding = '15px 30px';
            loadButton.style.backgroundColor = '#666';
            loadButton.style.color = '#999';
            loadButton.style.border = 'none';
            loadButton.style.borderRadius = '5px';
            loadButton.style.cursor = 'not-allowed';
            loadButton.style.fontSize = '18px';
            loadButton.style.marginBottom = '20px';
            loadButton.title = 'No saved pilot found';
            loadButton.disabled = true;
            loadContainer.appendChild(loadButton);
            
            // Add disabled delete button with tooltip
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete Save';
            deleteButton.style.padding = '10px 20px';
            deleteButton.style.backgroundColor = '#666';
            deleteButton.style.color = '#999';
            deleteButton.style.border = 'none';
            deleteButton.style.borderRadius = '5px';
            deleteButton.style.cursor = 'not-allowed';
            deleteButton.style.fontSize = '16px';
            deleteButton.style.marginBottom = '20px';
            deleteButton.title = 'No saved pilot to delete';
            deleteButton.disabled = true;
            loadContainer.appendChild(deleteButton);
        }
        
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
        const menuContainer = menuScreen.querySelector('div > div > div');
        if (menuContainer) {
            const options = menuContainer.querySelectorAll('div');
            options.forEach((option, index) => {
                if (option.textContent.includes('Start New Game')) {
                    option.textContent = 'Start New Game';
                    option.style.color = 'white';
                    option.style.cursor = 'pointer';
                }
            });
        }
    }
    
    /**
     * Update the menu state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // We no longer need the time-based delay check, because wasKeyJustPressed handles it.
        
        if (this.game.input.wasKeyJustPressed('ArrowUp') || this.game.input.wasKeyJustPressed('w')) {
            this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
            this.highlightSelectedOption();
        }
        
        if (this.game.input.wasKeyJustPressed('ArrowDown') || this.game.input.wasKeyJustPressed('s')) {
            this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
            this.highlightSelectedOption();
        }
        
        if (this.game.input.wasKeyJustPressed('Enter') || this.game.input.wasKeyJustPressed(' ')) {
            this.menuOptions[this.selectedOption].action();
        }
    }
    
    /**
     * Highlight the currently selected option for keyboard navigation
     */
    highlightSelectedOption() {
        const menuScreen = document.getElementById('menu-screen');
        const menuContainer = menuScreen.querySelector('div > div > div');
        if (!menuContainer) return;
        
        const options = menuContainer.querySelectorAll('div');
        
        options.forEach((option, index) => {
            if (option.textContent.includes('(')) return; // Skip loading text
            
            if (index === this.selectedOption) {
                option.style.color = '#ffcc00';
                option.style.textShadow = '0 0 15px #ffcc00';
            } else {
                option.style.color = 'white';
                option.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            }
        });
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
        logger.info('Exiting Menu State');
        
        // Hide menu screen
        document.getElementById('menu-screen').style.display = 'none';
        
        // Stop menu music
        // this.game.audio.stopMusic(); // Commented out - no audio assets defined yet
    }

    // Add this method at the end of the class, before the closing }
    showOptionsMenu() {
        const menuScreen = document.getElementById('menu-screen');
        menuScreen.innerHTML = '';

        // Create overlay container
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '10';

        // Title
        const title = document.createElement('h2');
        title.textContent = 'Select Resolution';
        title.style.color = '#ffcc00';
        title.style.marginBottom = '30px';
        overlay.appendChild(title);

        // Resolution options
        const resolutions = [
            { label: '960 x 540', width: 960, height: 540 },
            { label: '1280 x 720', width: 1280, height: 720 },
            { label: '1440 x 810', width: 1440, height: 810 }
        ];
        const currentWidth = this.game.width;
        const currentHeight = this.game.height;
        resolutions.forEach(res => {
            const btn = document.createElement('button');
            btn.textContent = res.label;
            btn.style.margin = '10px';
            btn.style.padding = '16px 40px';
            btn.style.fontSize = '22px';
            btn.style.backgroundColor = '#222';
            btn.style.color = '#ffcc00';
            btn.style.border = '2px solid #ffcc00';
            btn.style.borderRadius = '8px';
            btn.style.cursor = 'pointer';
            btn.style.transition = 'background 0.2s, color 0.2s';
            // Highlight the currently selected resolution
            if (res.width === currentWidth && res.height === currentHeight) {
                btn.style.backgroundColor = '#ffcc00';
                btn.style.color = '#222';
                btn.style.fontWeight = 'bold';
                btn.style.boxShadow = '0 0 12px #ffcc00';
            }
            btn.addEventListener('mouseover', () => {
                btn.style.backgroundColor = '#ffcc00';
                btn.style.color = '#222';
            });
            btn.addEventListener('mouseout', () => {
                if (res.width === this.game.width && res.height === this.game.height) {
                    btn.style.backgroundColor = '#ffcc00';
                    btn.style.color = '#222';
                } else {
                    btn.style.backgroundColor = '#222';
                    btn.style.color = '#ffcc00';
                }
            });
            btn.addEventListener('click', () => {
                this.setGameResolution(res.width, res.height);
                this.showOptionsMenu(); // Stay on options menu and update highlight
            });
            overlay.appendChild(btn);
        });

        // Back button
        const backBtn = document.createElement('button');
        backBtn.textContent = 'Back';
        backBtn.style.marginTop = '40px';
        backBtn.style.padding = '12px 32px';
        backBtn.style.fontSize = '18px';
        backBtn.style.backgroundColor = '#333';
        backBtn.style.color = 'white';
        backBtn.style.border = '1px solid #ffcc00';
        backBtn.style.borderRadius = '6px';
        backBtn.style.cursor = 'pointer';
        backBtn.addEventListener('click', () => {
            this.setupMenuScreen();
        });
        overlay.appendChild(backBtn);

        // Pop Out button
        const popOutBtn = document.createElement('button');
        popOutBtn.textContent = 'Pop Out';
        popOutBtn.style.marginTop = '20px';
        popOutBtn.style.padding = '12px 32px';
        popOutBtn.style.fontSize = '18px';
        popOutBtn.style.backgroundColor = '#222';
        popOutBtn.style.color = '#ffcc00';
        popOutBtn.style.border = '2px solid #ffcc00';
        popOutBtn.style.borderRadius = '6px';
        popOutBtn.style.cursor = 'pointer';
        popOutBtn.addEventListener('click', () => {
            const width = this.game.width;
            const height = this.game.height;
            const features = `width=${width},height=${height},resizable=no,scrollbars=no,status=no,toolbar=no,menubar=no,location=no`;
            const popup = window.open(window.location.pathname, 'RaptorGamePopup', features);
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                alert('Popup was blocked! Please allow popups for this site.');
            }
        });
        overlay.appendChild(popOutBtn);

        menuScreen.appendChild(overlay);
    }

    setGameResolution(width, height) {
        this.game.width = width;
        this.game.height = height;
        for (const key in this.game.layers) {
            const canvas = this.game.layers[key];
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
        }
        // Re-center canvases
        for (const key in this.game.layers) {
            const canvas = this.game.layers[key];
            canvas.style.position = 'absolute';
            canvas.style.left = '50%';
            canvas.style.top = '50%';
            canvas.style.transform = 'translate(-50%, -50%)';
        }
        // Redraw current state if needed
        if (this.game.currentState && typeof this.game.currentState.resize === 'function') {
            this.game.currentState.resize();
        }
    }
}

export { MenuState };