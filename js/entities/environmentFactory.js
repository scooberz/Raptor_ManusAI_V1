/**
 * EnvironmentFactory class
 * Factory for creating destructible environmental objects
 */
import { DestructibleObject } from './destructibleObject.js';

class EnvironmentFactory {
    constructor(game) {
        this.game = game;
    }

    /**
     * Creates a destructible environment object
     * @param {Object} envInfo - Object containing environment type and position
     * @returns {DestructibleObject|null} The created environment object, or null if type is unknown
     */
    createEnvironmentObject(envInfo) {
        const { type, x, y } = envInfo;

        console.log(`ENVIRONMENT FACTORY: Creating ${type} at (${x}, ${y})`);

        try {
            const envObject = new DestructibleObject(this.game, x, y, type);
            
            // Register with game systems
            this.game.entityManager.add(envObject);
            this.game.collision.addToGroup(envObject, 'environment');
            if (this.game.state && this.game.state.level && this.game.state.level.logicalGrid) {
                this.game.state.level.logicalGrid.registerObject(envObject);
            }
            
            console.log(`ENVIRONMENT FACTORY: Successfully created ${type}`);
            return envObject;
        } catch (error) {
            console.error(`ENVIRONMENT FACTORY: Failed to create ${type}:`, error);
            return null;
        }
    }

    /**
     * Creates multiple environment objects from an array
     * @param {Array} envObjects - Array of environment object data
     * @returns {Array} Array of created environment objects
     */
    createEnvironmentObjects(envObjects) {
        const created = [];
        
        envObjects.forEach(envData => {
            const envObject = this.createEnvironmentObject(envData);
            if (envObject) {
                created.push(envObject);
            }
        });
        
        return created;
    }
}

export { EnvironmentFactory }; 