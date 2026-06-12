import type { Logger } from "@/types/solver";

class Complex {
  constructor(public re: number, public im: number = 0) {}
  add(c: Complex) { return new Complex(this.re + c.re, this.im + c.im); }
  sub(c: Complex) { return new Complex(this.re - c.re, this.im - c.im); }
  mul(c: Complex) { return new Complex(this.re * c.re - this.im * c.im, this.re * c.im + this.im * c.re); }
  div(c: Complex) {
    const den = c.re * c.re + c.im * c.im;
    return new Complex((this.re * c.re + this.im * c.im) / den, (this.im * c.re - this.re * c.im) / den);
  }
  abs() { return Math.sqrt(this.re * this.re + this.im * this.im); }
  toString(decimals: number = 4) {
    const r = this.re.toFixed(decimals);
    const i = Math.abs(this.im).toFixed(decimals);
    if (Math.abs(this.im) < 1e-10) return r;
    return `${r} ${this.im >= 0 ? '+' : '-'} ${i}i`;
  }
}

function evaluatePolynomial(coeffs: number[], x: Complex): Complex {
  let res = new Complex(coeffs[0]);
  for (let i = 1; i < coeffs.length; i++) {
    res = res.mul(x).add(new Complex(coeffs[i]));
  }
  return res;
}

function findRootsDurandKerner(coeffs: number[], maxIter: number = 2000, tol: number = 1e-10): Complex[] {
  // P(x) = c_0 x^n + c_1 x^{n-1} + ... + c_n = 0
  // coeffs = [c_0, c_1, ..., c_n]
  const n = coeffs.length - 1;
  if (Math.abs(coeffs[0]) < 1e-14) return []; // not degree n
  
  // Normalize coeffs so leading is 1
  const normCoeffs = coeffs.map(c => c / coeffs[0]);

  // Initial guesses: complex roots around a circle
  // R_k = r * e^{i * theta}
  const roots: Complex[] = [];
  const radius = 1.0 + Math.max(...normCoeffs.map(Math.abs)); // rough bound
  for (let k = 0; k < n; k++) {
    const angle = (2 * Math.PI * k) / n + (0.1234); // slight offset to avoid symmetries
    roots.push(new Complex(Math.cos(angle) * radius, Math.sin(angle) * radius));
  }

  for (let iter = 0; iter < maxIter; iter++) {
    let maxDiff = 0;
    for (let k = 0; k < n; k++) {
      let denom = new Complex(1);
      for (let j = 0; j < n; j++) {
        if (j !== k) {
          denom = denom.mul(roots[k].sub(roots[j]));
        }
      }
      const num = evaluatePolynomial(normCoeffs, roots[k]);
      const diff = num.div(denom);
      roots[k] = roots[k].sub(diff);
      if (diff.abs() > maxDiff) maxDiff = diff.abs();
    }
    if (maxDiff < tol) break;
  }
  return roots;
}

