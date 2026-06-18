import { describe, it, expect, beforeEach } from 'vitest';
import { runTiepTuyen } from '@/lib/algorithms/tieptuyen';
import { createMockLogger } from './setup';
import type { Logger } from '@/types/solver';

describe('TiepTuyen (Newton-Raphson) Algorithm', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = createMockLogger();
  });

  it('1. Normal case converging (x^2 - 4 on [1, 3])', () => {
    runTiepTuyen({ fStr: 'x**2 - 4', dfStr: '2*x', ddfStr: '2', a: '1', b: '3', m1: '2', epsilon: '1e-4' }, logger);
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('Hội tụ'));
  });

  it('2. Chooses b as Fourier point (f(b) * f\'\'(b) > 0)', () => {
    // x^2 - 4: f(1)=-3, f''(1)=2 => <0. f(3)=5, f''(3)=2 => >0. Should choose b=3.
    runTiepTuyen({ fStr: 'x**2 - 4', dfStr: '2*x', ddfStr: '2', a: '1', b: '3', m1: '2', epsilon: '1e-4' }, logger);
    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('x₀ = b'));
  });

  it('3. Derivative reaches 0 during iteration', () => {
    // f(x) = x^2 - 1, we start exactly at x=0 if a=-1, b=1, but wait f(0)f''(0) < 0.
    // If df(x) reaches 0: df=0.
    runTiepTuyen({ fStr: 'x**2 - 1', dfStr: '0*x', ddfStr: '2', a: '0.5', b: '1.5', m1: '1', epsilon: '1e-4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Đạo hàm'));
  });

  it('4. Not converging within maxIter', () => {
    // Epsilon extremely small and maxIter hit.
    runTiepTuyen({ fStr: 'x**2 - 2', dfStr: '2*x', ddfStr: '2', a: '1', b: '2', m1: '2', epsilon: '1e-50' }, logger);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Không đạt sai số'));
  });

  it('5. Invalid m1 <= 0', () => {
    runTiepTuyen({ fStr: 'x**2 - 4', dfStr: '2*x', ddfStr: '2', a: '1', b: '3', m1: '-1', epsilon: '1e-4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('m₁ phải là số dương'));
  });

  it('6. Invalid epsilon <= 0', () => {
    runTiepTuyen({ fStr: 'x**2 - 4', dfStr: '2*x', ddfStr: '2', a: '1', b: '3', m1: '2', epsilon: '0' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Epsilon phải là số dương'));
  });

  it('7. Syntax error in f, df, ddf', () => {
    runTiepTuyen({ fStr: 'x^2', dfStr: '2*x', ddfStr: '2', a: '1', b: '3', m1: '2', epsilon: '1e-4' }, logger);
    // JS evaluates x^2 as bitwise XOR, but if we do something like 'x *** 2'
    runTiepTuyen({ fStr: 'x *** 2', dfStr: '2*x', ddfStr: '2', a: '1', b: '3', m1: '2', epsilon: '1e-4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Lỗi cú pháp'));
  });

  it('8. NaN parameters', () => {
    runTiepTuyen({ fStr: 'x**2 - 4', dfStr: '2*x', ddfStr: '2', a: 'NaN', b: '3', m1: '2', epsilon: '1e-4' }, logger);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('không hợp lệ'));
  });

  it('9. Missing parameter', () => {
    runTiepTuyen({ fStr: 'x**2 - 4', dfStr: '2*x', ddfStr: '2', a: '1', b: '3', m1: '2' }, logger); // eps missing
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('không hợp lệ'));
  });

  it('10. Chooses a as Fourier point (f(a) * f\'\'(a) > 0)', () => {
    // -x^2 + 4: f(-1)=3, f''(-1)=-2 => <0. f(1)=3, f''(1)=-2 => <0.
    // Let's use f(x) = (x-2)^2 - 1 => f''(x)=2. Roots 1, 3.
    // Interval [2.5, 4]. f(2.5) = 0.25*2 - 1 < 0. f(4)=3. f''(4)=2. f(4)*f''(4) > 0. b is chosen.
    // Interval [0, 1.5]. f(0)=3. f''(0)=2. f(0)*f''(0) > 0. a is chosen.
    runTiepTuyen({ fStr: '(x-2)**2 - 1', dfStr: '2*(x-2)', ddfStr: '2', a: '0', b: '1.5', m1: '1', epsilon: '1e-4' }, logger);
    expect(logger.success).toHaveBeenCalledWith(expect.stringContaining('x₀ = a'));
  });
});
