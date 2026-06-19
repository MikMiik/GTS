import type { Logger } from "@/types/solver";

export type NumMatrix = number[][];

export const TABLE_DECIMALS = 4;
export const PIVOT_EPS = 1e-10;

// ---------------------------------------------------------------------------
// Parse đầu vào
// ---------------------------------------------------------------------------

export function parseMatrix(text: string): NumMatrix {
  const lines = text.trim().split("\n").filter((l) => l.trim() !== "");
  if (lines.length === 0) throw new Error("Ma trận không được rỗng");
  return lines.map((line, i) => {
    const vals = line.trim().split(/[\s,;]+/).map((v) => {
      const n = parseFloat(v);
      if (isNaN(n)) throw new Error(`Giá trị không hợp lệ "${v}" ở hàng ${i + 1}`);
      return n;
    });
    return vals;
  });
}

export function parseVector(text: string): number[] {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Vector không được rỗng");
  if (trimmed.includes("\n")) {
    return trimmed
      .split("\n")
      .filter((l) => l.trim() !== "")
      .map((line, i) => {
        const parts = line.trim().split(/[\s,;]+/);
        if (parts.length !== 1) {
          throw new Error(`Mỗi dòng chỉ chứa 1 giá trị (lỗi ở dòng ${i + 1})`);
        }
        const n = parseFloat(parts[0]);
        if (isNaN(n)) throw new Error(`Giá trị không hợp lệ "${parts[0]}" ở dòng ${i + 1}`);
        return n;
      });
  }
  return trimmed.split(/[\s,;]+/).map((v) => {
    const n = parseFloat(v);
    if (isNaN(n)) throw new Error(`Giá trị "${v}" không hợp lệ`);
    return n;
  });
}

export function validateSquareMatrix(A: NumMatrix): string | null {
  if (A.length === 0) return "Ma trận A không hợp lệ.";
  const n = A[0].length;
  if (n === 0) return "Ma trận A không hợp lệ.";
  for (let i = 0; i < A.length; i++) {
    if (A[i].length !== n) return `Hàng ${i + 1} có ${A[i].length} cột, cần ${n} cột (ma trận vuông).`;
  }
  if (A.length !== n) return `Ma trận phải vuông: ${A.length} hàng × ${n} cột.`;
  return null;
}

// ---------------------------------------------------------------------------
// Định dạng số
// ---------------------------------------------------------------------------

export function fmt(v: number, d = TABLE_DECIMALS): string {
  if (!Number.isFinite(v)) return String(v);
  if (Math.abs(v) < 1e-15) return "0";
  return v.toFixed(d);
}

export function formatVec(vec: number[]): string {
  return `[${vec.map((v) => fmt(v)).join(", ")}]`;
}

export function formatMatrixForLog(m: NumMatrix): Record<string, string>[] {
  const cols = m[0]?.length ?? 0;
  return m.map((row, i) => {
    const obj: Record<string, string> = { hàng: String(i + 1) };
    for (let j = 0; j < cols; j++) {
      obj[`c${j + 1}`] = fmt(row[j]);
    }
    return obj;
  });
}

function subscript(i: number, j: number): string {
  return `l_{${i}${j}}`;
}

function subscriptU(i: number, j: number): string {
  return `u_{${i}${j}}`;
}

function subscriptA(i: number, j: number): string {
  return `a_{${i}${j}}`;
}

function sumTermsLCol(k: number, i: number, L: NumMatrix, U: NumMatrix): string {
  if (k <= 1) return "";
  const parts: string[] = [];
  for (let m = 1; m <= k - 1; m++) {
    const l = fmt(L[i - 1][m - 1]);
    const u = fmt(U[m - 1][k - 1]);
    parts.push(`${l}·${u}`);
  }
  return parts.join(" + ");
}

function sumTermsURow(k: number, j: number, L: NumMatrix, U: NumMatrix): string {
  if (k <= 1) return "";
  const parts: string[] = [];
  for (let m = 1; m <= k - 1; m++) {
    const l = fmt(L[k - 1][m - 1]);
    const u = fmt(U[m - 1][j - 1]);
    parts.push(`${l}·${u}`);
  }
  return parts.join(" + ");
}

