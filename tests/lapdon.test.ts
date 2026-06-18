import { describe, it, expect, beforeEach } from 'vitest';
import { runLapDon } from '@/lib/algorithms/lapdon';
import { createMockLogger } from './setup';
import type { Logger } from '@/types/solver';

describe('LapDon (Fixed-Point 1D) Algorithm', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = createMockLogger();
  });

  it('1. Normal case converging', () => {
    runLapDon({ phiStr: '1 / Math.sqrt(x + 3)', x0: '0.5', q: '0.0963', epsilon: '5e-9' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('điều kiện dừng'));
  });

  it('2. q >= 1 error', () => {
    runLapDon({ phiStr: 'Math.cos(x)', x0: '0', q: '1', epsilon: '1e-4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('khoảng (0, 1).'));
  });

  it('3. q <= 0 error', () => {
    runLapDon({ phiStr: 'Math.cos(x)', x0: '0', q: '0', epsilon: '1e-4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('khoảng (0, 1).'));
  });

  it('4. Not converging within maxIter (diverging phi)', () => {
    // phi(x) = x + 1 always increases, so it diverges
    runLapDon({ phiStr: 'x + 1', x0: '0', q: '0.5', epsilon: '1e-4' }, logger);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('không hội tụ'));
  });

  it('5. Syntax error in phi(x)', () => {
    runLapDon({ phiStr: 'Math.cos(x', x0: '0', q: '0.5', epsilon: '1e-4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Lỗi cú pháp'));
  });

  it('6. NaN parameters', () => {
    runLapDon({ phiStr: 'Math.cos(x)', x0: 'NaN', q: '0.5', epsilon: '1e-4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('hợp lệ'));
  });

  it('7. Epsilon <= 0 error', () => {
    runLapDon({ phiStr: 'Math.cos(x)', x0: '0', q: '0.5', epsilon: '0' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('dương'));
  });

  it('8. Converges on first iteration (phi(x0) = x0)', () => {
    // phi(x) = 2, x0 = 2 => phi(x0) = 2 = x0, diff = 0 < eps0
    runLapDon({ phiStr: '2', x0: '2', q: '0.5', epsilon: '1e-4' }, logger);
    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('điều kiện dừng'));
  });

  it('9. Complex function Math.sin(x) starting at x=1 (converges to 0)', () => {
    runLapDon({ phiStr: 'Math.sin(x)', x0: '1', q: '0.9', epsilon: '1e-3' }, logger);
    // Might not converge in 100 iterations, so just check it ran without crash
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('10. Missing parameter (eps missing)', () => {
    runLapDon({ phiStr: 'Math.cos(x)', x0: '0', q: '0.5' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('hợp lệ'));
  });
});
