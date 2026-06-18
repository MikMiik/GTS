import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runBisection } from '@/lib/algorithms/bisection';
import { createMockLogger } from './setup';
import type { Logger } from '@/types/solver';

describe('Bisection Algorithm', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = createMockLogger();
  });

  it('1. Normal case with standard root (e.g. x^2 - 4 on [0, 5])', () => {
    runBisection({ fStr: 'x**2 - 4', a: '0', b: '5', epsilon: '1e-4' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('2. Root exactly at midpoint on first iteration (e.g. x^2 - 4 on [0, 4], mid=2)', () => {
    runBisection({ fStr: 'x**2 - 4', a: '0', b: '4', epsilon: '1e-4' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('n = 1'));
  });

  it('3. Invalid interval: f(a) * f(b) > 0', () => {
    runBisection({ fStr: 'x**2 + 1', a: '-5', b: '5', epsilon: '1e-4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('trái dấu'));
  });

  it('4. Invalid parameter: a is not a number', () => {
    runBisection({ fStr: 'x - 2', a: 'abc', b: '5', epsilon: '1e-4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('hợp lệ'));
  });

  it('5. Syntax error in f(x) expression', () => {
    runBisection({ fStr: 'x +* 2', a: '0', b: '5', epsilon: '1e-4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Lỗi cú pháp'));
  });

  it('6. Epsilon <= 0 error', () => {
    runBisection({ fStr: 'x - 2', a: '0', b: '5', epsilon: '-0.01' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Epsilon phải là số dương'));
  });

  it('7. Very small interval, already satisfies epsilon condition (a=1, b=1.0000001, eps=1e-3)', () => {
    // bisection checks f(a)*f(b) < 0. For x-1.00000005: f(1) < 0, f(1.0000001) > 0
    runBisection({ fStr: 'x - 1.00000005', a: '1', b: '1.0000001', epsilon: '1e-3' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('8. Interval boundaries are roots: f(a) * f(b) == 0', () => {
    runBisection({ fStr: 'x - 2', a: '2', b: '5', epsilon: '1e-4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('trái dấu'));
  });

  it('9. Complex function: Math.sin(x) - x/2 on [1, 3]', () => {
    runBisection({ fStr: 'Math.sin(x) - x/2', a: '1', b: '3', epsilon: '1e-5' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('10. Missing parameters (b missing)', () => {
    runBisection({ fStr: 'x - 2', a: '0', epsilon: '1e-4' }, logger); // b is undefined
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('hợp lệ'));
  });
});
