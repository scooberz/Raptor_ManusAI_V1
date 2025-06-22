/**
 * Environment Data - Database of destructible environmental objects
 * Defines properties for all destructible ground-based objects in the game
 */

export const environmentData = {
    'FUEL_TANK': {
        id: 'FUEL_TANK',
        name: 'Fuel Tank',
        spriteAsset: 'fuelTank',
        width: 48,
        height: 48,
        health: 25,
        explosionSize: 'large', // 'small', 'medium', 'large'
        scoreValue: 50,
        description: 'Volatile fuel storage tank - explodes dramatically when destroyed'
    },
    
    'RADAR_DISH': {
        id: 'RADAR_DISH',
        name: 'Radar Dish',
        spriteAsset: 'radarDish',
        width: 64,
        height: 64,
        health: 75,
        explosionSize: 'medium',
        scoreValue: 150,
        description: 'Communications radar array - high value target'
    },
    
    'BUNKER': {
        id: 'BUNKER',
        name: 'Concrete Bunker',
        spriteAsset: 'bunker',
        width: 80,
        height: 60,
        health: 150,
        explosionSize: 'large',
        scoreValue: 200,
        description: 'Heavily fortified bunker - requires sustained fire to destroy'
    },
    
    'SILO': {
        id: 'SILO',
        name: 'Missile Silo',
        spriteAsset: 'silo_sprite',
        width: 56,
        height: 72,
        health: 100,
        explosionSize: 'large',
        scoreValue: 300,
        description: 'Strategic missile launch facility - extremely valuable target'
    },
    
    'TURRET_BASE': {
        id: 'TURRET_BASE',
        name: 'Anti-Aircraft Turret',
        spriteAsset: 'turret_base_sprite',
        width: 40,
        height: 40,
        health: 60,
        explosionSize: 'medium',
        scoreValue: 100,
        description: 'Automated defense turret - destroy before it targets you'
    },
    
    'POWER_STATION': {
        id: 'POWER_STATION',
        name: 'Power Generator',
        spriteAsset: 'power_station_sprite',
        width: 72,
        height: 48,
        health: 80,
        explosionSize: 'large',
        scoreValue: 175,
        description: 'Critical power infrastructure - causes chain explosions'
    },
    
    'WAREHOUSE': {
        id: 'WAREHOUSE',
        name: 'Supply Warehouse',
        spriteAsset: 'warehouse_sprite',
        width: 96,
        height: 64,
        health: 120,
        explosionSize: 'medium',
        scoreValue: 125,
        description: 'Large storage facility - may contain valuable supplies'
    },
    
    'COMM_TOWER': {
        id: 'COMM_TOWER',
        name: 'Communication Tower',
        spriteAsset: 'comm_tower_sprite',
        width: 32,
        height: 80,
        health: 40,
        explosionSize: 'small',
        scoreValue: 75,
        description: 'Tall communication antenna - easy target but low health'
    },
    
    'HANGAR': {
        id: 'HANGAR',
        name: 'Aircraft Hangar',
        spriteAsset: 'hangar_sprite',
        width: 120,
        height: 80,
        health: 200,
        explosionSize: 'large',
        scoreValue: 250,
        description: 'Large aircraft storage facility - heavily armored'
    },
    
    'SMALL_BUILDING': {
        id: 'SMALL_BUILDING',
        name: 'Small Building',
        spriteAsset: 'small_building_sprite',
        width: 40,
        height: 32,
        health: 30,
        explosionSize: 'small',
        scoreValue: 25,
        description: 'Basic structure - quick to destroy'
    }
};

/**
 * Helper function to get environment object data by ID
 * @param {string} id - The environment object ID
 * @returns {Object|null} Environment object data or null if not found
 */
export function getEnvironmentData(id) {
    return environmentData[id] || null;
}

/**
 * Helper function to get all environment object IDs
 * @returns {Array<string>} Array of all environment object IDs
 */
export function getAllEnvironmentIds() {
    return Object.keys(environmentData);
}

/**
 * Helper function to get environment objects by explosion size
 * @param {string} size - Explosion size ('small', 'medium', 'large')
 * @returns {Array<Object>} Array of environment objects with matching explosion size
 */
export function getEnvironmentsByExplosionSize(size) {
    return Object.values(environmentData).filter(env => env.explosionSize === size);
}

/**
 * Helper function to get environment objects by health range
 * @param {number} minHealth - Minimum health value
 * @param {number} maxHealth - Maximum health value
 * @returns {Array<Object>} Array of environment objects within health range
 */
export function getEnvironmentsByHealthRange(minHealth, maxHealth) {
    return Object.values(environmentData).filter(env => 
        env.health >= minHealth && env.health <= maxHealth
    );
}

