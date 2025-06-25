/**
 * CharacterSelectState class
 * Handles the character selection screen
 */
class CharacterSelectState {
    constructor(game) {
        this.game = game;
        this.background = null;
    }
    
    /**
     * Enter the character select state
     */
    enter() {
        console.log('Entering Character Select State');
        
        // Show character select screen
        document.getElementById('character-select-screen').style.display = 'flex';
        
        // Get background from assets
        this.background = this.game.assets.getImage('characterSelectBackground');
        
        // Set up character select screen
        this.setupCharacterSelectScreen();
    }
    
    /**
     * Set up the character select screen
     */
    setupCharacterSelectScreen() {
        const characterSelectScreen = document.getElementById('character-select-screen');
        characterSelectScreen.innerHTML = '';
        
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
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
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
        
        // Add title
        const title = document.createElement('h1');
        title.textContent = 'CHARACTER SELECT';
        title.style.color = 'white';
        title.style.fontSize = '48px';
        title.style.marginBottom = '40px';
        title.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        contentContainer.appendChild(title);
        
        // Add placeholder text
        const placeholder = document.createElement('div');
        placeholder.textContent = 'Character selection coming soon...';
        placeholder.style.color = '#ccc';
        placeholder.style.fontSize = '24px';
        placeholder.style.marginBottom = '60px';
        placeholder.style.textAlign = 'center';
        placeholder.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        contentContainer.appendChild(placeholder);
        
        // Add continue prompt
        const continuePrompt = document.createElement('div');
        continuePrompt.textContent = 'Press ENTER to continue';
        continuePrompt.style.color = '#ffcc00';
        continuePrompt.style.fontSize = '28px';
        continuePrompt.style.padding = '15px 30px';
        continuePrompt.style.border = '2px solid #ffcc00';
        continuePrompt.style.borderRadius = '8px';
        continuePrompt.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        continuePrompt.style.cursor = 'pointer';
        continuePrompt.style.transition = 'all 0.2s ease';
        continuePrompt.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        
        // Add hover effect
        continuePrompt.addEventListener('mouseover', () => {
            continuePrompt.style.backgroundColor = 'rgba(255, 204, 0, 0.2)';
            continuePrompt.style.transform = 'scale(1.05)';
        });
        
        continuePrompt.addEventListener('mouseout', () => {
            continuePrompt.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            continuePrompt.style.transform = 'scale(1)';
        });
        
        // Add click handler
        continuePrompt.addEventListener('click', () => {
            this.continueToGame();
        });
        
        contentContainer.appendChild(continuePrompt);
        
        // Add instructions
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
        instructions.innerHTML = 'Press ENTER to continue<br>ESC to go back';
        mainContainer.appendChild(instructions);
        
        // Assemble the layout
        mainContainer.appendChild(contentContainer);
        characterSelectScreen.appendChild(mainContainer);
    }
    
    /**
     * Continue to the hangar
     */
    continueToGame() {
        document.getElementById('character-select-screen').style.display = 'none';
        this.game.changeState('hangar');
    }
    
    /**
     * Update the character select state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        if (this.game.input.wasKeyJustPressed('Enter') || this.game.input.wasKeyJustPressed(' ')) {
            this.continueToGame();
        }
        
        if (this.game.input.wasKeyJustPressed('Escape')) {
            document.getElementById('character-select-screen').style.display = 'none';
            this.game.changeState('menu');
        }
    }
    
    /**
     * Render the character select screen
     * @param {Object} contexts - Object containing all canvas contexts
     */
    render(contexts) {
        // Character select is rendered using HTML/CSS in the character-select-screen element
    }
    
    /**
     * Exit the character select state
     */
    exit() {
        document.getElementById('character-select-screen').style.display = 'none';
        console.log('Exiting Character Select State');
    }
}

export { CharacterSelectState }; 