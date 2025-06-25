/**
 * ShopState class
 * Handles the shop screen
 */
class ShopState {
    constructor(game) {
        this.game = game;
        this.background = null;
        this.currentPage = 0;
        this.totalPages = 3; // Example: 3 pages of shop items
    }
    
    /**
     * Enter the shop state
     */
    enter() {
        console.log('Entering Shop State');
        
        // Show shop screen
        document.getElementById('shop-screen').style.display = 'flex';
        
        // Get background from assets
        this.background = this.game.assets.getImage('shopBackground');
        
        // Set up shop screen
        this.setupShopScreen();
    }
    
    /**
     * Set up the shop screen
     */
    setupShopScreen() {
        const shopScreen = document.getElementById('shop-screen');
        shopScreen.innerHTML = '';
        
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
        title.textContent = 'SHOP';
        title.style.color = 'white';
        title.style.fontSize = '48px';
        title.style.marginBottom = '20px';
        title.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        contentContainer.appendChild(title);
        
        // Add page indicator
        const pageIndicator = document.createElement('div');
        pageIndicator.textContent = `Page ${this.currentPage + 1} of ${this.totalPages}`;
        pageIndicator.style.color = '#ffcc00';
        pageIndicator.style.fontSize = '24px';
        pageIndicator.style.marginBottom = '40px';
        pageIndicator.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        contentContainer.appendChild(pageIndicator);
        
        // Add placeholder shop content
        const shopContent = document.createElement('div');
        shopContent.textContent = 'Shop items coming soon...';
        shopContent.style.color = '#ccc';
        shopContent.style.fontSize = '20px';
        shopContent.style.marginBottom = '40px';
        shopContent.style.textAlign = 'center';
        shopContent.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        contentContainer.appendChild(shopContent);
        
        // Create navigation buttons container
        const navContainer = document.createElement('div');
        navContainer.style.display = 'flex';
        navContainer.style.alignItems = 'center';
        navContainer.style.gap = '20px';
        navContainer.style.marginBottom = '40px';
        
        // Left arrow button
        const leftArrow = document.createElement('button');
        leftArrow.innerHTML = '&#8592;'; // Left arrow symbol
        leftArrow.style.fontSize = '32px';
        leftArrow.style.padding = '10px 20px';
        leftArrow.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        leftArrow.style.color = '#ffcc00';
        leftArrow.style.border = '2px solid #ffcc00';
        leftArrow.style.borderRadius = '8px';
        leftArrow.style.cursor = 'pointer';
        leftArrow.style.transition = 'all 0.2s ease';
        leftArrow.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        
        // Disable left arrow if on first page
        if (this.currentPage === 0) {
            leftArrow.style.opacity = '0.5';
            leftArrow.style.cursor = 'not-allowed';
        }
        
        leftArrow.addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.setupShopScreen(); // Refresh the screen
            }
        });
        
        // Right arrow button
        const rightArrow = document.createElement('button');
        rightArrow.innerHTML = '&#8594;'; // Right arrow symbol
        rightArrow.style.fontSize = '32px';
        rightArrow.style.padding = '10px 20px';
        rightArrow.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        rightArrow.style.color = '#ffcc00';
        rightArrow.style.border = '2px solid #ffcc00';
        rightArrow.style.borderRadius = '8px';
        rightArrow.style.cursor = 'pointer';
        rightArrow.style.transition = 'all 0.2s ease';
        rightArrow.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        
        // Disable right arrow if on last page
        if (this.currentPage === this.totalPages - 1) {
            rightArrow.style.opacity = '0.5';
            rightArrow.style.cursor = 'not-allowed';
        }
        
        rightArrow.addEventListener('click', () => {
            if (this.currentPage < this.totalPages - 1) {
                this.currentPage++;
                this.setupShopScreen(); // Refresh the screen
            }
        });
        
        // Add hover effects
        [leftArrow, rightArrow].forEach(button => {
            button.addEventListener('mouseover', () => {
                if (button.style.cursor !== 'not-allowed') {
                    button.style.backgroundColor = 'rgba(255, 204, 0, 0.2)';
                    button.style.transform = 'scale(1.05)';
                }
            });
            
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                button.style.transform = 'scale(1)';
            });
        });
        
        navContainer.appendChild(leftArrow);
        navContainer.appendChild(rightArrow);
        contentContainer.appendChild(navContainer);
        
        // Back to hangar button
        const backButton = document.createElement('button');
        backButton.textContent = 'Back to Hangar';
        backButton.style.fontSize = '24px';
        backButton.style.padding = '12px 24px';
        backButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        backButton.style.color = 'white';
        backButton.style.border = '2px solid white';
        backButton.style.borderRadius = '8px';
        backButton.style.cursor = 'pointer';
        backButton.style.transition = 'all 0.2s ease';
        backButton.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        
        backButton.addEventListener('mouseover', () => {
            backButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            backButton.style.transform = 'scale(1.05)';
        });
        
        backButton.addEventListener('mouseout', () => {
            backButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            backButton.style.transform = 'scale(1)';
        });
        
        backButton.addEventListener('click', () => {
            this.exitToHangar();
        });
        
        contentContainer.appendChild(backButton);
        
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
        instructions.innerHTML = 'Use arrow keys to navigate<br>ESC to go back';
        mainContainer.appendChild(instructions);
        
        // Assemble the layout
        mainContainer.appendChild(contentContainer);
        shopScreen.appendChild(mainContainer);
    }
    
    /**
     * Exit to hangar
     */
    exitToHangar() {
        document.getElementById('shop-screen').style.display = 'none';
        this.game.changeState('hangar');
    }
    
    /**
     * Update the shop state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        if (this.game.input.wasKeyJustPressed('ArrowLeft') || this.game.input.wasKeyJustPressed('a')) {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.setupShopScreen();
            }
        }
        
        if (this.game.input.wasKeyJustPressed('ArrowRight') || this.game.input.wasKeyJustPressed('d')) {
            if (this.currentPage < this.totalPages - 1) {
                this.currentPage++;
                this.setupShopScreen();
            }
        }
        
        if (this.game.input.wasKeyJustPressed('Escape')) {
            this.exitToHangar();
        }
    }
    
    /**
     * Render the shop screen
     * @param {Object} contexts - Object containing all canvas contexts
     */
    render(contexts) {
        // Shop is rendered using HTML/CSS in the shop-screen element
    }
    
    /**
     * Exit the shop state
     */
    exit() {
        document.getElementById('shop-screen').style.display = 'none';
        console.log('Exiting Shop State');
    }
}

export { ShopState }; 