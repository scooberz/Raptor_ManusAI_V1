/**
 * HangarState class
 * Handles the hangar/shop state for weapon upgrades
 */
class HangarState {
    constructor(game) {
        this.game = game;
    }
    
    /**
     * Enter the hangar state
     */
    enter() {
        console.log('Entering Hangar State');
        
        // For the simplified version, we'll just return to the game
        // In a full implementation, this would show a shop interface
        this.game.changeState('game');
    }
    
    /**
     * Update the hangar state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Not implemented in this simplified version
    }
    
    /**
     * Render the hangar state
     */
    render() {
        // Not implemented in this simplified version
    }
    
    /**
     * Exit the hangar state
     */
    exit() {
        console.log('Exiting Hangar State');
    }
}

