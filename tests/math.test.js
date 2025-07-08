import { clamp } from '../js/utils/math.js';

describe('clamp', () => {
  it('should return the value if it is within the range', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it('should return the minimum value if the value is less than the minimum', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  it('should return the maximum value if the value is greater than the maximum', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });
});