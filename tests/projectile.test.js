import { Projectile } from '../js/entities/projectile.js';

describe('Projectile', () => {
  let game;
  let projectile;

  beforeEach(() => {
    game = {
      projectilePool: {
        release: jest.fn(),
      },
      height: 600,
    };
    projectile = new Projectile(game);
  });

  test('should update its y position based on velocity', () => {
    projectile.activate(100, 100, 0, -500, 10, 'player', null);
    projectile.update(1000); // 1 second
    expect(projectile.y).toBe(100 - 500);
  });
});
