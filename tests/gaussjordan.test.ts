import { describe, it, expect, beforeEach } from 'vitest';
import { runGaussJordan } from '@/lib/algorithms/gaussjordan';
import { createMockLogger } from './setup';
import type { Logger } from '@/types/solver';

describe('Gauss-Jordan Algorithm', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = createMockLogger();
  });

  it('1. Normal system with unique solution', () => {
    runGaussJordan({ matA: '2 4 5 -6\n0 -1 0 8\n0 0 1 0\n0 0 -1.5 -4', matB: '7 3\n-6 1\n2 0\n2.8 -1.5' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('2. Multiple right-hand sides', () => {
    runGaussJordan({ matA: '1 2\n3 4', matB: '1 2\n3 4' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('3. Singular matrix (det = 0, no solution)', () => {
    // [1 2 | 3] and [2 4 | 1] => row 2 after elimination: 0 = -5 => VÔ NGHIỆM
    runGaussJordan({ matA: '1 2\n2 4', matB: '3\n1' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('VÔ NGHIỆM'));
  });

  it('4. Zero on diagonal, requires row swapping (pivot selection)', () => {
    runGaussJordan({ matA: '0 2\n1 4', matB: '1\n2' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.step).toHaveBeenCalledWith(expect.stringContaining('Chọn pivot'));
  });

  it('5. Dimension mismatch between A and B', () => {
    runGaussJordan({ matA: '1 2\n3 4', matB: '1\n2\n3' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Số hàng'));
  });

  it('6. Non-square matrix A (more columns than rows = under-determined)', () => {
    // GaussJordan handles non-square: finds free variables, no crash
    runGaussJordan({ matA: '1 2 3\n4 5 6', matB: '1\n2' }, logger);
    // Should not crash, may succeed with free vars
    expect(logger.success).toHaveBeenCalled();
  });

  it('7. Syntax error in matrix', () => {
    runGaussJordan({ matA: '1 2 x\n3 4 5', matB: '1\n2' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('không hợp lệ'));
  });

  it('8. All zeros A with zero B (free variables, NOT error)', () => {
    // 0*x1 + 0*x2 = 0 has infinite solutions, warned about free vars
    runGaussJordan({ matA: '0 0\n0 0', matB: '0\n0' }, logger);
    // No VÔ NGHIỆM because B is also 0
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled(); // warns about free variables
  });

  it('9. Very small numbers', () => {
    runGaussJordan({ matA: '1e-10 2e-10\n3e-10 4e-10', matB: '1e-10\n2e-10' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('10. Missing parameters (matB missing) - should error on parse', () => {
    runGaussJordan({ matA: '1 2\n3 4' }, logger); // matB is undefined
    expect(logger.error).toHaveBeenCalled();
  });
});
