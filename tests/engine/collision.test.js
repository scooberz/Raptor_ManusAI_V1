import { CollisionSystem } from '../../js/engine/collision.js';

describe('CollisionSystem', () => {
    let collisionSystem;

    beforeEach(() => {
        collisionSystem = new CollisionSystem();
    });

    // Mock entity structure for testing AABB collision
    const createMockEntity = (x, y, width, height) => ({
        x,
        y,
        width,
        height,
    });

    test('checkAABBCollision should return true for overlapping entities', () => {
        const entityA = createMockEntity(0, 0, 50, 50);
        const entityB = createMockEntity(25, 25, 50, 50);

        expect(collisionSystem.checkAABBCollision(entityA, entityB)).toBe(true);
    });

    test('checkAABBCollision should return false for non-overlapping entities', () => {
        const entityA = createMockEntity(0, 0, 50, 50);
        const entityB = createMockEntity(100, 100, 50, 50);

        expect(collisionSystem.checkAABBCollision(entityA, entityB)).toBe(false);
    });

    test('checkAABBCollision should return true for entities touching at edges', () => {
        const entityA = createMockEntity(0, 0, 50, 50);
        const entityB = createMockEntity(50, 0, 50, 50); // Touching on the right edge
        const entityC = createMockEntity(0, 50, 50, 50); // Touching on the bottom edge

        expect(collisionSystem.checkAABBCollision(entityA, entityB)).toBe(true);
        expect(collisionSystem.checkAABBCollision(entityA, entityC)).toBe(true);
    });
});
