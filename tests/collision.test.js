import { CollisionSystem } from '../js/engine/collision.js';

describe('CollisionSystem', () => {
  let collisionSystem;

  beforeEach(() => {
    collisionSystem = new CollisionSystem();
  });

  test('checkAABBCollision should return true for overlapping entities', () => {
    const entityA = { x: 10, y: 10, width: 20, height: 20 };
    const entityB = { x: 15, y: 15, width: 20, height: 20 };
    expect(collisionSystem.checkAABBCollision(entityA, entityB)).toBe(true);
  });

  test('checkAABBCollision should return false for non-overlapping entities', () => {
    const entityA = { x: 10, y: 10, width: 20, height: 20 };
    const entityB = { x: 50, y: 50, width: 20, height: 20 };
    expect(collisionSystem.checkAABBCollision(entityA, entityB)).toBe(false);
  });
});
