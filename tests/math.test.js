import { clamp } from '../js/utils/math.js';

describe('clamp', () => {
  test('should return the value if it is within the range', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  test('should return the minimum value if the value is less than the minimum', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  test('should return the maximum value if the value is greater than the maximum', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  test('should return the minimum value when the value is equal to the minimum', () => {
    expect(clamp(0, 0, 100)).toBe(0);
  });

  test('should return the maximum value when the value is equal to the maximum', () => {
    expect(clamp(100, 0, 100)).toBe(100);
  });
});