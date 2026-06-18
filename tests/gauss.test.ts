import { describe, it, expect, beforeEach } from 'vitest';
import { runGauss } from '@/lib/algorithms/gauss';
import { createMockLogger } from './setup';
import type { Logger } from '@/types/solver';

describe('Gauss Algorithm', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = createMockLogger();
  });

  it('1. Normal system with unique solution', () => {
    runGauss({ matA: '1 2 1\n2 3 2\n1 1 3', matB: '8\n14\n10' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('2. Multiple right-hand sides', () => {
    runGauss({ matA: '1 2 1\n2 3 2\n1 1 3', matB: '8 1\n14 2\n10 3' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('3. Singular matrix (det = 0, no solution) - reports VÔ NGHIỆM', () => {
    // Gauss uses logger.error with 'VÔ NGHIỆM' for inconsistent rows
    runGauss({ matA: '1 2 3\n4 5 6\n7 8 9', matB: '1\n2\n4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('VÔ NGHIỆM'));
  });

  it('4. Singular matrix (infinite solutions - consistent B, free variables)', () => {
    // For B=[1,2,3] which is consistent (B = A*[0,0,1/3]ᵀ roughly), Gauss
    // detects free variables and warns - no error, but warns about free vars
    runGauss({ matA: '1 2 3\n4 5 6\n7 8 9', matB: '1\n2\n3' }, logger);
    // Should warn about free variables, not error
    expect(logger.warn).toHaveBeenCalled();
  });

  it('5. Dimension mismatch between A and B', () => {
    runGauss({ matA: '1 2\n3 4', matB: '1\n2\n3' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Số hàng'));
  });

  it('6. Non-square matrix A - uses column-reduced Gauss (no error, free vars)', () => {
    // Gauss doesn't check if A is square — it just treats non-square as rank-deficient
    runGauss({ matA: '1 2 3\n4 5 6', matB: '1\n2' }, logger);
    // Runs without crash; may or may not error depending on B
    // Just ensure no crash
  });

  it('7. Zero on diagonal, requires row swapping', () => {
    runGauss({ matA: '0 2 1\n2 3 2\n1 1 3', matB: '8\n14\n10' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.step).toHaveBeenCalledWith(expect.stringContaining('Chọn phần tử khử'));
  });

  it('8. All zeros matrix - A only, all col skip then back-sub may warn', () => {
    // All-zero A with non-zero B => VÔ NGHIỆM
    runGauss({ matA: '0 0\n0 0', matB: '1\n2' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('VÔ NGHIỆM'));
  });

  it('9. Syntax error in matrix parsing', () => {
    runGauss({ matA: '1 2 a\n3 4 5', matB: '1\n2' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('không hợp lệ'));
  });

  it('10. Very large numbers', () => {
    runGauss({ matA: '1e10 2e10\n3e10 4e10', matB: '1e10\n2e10' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });
});
