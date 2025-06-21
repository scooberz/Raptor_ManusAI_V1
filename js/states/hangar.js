/**
 * HangarState class
 * Represents the hangar screen between missions
 */
class HangarState {
    constructor(game) {
        this.game = game;
        this.menuOptions = [
            'Repair Ship',
            'Upgrade Weapons',
            'Shop',
            'Proceed to Next Mission'
        ];
        this.selectedOptionIndex = 0;
        this.playerMoney = 0;
    }

    /**
     * Enter the hangar state
     */
    enter() {
        // Get player's money from persistent data
        this.playerMoney = this.game.playerData.money;
    }

    /**
     * Update the hangar state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Handle menu navigation
        if (this.game.input.wasKeyJustPressed('ArrowUp')) {
            this.selectedOptionIndex = (this.selectedOptionIndex - 1 + this.menuOptions.length) % this.menuOptions.length;
        }
        if (this.game.input.wasKeyJustPressed('ArrowDown')) {
            this.selectedOptionIndex = (this.selectedOptionIndex + 1) % this.menuOptions.length;
        }

        // Handle menu selection
        if (this.game.input.wasKeyJustPressed('Enter')) {
            const selectedOption = this.menuOptions[this.selectedOptionIndex];
            
            switch (selectedOption) {
                case 'Proceed to Next Mission':
                    this.game.stateMachine.changeState('Menu');
                    break;
                // Other options will be implemented later
                default:
                    console.log(`Selected: ${selectedOption}`);
                    break;
            }
        }
    }

    /**
     * Render the hangar screen
     * @param {Object} contexts - Object containing all canvas contexts
     */
    render(contexts) {
        const context = contexts.ui; // Use the UI context

        // Draw dark background
        context.fillStyle = '#111'; // Darker background
        context.fillRect(0, 0, this.game.width, this.game.height);

        // Draw title
        context.fillStyle = 'white';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.fillText('H A N G A R', this.game.width / 2, 80);

        // Draw credits
        context.font = '24px Arial';
        context.fillStyle = '#ffcc00';
        context.fillText(`CREDITS: $${this.playerMoney}`, this.game.width / 2, 140);

        // Draw menu options
        context.font = '32px Arial';
        const menuY = 250;
        const menuSpacing = 60;

        this.menuOptions.forEach((option, index) => {
            // Set color based on selection
            context.fillStyle = index === this.selectedOptionIndex ? '#ffcc00' : 'white';
            
            // Draw selection indicator
            if (index === this.selectedOptionIndex) {
                context.fillText('>', this.game.width / 2 - 200, menuY + index * menuSpacing);
            }
            
            // Draw option text
            context.fillText(option, this.game.width / 2, menuY + index * menuSpacing);
        });
    }

    exit() {
        console.log('Exiting Hangar State');
    }
}

export { HangarState };