// ---------------------------------------------------------------------------
// Phân tách LU (Doolittle: u_ii = 1)
// ---------------------------------------------------------------------------

export interface LuStepInfo {
  k: number;
  lColumn: { i: number; value: number; detail: string }[];
  uRow: { j: number; value: number; detail: string }[];
  lkk: number;
  L: NumMatrix;
  U: NumMatrix;
}

export type LuStepCallback = (step: LuStepInfo) => void;

export function initLU(n: number): { L: NumMatrix; U: NumMatrix } {
  const L: NumMatrix = Array.from({ length: n }, () => Array(n).fill(0));
  const U: NumMatrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
  return { L, U };
}

export function decomposeLU(
  A: NumMatrix,
  onStep?: LuStepCallback,
): { L: NumMatrix; U: NumMatrix } {
  const n = A.length;
  const { L, U } = initLU(n);

  for (let k = 1; k <= n; k++) {
    const lColumn: LuStepInfo["lColumn"] = [];
    const uRow: LuStepInfo["uRow"] = [];

    for (let i = k; i <= n; i++) {
      let sum = 0;
      for (let m = 1; m <= k - 1; m++) {
        sum += L[i - 1][m - 1] * U[m - 1][k - 1];
      }
      const val = A[i - 1][k - 1] - sum;
      L[i - 1][k - 1] = val;

      let detail: string;
      if (k === 1) {
        detail = `${subscript(i, k)} = ${subscriptA(i, k)} = ${fmt(A[i - 1][k - 1])}`;
      } else {
        const terms = sumTermsLCol(k, i, L, U);
        detail = `${subscript(i, k)} = ${subscriptA(i, k)} − (${terms}) = ${fmt(val)}`;
      }
      lColumn.push({ i, value: val, detail });
    }

    const lkk = L[k - 1][k - 1];
    if (Math.abs(lkk) < PIVOT_EPS) {
      throw new Error(
        `Phần tử khử l_{${k}${k}} = ${fmt(lkk)} ≈ 0 tại bước k = ${k}. Không thể phân tách LU (không pivot).`,
      );
    }

    for (let j = k + 1; j <= n; j++) {
      let sum = 0;
      for (let m = 1; m <= k - 1; m++) {
        sum += L[k - 1][m - 1] * U[m - 1][j - 1];
      }
      const val = (A[k - 1][j - 1] - sum) / lkk;
      U[k - 1][j - 1] = val;

      let detail: string;
      if (k === 1) {
        detail = `${subscriptU(k, j)} = ${subscriptA(k, j)}/${subscript(k, k)} = ${fmt(A[k - 1][j - 1])}/${fmt(lkk)} = ${fmt(val)}`;
      } else {
        const terms = sumTermsURow(k, j, L, U);
        detail = `${subscriptU(k, j)} = (${subscriptA(k, j)} − (${terms}))/${subscript(k, k)} = ${fmt(val)}`;
      }
      uRow.push({ j, value: val, detail });
    }

    onStep?.({
      k,
      lColumn,
      uRow,
      lkk,
      L: L.map((row) => [...row]),
      U: U.map((row) => [...row]),
    });
  }

  return { L, U };
}

export function verifyProduct(L: NumMatrix, U: NumMatrix, A: NumMatrix): number {
  const n = A.length;
  let maxErr = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let m = 0; m < n; m++) sum += L[i][m] * U[m][j];
      maxErr = Math.max(maxErr, Math.abs(sum - A[i][j]));
    }
  }
  return maxErr;
}

// ---------------------------------------------------------------------------
// Giải LY = B (thay thế tiến) và UX = Y (thay thế lùi)
// ---------------------------------------------------------------------------

export interface ForwardStep {
  i: number;
  value: number;
  detail: string;
}

export interface BackStep {
  i: number;
  value: number;
  detail: string;
}

