export const shopCategories = [
    { id: 'repairs', label: 'Repairs' },
    { id: 'systems', label: 'Systems' },
    { id: 'secondaries', label: 'Secondaries' },
    { id: 'consumables', label: 'Consumables' }
];

const shopItems = [
    {
        id: 'hull_repair',
        category: 'repairs',
        name: 'Hull Repair',
        description: 'Field service package that restores up to 25 hull points.',
        purchaseMode: 'service',
        serviceType: 'repairHull',
        healAmount: 25,
        pricePerPoint: 75,
        repeatable: true
    },
    {
        id: 'armor_plating',
        category: 'systems',
        name: 'Armor Plating',
        description: 'Adds 15 permanent hull and installs reinforced plating for tougher contracts.',
        purchaseMode: 'rank',
        systemId: 'armorPlating',
        basePrice: 5000,
        priceStep: 4000,
        maxRank: 3
    },
    {
        id: 'shield_cell',
        category: 'systems',
        name: 'Shield Cell Upgrade',
        description: 'Adds 25 shield capacity and charges the new cell immediately.',
        purchaseMode: 'rank',
        systemId: 'shieldCells',
        basePrice: 6000,
        priceStep: 5000,
        maxRank: 3
    },
    {
        id: 'reactive_shield_emitter',
        category: 'systems',
        name: 'Reactive Shield Emitter',
        description: 'Automatically refills your shield bank to full at mission launch.',
        purchaseMode: 'system',
        systemId: 'reactiveShieldEmitter',
        price: 9000
    },
    {
        id: 'boss_health_indicator',
        category: 'systems',
        name: 'Boss Health Indicator',
        description: 'Installs a dedicated boss readout so the flagship health bar appears during combat.',
        purchaseMode: 'system',
        systemId: 'bossHealthIndicator',
        price: 3500
    },
    {
        id: 'targeting_hud',
        category: 'systems',
        name: 'Targeting HUD',
        description: 'Displays lightweight health bars for standard enemies and destructible ground targets.',
        purchaseMode: 'system',
        systemId: 'targetingHud',
        price: 4500
    },
    {
        id: 'threat_computer',
        category: 'systems',
        name: 'Threat Computer',
        description: 'Adds a tactical panel with section and threat readouts during missions.',
        purchaseMode: 'system',
        systemId: 'threatComputer',
        price: 5000
    },
    {
        id: 'damage_control_kit',
        category: 'systems',
        name: 'Damage Control Kit',
        description: 'Automatically restores a small amount of hull after a successful mission.',
        purchaseMode: 'system',
        systemId: 'damageControlKit',
        price: 6500
    },
    {
        id: 'salvage_uplink',
        category: 'systems',
        name: 'Salvage Uplink',
        description: 'Improves post-strike salvage recovery, boosting cash earned from destruction.',
        purchaseMode: 'rank',
        systemId: 'salvageUplink',
        basePrice: 7000,
        priceStep: 7000,
        maxRank: 2
    },
    {
        id: 'missile_rack',
        category: 'secondaries',
        name: 'Missile Rack',
        description: 'Permanently installs the standard missile secondary and equips it for launch.',
        purchaseMode: 'secondary',
        weaponId: 'MISSILE',
        price: 5500
    },
    {
        id: 'missile_loader',
        category: 'secondaries',
        name: 'Missile Loader',
        description: 'Improves reload cadence for the standard missile rack.',
        purchaseMode: 'rank',
        systemId: 'missileLoader',
        basePrice: 4500,
        priceStep: 3500,
        maxRank: 2
    },
    {
        id: 'megabomb_stock',
        category: 'consumables',
        name: 'Megabomb Stock',
        description: 'Adds one additional megabomb to your current inventory.',
        purchaseMode: 'consumable',
        price: 3000,
        consumableType: 'megabomb',
        amount: 1,
        repeatable: true
    }
];

export default shopItems;
