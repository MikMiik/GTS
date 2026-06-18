import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runDanilevsky } from '@/lib/algorithms/danilevsky';
import { createMockLogger } from './setup';
import type { Logger } from '@/types/solver';

describe('Danilevsky Algorithm', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = createMockLogger();
  });

  it('1. Normal 3x3 matrix', () => {
    runDanilevsky({ matA: '1 2 3\n4 5 6\n7 8 9' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
  });

  it('2. Normal 5x5 matrix (from BT.md)', () => {
    runDanilevsky({ matA: '2 1 0 3 1\n1 3 1 2 0\n0 1 4 1 2\n1 2 0 3 1\n0 0 3 4 2' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalled();
    const resultCall = (logger.result as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    // Hệ số đúng theo det(A-λI): λ^5 - 14λ^4 + 58λ^3 - 66λ^2 - 33λ + 66
    expect(resultCall).toMatch(/14\.0000/);
    expect(resultCall).toMatch(/58\.0000/);
    expect(resultCall).toMatch(/66\.0000/);
    expect(logger.section).toHaveBeenCalledWith('VECTOR RIÊNG');
    expect(logger.info).toHaveBeenCalledWith(expect.stringMatching(/^  v1 /));
  });

  it('3. TH1 triggered (zero on subdiagonal, valid element to swap)', () => {
    // We need a matrix where a(k, k-1) is 0 but there is a non-zero to its left.
    // k=3, so a(3,2)=0. M: 
    // 1 2 3
    // 4 5 6
    // 7 0 9 => a(3,2)=0, a(3,1)=7 != 0
    runDanilevsky({ matA: '1 2 3\n4 5 6\n7 0 9' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.step).toHaveBeenCalledWith(expect.stringContaining('TH1: Hoán vị'));
  });

  it('4. TH3 triggered (block matrix)', () => {
    // All elements left of diagonal are 0.
    // 1 2 3
    // 4 5 6
    // 0 0 9 => a(3,2)=0, a(3,1)=0 => TH3
    runDanilevsky({ matA: '1 2 3\n4 5 6\n0 0 9' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.step).toHaveBeenCalledWith(expect.stringContaining('TH3: Giảm bậc khối'));
  });

  it('5. Non-square matrix', () => {
    runDanilevsky({ matA: '1 2\n3 4\n5 6' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Ma trận không vuông'));
  });

  it('6. Missing matrix', () => {
    runDanilevsky({}, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Lỗi đọc ma trận'));
  });

  it('7. Syntax error in matrix parsing', () => {
    runDanilevsky({ matA: '1 2 a\n3 4 5\n6 7 8' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('không hợp lệ'));
  });

  it('8. 1x1 matrix', () => {
    runDanilevsky({ matA: '5' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.result).toHaveBeenCalledWith(expect.stringContaining('5.0000'));
  });

  it('9. Empty matrix', () => {
    runDanilevsky({ matA: '' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('không hợp lệ'));
  });

  it('10. TH1 but no valid swap (all zeros left of diagonal) => should fall into TH3', () => {
    runDanilevsky({ matA: '1 2 3 4\n5 6 7 8\n9 1 2 3\n0 0 0 5' }, logger);
    expect(logger.step).toHaveBeenCalledWith(expect.stringContaining('TH3'));
    expect(logger.formula).toHaveBeenCalledWith(expect.stringContaining('(5.0000 - λ)'));
    expect(logger.success).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(expect.stringMatching(/λ1 = 5\.0000/));
    expect(logger.info).toHaveBeenCalledWith(expect.stringMatching(/^  v1 /));
  });

  it('11. Logs eigenvectors for all roots', () => {
    runDanilevsky({ matA: '1 2 3\n4 5 6\n7 8 9' }, logger);
    expect(logger.section).toHaveBeenCalledWith('VECTOR RIÊNG');
    const vectorLogs = (logger.info as ReturnType<typeof vi.fn>).mock.calls
      .map((c) => c[0] as string)
      .filter((msg) => msg.startsWith('  v'));
    expect(vectorLogs.length).toBe(3);
  });
});
