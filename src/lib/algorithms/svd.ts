import { create, all } from "mathjs";
import { parseFraction } from "./math-utils";
import type { Logger } from "@/types/solver";

const math = create(all);

type Mat = number[][];

// ─── Matrix helpers ──────────────────────────────────────────────────────────

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
        })
    );
}

function transpose(A: Mat): Mat {
  const m = A.length, n = A[0].length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) => A[j][i])
  );
}

function matMul(A: Mat, B: Mat): Mat {
  const m = A.length, k = A[0].length, n = B[0].length;
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      Array.from({ length: k }, (_, p) => A[i][p] * B[p][j]).reduce((a, b) => a + b, 0)
    )
  );
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

/** Gram-Schmidt trực chuẩn hóa một tập vector cột */
function gramSchmidt(vecs: number[][]): number[][] {
  const result: number[][] = [];
  for (const v of vecs) {
    let u = [...v];
    for (const e of result) {
      const proj = scale(e, dot(e, u));
      u = sub(u, proj);
    }
    const n = norm(u);
    if (n > 1e-12) result.push(scale(u, 1 / n));
  }
  return result;
}

/** Tìm các vector cơ sở cho null space của M bằng Gaussian elimination */
function nullSpaceBasis(M: Mat, tol = 1e-10): number[][] {
  const m = M.length, n = M[0].length;
  // Copy and row-reduce
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
    (c) => !pivotCols.includes(c)
  );
  return freeCols.map((freeCol) => {
    const x = new Array(n).fill(0);
    x[freeCol] = 1;
    for (let r = 0; r < pivotCols.length; r++) {
      const pc = pivotCols[r];
      x[pc] = -A[r][freeCol];
    }
    return x;
  });
}

function fmtNum(v: number, decimals = 6): string {
  if (Math.abs(v) < 1e-10) return "0";
  const r = parseFloat(v.toFixed(decimals));
  return String(r);
}

function fmtVec(v: number[]): string {
  return v.map((x) => fmtNum(x)).join(" & ");
}

function fmtMat(M: Mat): string {
  const rows = M.map((r) => r.map((x) => fmtNum(x)).join(" & "));
  return `\\begin{bmatrix} ${rows.join(" \\\\ ")} \\end{bmatrix}`;
}

// ─── Core SVD computation ─────────────────────────────────────────────────────

export interface SvdResult {
  U: Mat;
  Sigma: Mat;
  Vt: Mat;
  singularValues: number[];
  rank: number;
}