export function runDanilevsky(params: Record<string, string>, logger: Logger) {
  const { matA } = params;

  let A: number[][];
  try {
    A = parseMatrix(matA);
  } catch (e) {
    logger.error("Lỗi đọc ma trận: " + (e as Error).message);
    return;
  }

  const n = A.length;
  if (n === 0) {
    logger.error("Ma trận A không hợp lệ.");
    return;
  }
  for (let i = 0; i < n; i++) {
    if (A[i].length !== n) {
      logger.error(`Ma trận không vuông: Hàng ${i + 1} có ${A[i].length} phần tử, khác với số hàng là ${n}.`);
      return;
    }
  }

  logger.section("MA TRẬN ĐẦU VÀO A");
  logger.table(_formatMatrixForLog(A));

  // Clone matrix
  const M_curr = A.map(row => [...row]);
  let P = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))); // Accumulated transform

  let k = n - 1;
  const polyFactors: number[][] = []; // For Case 3, we collect block polynomials

  while (k > 0) {
    // Look at row k, elements M_curr[k][0...k-1]
    const pVal = M_curr[k][k - 1];

    if (Math.abs(pVal) < 1e-10) {
      // Case 1 or 3
      let s = -1;
      for (let j = 0; j < k - 1; j++) {
        if (Math.abs(M_curr[k][j]) > 1e-10) {
          s = j;
          break;
        }
      }

      if (s !== -1) {
        // Case 1: swap col s and k-1, row s and k-1
        logger.step(`[Hàng ${k + 1}] a(${k + 1},${k}) = 0 nhưng có a(${k + 1},${s + 1}) ≠ 0. TH1: Hoán vị.`);
        
        // C_{s <-> k-1}
        for (let i = 0; i < n; i++) {
          const temp = M_curr[i][s];
          M_curr[i][s] = M_curr[i][k - 1];
          M_curr[i][k - 1] = temp;
        }
        for (let j = 0; j < n; j++) {
          const temp = M_curr[s][j];
          M_curr[s][j] = M_curr[k - 1][j];
          M_curr[k - 1][j] = temp;
        }
        
        // P = P * C
        for (let i = 0; i < n; i++) {
          const temp = P[i][s];
          P[i][s] = P[i][k - 1];
          P[i][k - 1] = temp;
        }

        logger.info(`Đã hoán vị cột/hàng ${s + 1} và ${k}. Ma trận sau hoán vị:`);
        logger.table(_formatMatrixForLog(M_curr));
        // Don't decrement k, process this row again (now it falls into Case 2)
        continue;
      } else {
        // Case 3: all elements left of diagonal are 0
        logger.step(`[Hàng ${k + 1}] Toàn bộ phần tử bên trái đường chéo đều bằng 0. TH3: Giảm bậc khối.`);
        logger.formula(`Đa thức tích lũy có thêm nhân tử: (${M_curr[k][k].toFixed(4)} - λ)`);
        polyFactors.push([-1, M_curr[k][k]]); // -lambda + a_kk -> coeffs: [-1, a_kk]
        k--;
        continue;
      }
    }

    // Case 2: pVal != 0
    logger.step(`[Hàng ${k + 1}] Chọn phần tử kề chéo a(${k + 1},${k}) = ${pVal.toFixed(4)}. TH2: Khử Frobenius.`);
    const M_inv: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
    const M_mat: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));

    for (let j = 0; j < n; j++) {
      M_mat[k - 1][j] = M_curr[k][j];
      if (j === k - 1) {
        M_inv[k - 1][j] = 1 / pVal;
      } else {
        M_inv[k - 1][j] = -M_curr[k][j] / pVal;
      }
    }

    // A = M_mat * A * M_inv
    const temp = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let l = 0; l < n; l++) sum += M_mat[i][l] * M_curr[l][j];
        temp[i][j] = sum;
      }
    }
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let l = 0; l < n; l++) sum += temp[i][l] * M_inv[l][j];
        M_curr[i][j] = sum;
      }
    }

    // P = P * M_inv
    const tempP = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let l = 0; l < n; l++) sum += P[i][l] * M_inv[l][j];
        tempP[i][j] = sum;
      }
    }
    P = tempP;

    logger.table(_formatMatrixForLog(M_curr));
    k--;
  }

  logger.section("DẠNG CHUẨN FROBENIUS");
  logger.table(_formatMatrixForLog(M_curr));

  // Extract Frobenius polynomial from top row of the block (from 0 to remaining k+1 size)
  // Actually, the main block is from 0 to top_k where top_k is the index we stopped + 1. 
  // Wait, if it didn't split, it's just M_curr[0][0...n-1].
  // M_curr[0] has -p_1, -p_2, ..., -p_m. The polynomial is (-1)^m [lambda^m + p_1 lambda^{m-1} + ... + p_m]
  const polynomials: number[][] = [...polyFactors];
  
  let i = 0;
  while (i < n) {
    // Find size of the frobenius block starting at i
    let blockSize = 1;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(M_curr[j][j - 1] - 1) < 1e-10) {
        blockSize++;
      } else {
        break;
      }
    }
    
    // Extract polynomial for this block
    // M_curr[i] contains the coefficients for this block.
    // The coeffs are -p_1, -p_2, ..., -p_{blockSize}
    // So p_j = -M_curr[i][i + j - 1]
    // Polynomial: lambda^{blockSize} - M_curr[i][i] lambda^{blockSize-1} - M_curr[i][i+1] lambda^{blockSize-2} ...
    const poly = [1]; // lambda^blockSize
    for (let c = 0; c < blockSize; c++) {
      poly.push(-M_curr[i][i + c]);
    }
    // Adjust sign: (-1)^blockSize. But roots are the same, so we just use the monic polynomial for roots.
    // However, for the characteristic polynomial expression, we need (-1)^n overall.
    polynomials.push(poly);
    
    i += blockSize;
  }

  // Multiply all polynomials together
  let charPoly = polynomials[0];
  for (let pIdx = 1; pIdx < polynomials.length; pIdx++) {
    const p1 = charPoly;
    const p2 = polynomials[pIdx];
    const res = new Array(p1.length + p2.length - 1).fill(0);
    for (let idx1 = 0; idx1 < p1.length; idx1++) {
      for (let idx2 = 0; idx2 < p2.length; idx2++) {
        res[idx1 + idx2] += p1[idx1] * p2[idx2];
      }
    }
    charPoly = res;
  }

  // Calculate roots
  const roots = findRootsDurandKerner(charPoly);

  // Formatting characteristic polynomial string
  let polyStr = "";
  const degree = charPoly.length - 1;
  const overallSign = n % 2 === 0 ? 1 : -1;
  
  for (let idx = 0; idx < charPoly.length; idx++) {
    const coeff = charPoly[idx] * overallSign;
    if (Math.abs(coeff) < 1e-10) continue;
    
    const power = degree - idx;
    let termStr = "";
    
    const absCoeff = Math.abs(coeff);
    const signStr = coeff < 0 ? "-" : (polyStr === "" ? "" : "+");
    
    if (absCoeff !== 1 || power === 0) {
      termStr = absCoeff.toFixed(4);
    }
    
    if (power > 0) {
      termStr += "λ";
      if (power > 1) {
        termStr += `^${power}`;
      }
    }
    
    if (polyStr === "") {
      polyStr += (coeff < 0 ? "-" : "") + termStr;
    } else {
      polyStr += ` ${signStr} ${termStr}`;
    }
  }

  if (polyStr === "") polyStr = "0";

  logger.section("KẾT QUẢ");
  logger.result(`Đa thức đặc trưng: P(λ) = ${n % 2 === 0 ? "" : "-("}${polyStr.replace(/^-/, "")}${n % 2 === 0 ? "" : ")"}`);
  
  // Clean up roots to format
  logger.success(`✔ Tìm được ${roots.length} giá trị riêng (nghiệm):`);
  roots.forEach((r, idx) => {
    // try to make small numbers 0
    let re = r.re;
    let im = r.im;
    if (Math.abs(re) < 1e-5) re = 0;
    if (Math.abs(im) < 1e-5) im = 0;
    const formatted = new Complex(re, im).toString(4);
    logger.info(`  λ${idx + 1} = ${formatted}`);
  });
}

function parseMatrix(text: string): number[][] {
  const lines = text.trim().split("\n").filter(l => l.trim() !== "");
  return lines.map((line, i) => {
    const vals = line.trim().split(/[\s,;]+/).map(v => {
      const n = parseFloat(v);
      if (isNaN(n)) throw new Error(`Giá trị không hợp lệ "${v}" ở hàng ${i + 1}`);
      return n;
    });
    return vals;
  });
}

function _formatMatrixForLog(M: number[][]): Record<string, string>[] {
  return M.map((row, rIdx) => {
    const obj: Record<string, string> = { "Hàng": `H${rIdx + 1}` };
    row.forEach((val, cIdx) => {
      obj[`Cột ${cIdx + 1}`] = Math.abs(val) < 1e-10 ? "0.0000" : val.toFixed(4);
    });
    return obj;
  });
}
