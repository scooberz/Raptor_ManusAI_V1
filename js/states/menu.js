/**
 * MenuState class
 * Handles the main menu state, providing options to start a new game,
 * load a saved game, access options, and view credits. This state serves
 * as the primary entry point for the game.
 */
class MenuState {
    /**
     * Create a new MenuState instance
     * @param {Game} game - Reference to the main game instance
     */
    constructor(game) {
        this.game = game;
        this.logo = null;
        this.isTransitioning = false;
        
        // Define menu options with their associated actions
        this.menuOptions = [
            { text: 'New Game', action: () => this.startNewGame() },
            { text: 'Load Game', action: () => this.loadGame() },
            { text: 'Options', action: () => this.showOptions() },
            { text: 'Credits', action: () => this.showCredits() }
        ];
        
        this.selectedOption = 0;
        this.keyDelay = 200; // Delay between key presses to prevent too rapid menu navigation
        this.lastKeyTime = 0;
        this.showingOptions = false; // Flag for options menu visibility
        this.showingCredits = false; // Flag for credits screen visibility
    }
    
    /**
     * Enter the menu state
     * Initializes the menu screen and resets menu state
     */
    enter() {
        console.log('Entering Menu State');
        
        // Show menu screen and hide other screens
        document.getElementById('menu-screen').style.display = 'flex';
        document.getElementById('game-over-screen').style.display = 'none';
        document.getElementById('loading-screen').style.display = 'none';
        
        // Reset menu state
        this.showingOptions = false;
        this.showingCredits = false;
        this.selectedOption = 0;
        
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
     * Update the menu state
     * Handles menu navigation and option selection
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        const now = Date.now();
        
        // Handle keyboard navigation with delay to prevent too rapid menu movement
        if (now - this.lastKeyTime > this.keyDelay) {
            // Navigate up in menu
            if (this.game.input.isKeyPressed('ArrowUp') || this.game.input.isKeyPressed('w')) {
                this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
                this.updateMenuSelection();
                this.lastKeyTime = now;
            }
            
            // Navigate down in menu
            if (this.game.input.isKeyPressed('ArrowDown') || this.game.input.isKeyPressed('s')) {
                this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
                this.updateMenuSelection();
                this.lastKeyTime = now;
            }
            
            // Select current menu option
            if (this.game.input.isKeyPressed('Enter') || this.game.input.isKeyPressed(' ')) {
                this.menuOptions[this.selectedOption].action();
                this.lastKeyTime = now;
            }
            
            // Handle back button for sub-menus
            if (this.game.input.isKeyPressed('Escape')) {
                if (this.showingOptions || this.showingCredits) {
                    this.showingOptions = false;
                    this.showingCredits = false;
                }
                this.lastKeyTime = now;
            }
        }
    }
    
    /**
     * Render the menu state
     * Draws the appropriate menu screen based on current state
     */
    render() {
        const ctx = this.game.contexts.ui;
        
        // Clear the screen
        ctx.clearRect(0, 0, this.game.width, this.game.height);
        
        // Render appropriate screen based on state
        if (this.showingOptions) {
            this.renderOptions(ctx);
        } else if (this.showingCredits) {
            this.renderCredits(ctx);
        } else {
            this.renderMainMenu(ctx);
        }
    }
    
    /**
     * Render the main menu
     * Draws the main menu with all available options
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     */
    renderMainMenu(ctx) {
        // Draw game title
        ctx.fillStyle = '#ffcc00';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('RAPTOR MANUS', this.game.width / 2, this.game.height / 4);
        
        // Draw menu options with appropriate highlighting
        ctx.font = '24px Arial';
        this.menuOptions.forEach((option, index) => {
            // Gray out Load Game option if no save exists
            if (option.text === 'Load Game' && !this.game.saveManager.hasSaveGame()) {
                ctx.fillStyle = '#666666';
            } else {
                ctx.fillStyle = index === this.selectedOption ? '#ffcc00' : 'white';
            }
            ctx.fillText(option.text, this.game.width / 2, this.game.height / 2 + index * 40);
        });
        
        // Draw controls reminder
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '16px Arial';
        ctx.fillText('Use Arrow Keys or W/S to navigate, Enter to select', this.game.width / 2, this.game.height - 50);
    }
    
    /**
     * Render the options menu
     * Draws the options screen with available settings
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     */
    renderOptions(ctx) {
        // Draw options title
        ctx.fillStyle = '#ffcc00';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Options', this.game.width / 2, this.game.height / 4);
        
        // TODO: Add options menu content
        
        // Draw back button reminder
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Press ESC to return', this.game.width / 2, this.game.height - 50);
    }
    
    /**
     * Render the credits screen
     * Draws the credits screen with game information
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     */
    renderCredits(ctx) {
        // Draw credits title
        ctx.fillStyle = '#ffcc00';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Credits', this.game.width / 2, this.game.height / 4);
        
        // TODO: Add credits content
        
        // Draw back button reminder
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Press ESC to return', this.game.width / 2, this.game.height - 50);
    }
    
    /**
     * Start a new game
     * Deletes any existing save and initializes a new game
     */
    startNewGame() {
        // Prevent multiple rapid transitions
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Delete any existing save game
        this.game.saveManager.deleteSaveGame();
        
        // Change to game state
        this.game.changeState('game');
        
        // Reset transition flag after a short delay
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1000);
    }
    
    /**
     * Load a saved game
     * Attempts to load and apply saved game data
     */
    loadGame() {
        // Prevent multiple rapid transitions
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        if (!this.game.saveManager.hasSaveGame()) {
            this.isTransitioning = false;
            return;
        }
        
        const saveData = this.game.saveManager.loadGame();
        if (saveData) {
            // Change to game state
            this.game.changeState('game');
            
            // Apply save data to restore game state
            this.game.saveManager.applySaveData(saveData);
        }
        
        // Reset transition flag after a short delay
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1000);
    }
    
    /**
     * Show the options menu
     * Sets the menu state to display options
     */
    showOptions() {
        this.showingOptions = true;
        this.showingCredits = false;
    }
    
    /**
     * Show the credits screen
     * Sets the menu state to display credits
     */
    showCredits() {
        this.showingOptions = false;
        this.showingCredits = true;
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

