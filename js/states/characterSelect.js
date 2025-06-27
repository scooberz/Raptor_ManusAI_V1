/**
 * CharacterSelectState class
 * Handles the character creation and selection screen
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
        
        // Add title
        const title = document.createElement('h1');
        title.textContent = 'PILOT CREATION';
        title.style.color = 'white';
        title.style.fontSize = '48px';
        title.style.marginBottom = '40px';
        title.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        contentContainer.appendChild(title);
        
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.style.display = 'flex';
        formContainer.style.flexDirection = 'column';
        formContainer.style.alignItems = 'center';
        formContainer.style.gap = '20px';
        formContainer.style.marginBottom = '40px';
        
        // Name input section
        const nameSection = document.createElement('div');
        nameSection.style.display = 'flex';
        nameSection.style.flexDirection = 'column';
        nameSection.style.alignItems = 'center';
        nameSection.style.gap = '10px';
        
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'PILOT NAME:';
        nameLabel.style.color = 'white';
        nameLabel.style.fontSize = '24px';
        nameLabel.style.fontWeight = 'bold';
        nameLabel.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Enter pilot name...';
        nameInput.maxLength = '20';
        nameInput.style.fontSize = '20px';
        nameInput.style.padding = '15px 20px';
        nameInput.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        nameInput.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        nameInput.style.borderRadius = '8px';
        nameInput.style.minWidth = '300px';
        nameInput.style.textAlign = 'center';
        nameInput.style.color = 'white';
        nameInput.style.outline = 'none';
        nameInput.style.transition = 'all 0.2s ease';
        
        nameInput.addEventListener('focus', () => {
            nameInput.style.borderColor = '#ffcc00';
        });
        
        nameInput.addEventListener('blur', () => {
            nameInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        });
        
        // Add Enter key handler to move to callsign
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                callsignInput.focus();
            }
        });
        
        nameSection.appendChild(nameLabel);
        nameSection.appendChild(nameInput);
        
        // Callsign input section
        const callsignSection = document.createElement('div');
        callsignSection.style.display = 'flex';
        callsignSection.style.flexDirection = 'column';
        callsignSection.style.alignItems = 'center';
        callsignSection.style.gap = '10px';
        
        const callsignLabel = document.createElement('label');
        callsignLabel.textContent = 'CALLSIGN:';
        callsignLabel.style.color = 'white';
        callsignLabel.style.fontSize = '24px';
        callsignLabel.style.fontWeight = 'bold';
        callsignLabel.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        
        const callsignInput = document.createElement('input');
        callsignInput.type = 'text';
        callsignInput.placeholder = 'Enter callsign...';
        callsignInput.maxLength = '12';
        callsignInput.style.fontSize = '20px';
        callsignInput.style.padding = '15px 20px';
        callsignInput.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        callsignInput.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        callsignInput.style.borderRadius = '8px';
        callsignInput.style.minWidth = '300px';
        callsignInput.style.textAlign = 'center';
        callsignInput.style.color = 'white';
        callsignInput.style.outline = 'none';
        callsignInput.style.transition = 'all 0.2s ease';
        
        callsignInput.addEventListener('focus', () => {
            callsignInput.style.borderColor = '#ffcc00';
        });
        
        callsignInput.addEventListener('blur', () => {
            callsignInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        });

        // Add Enter key handler to create pilot
        callsignInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.createPilot(nameInput.value, callsignInput.value);
            }
        });
        
        callsignSection.appendChild(callsignLabel);
        callsignSection.appendChild(callsignInput);
        
        // Starting funds display
        const fundsDisplay = document.createElement('div');
        fundsDisplay.textContent = 'STARTING FUNDS: $10,000';
        fundsDisplay.style.color = '#ffcc00';
        fundsDisplay.style.fontSize = '20px';
        fundsDisplay.style.marginTop = '20px';
        fundsDisplay.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        
        formContainer.appendChild(nameSection);
        formContainer.appendChild(callsignSection);
        formContainer.appendChild(fundsDisplay);
        contentContainer.appendChild(formContainer);
        
        // Add continue button
        const continueButton = document.createElement('div');
        continueButton.textContent = 'CREATE PILOT';
        continueButton.style.color = 'white';
        continueButton.style.fontSize = '28px';
        continueButton.style.padding = '15px 30px';
        continueButton.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        continueButton.style.borderRadius = '8px';
        continueButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        continueButton.style.cursor = 'pointer';
        continueButton.style.transition = 'all 0.2s ease';
        continueButton.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        
        // Add hover effect
        continueButton.addEventListener('mouseover', () => {
            continueButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            continueButton.style.color = '#ffcc00';
            continueButton.style.textShadow = '0 0 15px #ffcc00';
            continueButton.style.borderColor = '#ffcc00';
        });
        
        continueButton.addEventListener('mouseout', () => {
            continueButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            continueButton.style.color = 'white';
            continueButton.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            continueButton.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        });
        
        // Add click handler
        continueButton.addEventListener('click', () => {
            this.createPilot(nameInput.value, callsignInput.value);
        });
        
        contentContainer.appendChild(continueButton);
        
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
        instructions.innerHTML = 'Click fields to enter text<br>ENTER: Move between fields<br>ESC: Back to menu';
        mainContainer.appendChild(instructions);
        
        // Assemble the layout
        mainContainer.appendChild(contentContainer);
        characterSelectScreen.appendChild(mainContainer);
        
        // Focus on name input
        nameInput.focus();
    }
    
    /**
     * Create the pilot and continue to hangar
     */
    createPilot(name, callsign) {
        // Validate inputs
        if (!name.trim()) {
            alert('Please enter a pilot name!');
            return;
        }
        
        if (!callsign.trim()) {
            alert('Please enter a callsign!');
            return;
        }
        
        // Create player data
        const playerData = {
            name: name.trim(),
            callsign: callsign.trim(),
            money: 10000,
            level: 1,
            score: 0,
            lives: 3,
            health: 75,
            shield: 0,
            unlockedWeapons: ['basic'],
            timestamp: Date.now()
        };
        
        // Save to localStorage
        try {
            localStorage.setItem('raptor_manus_save', JSON.stringify(playerData));
            console.log('Pilot created and saved:', playerData);
        } catch (error) {
            console.error('Error saving pilot data:', error);
        }
        
        // Set player data in game
        this.game.playerData = playerData;
        
        // Continue to hangar
        this.continueToGame();
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
