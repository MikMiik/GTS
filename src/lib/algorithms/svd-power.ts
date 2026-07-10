import { getPrecisionByEpsilon, parseFraction } from "./math-utils";
import type { Logger } from "@/types/solver";

type Mat = number[][];

function parseMatrix(raw: string): Mat {
  return raw
    .trim()
    .split("\n")
    .map((row) =>
      row
        .trim()
        .split(/[\s,]+/)
        .map((v) => {
          const n = parseFraction(v);
          if (isNaN(n)) throw new Error(`Giá trị không hợp lệ: "${v}"`);
          return n;
        }),
    );
}

function parseVector(raw: string): number[] {
  return raw
    .trim()
    .split(/[\s,]+/)
    .map((v) => {
      const n = parseFraction(v);
      if (isNaN(n)) throw new Error(`Giá trị không hợp lệ: "${v}"`);
      return n;
    });
}

function transpose(A: Mat): Mat {
  const m = A.length,
    n = A[0].length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) => A[j][i]),
  );
}

function matMul(A: Mat, B: Mat): Mat {
  const m = A.length,
    k = A[0].length,
    n = B[0].length;
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      Array.from({ length: k }, (_, p) => A[i][p] * B[p][j]).reduce(
        (a, b) => a + b,
        0,
      ),
    ),
  );
}

function matVecMul(A: Mat, x: number[]): number[] {
  return A.map((row) => row.reduce((sum, aij, j) => sum + aij * x[j], 0));
}

