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
    DOCK_STORAGE: {
        id: 'DOCK_STORAGE',
        name: 'Dock Storage Yard',
        spriteAsset: 'dockStorage',
        width: 96,
        height: 56,
        health: 170,
        explosionSize: 'medium',
        scoreValue: 190,
        moneyValue: 120,
        description: 'Low industrial storage block near the docks.'
    },
    HARBOR_FUEL_LINE: {
        id: 'HARBOR_FUEL_LINE',
        name: 'Harbor Fuel Line',
        spriteAsset: 'fuelTank',
        width: 42,
        height: 60,
        health: 38,
        explosionSize: 'medium',
        scoreValue: 90,
        moneyValue: 110,
        chainExplosions: 2,
        description: 'Pipeline-fed harbor storage tank.'
    },
    CARGO_BARGE: {
        id: 'CARGO_BARGE',
        name: 'Cargo Barge',
        spriteAsset: 'cargoBarge',
        width: 88,
        height: 58,
        health: 95,
        explosionSize: 'medium',
        scoreValue: 165,
        moneyValue: 145,
        description: 'Loaded harbor barge carrying military cargo through the inlet.'
    },
    PATROL_BOAT: {
        id: 'PATROL_BOAT',
        name: 'Patrol Boat',
        spriteAsset: 'patrolBoat',
        width: 74,
        height: 42,
        health: 70,
        explosionSize: 'medium',
        scoreValue: 120,
        moneyValue: 105,
        description: 'Armed patrol boat escorting coastal shipping lanes.'
    },
    WAREHOUSE_BLOCK: {
        id: 'WAREHOUSE_BLOCK',
        name: 'Warehouse Block',
        spriteAsset: 'warehouseBlock',
        width: 108,
        height: 62,
        health: 185,
        explosionSize: 'large',
        scoreValue: 210,
        moneyValue: 145,
        description: 'Heavy warehouse roofline overlooking the shoreline.'
    },
    WAREHOUSE_BLOCK_B: {
        id: 'WAREHOUSE_BLOCK_B',
        name: 'Warehouse Block B',
        spriteAsset: 'warehouseBlockB',
        width: 112,
        height: 64,
        health: 195,
        explosionSize: 'large',
        scoreValue: 225,
        moneyValue: 155,
        description: 'Alternate heavy warehouse complex overlooking the shoreline.'
    },
    COMM_ARRAY: {
        id: 'COMM_ARRAY',
        name: 'Communications Array',
        spriteAsset: 'radarDish',
        width: 74,
        height: 74,
        health: 100,
        explosionSize: 'medium',
        scoreValue: 190,
        moneyValue: 135,
        description: 'Large relay array for coastal command traffic.'
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
    BRIDGE_NODE: {
        id: 'BRIDGE_NODE',
        name: 'Bridge Support Node',
        spriteAsset: 'bridgeNode',
        width: 88,
        height: 58,
        health: 175,
        explosionSize: 'large',
        scoreValue: 220,
        moneyValue: 155,
        description: 'Structural bridge support and weapons node.'
    },
    BRIDGE_NODE_B: {
        id: 'BRIDGE_NODE_B',
        name: 'Bridge Support Node B',
        spriteAsset: 'bridgeNodeB',
        width: 96,
        height: 64,
        health: 190,
        explosionSize: 'large',
        scoreValue: 235,
        moneyValue: 165,
        description: 'Secondary bridge support platform with reinforced anchor points.'
    },
    ROAD_JUNCTION: {
        id: 'ROAD_JUNCTION',
        name: 'Road Junction Control',
        spriteAsset: 'radarDish',
        width: 56,
        height: 56,
        health: 72,
        explosionSize: 'medium',
        scoreValue: 135,
        moneyValue: 95,
        description: 'Bridge traffic control dish.'
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
    CHEMICAL_VAT: {
        id: 'CHEMICAL_VAT',
        name: 'Chemical Vat',
        spriteAsset: 'chemicalVat',
        width: 64,
        height: 64,
        health: 62,
        explosionSize: 'large',
        scoreValue: 155,
        moneyValue: 190,
        chainExplosions: 5,
        description: 'Tall volatile chemical vat suspended above the inlet.'
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
    PIPELINE_HUB: {
        id: 'PIPELINE_HUB',
        name: 'Pipeline Hub',
        spriteAsset: 'bunker',
        width: 86,
        height: 52,
        health: 150,
        explosionSize: 'medium',
        scoreValue: 170,
        moneyValue: 125,
        description: 'Armored pipeline control and pump station.'
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
    },
    CONTROL_TOWER: {
        id: 'CONTROL_TOWER',
        name: 'Control Tower',
        spriteAsset: 'controlTower',
        width: 78,
        height: 90,
        health: 145,
        explosionSize: 'large',
        scoreValue: 280,
        moneyValue: 210,
        description: 'Tall command tower guiding the hardened base approach.'
    },
    BASE_GENERATOR: {
        id: 'BASE_GENERATOR',
        name: 'Base Generator',
        spriteAsset: 'baseGenerator',
        width: 58,
        height: 58,
        health: 70,
        explosionSize: 'large',
        scoreValue: 175,
        moneyValue: 165,
        chainExplosions: 3,
        description: 'Fortified base power generator.'
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
