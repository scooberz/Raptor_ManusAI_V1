import { Player } from '../js/entities/player.js';
import { createMockGame } from './mocks/mock-game.js';

describe('Player', () => {
  let game;
  let player;

  beforeEach(() => {
    game = createMockGame();
    player = new Player(game, 100, 100);
  });

  test('should have correct initial health', () => {
    expect(player.health).toBe(75);
  });

  test('should have correct initial score', () => {
    expect(player.score).toBe(0);
  });

  test('should have correct initial money', () => {
    expect(player.money).toBe(0);
  });

  test('should have correct initial speed', () => {
    expect(player.speed).toBe(575);
  });
});

describe('Player Interactions', () => {
  let game;
  let player;

  beforeEach(() => {
    game = createMockGame();
    player = new Player(game, 100, 100);
  });

  test('collectHealthPickup should increase health', () => {
    player.health = 50;
    player.collectHealthPickup(25);
    expect(player.health).toBe(75);
  });

  test('collectHealthPickup should not exceed maxHealth', () => {
    player.health = 90;
    player.collectHealthPickup(25);
    expect(player.health).toBe(player.maxHealth);
  });
});
