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

function sub(a: number[], b: number[]): number[] {
  return a.map((x, i) => x - b[i]);
}

function addMat(A: Mat, B: Mat): Mat {
  return A.map((row, i) => row.map((val, j) => val + B[i][j]));
}

function outerProduct(u: number[], v: number[]): Mat {
  return u.map((ui) => v.map((vj) => ui * vj));
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

/**
 * Hoàn chỉnh cơ sở trực chuẩn bằng cách chiếu các vector đơn vị chuẩn $e_i$.
 * Nhận vào tập các vector đã trực chuẩn, bổ sung đủ `dim` vector.
 * Ổn định hơn nullSpaceBasis vì không phụ thuộc ngưỡng khử Gauss.
 */
function completeBasis(existing: number[][], dim: number, logger: Logger, symbol: string, tol = 1e-9): number[][] {
  const result: number[][] = existing.map((v) => [...v]);
  for (let i = 0; i < dim && result.length < dim; i++) {
    const ei = new Array(dim).fill(0);
    ei[i] = 1;
    let u = [...ei];
    for (const v of result) {
      u = sub(u, scale(v, dot(v, u)));
    }
    const n = norm(u);
    if (n > tol) {
      const vNew = scale(u, 1 / n);
      result.push(vNew);
      logger.text(
        `- Chọn vector đơn vị $e_{${i + 1}}$. Trừ đi hình chiếu trên các vector đã có, độ dài phần dư $\\approx ${fmtNum(n)}$. Chuẩn hóa thành $${symbol}_{${result.length}} = \\begin{bmatrix} ${fmtVec(vNew)} \\end{bmatrix}^T$.`
      );
    }
  }
  return result;
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
  const m = A.length,
    n = A[0].length;

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
    logger.error(
      "Không thể tính trị riêng của $A^T A$. Vui lòng kiểm tra ma trận đầu vào.",
    );
    return null;
  }

  // mathjs eigs trả về values tăng dần → sort giảm dần
  const rawVals = (eigenResult.values as number[])
    .slice()
    .sort((a, b) => b - a);
  // eigenvectors: array of { value, vector } — sort tương ứng
  const eigPairs = eigenResult.eigenvectors as {
    value: number;
    vector: number[];
  }[];
  const sortedPairs = [...eigPairs].sort((a, b) => b.value - a.value);
  const rawVecs: number[][] = sortedPairs.map(
    (p) => Array.from(p.vector) as number[],
  );

  logger.info(
    `Các giá trị riêng (giảm dần): $\\lambda = [${rawVals.map(fmtNum).join(", ")}]$`,
  );

  const EPS = 1e-9;
  const rank = rawVals.filter((v) => v > EPS).length;
  logger.info(`Hạng của ma trận: $r = ${rank}$`);

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
  logger.text(
    "- Trực chuẩn hóa hệ $\\{v_1, v_2, \\dots, v_n\\}$ (dùng Gram-Schmidt nếu cần).",
  );
  logger.step("**Bước 3: Xác định ma trận $\\Sigma$**");
  logger.text(
    "- Tính $\\sigma_i = \\sqrt{\\lambda_i}$ với $i = \\overline{1,r}$.",
  );
  const sigmasAll = rawVals.map((lam) => Math.sqrt(Math.max(lam, 0)));
  const sigmas = sigmasAll.slice(0, rank);
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

  // Lập Sigma (m×n)
  const Sigma: Mat = Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j && i < rank ? sigmas[i] : 0)),
  );

  logger.text(
    "- Lập $\\Sigma \\in \\mathbb{R}^{m \\times n}$. Đặt $\\sigma_1, \\dots, \\sigma_r$ lên đường chéo chính, các phần tử còn lại bằng $0$:",
  );
  logger.formula(`$$\\Sigma = ${fmtMat(Sigma)}$$`);

  logger.step("**Bước 4: Lập ma trận $V$**");
  logger.text(
    "- Lập ma trận trực giao $V = \\begin{bmatrix} v_1 & v_2 & \\dots & v_n \\end{bmatrix}$.",
  );
  const V: Mat = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => VCols[j]?.[i] ?? 0),
  );
  logger.formula(`$$V = ${fmtMat(V)}$$`);

  logger.text("- Lấy chuyển vị $V^T$.");

  logger.step("**Bước 5: Lập ma trận $U$**");
  logger.text(
    "- **Với $r$ cột đầu ($i = \\overline{1,r}$):** Tính $u_i = \\frac{1}{\\sigma_i}Av_i$.",
  );
  // r cột đầu: u_i = (1/σ_i) * A * v_i
  const UCols: number[][] = [];
  for (let i = 0; i < rank; i++) {
    const vi = VCols[i];
    const Avi = A.map((row) => dot(row, vi));
    const ui = scale(Avi, 1 / sigmas[i]);
    UCols.push(ui);
    logger.info(
      `$u_{${i + 1}} = \\frac{1}{\\sigma_{${i + 1}}} A v_{${i + 1}} = \\begin{bmatrix} ${fmtVec(ui)} \\end{bmatrix}^T$`,
    );
  }

  // Bổ sung m-r cột còn lại bằng completeBasis
  if (m > rank) {
    logger.text(
      "- **Với $m - r$ cột còn lại:** Bổ sung véc-tơ trực chuẩn từ không gian $Null(A^T)$ (Gram-Schmidt qua vector đơn vị chuẩn $e_i$).",
    );
    const completed = completeBasis(UCols, m, logger, "u");
    const extra = completed.slice(rank);
    UCols.push(...extra);
  }

  logger.text(
    "- Lập ma trận trực giao $U = \\begin{bmatrix} u_1 & u_2 & \\dots & u_m \\end{bmatrix}$.",
  );

  const U: Mat = Array.from({ length: m }, (_, i) =>
    Array.from({ length: m }, (_, j) => UCols[j]?.[i] ?? 0),
  );

  const Vt = transpose(V);
  return { U, Sigma, Vt, singularValues: sigmas, rank };
}