export function computeSVD(A: Mat, logger: Logger): SvdResult | null {
  const m = A.length, n = A[0].length;

  logger.step("**Bước 1: Tính ma trận $A^TA$**");
  const At = transpose(A);
  const AtA = matMul(At, A);
  logger.formula(`$$A^T A = ${fmtMat(AtA)}$$`);

  logger.step("**Bước 2: Tìm giá trị riêng và vector riêng của $A^TA$**");
  logger.text("- Giải $\\det(A^TA - \\lambda I) = 0$ tìm $\\lambda_i$.");
  logger.text("- Sắp xếp $\\lambda_i$ giảm dần: $\\lambda_1 \\ge \\lambda_2 \\ge \\dots \\ge \\lambda_r > 0$ và $\\lambda_{r+1} = \\dots = \\lambda_n = 0$.");
  let eigenResult;
  try {
    eigenResult = math.eigs(AtA as number[][]);
  } catch {
    logger.error("Không thể tính trị riêng của $A^T A$. Vui lòng kiểm tra ma trận đầu vào.");
    return null;
  }

  // mathjs eigs trả về values tăng dần → sort giảm dần
  const rawVals = (eigenResult.values as number[]).slice().sort((a, b) => b - a);
  // eigenvectors: array of { value, vector } — sort tương ứng
  const eigPairs = eigenResult.eigenvectors as { value: number; vector: number[] }[];
  const sortedPairs = [...eigPairs].sort((a, b) => b.value - a.value);
  const rawVecs: number[][] = sortedPairs.map((p) => Array.from(p.vector) as number[]);

  logger.info(`Các giá trị riêng (giảm dần): $\\lambda = [${rawVals.map(fmtNum).join(", ")}]$`);

  const EPS = 1e-9;
  const rank = rawVals.filter((v) => v > EPS).length;
  logger.info(`Hạng của ma trận: $r = ${rank}$`);

  logger.text("- Với mỗi $\\lambda_i$, giải $(A^TA - \\lambda_i I)x = 0$ tìm vector riêng $v_i$.");
  logger.text("- Trực chuẩn hóa hệ $\\{v_1, v_2, \\dots, v_n\\}$ (dùng Gram-Schmidt nếu cần).");

  // Gram-Schmidt toàn bộ V
  const VCols = gramSchmidt(rawVecs);
  logger.step("**Bước 3: Xác định ma trận $\\Sigma$**");
  logger.text("- Tính $\\sigma_i = \\sqrt{\\lambda_i}$ với $i = \\overline{1,r}$.");
  const sigmas = rawVals.slice(0, rank).map((lam) => Math.sqrt(Math.max(lam, 0)));
  logger.formula(`$$\\sigma = [${sigmas.map(fmtNum).join(", ")}]$$`);

  // Lập Sigma (m×n)
  const Sigma: Mat = Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j && i < rank ? sigmas[i] : 0))
  );

  logger.text("- Lập $\\Sigma \\in \\mathbb{R}^{m \\times n}$. Đặt $\\sigma_1, \\dots, \\sigma_r$ lên đường chéo chính, các phần tử còn lại bằng $0$.");

  logger.step("**Bước 4: Lập ma trận $V$**");
  logger.text("- Lập ma trận trực giao $V = \\begin{bmatrix} v_1 & v_2 & \\dots & v_n \\end{bmatrix}$.");
  const V: Mat = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => VCols[j]?.[i] ?? 0)
  );
  logger.formula(`$$V = ${fmtMat(V)}$$`);

  logger.text("- Lấy chuyển vị $V^T$.");

  logger.step("**Bước 5: Lập ma trận $U$**");
  logger.text("- **Với $r$ cột đầu ($i = \\overline{1,r}$):** Tính $u_i = \\frac{1}{\\sigma_i}Av_i$.");
  // r cột đầu: u_i = (1/σ_i) * A * v_i
  const UCols: number[][] = [];
  for (let i = 0; i < rank; i++) {
    const vi = VCols[i];
    const Avi = A.map((row) => dot(row, vi));
    const ui = scale(Avi, 1 / sigmas[i]);
    UCols.push(ui);
    logger.info(`$u_{${i + 1}} = \\frac{1}{\\sigma_{${i + 1}}} A v_{${i + 1}} = \\begin{bmatrix} ${fmtVec(ui)} \\end{bmatrix}^T$`);
  }

  // Bổ sung m-r cột còn lại từ null space của AA^T
  if (m > rank) {
    logger.text("- **Với $m - r$ cột còn lại:** Giải $(AA^T - 0I)u = 0$, chọn các vector cơ sở trực chuẩn $u_{r+1}, \\dots, u_m$.");
    const AAt = matMul(A, At);
    const nullVecs = nullSpaceBasis(AAt);
    const extra = gramSchmidt([...UCols, ...nullVecs]).slice(rank);
    UCols.push(...extra);
    if (extra.length > 0) {
      logger.info(`Bổ sung ${extra.length} vector trực chuẩn từ null space của $AA^T$ để hoàn thành $U$.`);
    }
  }

  logger.text("- Lập ma trận trực giao $U = \\begin{bmatrix} u_1 & u_2 & \\dots & u_m \\end{bmatrix}$.");

  const U: Mat = Array.from({ length: m }, (_, i) =>
    Array.from({ length: m }, (_, j) => UCols[j]?.[i] ?? 0)
  );

  const Vt = transpose(V);
  return { U, Sigma, Vt, singularValues: sigmas, rank };
}

// ─── Run function ─────────────────────────────────────────────────────────────

export function runSvd(params: Record<string, string>, logger: Logger): void {
  let A: Mat;
  try {
    A = parseMatrix(params.matA);
  } catch (e) {
    logger.error("Lỗi đọc ma trận: " + (e as Error).message);
    return;
  }

  const m = A.length, n = A[0].length;
  logger.section(`Khai Triển SVD cho Ma Trận $${m} \\times ${n}$`);
  logger.formula(`$$A = ${fmtMat(A)}$$`);
  logger.separator();

  const result = computeSVD(A, logger);
  if (!result) return;

  const { U, Sigma, Vt } = result;

  logger.step("**Bước 6: Khai triển SVD**");
  logger.text("- $A = U\\Sigma V^T$.");
  logger.separator();
  logger.result(`$$U = ${fmtMat(U)}$$`);
  logger.result(`$$\\Sigma = ${fmtMat(Sigma)}$$`);
  logger.result(`$$V^T = ${fmtMat(Vt)}$$`);
  logger.separator();
  logger.success(`Khai triển SVD: $A = U\\Sigma V^T$`);
}
