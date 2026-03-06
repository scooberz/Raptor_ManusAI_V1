/**
 * Environment Data - Database of destructible environmental objects.
 * These definitions intentionally reuse the existing spritework while allowing
 * sector-specific value, durability, and presentation differences.
 */

export const environmentData = {
    FUEL_TANK: {
        id: 'FUEL_TANK',
        name: 'Fuel Tank',
        spriteAsset: 'fuelTank',
        width: 48,
        height: 48,
        health: 25,
        explosionSize: 'large',
        scoreValue: 50,
        moneyValue: 40,
        chainExplosions: 2,
        description: 'Volatile fuel storage tank.'
    },
    RADAR_DISH: {
        id: 'RADAR_DISH',
        name: 'Radar Dish',
        spriteAsset: 'radarDish',
        width: 64,
        height: 64,
        health: 75,
        explosionSize: 'medium',
        scoreValue: 150,
        moneyValue: 90,
        description: 'Communications radar array.'
    },
    BUNKER: {
        id: 'BUNKER',
        name: 'Concrete Bunker',
        spriteAsset: 'bunker',
        width: 80,
        height: 60,
        health: 150,
        explosionSize: 'large',
        scoreValue: 200,
        moneyValue: 125,
        description: 'Heavily fortified bunker.'
    },
    COASTAL_RADAR: {
        id: 'COASTAL_RADAR',
        name: 'Coastal Radar',
        spriteAsset: 'radarDish',
        width: 56,
        height: 56,
        health: 60,
        explosionSize: 'medium',
        scoreValue: 120,
        moneyValue: 85,
        description: 'Smaller shoreline radar station.'
    },
    SHORE_BUNKER: {
        id: 'SHORE_BUNKER',
        name: 'Shore Bunker',
        spriteAsset: 'bunker',
        width: 84,
        height: 58,
        health: 165,
        explosionSize: 'large',
        scoreValue: 180,
        moneyValue: 130,
        description: 'Coastal emplacement guarding the shoreline.'
    },
    FUEL_DEPOT: {
        id: 'FUEL_DEPOT',
        name: 'Fuel Depot',
        spriteAsset: 'fuelTank',
        width: 52,
        height: 52,
        health: 40,
        explosionSize: 'large',
        scoreValue: 95,
        moneyValue: 140,
        chainExplosions: 3,
        description: 'Large volatile fuel storage.'
    },
    BRIDGE_TURRET: {
        id: 'BRIDGE_TURRET',
        name: 'Bridge Guard Bunker',
        spriteAsset: 'bunker',
        width: 68,
        height: 50,
        health: 125,
        explosionSize: 'medium',
        scoreValue: 145,
        moneyValue: 100,
        description: 'Bridge defense hardpoint.'
    },
    REFINERY_TANK: {
        id: 'REFINERY_TANK',
        name: 'Refinery Tank',
        spriteAsset: 'fuelTank',
        width: 56,
        height: 56,
        health: 55,
        explosionSize: 'large',
        scoreValue: 125,
        moneyValue: 165,
        chainExplosions: 4,
        description: 'Chemical processing tank with volatile contents.'
    },
    REFINERY_RADAR: {
        id: 'REFINERY_RADAR',
        name: 'Refinery Control Radar',
        spriteAsset: 'radarDish',
        width: 60,
        height: 60,
        health: 80,
        explosionSize: 'medium',
        scoreValue: 160,
        moneyValue: 110,
        description: 'Industrial command radar.'
    },
    HARDENED_BUNKER: {
        id: 'HARDENED_BUNKER',
        name: 'Hardened Bunker',
        spriteAsset: 'bunker',
        width: 92,
        height: 64,
        health: 230,
        explosionSize: 'large',
        scoreValue: 260,
        moneyValue: 180,
        description: 'Heavy final-approach bunker.'
    },
    COMMAND_RADAR: {
        id: 'COMMAND_RADAR',
        name: 'Command Radar',
        spriteAsset: 'radarDish',
        width: 72,
        height: 72,
        health: 110,
        explosionSize: 'large',
        scoreValue: 210,
        moneyValue: 150,
        description: 'High-value command-and-control radar.'
    }
};

export function getEnvironmentData(id) {
    return environmentData[id] || null;
}

export function getAllEnvironmentIds() {
    return Object.keys(environmentData);
}

export function getEnvironmentsByExplosionSize(size) {
    return Object.values(environmentData).filter((env) => env.explosionSize === size);
}

export function getEnvironmentsByHealthRange(minHealth, maxHealth) {
    return Object.values(environmentData).filter((env) => env.health >= minHealth && env.health <= maxHealth);
}