// ─── Run function ─────────────────────────────────────────────────────────────

export function runSvd(params: Record<string, string>, logger: Logger): void {
  const { truncationR, targetErrorPct } = params;
  const tR = truncationR ? parseInt(truncationR, 10) : NaN;
  const tErr = targetErrorPct ? parseFloat(targetErrorPct) : NaN;
  let A: Mat;
  try {
    A = parseMatrix(params.matA);
  } catch (e) {
    logger.error("Lỗi đọc ma trận: " + (e as Error).message);
    return;
  }

  const m = A.length,
    n = A[0].length;
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

  // --- BƯỚC 7: XẤP XỈ MA TRẬN (SVD TRUNCATION) ---
  if (!isNaN(tR) || !isNaN(tErr)) {
    logger.step("**Bước 7: Xấp xỉ ma trận (SVD Truncation)**");
    
    // Tổng bình phương giá trị kỳ dị = ||A||_F^2
    const totalVariance = result.singularValues.reduce((sum, val) => sum + val * val, 0);
    const normAF = Math.sqrt(totalVariance);
    logger.formula(`$$\\|A\\|_F = \\sqrt{\\sum_{i=1}^{${result.rank}} \\sigma_i^2} = ${fmtNum(normAF)}$$`);

    let finalR = 1;
    if (!isNaN(tErr)) {
      logger.text(`Mục tiêu: Tìm bậc xấp xỉ $r$ sao cho sai số tương đối $\\le ${tErr}\\%$`);
      for (let currR = 1; currR <= result.rank; currR++) {
        const explainedVar = result.singularValues.slice(0, currR).reduce((sum, val) => sum + val * val, 0);
        const errVar = totalVariance - explainedVar;
        const errNorm = Math.sqrt(Math.max(0, errVar));
        const errPct = (errNorm / normAF) * 100;
        logger.text(`- Tại $r = ${currR}$, Sai số = $\\frac{\\sqrt{\\sum_{i=${currR+1}}^{${result.rank}} \\sigma_i^2}}{\\|A\\|_F} \\approx ${fmtNum(errPct, 2)}\\%$`);
        
        finalR = currR;
        if (errPct <= tErr) {
          logger.text(`$\\rightarrow$ Chọn bậc xấp xỉ $r = ${currR}$ (Thỏa mãn $\\le ${tErr}\\%$)`);
          break;
        }
      }
    } else if (!isNaN(tR)) {
      finalR = Math.max(1, Math.min(tR, result.rank));
      logger.text(`Người dùng yêu cầu bậc xấp xỉ $r = ${finalR}$.`);
    }

    let A_approx = Array.from({ length: m }, () => new Array(n).fill(0));
    // UCols và VCols có thể trích từ ma trận U và V
    for (let i = 0; i < finalR; i++) {
      const u_i = U.map(row => row[i]);
      const v_i = Vt[i]; // row i of Vt is col i of V
      const sigma_i = result.singularValues[i];
      const outer = outerProduct(u_i, v_i).map(row => scale(row, sigma_i));
      A_approx = addMat(A_approx, outer);
    }

    logger.text(`Ma trận xấp xỉ $\\hat{A}_{${finalR}} = \\sum_{i=1}^{${finalR}} \\sigma_i u_i v_i^T$:`);
    logger.formula(`$$\\hat{A}_{${finalR}} = ${fmtMat(A_approx)}$$`);
  }
}