function dot(a: number[], b: number[]): number {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

function norm(v: number[]): number {
  return Math.sqrt(dot(v, v));
}

function scale(v: number[], s: number): number[] {
  return v.map((x) => x * s);
}

function sub(a: number[], b: number[]): number[] {
  return a.map((x, i) => x - b[i]);
}

function subMat(A: Mat, B: Mat): Mat {
  return A.map((row, i) => row.map((val, j) => val - B[i][j]));
}

function addMat(A: Mat, B: Mat): Mat {
  return A.map((row, i) => row.map((val, j) => val + B[i][j]));
}

function outerProduct(u: number[], v: number[]): Mat {
  return u.map((ui) => v.map((vj) => ui * vj));
}

function getLargestAbsElement(v: number[]): number {
  let maxAbs = -1;
  let maxVal = 0;
  for (let i = 0; i < v.length; i++) {
    if (Math.abs(v[i]) > maxAbs) {
      maxAbs = Math.abs(v[i]);
      maxVal = v[i];
    }
  }
  return maxVal;
}

function nullSpaceBasis(M: Mat, tol = 1e-10): number[][] {
  const m = M.length,
    n = M[0].length;
  const A = M.map((r) => [...r]);
  const pivotCols: number[] = [];
  let row = 0;
  for (let col = 0; col < n && row < m; col++) {
    let maxRow = row;
    for (let r = row + 1; r < m; r++) {
      if (Math.abs(A[r][col]) > Math.abs(A[maxRow][col])) maxRow = r;
    }
    if (Math.abs(A[maxRow][col]) < tol) continue;
    [A[row], A[maxRow]] = [A[maxRow], A[row]];
    const pivot = A[row][col];
    for (let j = col; j < n; j++) A[row][j] /= pivot;
    for (let r = 0; r < m; r++) {
      if (r === row) continue;
      const factor = A[r][col];
      for (let j = col; j < n; j++) A[r][j] -= factor * A[row][j];
    }
    pivotCols.push(col);
    row++;
  }
  const freeCols = Array.from({ length: n }, (_, i) => i).filter(
    (c) => !pivotCols.includes(c),
  );
  return freeCols.map((freeCol) => {
    const x = new Array(n).fill(0);
    x[freeCol] = 1;
    for (let r = 0; r < pivotCols.length; r++) {
      const pc = pivotCols[r];
      x[pc] = -A[r][freeCol];
    }
    // normalize
    const nX = norm(x);
    return nX > tol ? scale(x, 1 / nX) : x;
  });
}

function fmtNum(v: number, decimals = 5): string {
  if (Math.abs(v) < 1e-10) return "0";
  return parseFloat(v.toFixed(decimals)).toString();
}

function fmtVec(v: number[], d?: number): string {
  return v.map((x) => fmtNum(x, d)).join(" & ");
}

function fmtMat(M: Mat, d?: number): string {
  const rows = M.map((r) => r.map((x) => fmtNum(x, d)).join(" & "));
  return `\\begin{bmatrix} ${rows.join(" \\\\ ")} \\end{bmatrix}`;
}

export function runSvdPower(
  params: Record<string, string>,
  logger: Logger,
): void {
  const {
    matA,
    x0Str,
    epsilon,
    maxIter: maxIterStr,
    truncationR,
    targetErrorPct,
  } = params;

  let A: Mat;
  let x0: number[];
  let eps: number;
  let maxIter: number;
  const tR = truncationR ? parseInt(truncationR, 10) : NaN;
  const tErr = targetErrorPct ? parseFloat(targetErrorPct) : NaN;

  try {
    A = parseMatrix(matA);
    x0 = parseVector(x0Str);
    eps = parseFraction(epsilon);
    maxIter = parseInt(maxIterStr, 10);
  } catch (e) {
    logger.error("Lỗi đọc dữ liệu: " + (e as Error).message);
    return;
  }

  const { tableDecimals } = getPrecisionByEpsilon(eps);
  const m = A.length;
  const n = A[0].length;

  if (x0.length !== n) {
    logger.error(
      `Véc-tơ khởi tạo x₀ phải có số phần tử bằng số cột của A (${n}).`,
    );
    return;
  }

  logger.section("THÔNG TIN ĐẦU VÀO");
  logger.formula(`$$A = ${fmtMat(A, tableDecimals)}$$`);
  logger.info(`Kích thước: $${m} \\times ${n}$`);
  logger.formula(
    `$$x_0 = \\begin{bmatrix} ${fmtVec(x0, tableDecimals)} \\end{bmatrix}^T$$`,
  );
  logger.info(`$$\\varepsilon = ${eps}, N_{\\max} = ${maxIter}$$`);

  logger.step("**Bước 1: Tính ma trận $A^TA$**");
  const At = transpose(A);
  let M = matMul(At, A);
  logger.formula(`$$A^T A = ${fmtMat(M, tableDecimals)}$$`);

  logger.step("**Bước 2: Tìm các giá trị riêng bằng Lũy thừa và Xuống thang**");

  const eigenValues: number[] = [];
  const eigenVectors: number[][] = [];
  const rMax = Math.min(m, n);

  for (let step = 1; step <= rMax; step++) {
    logger.text(`--- **Tìm $\\lambda_{${step}}$ (Lần lặp lớn ${step})** ---`);
    if (step > 1) {
      logger.text(
        `Sử dụng phương pháp xuống thang (Hotelling Deflation) cho ma trận đối xứng:`,
      );
      const lamPrev = eigenValues[step - 2];
      const vPrev = eigenVectors[step - 2];
      const term = outerProduct(vPrev, vPrev).map((row) => scale(row, lamPrev));
      M = subMat(M, term);
      logger.formula(
        `$$M_{${step}} = M_{${step - 1}} - \\lambda_{${step - 1}} v_{${step - 1}} v_{${step - 1}}^T = ${fmtMat(M, tableDecimals)}$$`,
      );
    }

    let x = [...x0];
    let k = 0;
    let converged = false;
    let mk = 0;
    const tableData: Record<string, unknown>[] = [];
    const xCols0 = Object.fromEntries(
      x.map((_, i) => [`$(x_k)_{${i + 1}}$`, fmtNum(x[i], tableDecimals)]),
    );
    tableData.push({
      $k$: k,
      ...xCols0,
      $m_k$: "—",
      "$\\|x_k - x_{k-1}\\|_\\infty$": "—",
    });

    for (k = 1; k <= maxIter; k++) {
      const y = matVecMul(M, x);
      mk = getLargestAbsElement(y);

      if (Math.abs(mk) < 1e-15) {
        break; // Zero matrix -> lambda is 0
      }

      const xNext = scale(y, 1 / mk);
      let err = 0;
      for (let i = 0; i < n; i++) {
        err = Math.max(err, Math.abs(xNext[i] - x[i]));
      }

      const xCols = Object.fromEntries(
        xNext.map((_, i) => [
          `$(x_k)_{${i + 1}}$`,
          fmtNum(xNext[i], tableDecimals),
        ]),
      );
      tableData.push({
        $k$: k,
        ...xCols,
        $m_k$: fmtNum(mk, tableDecimals),
        "$\\|x_k - x_{k-1}\\|_\\infty$": fmtNum(err, tableDecimals),
      });

      x = xNext;

      if (err < eps) {
        converged = true;
        break;
      }
    }

    if (Math.abs(mk) < 1e-8) {
      logger.info(
        `Ma trận phần dư xấp xỉ 0 $\\implies \\lambda_{${step}} \\approx 0$. Dừng tìm trị riêng.`,
      );
      break;
    }

    if (!converged) {
      logger.warn(
        `Lũy thừa không hội tụ sau ${maxIter} bước tại $\\lambda_{${step}}$. Thuật toán không đảm bảo chính xác.`,
      );
    }

    logger.table(tableData);
    logger.result(
      `$$\\lambda_{${step}} \\approx ${fmtNum(mk, tableDecimals)}$$`,
    );

    // Normalize v_k to norm 2
    const nX = norm(x);
    const v = scale(x, 1 / nX);
    logger.text(`Véc-tơ riêng trực chuẩn (chuẩn 2 = 1):`);
    logger.formula(
      `$$v_{${step}} = \\begin{bmatrix} ${fmtVec(v, tableDecimals)} \\end{bmatrix}^T$$`,
    );

    eigenValues.push(mk);
    eigenVectors.push(v);
  }

  const r = eigenValues.length;
  logger.info(`Hạng của ma trận $A$ được xác định là: $r = ${r}$`);

  // Fill remaining null space if r < n
  if (r < n) {
    logger.text(
      `Bổ sung ${n - r} véc-tơ cho cơ sở không gian null của $A^TA$ để lập $V$:`,
    );
    const nullBasis = nullSpaceBasis(matMul(At, A), 1e-7);
    // Find vectors orthogonal to existing eigenVectors
    for (const nb of nullBasis) {
      let u = [...nb];
      for (const ev of eigenVectors) {
        u = sub(u, scale(ev, dot(u, ev)));
      }
      const nU = norm(u);
      if (nU > 1e-7) {
        const v = scale(u, 1 / nU);
        eigenVectors.push(v);
        logger.formula(
          `$$v_{${eigenVectors.length}} = \\begin{bmatrix} ${fmtVec(v, tableDecimals)} \\end{bmatrix}^T$$`,
        );
      }
      if (eigenVectors.length === n) break;
    }
  }

  logger.step("**Bước 3 & 4: Lập ma trận $\\Sigma$ và $V$**");
  const Sigma = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < r; i++) {
    Sigma[i][i] = Math.sqrt(eigenValues[i]);
  }
  logger.formula(`$$\\Sigma = ${fmtMat(Sigma, tableDecimals)}$$`);
  const V = transpose(eigenVectors);
  logger.formula(`$$V = ${fmtMat(V, tableDecimals)}$$`);

  logger.step("**Bước 5: Lập ma trận $U$**");
  const UCols: number[][] = [];
  for (let i = 0; i < r; i++) {
    const Av = matVecMul(A, eigenVectors[i]);
    const ui = scale(Av, 1 / Math.sqrt(eigenValues[i]));
    UCols.push(ui);
    logger.text(
      `$$u_{${i + 1}} = \\frac{1}{\\sigma_{${i + 1}}} A v_{${i + 1}} = \\begin{bmatrix} ${fmtVec(ui, tableDecimals)} \\end{bmatrix}^T$$`,
    );
  }

  if (r < m) {
    logger.text(`Bổ sung ${m - r} véc-tơ bằng cách giải $(AA^T)u = 0$`);
    const AAt = matMul(A, At);
    const nullBasis = nullSpaceBasis(AAt, 1e-7);
    for (const nb of nullBasis) {
      let u = [...nb];
      for (const euc of UCols) {
        u = sub(u, scale(euc, dot(u, euc)));
      }
      const nU = norm(u);
      if (nU > 1e-7) {
        const ui = scale(u, 1 / nU);
        UCols.push(ui);
        logger.text(
          `$$u_{${UCols.length}} = \\begin{bmatrix} ${fmtVec(ui, tableDecimals)} \\end{bmatrix}^T$$`,
        );
      }
      if (UCols.length === m) break;
    }
  }

  const U = transpose(UCols);
  logger.formula(`$$U = ${fmtMat(U, tableDecimals)}$$`);

  logger.step("**Bước 6: Khai triển SVD**");
  logger.formula(`$$A = U \\Sigma V^T$$`);

  // Bổ sung kết luận tường minh cho Đề thi
  if (r > 0) {
    logger.section("KẾT LUẬN GIÁ TRỊ VÀ VECTOR KỲ DỊ LỚN NHẤT");
    logger.text(
      "Theo yêu cầu phổ biến của các đề thi, dưới đây là kết quả trích xuất phần tử trội nhất (ứng với $\\sigma_1$):",
    );
    logger.formula(
      `- **Giá trị kỳ dị lớn nhất:** $\\sigma_1 = ${fmtNum(Math.sqrt(eigenValues[0]), tableDecimals)}$`,
    );
    logger.formula(
      `- **Vector kỳ dị phải (tương ứng $\\sigma_1$):** $v_1 = \\begin{bmatrix} ${fmtVec(eigenVectors[0], tableDecimals)} \\end{bmatrix}^T$`,
    );
    logger.formula(
      `- **Vector kỳ dị trái (tương ứng $\\sigma_1$):** $u_1 = \\begin{bmatrix} ${fmtVec(UCols[0], tableDecimals)} \\end{bmatrix}^T$`,
    );
  }

  // --- BƯỚC 7: XẤP XỈ MA TRẬN (SVD TRUNCATION) ---
  if (!isNaN(tR) || !isNaN(tErr)) {
    logger.step("**Bước 7: Xấp xỉ ma trận (SVD Truncation)**");

    // Tính tổng bình phương các giá trị kỳ dị = ||A||_F^2
    const totalVariance = eigenValues.reduce((sum, val) => sum + val, 0);
    const normAF = Math.sqrt(totalVariance);
    logger.formula(
      `$$\\|A\\|_F = \\sqrt{\\sum_{i=1}^{${r}} \\sigma_i^2} = ${fmtNum(normAF, tableDecimals)}$$`,
    );

    let finalR = 1;
    if (!isNaN(tErr)) {
      // Tìm r theo sai số
      logger.text(
        `Mục tiêu: Tìm bậc xấp xỉ $r$ sao cho sai số tương đối $\\le ${tErr}\\%$`,
      );
      for (let currR = 1; currR <= r; currR++) {
        const explainedVar = eigenValues
          .slice(0, currR)
          .reduce((sum, val) => sum + val, 0);
        const errVar = totalVariance - explainedVar;
        const errNorm = Math.sqrt(Math.max(0, errVar));
        const errPct = (errNorm / normAF) * 100;
        logger.text(
          `- Tại $r = ${currR}$, Sai số = $\\frac{\\sqrt{\\sum_{i=${currR + 1}}^{${r}} \\sigma_i^2}}{\\|A\\|_F} \\approx ${fmtNum(errPct, 2)}\\%$`,
        );

        finalR = currR;
        if (errPct <= tErr) {
          logger.text(
            `$\\rightarrow$ Chọn bậc xấp xỉ $r = ${currR}$ (Thỏa mãn $\\le ${tErr}\\%$)`,
          );
          break;
        }
      }
    } else if (!isNaN(tR)) {
      finalR = Math.max(1, Math.min(tR, r));
      logger.text(`Người dùng yêu cầu bậc xấp xỉ $r = ${finalR}$.`);
    }

    // Tái tạo ma trận
    let A_approx = Array.from({ length: m }, () => new Array(n).fill(0));
    for (let i = 0; i < finalR; i++) {
      const u_i = UCols[i];
      const v_i = eigenVectors[i];
      const sigma_i = Math.sqrt(eigenValues[i]);
      const outer = outerProduct(u_i, v_i).map((row) => scale(row, sigma_i));
      A_approx = addMat(A_approx, outer);
    }

    logger.text(
      `Ma trận xấp xỉ $\\hat{A}_{${finalR}} = \\sum_{i=1}^{${finalR}} \\sigma_i u_i v_i^T$:`,
    );
    logger.formula(
      `$$\\hat{A}_{${finalR}} = ${fmtMat(A_approx, tableDecimals)}$$`,
    );
  }
}
