const shopItems = [
    {
        id: 'ENERGY_MODULE',
        name: 'Energy Module',
        price: 10000,
        description: 'A consumable item that instantly restores 25 points of health.',
        type: 'consumable',
        effect: {
            stat: 'health',
            value: 25
        }
    },
    {
        id: 'PHASE_SHIELD_L1',
        name: 'Phase Shield (Level 1)',
        price: 25000,
        description: 'Equips your ship with a basic, non-recharging shield that can absorb 50 damage.',
        type: 'upgrade',
        effect: {
            stat: 'shield',
            value: 50
        }
    },
    {
        id: 'AUTOCANNON_DEATHRAY',
        name: '"Deathray" Autocannon',
        price: 78800,
        description: 'Upgrades your primary cannon to fire more powerful projectiles.',
        type: 'upgrade',
        effect: {
            stat: 'primaryWeapon',
            value: 'DEATHRAY'
        }
    },
    {
        id: 'WEAPON_AIR_AIR_MISSILE',
        name: 'Air-to-Air Missile',
        price: 63500,
        description: 'Unlocks the powerful Air-to-Air homing missile as a selectable secondary weapon.',
        type: 'unlock',
        effect: {
            stat: 'secondaryWeapon',
            value: 'AIR_AIR_MISSILE'
        }
    },
    {
        id: 'MEGABOMB',
        name: 'MegaBomb',
        price: 15000,
        description: 'A powerful explosive that clears most enemies from the screen. Adds one to your inventory.',
        type: 'consumable',
        effect: {
            stat: 'megabombs',
            value: 1
        }
    }
];

export default shopItems; 