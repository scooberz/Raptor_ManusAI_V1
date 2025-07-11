/**
 * SupplyState class
 * Handles the supply shop state for buying items
 */
import { logger } from '../utils/logger.js';
class SupplyState {
    constructor(game) {
        this.game = game;
    }
    
    /**
     * Enter the supply state
     */
    enter() {
        logger.info('Entering Supply State');
        
        // For the simplified version, we'll just return to the game
        // In a full implementation, this would show a shop interface
        this.game.changeState('game');
    }
    
    /**
     * Update the supply state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Not implemented in this simplified version
    }
    
    /**
     * Render the supply state
     */
    render() {
        // Not implemented in this simplified version
    }
    
    /**
     * Exit the supply state
     */
    exit() {
        logger.info('Exiting Supply State');
    }
}

export { SupplyState };

