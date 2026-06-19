import type { Logger } from "@/types/solver";
import {
  PIVOT_EPS,
  fmt,
  formatMatrixForLog,
  type NumMatrix,
} from "@/lib/algorithms/lu-core";

// ---------------------------------------------------------------------------
// Kiểm tra ma trận đối xứng
// ---------------------------------------------------------------------------

export function validateSymmetricMatrix(A: NumMatrix, tol = 1e-9): string | null {
  const n = A.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(A[i][j] - A[j][i]) > tol) {
        return `Ma trận không đối xứng: a_{${i + 1}${j + 1}} = ${fmt(A[i][j])} ≠ a_{${j + 1}${i + 1}} = ${fmt(A[j][i])}.`;
      }
    }
  }
  return null;
}

function subscript(i: number, j: number): string {
  return `l_{${i}${j}}`;
}

function subscriptA(i: number, j: number): string {
  return `a_{${i}${j}}`;
}

function sumSquaresCol(j: number, L: NumMatrix): string {
  if (j <= 1) return "";
  const parts: string[] = [];
  for (let k = 1; k <= j - 1; k++) {
    const l = fmt(L[j - 1][k - 1]);
    parts.push(`${l}²`);
  }
  return parts.join(" + ");
}

function sumTermsCol(j: number, i: number, L: NumMatrix): string {
  if (j <= 1) return "";
  const parts: string[] = [];
  for (let k = 1; k <= j - 1; k++) {
    const lik = fmt(L[i - 1][k - 1]);
    const ljk = fmt(L[j - 1][k - 1]);
    parts.push(`${lik}·${ljk}`);
  }
  return parts.join(" + ");
}

// ---------------------------------------------------------------------------
// Phân tách Cholesky: A = L L^T
// ---------------------------------------------------------------------------

export interface CholeskyStepInfo {
  j: number;
  ljj: number;
  diagDetail: string;
  belowDiag: { i: number; value: number; detail: string }[];
  L: NumMatrix;
}

export type CholeskyStepCallback = (step: CholeskyStepInfo) => void;

export function initCholeskyL(n: number): NumMatrix {
  return Array.from({ length: n }, () => Array(n).fill(0));
}

export function decomposeCholesky(
  A: NumMatrix,
  onStep?: CholeskyStepCallback,
): NumMatrix {
  const n = A.length;
  const L = initCholeskyL(n);

  for (let j = 1; j <= n; j++) {
    let sumSq = 0;
    for (let k = 1; k <= j - 1; k++) {
      sumSq += L[j - 1][k - 1] * L[j - 1][k - 1];
    }
    const radicand = A[j - 1][j - 1] - sumSq;
    if (radicand <= PIVOT_EPS) {
      throw new Error(
        `a_{${j}${j}} − Σ l_{${j}k}² = ${fmt(radicand)} ≤ 0 tại cột j = ${j}. Ma trận không xác định dương.`,
      );
    }
    const ljj = Math.sqrt(radicand);
    L[j - 1][j - 1] = ljj;

    let diagDetail: string;
    if (j === 1) {
      diagDetail = `${subscript(j, j)} = √${subscriptA(j, j)} = √${fmt(A[j - 1][j - 1])} = ${fmt(ljj)}`;
    } else {
      const terms = sumSquaresCol(j, L);
      diagDetail = `${subscript(j, j)} = √(${subscriptA(j, j)} − (${terms})) = √${fmt(radicand)} = ${fmt(ljj)}`;
    }

    const belowDiag: CholeskyStepInfo["belowDiag"] = [];

    for (let i = j + 1; i <= n; i++) {
      let sum = 0;
      for (let k = 1; k <= j - 1; k++) {
        sum += L[i - 1][k - 1] * L[j - 1][k - 1];
      }
      const val = (A[i - 1][j - 1] - sum) / ljj;
      L[i - 1][j - 1] = val;

      let detail: string;
      if (j === 1) {
        detail = `${subscript(i, j)} = ${subscriptA(i, j)}/${subscript(j, j)} = ${fmt(A[i - 1][j - 1])}/${fmt(ljj)} = ${fmt(val)}`;
      } else {
        const terms = sumTermsCol(j, i, L);
        detail = `${subscript(i, j)} = (${subscriptA(i, j)} − (${terms}))/${subscript(j, j)} = ${fmt(val)}`;
      }
      belowDiag.push({ i, value: val, detail });
    }

    onStep?.({
      j,
      ljj,
      diagDetail,
      belowDiag,
      L: L.map((row) => [...row]),
    });
  }

  return L;
}

