import { create, all } from "mathjs";
import { parseFraction } from "./math-utils";
import type { Logger } from "@/types/solver";

const math = create(all);

type Mat = number[][];

// ─── Reused helpers (same as svd.ts) ──────────────────────────────────────────

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

function dot(a: number[], b: number[]): number {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

function norm(v: number[]): number {
  return Math.sqrt(dot(v, v));
}

function scale(v: number[], s: number): number[] {
  return v.map((x) => x * s);
}

function vecSub(a: number[], b: number[]): number[] {
  return a.map((x, i) => x - b[i]);
}

function gramSchmidt(vecs: number[][]): number[][] {
  const result: number[][] = [];
  for (const v of vecs) {
    let u = [...v];
    for (const e of result) {
      u = vecSub(u, scale(e, dot(e, u)));
    }
    const n = norm(u);
    if (n > 1e-12) result.push(scale(u, 1 / n));
  }
  return result;
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
      x[pivotCols[r]] = -A[r][freeCol];
    }
    return x;
  });
}

function fmtNum(v: number): string {
  if (Math.abs(v) < 1e-10) return "0";
  return String(parseFloat(v.toFixed(6)));
}

function fmtVec(v: number[]): string {
  return v.map((x) => fmtNum(x)).join(" & ");
}

function fmtMat(M: Mat): string {
  const rows = M.map((r) => r.map((x) => fmtNum(x)).join(" & "));
  return `\\begin{bmatrix} ${rows.join(" \\\\ ")} \\end{bmatrix}`;
}

// ─── Run function ─────────────────────────────────────────────────────────────

