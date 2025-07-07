import { EnemyFactory } from '../../js/entities/enemyFactory.js';
import { Enemy } from '../../js/entities/enemy.js';
import { Boss1 } from '../../js/entities/boss1.js';
import { DestructibleObject } from '../../js/entities/destructibleObject.js';

// Mock the classes that the factory uses
jest.mock('../../js/entities/enemy.js');
jest.mock('../../js/entities/boss1.js');
jest.mock('../../js/entities/destructibleObject.js');

describe('EnemyFactory', () => {
    let game;
    let factory;

    beforeEach(() => {
        // Clear all mocks before each test
        Enemy.mockClear();
        Boss1.mockClear();
        DestructibleObject.mockClear();

        // Mock the game object with the systems the factory interacts with
        game = {
            entityManager: {
                add: jest.fn(),
            },
            collision: {
                addToGroup: jest.fn(),
            },
        };

        factory = new EnemyFactory(game);
    });

    test("should create a 'fighter' enemy using the Enemy constructor", () => {
        const enemyInfo = { type: 'fighter', spawn_x: 100, spawn_y: 50 };
        factory.createEnemy(enemyInfo);

        // Verify that the Enemy constructor was called
        expect(Enemy).toHaveBeenCalledTimes(1);
        // Verify it was NOT called for other types
        expect(Boss1).not.toHaveBeenCalled();
        expect(DestructibleObject).not.toHaveBeenCalled();
    });

    test("should create a 'boss1' enemy using the Boss1 constructor", () => {
        const enemyInfo = { type: 'boss1', spawn_x: 200, spawn_y: 100 };
        factory.createEnemy(enemyInfo);

        // Verify that the Boss1 constructor was called
        expect(Boss1).toHaveBeenCalledTimes(1);
        // Verify it was NOT called for other types
        expect(Enemy).not.toHaveBeenCalled();
        expect(DestructibleObject).not.toHaveBeenCalled();
    });

    test('should apply health override to the created enemy', () => {
        // Create a mock instance to inspect
        const mockEnemyInstance = { health: 0 };
        Enemy.mockImplementation(() => mockEnemyInstance);

        const enemyInfo = {
            type: 'fighter',
            spawn_x: 100,
            spawn_y: 50,
            overrides: {
                health: 500,
            },
        };

        const createdEnemy = factory.createEnemy(enemyInfo);

        // Verify that the health property on the instance was set correctly
        expect(createdEnemy.health).toBe(500);
    });

    test("should add the created enemy to the entity manager and collision system", () => {
        const enemyInfo = { type: 'fighter', spawn_x: 100, spawn_y: 50 };
        const createdEnemy = factory.createEnemy(enemyInfo);

        // Verify that the enemy was registered with the game systems
        expect(game.entityManager.add).toHaveBeenCalledWith(createdEnemy);
        expect(game.collision.addToGroup).toHaveBeenCalledWith(createdEnemy, 'enemies');
    });
});