export function forwardSub(
  L: NumMatrix,
  b: number[],
  onStep?: (step: ForwardStep) => void,
): number[] {
  const n = b.length;
  const y = Array(n).fill(0);

  for (let i = 1; i <= n; i++) {
    let sum = 0;
    const terms: string[] = [];
    for (let j = 1; j <= i - 1; j++) {
      const term = L[i - 1][j - 1] * y[j - 1];
      sum += term;
      if (Math.abs(L[i - 1][j - 1]) > PIVOT_EPS) {
        terms.push(`${fmt(L[i - 1][j - 1])}·y_${j}`);
      }
    }
    const val = (b[i - 1] - sum) / L[i - 1][i - 1];
    y[i - 1] = val;

    let detail: string;
    if (i === 1) {
      detail = `y_1 = b_1/l_{11} = ${fmt(b[0])}/${fmt(L[0][0])} = ${fmt(val)}`;
    } else {
      const termStr = terms.length > 0 ? terms.join(" + ") : "0";
      detail = `y_${i} = (b_${i} − (${termStr}))/l_{${i}${i}} = (${fmt(b[i - 1])} − ${fmt(sum)})/${fmt(L[i - 1][i - 1])} = ${fmt(val)}`;
    }
    onStep?.({ i, value: val, detail });
  }

  return y;
}

export function backSub(
  U: NumMatrix,
  y: number[],
  onStep?: (step: BackStep) => void,
): number[] {
  const n = y.length;
  const x = Array(n).fill(0);

  for (let i = n; i >= 1; i--) {
    let sum = 0;
    const terms: string[] = [];
    for (let j = i + 1; j <= n; j++) {
      const term = U[i - 1][j - 1] * x[j - 1];
      sum += term;
      if (Math.abs(U[i - 1][j - 1]) > PIVOT_EPS) {
        terms.push(`${fmt(U[i - 1][j - 1])}·x_${j}`);
      }
    }
    const val = y[i - 1] - sum;
    x[i - 1] = val;

    let detail: string;
    if (i === n) {
      detail = `x_${n} = y_${n} = ${fmt(val)}`;
    } else {
      const termStr = terms.length > 0 ? terms.join(" + ") : "0";
      detail = `x_${i} = y_${i} − (${termStr}) = ${fmt(y[i - 1])} − ${fmt(sum)} = ${fmt(val)}`;
    }
    onStep?.({ i, value: val, detail });
  }

  return x;
}

// ---------------------------------------------------------------------------
// Logging phân tách LU (dùng chung cho lu-decompose và lu-solve)
// ---------------------------------------------------------------------------

const VERBOSE_THRESHOLD = 8;

export function logLuDecomposition(
  A: NumMatrix,
  logger: Logger,
  sectionTitle = "PHÂN TÁCH A = LU",
): { L: NumMatrix; U: NumMatrix } | null {
  const n = A.length;
  const verbose = n <= VERBOSE_THRESHOLD;

  logger.section(sectionTitle);
  logger.info(`Khởi tạo: U có u_ii = 1; L có l_ij = 0 khi i < j.`);

  try {
    const { L, U } = decomposeLU(A, (step) => {
      logger.step(`k = ${step.k}`);
      logger.formula(
        `Cột ${step.k} của L: l_ik = a_ik − Σ_{m=1}^{k−1} l_im u_mk  (i = ${step.k}…${n})`,
      );
      if (verbose) {
        for (const entry of step.lColumn) {
          logger.info(`  ${entry.detail}`);
        }
      } else {
        const vals = step.lColumn.map((e) => `l_${e.i}${step.k}=${fmt(e.value)}`).join(", ");
        logger.info(`  ${vals}`);
      }

      if (step.k < n) {
        logger.formula(
          `Dòng ${step.k} của U: u_kj = (a_kj − Σ_{m=1}^{k−1} l_km u_mj) / l_{${step.k}${step.k}}  (j = ${step.k + 1}…${n})`,
        );
        if (step.uRow.length === 0) {
          logger.info(`  (không có phần tử ngoài đường chéo)`);
        } else if (verbose) {
          for (const entry of step.uRow) {
            logger.info(`  ${entry.detail}`);
          }
        } else {
          const vals = step.uRow.map((e) => `u_${step.k}${e.j}=${fmt(e.value)}`).join(", ");
          logger.info(`  ${vals}`);
        }
      }

      if (!verbose) {
        logger.text(`Trạng thái L, U sau k = ${step.k}:`);
        logger.table(formatMatrixForLog(step.L));
        logger.table(formatMatrixForLog(step.U));
      }

      if (step.k < n) logger.separator();
    });

    return { L, U };
  } catch (e) {
    logger.error((e as Error).message);
    return null;
  }
}
