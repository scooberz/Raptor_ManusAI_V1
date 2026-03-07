export const playerShips = {
    raptor: {
        id: 'raptor',
        displayName: 'Raptor',
        manufacturer: 'Megacorp Dynamics',
        role: 'Balanced Interceptor',
        description: 'Standard contract craft with balanced armor, speed, and a disciplined twin-cannon setup.',
        storyTrack: 'raptor_route',
        endingKey: 'raptor_standard',
        speed: 575,
        maxHealth: 100,
        cannonDamage: 3,
        cannonFireRate: 110,
        cannonUpgradeFloor: 80,
        bulletSpacing: 10,
        collisionDamage: 20,
        tint: null,
        spriteKeys: {
            base: 'playerShipBase',
            left: 'playerShipLeft',
            right: 'playerShipRight',
            thrust: 'playerShipThrust'
        }
    },
    specter: {
        id: 'specter',
        displayName: 'Specter',
        manufacturer: 'Aegis Blackworks',
        role: 'High-Speed Raider',
        description: 'Fast and fragile. Its lighter machine gun cycles faster but hits softer until upgraded.',
        storyTrack: 'specter_route',
        endingKey: 'specter_black_ops',
        speed: 635,
        maxHealth: 84,
        cannonDamage: 2,
        cannonFireRate: 88,
        cannonUpgradeFloor: 68,
        bulletSpacing: 12,
        collisionDamage: 16,
        tint: 'rgba(80, 180, 255, 0.24)',
        spriteKeys: {
            base: 'playerShipBaseSpecter',
            left: 'playerShipLeftSpecter',
            right: 'playerShipRightSpecter',
            thrust: 'playerShipThrustSpecter'
        }
    },
    tempest: {
        id: 'tempest',
        displayName: 'Tempest',
        manufacturer: 'Iron Vale Systems',
        role: 'Heavy Gunship',
        description: 'Slower and tougher. The opening machine gun fires heavier rounds with lower cadence.',
        storyTrack: 'tempest_route',
        endingKey: 'tempest_command',
        speed: 520,
        maxHealth: 122,
        cannonDamage: 4,
        cannonFireRate: 145,
        cannonUpgradeFloor: 105,
        bulletSpacing: 9,
        collisionDamage: 24,
        tint: 'rgba(255, 176, 96, 0.20)',
        spriteKeys: {
            base: 'playerShipBaseTempest',
            left: 'playerShipLeftTempest',
            right: 'playerShipRightTempest',
            thrust: 'playerShipThrustTempest'
        }
    }
};

export function getPlayerShipProfile(shipId = 'raptor') {
    return playerShips[shipId] || playerShips.raptor;
}

export function getAllPlayerShips() {
    return Object.values(playerShips);
}