export function verifyCholeskyProduct(L: NumMatrix, A: NumMatrix): number {
  const n = A.length;
  let maxErr = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += L[i][k] * L[j][k];
      }
      maxErr = Math.max(maxErr, Math.abs(sum - A[i][j]));
    }
  }
  return maxErr;
}

// ---------------------------------------------------------------------------
// Giải L^T X = Y (thay thế lùi)
// ---------------------------------------------------------------------------

export interface BackTransposeStep {
  i: number;
  value: number;
  detail: string;
}

export function backSubTranspose(
  L: NumMatrix,
  y: number[],
  onStep?: (step: BackTransposeStep) => void,
): number[] {
  const n = y.length;
  const x = Array(n).fill(0);

  for (let i = n; i >= 1; i--) {
    let sum = 0;
    const terms: string[] = [];
    for (let j = i + 1; j <= n; j++) {
      const lji = L[j - 1][i - 1];
      const term = lji * x[j - 1];
      sum += term;
      if (Math.abs(lji) > PIVOT_EPS) {
        terms.push(`${fmt(lji)}·x_${j}`);
      }
    }
    const val = (y[i - 1] - sum) / L[i - 1][i - 1];
    x[i - 1] = val;

    let detail: string;
    if (i === n) {
      detail = `x_${n} = y_${n}/l_{${n}${n}} = ${fmt(y[n - 1])}/${fmt(L[n - 1][n - 1])} = ${fmt(val)}`;
    } else {
      const termStr = terms.length > 0 ? terms.join(" + ") : "0";
      detail = `x_${i} = (y_${i} − (${termStr}))/l_{${i}${i}} = (${fmt(y[i - 1])} − ${fmt(sum)})/${fmt(L[i - 1][i - 1])} = ${fmt(val)}`;
    }
    onStep?.({ i, value: val, detail });
  }

  return x;
}

// ---------------------------------------------------------------------------
// Logging phân tách Cholesky (dùng chung cho cholesky-decompose và cholesky-solve)
// ---------------------------------------------------------------------------

const VERBOSE_THRESHOLD = 8;

export function logCholeskyDecomposition(
  A: NumMatrix,
  logger: Logger,
  sectionTitle = "PHÂN TÁCH A = LL^T",
): NumMatrix | null {
  const n = A.length;
  const verbose = n <= VERBOSE_THRESHOLD;

  logger.section(sectionTitle);
  logger.info(`Khởi tạo: L tam giác dưới, l_ij = 0 khi i < j.`);

  try {
    const L = decomposeCholesky(A, (step) => {
      logger.step(`j = ${step.j}`);
      logger.formula(
        `l_{${step.j}${step.j}} = √(${subscriptA(step.j, step.j)} − Σ_{k=1}^{${step.j}−1} l_{${step.j}k}²)`,
      );
      logger.info(`  ${step.diagDetail}`);

      if (step.belowDiag.length > 0) {
        logger.formula(
          `l_{ij} = (a_{ij} − Σ_{k=1}^{${step.j}−1} l_{ik}·l_{${step.j}k}) / l_{${step.j}${step.j}}  (i = ${step.j + 1}…${n})`,
        );
        if (verbose) {
          for (const entry of step.belowDiag) {
            logger.info(`  ${entry.detail}`);
          }
        } else {
          const vals = step.belowDiag
            .map((e) => `l_${e.i}${step.j}=${fmt(e.value)}`)
            .join(", ");
          logger.info(`  ${vals}`);
        }
      }

      if (!verbose) {
        logger.text(`Trạng thái L sau j = ${step.j}:`);
        logger.table(formatMatrixForLog(step.L));
      }

      if (step.j < n) logger.separator();
    });

    return L;
  } catch (e) {
    logger.error((e as Error).message);
    return null;
  }
}
