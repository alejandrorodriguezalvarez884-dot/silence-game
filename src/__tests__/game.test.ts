import { SENSITIVITY, formatTime, isElimination, type Player } from '../game';

const player = (name: string): Player => ({ id: name, name, color: '#fff' });

describe('formatTime', () => {
  it('formats minutes and zero-padded seconds', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(9_999)).toBe('0:09');
    expect(formatTime(65_000)).toBe('1:05');
    expect(formatTime(600_000)).toBe('10:00');
  });

  it('never shows negative time', () => {
    expect(formatTime(-5_000)).toBe('0:00');
  });
});

describe('isElimination', () => {
  it('needs at least two players', () => {
    expect(isElimination([])).toBe(false);
    expect(isElimination([player('Ana')])).toBe(false);
    expect(isElimination([player('Ana'), player('Leo')])).toBe(true);
  });
});

describe('SENSITIVITY', () => {
  it('gets more sensitive from low to high', () => {
    expect(SENSITIVITY.low.marginDb).toBeGreaterThan(SENSITIVITY.medium.marginDb);
    expect(SENSITIVITY.medium.marginDb).toBeGreaterThan(SENSITIVITY.high.marginDb);
    expect(SENSITIVITY.low.samples).toBeGreaterThanOrEqual(SENSITIVITY.medium.samples);
    expect(SENSITIVITY.medium.samples).toBeGreaterThanOrEqual(SENSITIVITY.high.samples);
  });
});
