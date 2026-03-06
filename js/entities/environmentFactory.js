/**
 * EnvironmentFactory class
 * Factory for creating destructible environmental objects.
 */
import { DestructibleObject } from './destructibleObject.js';
import { logger } from '../utils/logger.js';

class EnvironmentFactory {
    constructor(game) {
        this.game = game;
    }

    createEnvironmentObject(envInfo, level = null) {
        const { type } = envInfo;
        const x = this.translateX(envInfo.x ?? 0, level);
        const y = this.translateY(envInfo.y ?? 0, level);

        logger.debug(`ENVIRONMENT FACTORY: Creating ${type} at (${x}, ${y})`);

        try {
            const envObject = new DestructibleObject(this.game, x, y, type, envInfo);
            this.game.entityManager.add(envObject);
            this.game.collision.addToGroup(envObject, 'environment');
            logger.debug(`ENVIRONMENT FACTORY: Successfully created ${type}`);
            return envObject;
        } catch (error) {
            logger.error(`ENVIRONMENT FACTORY: Failed to create ${type}:`, error);
            return null;
        }
    }

    createEnvironmentObjects(envObjects, level = null) {
        const created = [];
        envObjects.forEach((envData) => {
            const envObject = this.createEnvironmentObject(envData, level);
            if (envObject) {
                created.push(envObject);
            }
        });
        return created;
    }

    translateX(value, level) {
        if (level && typeof level.translateLevelX === 'function') {
            return level.translateLevelX(value);
        }
        return value;
    }

    translateY(value, level) {
        if (level && typeof level.translateLevelY === 'function') {
            return level.translateLevelY(value);
        }
        return value;
    }
}

export { EnvironmentFactory };
