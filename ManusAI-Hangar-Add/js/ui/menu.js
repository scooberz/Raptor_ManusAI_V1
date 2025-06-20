/**
 * MenuUI class
 * Handles menu UI elements and interactions
 */
class MenuUI {
    constructor(game) {
        this.game = game;
        this.logo = null;
    }
    
    /**
     * Load menu assets
     */
    loadAssets() {
        this.logo = this.game.assets.getImage('logo');
    }
    
    /**
     * Create a menu container element
     * @returns {HTMLElement} The menu container element
     */
    createMenuContainer() {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        return container;
    }
    
    /**
     * Create a menu title element
     * @param {string} text - The title text
     * @param {string} color - The title color
     * @returns {HTMLElement} The title element
     */
    createTitle(text, color = '#ffcc00') {
        const title = document.createElement('h1');
        title.textContent = text;
        title.style.color = color;
        title.style.fontSize = '36px';
        title.style.marginBottom = '30px';
        return title;
    }
    
    /**
     * Create menu options
     * @param {Array} options - Array of option objects with text and action properties
     * @param {number} selectedIndex - Index of the currently selected option
     * @param {Function} selectionCallback - Callback function when selection changes
     * @returns {Array} Array of option elements
     */
    createMenuOptions(options, selectedIndex, selectionCallback) {
        return options.map((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.textContent = option.text;
            optionElement.style.color = index === selectedIndex ? '#ffcc00' : 'white';
            optionElement.style.fontSize = '24px';
            optionElement.style.margin = '10px';
            optionElement.style.cursor = 'pointer';
            optionElement.style.textShadow = index === selectedIndex ? '0 0 10px #ffcc00' : 'none';
            
            // Add hover effect
            optionElement.addEventListener('mouseover', () => {
                if (selectionCallback) {
                    selectionCallback(index);
                }
            });
            
            // Add click handler
            optionElement.addEventListener('click', option.action);
            
            return optionElement;
        });
    }
    
    /**
     * Create a back button
     * @param {Function} action - Action to perform when clicked
     * @returns {HTMLElement} The back button element
     */
    createBackButton(action) {
        const backButton = document.createElement('button');
        backButton.textContent = 'Back';
        backButton.style.padding = '10px 20px';
        backButton.style.backgroundColor = '#333';
        backButton.style.color = 'white';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '5px';
        backButton.style.cursor = 'pointer';
        backButton.style.marginTop = '30px';
        
        backButton.addEventListener('click', action);
        
        return backButton;
    }
    
    /**
     * Create instructions text
     * @param {string} text - The instructions text
     * @returns {HTMLElement} The instructions element
     */
    createInstructions(text) {
        const instructions = document.createElement('div');
        instructions.style.position = 'absolute';
        instructions.style.bottom = '20px';
        instructions.style.color = '#aaa';
        instructions.style.fontSize = '16px';
        instructions.textContent = text;
        return instructions;
    }
}

