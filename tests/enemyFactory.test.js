
import { EnemyFactory } from '../js/entities/enemyFactory.js';
import { Enemy } from '../js/entities/enemy.js';
import { Boss1 } from '../js/entities/boss1.js';

// Mock the dependencies
jest.mock('../js/entities/enemy.js');
jest.mock('../js/entities/boss1.js');
jest.mock('../js/entities/enemy.js');

describe('EnemyFactory', () => {
  let game;
  let factory;

  beforeEach(() => {
    // Clear all instances and calls to constructor and methods before each test
    Enemy.mockClear();
    Boss1.mockClear();

    // Mock game object with necessary properties and methods
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

  test('should create an Enemy for type "fighter"', () => {
    const enemyInfo = { type: 'fighter', spawn_x: 100, spawn_y: 100 };
    factory.createEnemy(enemyInfo);
    expect(Enemy).toHaveBeenCalledTimes(1);
  });

  test('should create a Boss1 for type "boss1"', () => {
    const enemyInfo = { type: 'boss1', spawn_x: 100, spawn_y: 100 };
    factory.createEnemy(enemyInfo);
    expect(Boss1).toHaveBeenCalledTimes(1);
  });

  test('should apply health override to the created enemy', () => {
    const enemyInfo = {
      type: 'fighter',
      spawn_x: 100,
      spawn_y: 100,
      overrides: { health: 500 },
    };
    const enemyInstance = factory.createEnemy(enemyInfo);
    // The factory applies the override to the instance *after* creation.
    // We can check if the health property was set.
    // The mock constructor of Enemy needs to return an object so we can check its property.
    const mockEnemyInstance = Enemy.mock.instances[0];
    expect(mockEnemyInstance.health).toBe(500);
  });

  test('should award score to player when enemy is destroyed', () => {
    const { Enemy: ActualEnemy } = jest.requireActual('../js/entities/enemy.js');
    const player = {
      addScore: jest.fn(),
      addMoney: jest.fn(), // Mock addMoney as it is also called
    };
    game.player = player;
    game.assets = { getImage: () => ({}) }; // Mock assets
    game.entityManager = { add: jest.fn() }; // Mock entityManager

    const enemyInfo = {
      type: 'fighter',
      spawn_x: 100,
      spawn_y: 100,
      overrides: { health: 10, scoreValue: 150 },
    };

    // Create a real Enemy instance
    const enemy = new ActualEnemy(game, enemyInfo.spawn_x, enemyInfo.spawn_y, 'fighter', 'enemyFighter', enemyInfo.overrides.health, enemyInfo.overrides.scoreValue);

    // Simulate taking enough damage to be destroyed
    enemy.takeDamage(10);
    enemy.update(0); // Call update to trigger the death logic

    expect(player.addScore).toHaveBeenCalledWith(150);
  });
});
