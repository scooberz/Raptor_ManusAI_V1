/**
 * BootState class
 * Initial game state that sets up the game and loads essential assets
 */
class BootState {
    constructor(game) {
        this.game = game;
    }
    
    /**
     * Enter the boot state
     */
    enter() {
        console.log('Entering Boot State');
        
        // Hide all screens except loading
        document.getElementById('menu-screen').style.display = 'none';
        document.getElementById('game-over-screen').style.display = 'none';
        document.getElementById('loading-screen').style.display = 'flex';
        
        // Set up asset loading callbacks
        this.game.assets.setProgressCallback(this.updateLoadingProgress.bind(this));
        this.game.assets.setCompleteCallback(() => {
            this.game.changeState('loading');
        });
        
        // Load essential assets
        this.loadEssentialAssets();
    }
    
    /**
     * Update loading progress display
     * @param {number} progress - Loading progress (0-100)
     */
    updateLoadingProgress(progress) {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.textContent = `Loading... ${Math.floor(progress)}%`;
    }
    
    /**
     * Load essential assets needed before the main loading screen
     */
    loadEssentialAssets() {
        // Load minimal assets needed for the loading screen
        const essentialAssets = {
            images: {
                'logo': 'assets/images/ui/game_logo.png'
            }
        };
        
        this.game.assets.loadAssets(essentialAssets)
            .then(() => {
                // Once essential assets are loaded, move to the loading state
                this.game.changeState('loading');
            })
            .catch(error => {
                console.error('Error loading essential assets:', error);
                // Show error message on loading screen
                document.getElementById('loading-screen').textContent = 'Error loading game assets. Please refresh the page.';
            });
    }
    
    /**
     * Update the boot state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Nothing to update in boot state
    }
    
    /**
     * Render the boot state
     */
    render() {
        // Clear the screen
        this.game.contexts.ui.clearRect(0, 0, this.game.width, this.game.height);
        
        // Draw loading text
        this.game.contexts.ui.fillStyle = 'white';
        this.game.contexts.ui.font = '24px Arial';
        this.game.contexts.ui.textAlign = 'center';
        this.game.contexts.ui.fillText('Initializing...', this.game.width / 2, this.game.height / 2);
    }
    
    /**
     * Exit the boot state
     */
    exit() {
        console.log('Exiting Boot State');
        
        // Clear the onComplete callback to prevent it from being triggered later
        this.game.assets.setCompleteCallback(null);
    }
}

export { BootState };

