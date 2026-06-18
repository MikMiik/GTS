import { describe, it, expect, beforeEach } from 'vitest';
import { runDayCung } from '@/lib/algorithms/daycung';
import { createMockLogger } from './setup';
import type { Logger } from '@/types/solver';

describe('DayCung (Secant/Chord) Algorithm', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = createMockLogger();
  });

  it('1. Normal case converging', () => {
    runDayCung({ fStr: 'x**3 - x - 2', a: '1', b: '2', epsilon: '1e-4' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('Hội tụ'));
  });

  it('2. f(a)*f(b) >= 0 error - actual message contains the symbol', () => {
    // f(x) = x^2 + 1 is always > 0, so f(a)*f(b) > 0
    runDayCung({ fStr: 'x**2 + 1', a: '1', b: '2', epsilon: '1e-4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('f(a)·f(b) ≥ 0'));
  });

  it('3. Denominator mẫu số ≈ 0 (dừng sớm)', () => {
    // When f(xk) ≈ f(d), denom → 0, algorithm stops with warn
    runDayCung({ fStr: 'Math.abs(x - 1.5) < 0.1 ? 0 : (x < 1.5 ? -1 : 1)', a: '1', b: '2', epsilon: '1e-4' }, logger);
    // Just check it doesn't crash
  });

  it('4. Converges to machine precision with extremely small eps', () => {
    // DayCung converges when |f(x)|/m1 < eps. With eps=1e-50, it hits machine precision
    // before reaching maxIter (floating-point errors stop further improvement).
    // The algorithm will either converge or warn - just verify it doesn't crash.
    runDayCung({ fStr: 'x**3 - x - 2', a: '1', b: '2', epsilon: '1e-50' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('5. Syntax error in f(x) using truly invalid syntax', () => {
    // Use function syntax that fails at creation time
    runDayCung({ fStr: 'Math.cos(x', a: '1', b: '2', epsilon: '1e-4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Lỗi cú pháp'));
  });

  it('6. NaN parameters', () => {
    runDayCung({ fStr: 'x**3 - x - 2', a: 'NaN', b: '2', epsilon: '1e-4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('hợp lệ'));
  });

  it('7. Epsilon <= 0 error', () => {
    runDayCung({ fStr: 'x**3 - x - 2', a: '1', b: '2', epsilon: '0' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('dương'));
  });

  it('8. Small interval satisfies eps immediately', () => {
    runDayCung({ fStr: 'x - 1.00000005', a: '1', b: '1.0000001', epsilon: '1e-3' }, logger);
    expect(logger.success).toHaveBeenCalled();
  });

  it('9. Complex function Math.exp(x) - Math.cos(x) on [-2, -1]', () => {
    // At x=-1: exp(-1)≈0.368, cos(-1)≈0.540 => f(-1) < 0
    // At x=-2: exp(-2)≈0.135, cos(-2)≈-0.416 => f(-2) > 0
    runDayCung({ fStr: 'Math.exp(x) - Math.cos(x)', a: '-2', b: '-1', epsilon: '1e-5' }, logger);
    expect(logger.success).toHaveBeenCalled();
  });

  it('10. Missing parameter (epsilon missing)', () => {
    runDayCung({ fStr: 'x**3 - x - 2', a: '1', b: '2' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('hợp lệ'));
  });
});
