
import { Player } from '../../js/entities/player.js';
import { Entity } from '../../js/engine/entity.js';

// Mock the Entity class since Player extends it
jest.mock('../../js/engine/entity.js');

describe('Player', () => {
    let game;
    let player;

    beforeEach(() => {
        // Reset mocks before each test
        Entity.mockClear();

        // Mock the Entity constructor to assign the game object to the instance.
        // This is crucial because the Player class extends Entity and expects
        // `this.game` to be set after the `super()` call.
        Entity.mockImplementation(function(gameInstance) {
            this.game = gameInstance;
        });

        // Create a more complete mock for the 'game' object to ensure all
        // properties accessed by the Player class are defined.
        game = {
            playerData: null,
            width: 800,
            height: 600,
            assets: {
                getImage: jest.fn(),
            },
            input: {
                getMousePosition: jest.fn().mockReturnValue({ x: 0, y: 0 }),
                isMouseButtonPressed: jest.fn().mockReturnValue(false),
                wasMouseButtonJustPressed: jest.fn().mockReturnValue(false),
                isKeyPressed: jest.fn().mockReturnValue(false),
            },
            isTouchDevice: false,
            touchHandler: {
                isTouching: false,
                touchX: 0,
                touchY: 0,
            },
            projectilePool: {
                get: jest.fn(),
            },
            missilePool: {
                get: jest.fn(),
            },
            entityManager: {
                add: jest.fn(),
            },
            collision: {
                addToGroup: jest.fn(),
                collisionGroups: {
                    enemies: [],
                    enemyProjectiles: [],
                },
            },
            audio: {
                playSound: jest.fn(),
            },
            changeState: jest.fn(),
        };
    });

    test('should initialize with default properties when no playerData is provided', () => {
        player = new Player(game, 100, 150);

        // Verify Entity constructor was called correctly
        expect(Entity).toHaveBeenCalledWith(game, 100, 150, 64, 64);

        // Verify initial stats
        expect(player.layer).toBe('player');
        expect(player.speed).toBe(575);
        expect(player.health).toBe(75);
        expect(player.maxHealth).toBe(100);
        expect(player.shield).toBe(0);
        expect(player.money).toBe(0);
        expect(player.score).toBe(0);
        expect(player.collisionDamage).toBe(20);

        // Verify weapon system
        expect(player.weaponOrder).toEqual(['MISSILE']);
        expect(player.currentWeaponIndex).toBe(0);
        expect(player.currentWeapon).toBe('MISSILE');
        expect(player.weapons['CANNON'].name).toBe('Autocannon');
        expect(player.weapons['MISSILE'].fireRate).toBe(715);
        expect(player.unlockedWeapons).toEqual(['MISSILE']);

        // Verify special weapons
        expect(player.megabombs).toBe(3);
        expect(player.lastMegabombTime).toBe(0);
        expect(player.megabombCooldown).toBe(1000);

        // Verify animation properties
        expect(player.sprite).toBeNull();
        expect(player.maxFrames).toBe(2);
        expect(player.frameInterval).toBe(100);

        // Verify movement properties
        expect(player.turnThreshold).toBe(0.3);
        expect(player.currentDirection).toBe(0);

        // Verify invulnerability state
        expect(player.invulnerable).toBe(false);
        expect(player.invulnerabilityTime).toBe(0);
        expect(player.invulnerabilityDuration).toBe(1000);
        expect(player.visible).toBe(true);

        // Verify missile auto-fire
        expect(player.missileAutoFire).toBe(true);
    });

    test('should sync with playerData on initialization if it exists', () => {
        const mockPlayerData = {
            health: 50,
            money: 500,
            score: 10000,
            shield: 25,
            unlockedWeapons: ['CANNON', 'MISSILE'],
        };

        game.playerData = mockPlayerData;
        player = new Player(game, 100, 150);

        // Verify stats are synced from playerData
        expect(player.health).toBe(mockPlayerData.health);
        expect(player.money).toBe(mockPlayerData.money);
        expect(player.score).toBe(mockPlayerData.score);
        expect(player.shield).toBe(mockPlayerData.shield);
        expect(player.unlockedWeapons).toEqual(mockPlayerData.unlockedWeapons);

        // Verify a default value is used if a property is missing from playerData
        const gameWithPartialData = {
            playerData: {
                money: 200
            }
        };
        player = new Player(gameWithPartialData, 100, 150);
        expect(player.health).toBe(75); // Default value
        expect(player.money).toBe(200); // Value from playerData
        expect(player.shield).toBe(0); // Default value
    });

    describe('Player Mechanics', () => {
        beforeEach(() => {
            // Create a fresh player for each mechanics test
            player = new Player(game, 100, 150);
        });

        test('takeDamage(25) should reduce health by 25', () => {
            const initialHealth = player.health;
            player.takeDamage(25);
            expect(player.health).toBe(initialHealth - 25);
        });

        test('takeDamage should not reduce health below 0', () => {
            // Deal more damage than the player has health
            player.takeDamage(player.health + 50);
            expect(player.health).toBe(0);
        });
    });
});
