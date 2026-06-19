import type { Logger } from "@/types/solver";

type NumMatrix = number[][];

type CaseType = "TH1" | "TH2" | "TH3";

interface IterRecord {
  k: number;
  x: number[];
  y: number[];
  lambdaEst: number | null;
  lambdaSqEst: number | null;
  caseType: CaseType;
  deltaLambda: number | null;
}

const TABLE_DECIMALS = 4;
const RATIO_TOL = 1e-10;

// ---------------------------------------------------------------------------
// Số phức tối giản — dùng cho TH3
// ---------------------------------------------------------------------------

class Complex {
  constructor(
    public re: number,
    public im: number = 0,
  ) {}

  abs() {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  toString(decimals = TABLE_DECIMALS) {
    const r = this.re.toFixed(decimals);
    const i = Math.abs(this.im).toFixed(decimals);
    if (Math.abs(this.im) < 1e-10) return r;
    return `${r} ${this.im >= 0 ? "+" : "-"} ${i}i`;
  }
}

function solveQuadratic(p: number, q: number): [Complex, Complex] {
  const disc = p * p - 4 * q;
  if (disc >= 0) {
    const s = Math.sqrt(disc);
    return [new Complex((p + s) / 2), new Complex((p - s) / 2)];
  }
  const s = Math.sqrt(-disc);
  return [new Complex(p / 2, s / 2), new Complex(p / 2, -s / 2)];
}

function pickDominantRoot(r1: Complex, r2: Complex): Complex {
  return r1.abs() >= r2.abs() ? r1 : r2;
}

// ---------------------------------------------------------------------------
// Parse đầu vào
// ---------------------------------------------------------------------------

function parseMatrix(text: string): NumMatrix {
  const lines = text.trim().split("\n").filter((l) => l.trim() !== "");
  return lines.map((line, i) => {
    const vals = line.trim().split(/[\s,;]+/).map((v) => {
      const n = parseFloat(v);
      if (isNaN(n)) throw new Error(`Giá trị không hợp lệ "${v}" ở hàng ${i + 1}`);
      return n;
    });
    return vals;
  });
}

function parseVector(text: string): number[] {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Vector x₀ không được rỗng");
  return trimmed.split(/[\s,;]+/).map((v) => {
    const n = parseFloat(v);
    if (isNaN(n)) throw new Error(`Giá trị "${v}" không hợp lệ`);
    return n;
  });
}

// ---------------------------------------------------------------------------
// Định dạng
// ---------------------------------------------------------------------------

function fmt(v: number, d = TABLE_DECIMALS): string {
  if (!Number.isFinite(v)) return String(v);
  if (Math.abs(v) < 1e-15) return "0";
  return v.toFixed(d);
}

function formatVec(vec: number[]): string {
  return `[${vec.map((v) => fmt(v)).join(", ")}]`;
}

function formatMatrixForLog(m: NumMatrix): Record<string, string>[] {
  const cols = m[0]?.length ?? 0;
  return m.map((row, i) => {
    const obj: Record<string, string> = { hàng: String(i + 1) };
    for (let j = 0; j < cols; j++) obj[`c${j + 1}`] = fmt(row[j]);
    return obj;
  });
}

// ---------------------------------------------------------------------------
// Phép toán vector / ma trận
// ---------------------------------------------------------------------------

function matVecMul(A: NumMatrix, x: number[]): number[] {
  return A.map((row) => row.reduce((sum, aij, j) => sum + aij * x[j], 0));
}

function infNorm(v: number[]): number {
  return Math.max(...v.map((x) => Math.abs(x)));
}

function normalizeInf(v: number[]): number[] {
  const n = infNorm(v);
  if (n < RATIO_TOL) return [...v];
  return v.map((x) => x / n);
}

function scaleIfLarge(v: number[]): number[] {
  const n = infNorm(v);
  if (n > 1e10) return v.map((x) => x / n);
  return v;
}

// ---------------------------------------------------------------------------
// Ước lượng λ theo từng trường hợp
// ---------------------------------------------------------------------------

/** TH1: λ ≈ y_i / x_i tại các chỉ số |x_i| đủ lớn */
function estimateLambdaTH1(x: number[], y: number[]): number | null {
  const ratios: number[] = [];
  for (let i = 0; i < x.length; i++) {
    if (Math.abs(x[i]) > RATIO_TOL) ratios.push(y[i] / x[i]);
  }
  if (ratios.length === 0) return null;
  ratios.sort((a, b) => a - b);
  return ratios[Math.floor(ratios.length / 2)];
}

/** TH2: λ₁² ≈ y_i / x_i với bước chẵn */
function estimateLambdaSqTH2(xEven: number[], yEvenPlus2: number[]): number | null {
  const ratios: number[] = [];
  for (let i = 0; i < xEven.length; i++) {
    if (Math.abs(xEven[i]) > RATIO_TOL) ratios.push(yEvenPlus2[i] / xEven[i]);
  }
  if (ratios.length === 0) return null;
  ratios.sort((a, b) => a - b);
  const median = ratios[Math.floor(ratios.length / 2)];
  return median >= 0 ? median : null;
}

/** TH3: giải λ² - pλ + q = 0 từ hai chỉ số thành phần */
function estimateLambdaTH3(
  vn: number[],
  vn1: number[],
  vn2: number[],
): { lambda: Complex; p: number; q: number } | null {
  const indices = vn
    .map((_, i) => i)
    .filter((i) => Math.abs(vn[i]) > RATIO_TOL)
    .sort((a, b) => Math.abs(vn[b]) - Math.abs(vn[a]));

  if (indices.length < 2) return null;

  for (let a = 0; a < indices.length - 1; a++) {
    for (let b = a + 1; b < indices.length; b++) {
      const i = indices[a];
      const j = indices[b];
      const c1 = vn[i];
      const b1 = vn1[i];
      const a1 = vn2[i];
      const c2 = vn[j];
      const b2 = vn1[j];
      const a2 = vn2[j];

      const det = b1 * c2 - b2 * c1;
      if (Math.abs(det) < RATIO_TOL) continue;

      const p = (a1 * c2 - a2 * c1) / det;
      const q = (a1 * b2 - a2 * b1) / det;
      const [r1, r2] = solveQuadratic(p, q);
      const dominant = pickDominantRoot(r1, r2);
      if (dominant.abs() > RATIO_TOL) return { lambda: dominant, p, q };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Phát hiện trường hợp
// ---------------------------------------------------------------------------

function detectCaseTH2(history: IterRecord[]): boolean {
  if (history.length < 4) return false;
  const recent = history.slice(-4);
  let alternations = 0;
  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1].lambdaEst;
    const curr = recent[i].lambdaEst;
    if (prev === null || curr === null) continue;
    const sameModulus = Math.abs(Math.abs(curr) - Math.abs(prev)) < 0.1 * Math.abs(prev);
    const oppositeSign = curr * prev < 0;
    if (sameModulus && oppositeSign) alternations++;
  }
  return alternations >= 2;
}

function detectCaseTH3(history: IterRecord[]): boolean {
  if (history.length < 6) return false;
  const recent = history.slice(-6);
  const lambdas = recent.map((r) => r.lambdaEst).filter((v): v is number => v !== null);
  if (lambdas.length < 4) return false;

  const deltas = lambdas.slice(1).map((v, i) => Math.abs(v - lambdas[i]));
  const notConverging = deltas.every((d) => d > 0.01);
  const notTH2 = !detectCaseTH2(recent);
  return notConverging && notTH2;
}

// ---------------------------------------------------------------------------
// Vòng lặp chính
// ---------------------------------------------------------------------------

function powerIteration(
  A: NumMatrix,
  x0: number[],
  epsilon: number,
  maxIter: number,
  logger: Logger,
): {
  converged: boolean;
  caseType: CaseType;
  lambda: number | Complex | null;
  eigenvector: number[];
  k: number;
} {
  let x = normalizeInf([...x0]);
  let caseType: CaseType = "TH1";
  let prevLambda: number | null = null;
  let prevLambdaSq: number | null = null;
  let prevModulus: number | null = null;
  const history: IterRecord[] = [];
  const tableData: Record<string, unknown>[] = [];
  const vectorSnapshots: number[][] = [normalizeInf([...x0])];

  const xCols0 = Object.fromEntries(x.map((_, i) => [`x${i + 1}`, fmt(x[i])]));
  tableData.push({
    k: 0,
    ...xCols0,
    "λ ước lượng": "—",
    TH: "—",
    "‖Δλ‖": "—",
  });

  let converged = false;
  let finalLambda: number | Complex | null = null;
  let k = 0;

  for (k = 1; k <= maxIter; k++) {
    const y = scaleIfLarge(matVecMul(A, x));
    vectorSnapshots.push([...y]);

    if (caseType === "TH1" && k >= 4 && detectCaseTH2(history)) {
      caseType = "TH2";
      logger.step(
        "Nhận diện TH2: λ ước lượng xen kẽ dấu, |λ_k| ≈ |λ_{k-1}| → chuyển sang công thức bước chẵn.",
      );
      logger.formula("λ₁² ≈ (A^{2n+2}x)_i / (A^{2n}x)_i");
    } else if (caseType === "TH1" && k >= 6 && detectCaseTH3(history)) {
      caseType = "TH3";
      logger.step(
        "Nhận diện TH3: λ không hội tụ về số thực → dùng phương trình đặc trưng bậc 2.",
      );
      logger.formula(
        "(A^{n+2}x)_i − p(A^{n+1}x)_i + q(A^n x)_i = 0  →  λ² − pλ + q = 0",
      );
    }

    let lambdaEst: number | null = null;
    let lambdaSqEst: number | null = null;
    let deltaLambda: number | null = null;

    if (caseType === "TH1") {
      lambdaEst = estimateLambdaTH1(x, y);
      if (lambdaEst !== null && prevLambda !== null) {
        deltaLambda = Math.abs(lambdaEst - prevLambda);
        if (deltaLambda <= epsilon) {
          converged = true;
          finalLambda = lambdaEst;
        }
      }
      prevLambda = lambdaEst;
    } else if (caseType === "TH2" && k % 2 === 0 && k >= 4) {
      const xEven = vectorSnapshots[k - 2];
      lambdaSqEst = estimateLambdaSqTH2(xEven, y);
      lambdaEst = lambdaSqEst !== null ? Math.sqrt(Math.abs(lambdaSqEst)) : null;

      if (lambdaSqEst !== null && prevLambdaSq !== null) {
        deltaLambda = Math.abs(lambdaSqEst - prevLambdaSq);
        if (deltaLambda <= epsilon) {
          converged = true;
          const sign =
            history.length > 0 && (history[history.length - 1].lambdaEst ?? 0) < 0 ? -1 : 1;
          finalLambda = sign * Math.sqrt(Math.abs(lambdaSqEst));
        }
      }
      prevLambdaSq = lambdaSqEst;
    } else if (caseType === "TH3" && k >= 3) {
      const vn = vectorSnapshots[k - 2];
      const vn1 = vectorSnapshots[k - 1];
      const vn2 = y;
      const result = estimateLambdaTH3(vn, vn1, vn2);
      if (result) {
        lambdaEst = result.lambda.re;
        const mod = result.lambda.abs();
        if (prevModulus !== null) {
          deltaLambda = Math.abs(mod - prevModulus);
          if (deltaLambda <= epsilon) {
            converged = true;
            finalLambda = result.lambda;
          }
        }
        prevModulus = mod;
      }
    }

    const xColsK = Object.fromEntries(x.map((_, i) => [`x${i + 1}`, fmt(x[i])]));
    const lambdaDisplay =
      caseType === "TH3" && finalLambda instanceof Complex
        ? finalLambda.toString()
        : lambdaEst !== null
          ? fmt(lambdaEst)
          : lambdaSqEst !== null
            ? `λ²=${fmt(lambdaSqEst)}`
            : "—";

    tableData.push({
      k,
      ...xColsK,
      "λ ước lượng": lambdaDisplay,
      TH: caseType,
      "‖Δλ‖": deltaLambda !== null ? fmt(deltaLambda) : "—",
    });

    history.push({ k, x: [...x], y: [...y], lambdaEst, lambdaSqEst, caseType, deltaLambda });

    if (converged) {
      x = normalizeInf(y);
      break;
    }

    x = normalizeInf(y);
  }

  logger.table(tableData);

  if (!converged && caseType === "TH3" && vectorSnapshots.length >= 3) {
    const len = vectorSnapshots.length;
    const result = estimateLambdaTH3(
      vectorSnapshots[len - 3],
      vectorSnapshots[len - 2],
      vectorSnapshots[len - 1],
    );
    if (result) finalLambda = result.lambda;
  }

  return {
    converged,
    caseType,
    lambda: finalLambda ?? prevLambda,
    eigenvector: x,
    k,
  };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function runPowerEigen(params: Record<string, string>, logger: Logger): void {
  const { matA, x0Str, epsilon, maxIter: maxIterStr } = params;

  let A: NumMatrix;
  let x0: number[];

  try {
    A = parseMatrix(matA);
    x0 = parseVector(x0Str);
  } catch (e) {
    logger.error("Lỗi đọc dữ liệu: " + (e as Error).message);
    return;
  }

  const eps = parseFloat(epsilon);
  const maxIter = parseInt(maxIterStr, 10);

  if (A.length === 0) {
    logger.error("Ma trận A không hợp lệ.");
    return;
  }
  const n = A.length;
  if (!A.every((row) => row.length === n)) {
    logger.error("Ma trận A phải vuông (n × n).");
    return;
  }
  if (x0.length !== n) {
    logger.error(`x₀ phải có đúng ${n} phần tử.`);
    return;
  }
  if (infNorm(x0) < RATIO_TOL) {
    logger.error("x₀ phải khác vector không (x ≠ 0).");
    return;
  }
  if (isNaN(eps) || eps <= 0) {
    logger.error("ε phải là số dương.");
    return;
  }
  if (isNaN(maxIter) || maxIter <= 0) {
    logger.error("N phải là số nguyên dương.");
    return;
  }

  logger.section("MA TRẬN ĐẦU VÀO");
  logger.info(`Kích thước: ${n} × ${n}`);
  logger.text("Ma trận A:");
  logger.table(formatMatrixForLog(A));
  logger.info(`x⁽⁰⁾ = ${formatVec(x0)}`);
  logger.info(`ε = ${eps}, N = ${maxIter}`);

  logger.section("Ý TƯỞNG PHƯƠNG PHÁP");
  logger.formula("A^k x = a₁λ₁^k v₁ + a₂λ₂^k v₂ + … + aₛλₛ^k vₛ");
  logger.formula("TH1 (|λ₁| > |λ₂|):  λ₁ ≈ (A^{k+1}x)_i / (A^k x)_i");
  logger.formula("TH2 (λ₁ = −λ₂):      λ₁² ≈ (A^{2n+2}x)_i / (A^{2n}x)_i");
  logger.formula("TH3 (λ₁ = λ̄₂):       λ² − pλ + q = 0 từ 3 bước liên tiếp");
  logger.text("Tỷ số tính trước khi chuẩn hóa vector (‖·‖∞) để tránh tràn số.");

  logger.section("QUÁ TRÌNH LẶP");

  const { converged, caseType, lambda, eigenvector, k } = powerIteration(
    A,
    x0,
    eps,
    maxIter,
    logger,
  );

  logger.separator();
  logger.text(`Ngưỡng dừng ε = ${eps}`);

  logger.section("KẾT QUẢ");

  if (converged && lambda !== null) {
    logger.success(`✔ Hội tụ tại bước k = ${k} (${caseType}).`);

    if (lambda instanceof Complex) {
      logger.result(`Giá trị riêng trội: λ₁ ≈ ${lambda.toString()}`);
      logger.info(`|λ₁| ≈ ${fmt(lambda.abs())}`);
      logger.result(`Vector riêng (xấp xỉ, đã chuẩn hóa): v₁ ≈ ${formatVec(eigenvector)}`);
    } else {
      logger.result(`Giá trị riêng trội: λ₁ ≈ ${fmt(lambda)}`);
      logger.result(`Vector riêng (xấp xỉ, đã chuẩn hóa): v₁ ≈ ${formatVec(eigenvector)}`);
    }
  } else if (lambda !== null) {
    logger.warn(`⚠ Chưa đạt ε sau ${maxIter} bước lặp — kết quả xấp xỉ cuối (${caseType}).`);
    if (lambda instanceof Complex) {
      logger.result(`λ₁ ≈ ${lambda.toString()} (|λ₁| ≈ ${fmt(lambda.abs())})`);
    } else {
      logger.result(`λ₁ ≈ ${fmt(lambda)}`);
    }
    logger.text(`Vector: ${formatVec(eigenvector)}`);
  } else {
    logger.warn(`⚠ Không hội tụ sau ${maxIter} bước lặp.`);
    logger.text(
      "Gợi ý: thử vector ban đầu khác (tránh a₁ = 0 trong khai triển x = Σ aᵢvᵢ).",
    );
  }
}