export function runPseudoinverse(
  params: Record<string, string>,
  logger: Logger,
): void {
  let A: Mat;
  try {
    A = parseMatrix(params.matA);
  } catch (e) {
    logger.error("Lỗi đọc ma trận: " + (e as Error).message);
    return;
  }

  const m = A.length,
    n = A[0].length;
  logger.section(
    `Ma Trận Nghịch Đảo Suy Rộng $A^\\dagger$ của ma trận $${m} \\times ${n}$`,
  );
  logger.formula(`$$A = ${fmtMat(A)}$$`);
  logger.separator();

  // ── Bước 1-2: Tính AtA và trị riêng ──────────────────────────────────────
  logger.step("**Bước 1: Tính ma trận $A^TA$**");
  const At = transpose(A);
  const AtA = matMul(At, A);
  logger.formula(`$$A^T A = ${fmtMat(AtA)}$$`);

  logger.step("**Bước 2: Tìm giá trị riêng và vector riêng của $A^TA$**");
  logger.text("- Giải $\\det(A^TA - \\lambda I) = 0$ tìm $\\lambda_i$.");
  logger.text(
    "- Sắp xếp $\\lambda_i$ giảm dần: $\\lambda_1 \\ge \\lambda_2 \\ge \\dots \\ge \\lambda_r > 0$ và $\\lambda_{r+1} = \\dots = \\lambda_n = 0$.",
  );
  let eigenResult;
  try {
    eigenResult = math.eigs(AtA as number[][]);
  } catch {
    logger.error("Không thể tính trị riêng của $A^T A$.");
    return;
  }

  const rawVals = (eigenResult.values as number[])
    .slice()
    .sort((a, b) => b - a);
  const eigPairs = eigenResult.eigenvectors as {
    value: number;
    vector: number[];
  }[];
  const sortedPairs = [...eigPairs].sort((a, b) => b.value - a.value);
  const rawVecs: number[][] = sortedPairs.map(
    (p) => Array.from(p.vector) as number[],
  );

  const EPS = 1e-9;
  const rank = rawVals.filter((v) => v > EPS).length;
  logger.info(
    `Hạng $r = ${rank}$, các giá trị riêng: $[${rawVals.map(fmtNum).join(", ")}]$`,
  );

  // In chi tiết từng vector v_i
  const VCols = gramSchmidt(rawVecs);
  for (let i = 0; i < rawVals.length; i++) {
    const lam = rawVals[i];
    logger.text(
      `- Với $\\lambda_{${i + 1}} = ${fmtNum(lam)}$, giải $(A^TA - ${fmtNum(lam)}I)v_{${i + 1}} = 0$:`,
    );
    logger.info(
      `Vector riêng trực chuẩn: $v_{${i + 1}} = \\begin{bmatrix} ${fmtVec(VCols[i])} \\end{bmatrix}^T$`,
    );
  }
  logger.text("- Trực chuẩn hóa hệ $\\{v_1, v_2, \\dots, v_n\\}$.");

  const sigmasAll = rawVals.map((lam) => Math.sqrt(Math.max(lam, 0)));
  const sigmas = sigmasAll.slice(0, rank);

  logger.step("**Bước 3: Lập ma trận $V$**");
  logger.text(
    "- Lập ma trận trực giao $V = \\begin{bmatrix} v_1 & v_2 & \\dots & v_n \\end{bmatrix} \\in \\mathbb{R}^{n \\times n}$.",
  );
  const V: Mat = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => VCols[j]?.[i] ?? 0),
  );
  logger.formula(`$$V = ${fmtMat(V)}$$`);

  // ── Bước 4: Lập U ────────────────────────────────────────────────────────
  logger.step("**Bước 4: Lập ma trận $U$**");
  logger.text(
    "- **Với $r$ cột đầu ($i = \\overline{1,r}$):** Tính $u_i = \\frac{1}{\\sqrt{\\lambda_i}}Av_i$.",
  );
  const UCols: number[][] = [];
  for (let i = 0; i < rank; i++) {
    const vi = VCols[i];
    const ui = scale(
      A.map((row) => dot(row, vi)),
      1 / sigmas[i],
    );
    UCols.push(ui);
  }
  if (m > rank) {
    logger.text(
      "- **Với $m - r$ cột còn lại:** Giải $(AA^T - 0I)u = 0$, chọn các vector cơ sở trực chuẩn $u_{r+1}, \\dots, u_m$.",
    );
    const AAt = matMul(A, At);
    const nullVecs = nullSpaceBasis(AAt);
    const extra = gramSchmidt([...UCols, ...nullVecs]).slice(rank);
    UCols.push(...extra);
  }
  const U: Mat = Array.from({ length: m }, (_, i) =>
    Array.from({ length: m }, (_, j) => UCols[j]?.[i] ?? 0),
  );
  logger.text(
    "- Lập ma trận trực giao $U = \\begin{bmatrix} u_1 & u_2 & \\dots & u_m \\end{bmatrix} \\in \\mathbb{R}^{m \\times m}$.",
  );
  logger.formula(`$$U = ${fmtMat(U)}$$`);

  // ── Bước 5: Lập Sigma^{-1} ───────────────────────────────────────────────
  logger.step("**Bước 5: Lập ma trận $\\Sigma^{-1}$**");
  logger.text(
    "- Tính $\\sigma_i = \\sqrt{\\lambda_i}$ với $i = \\overline{1,r}$.",
  );
  logger.formula(
    "$" +
      sigmasAll
        .map(
          (s, idx) =>
            `\\sigma_{${idx + 1}} = \\sqrt{\\lambda_{${idx + 1}}} = ${fmtNum(s)}`,
        )
        .join(",\\quad ") +
      "$",
  );
  logger.text(
    "- Lập $\\Sigma^{-1} \\in \\mathbb{R}^{n \\times m}$. Đặt $\\frac{1}{\\sigma_1}, \\dots, \\frac{1}{\\sigma_r}$ lên đường chéo chính, các phần tử còn lại bằng $0$:",
  );
  const SigmaDag: Mat = Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) =>
      i === j && i < rank ? 1 / sigmas[i] : 0,
    ),
  );
  logger.formula(`$$\\Sigma^{-1} = ${fmtMat(SigmaDag)}$$`);

  // ── Bước 6: Tính A† = V * Σ† * U^T ─────────────────────────────────────
  logger.step("**Bước 6: Tính $A^\\dagger$**");
  logger.text("- $A^\\dagger = V\\Sigma^{-1}U^T$.");
  const Ut = transpose(U);
  const ADag = matMul(matMul(V, SigmaDag), Ut);
  logger.separator();
  logger.result(`$$A^\\dagger = ${fmtMat(ADag)}$$`);

  // Kiểm tra A * A† * A ≈ A
  const check = matMul(matMul(A, ADag), A);
  const maxErr = Math.max(
    ...check.map((row, i) => row.map((v, j) => Math.abs(v - A[i][j]))).flat(),
  );
  if (maxErr < 1e-6) {
    logger.success(
      `Kiểm tra $A A^\\dagger A \\approx A$: ✓ Sai số tối đa ${fmtNum(maxErr)}`,
    );
  } else {
    logger.warn(
      `Kiểm tra $A A^\\dagger A$: sai số = ${fmtNum(maxErr)} (có thể do độ chính xác số thực).`,
    );
  }
}
