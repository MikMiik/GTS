import type { Logger } from "@/types/solver";
import { parseFraction } from "./math-utils";

type NumMatrix = number[][];

export type CaseType = "TH1" | "TH2" | "TH3";

const TABLE_DECIMALS = 5;

// ---------------------------------------------------------------------------
// Số phức
// ---------------------------------------------------------------------------

export class Complex {
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
// Parse & Format
// ---------------------------------------------------------------------------

function parseMatrix(text: string): NumMatrix {
  const lines = text
    .trim()
    .split("\n")
    .filter((l) => l.trim() !== "");
  if (lines.length === 0) throw new Error("Ma trận rỗng");
  return lines.map((line, i) => {
    const normalizedLine = line.replace(/\s*\/\s*/g, "/");
    const vals = normalizedLine
      .trim()
      .split(/[\s,;]+/)
      .map((v) => {
        const n = parseFraction(v);
        if (isNaN(n))
          throw new Error(`Giá trị không hợp lệ "${v}" ở hàng ${i + 1}`);
        return n;
      });
    return vals;
  });
}

function parseVector(text: string): number[] {
  const normalizedText = text.replace(/\s*\/\s*/g, "/");
  const trimmed = normalizedText.trim();
  if (!trimmed) throw new Error("Vector rỗng");
  const parts = trimmed.split(/[\s,;]+/);
  return parts.map((v) => {
    const n = parseFraction(v);
    if (isNaN(n)) throw new Error(`Giá trị không hợp lệ "${v}"`);
    return n;
  });
}

export function fmt(v: number, d = TABLE_DECIMALS): string {
  if (!Number.isFinite(v)) return String(v);
  if (Math.abs(v) < 1e-15) return "0";
  return v.toFixed(d);
}

export function formatVec(vec: number[]): string {
  return `[${vec.map(fmt).join(", ")}]`;
}

export function formatMatrixForLog(m: NumMatrix): Record<string, string>[] {
  const cols = m[0]?.length ?? 0;
  return m.map((row, i) => {
    const obj: Record<string, string> = { hàng: String(i + 1) };
    for (let j = 0; j < cols; j++) obj[`c${j + 1}`] = fmt(row[j]);
    return obj;
  });
}

// ---------------------------------------------------------------------------
// Phép toán
// ---------------------------------------------------------------------------

function matVecMul(A: NumMatrix, x: number[]): number[] {
  return A.map((row) => row.reduce((sum, aij, j) => sum + aij * x[j], 0));
}

export function infNorm(v: number[]): number {
  return Math.max(...v.map((x) => Math.abs(x)));
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

// ---------------------------------------------------------------------------
// Vòng lặp chính và Phân tích kết quả
// ---------------------------------------------------------------------------

export function powerIteration(
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
  // Bước 1: Tính chuỗi lặp
  logger.step("**Bước 1: Tính chuỗi lặp và chuẩn hóa**");

  const tableData: Record<string, unknown>[] = [];

  let x = [...x0];
  let k = 0;
  let converged = false;

  const xCols0 = Object.fromEntries(
    x.map((_, i) => [`$(x_k)_{${i + 1}}$`, fmt(x[i])]),
  );
  tableData.push({
    "$k$": k,
    ...xCols0,
    "$m_k$": "—",
    "$\\|x_k - x_{k-1}\\|_\\infty$": "—",
  });

  let mk = 0;

  for (k = 1; k <= maxIter; k++) {
    const y = matVecMul(A, x);
    mk = getLargestAbsElement(y);

    if (Math.abs(mk) < 1e-15) {
      logger.error(
        `Tại bước $k=${k}$, vector lặp trở thành vector 0. Giá trị riêng có thể là 0.`,
      );
      return {
        converged: false,
        caseType: "TH1",
        lambda: 0,
        eigenvector: x,
        k,
      };
    }

    const xNext = y.map((v) => v / mk);
    const err = infNorm(xNext.map((v, i) => v - x[i]));

    const xCols = Object.fromEntries(
      xNext.map((_, i) => [`$(x_k)_{${i + 1}}$`, fmt(xNext[i])]),
    );
    tableData.push({
      "$k$": k,
      ...xCols,
      "$m_k$": fmt(mk),
      "$\\|x_k - x_{k-1}\\|_\\infty$": fmt(err),
    });

    x = xNext;

    if (err < epsilon) {
      converged = true;
      break;
    }
  }

  logger.table(tableData);
  logger.separator();

  // Bước 2: Xác định kết quả
  logger.step("**Bước 2: Xác định kết quả**");

  if (converged) {
    logger.text("- **Trường hợp 1: Một giá trị riêng thực trội duy nhất**\n    - Xảy ra khi dãy $x_k$ hội tụ.");
    logger.text("- Kết quả:");
    logger.result(
      `$$\\lambda_1 = m_{k+1} \\approx ${fmt(mk)}, \\quad v_1 = x_{k+1} \\approx \\begin{bmatrix} ${x.map((v: number) => fmt(v)).join(" & ")} \\end{bmatrix}^T$$`,
    );
    return { converged: true, caseType: "TH1", lambda: mk, eigenvector: x, k };
  }

  logger.warn(
    `Dãy $x_k$ không hội tụ sau ${maxIter} bước — tiến hành xác định trường hợp 2 hoặc 3.`,
  );

  // Tính các vector chưa chuẩn hóa y_1, y_2 từ điểm neo x cuối cùng
  const xLast = [...x];
  const y1 = matVecMul(A, xLast);
  const y2 = matVecMul(A, y1);

  logger.step("Tính dội lại $y_{k+1}, y_{k+2}$ từ $x_k$ (chưa chuẩn hóa)");
  logger.formula(
    `$$y_{k+1} = A x_{k} = \\begin{bmatrix} ${y1.map((v: number) => fmt(v)).join(" & ")} \\end{bmatrix}^T$$`,
  );
  logger.formula(
    `$$y_{k+2} = A y_{k+1} = \\begin{bmatrix} ${y2.map((v: number) => fmt(v)).join(" & ")} \\end{bmatrix}^T$$`,
  );

  // Kiểm tra TH2: tỉ số y2_i / xLast_i có bằng nhau không?
  const ratiosTH2: number[] = [];
  for (let i = 0; i < xLast.length; i++) {
    if (Math.abs(xLast[i]) > 1e-6) {
      ratiosTH2.push(y2[i] / xLast[i]);
    }
  }

  if (ratiosTH2.length > 0) {
    const avgRatio = ratiosTH2.reduce((a, b) => a + b, 0) / ratiosTH2.length;
    const maxDiff = Math.max(...ratiosTH2.map((r) => Math.abs(r - avgRatio)));

    if (avgRatio > 0 && maxDiff < 0.1 * avgRatio) {
      logger.text("- **Trường hợp 2: Hai giá trị riêng đối nhau ($\\lambda_1 = -\\lambda_2$)**\n    - Xảy ra khi dãy $x_k$ không hội tụ mà đổi dấu luân phiên.\n    - Lấy 3 véc-tơ lặp liên tiếp chưa chuẩn hóa (tính dội lại $y_{k+1}, y_{k+2}$ từ $x_k$).\n    - Tính $\\lambda_{1}^{2} \\approx \\frac{(y_{k+2})_i}{(x_k)_i}$ (với thành phần $i$ bất kỳ khác 0).");
      logger.formula(
        `$$\\lambda_1^2 \\approx \\frac{(y_{k+2})_i}{(x_k)_i} \\approx ${fmt(avgRatio)}$$`,
      );
      const lam = Math.sqrt(avgRatio);
      logger.text("- Suy ra $\\lambda_1$ và $\\lambda_2 = -\\lambda_1$:");
      logger.result(
        `$$\\lambda_1 \\approx ${fmt(lam)}, \\quad \\lambda_2 = -\\lambda_1 \\approx -${fmt(lam)}$$`,
      );
      return {
        converged: false,
        caseType: "TH2",
        lambda: lam,
        eigenvector: x,
        k,
      };
    }
  }

  // TH3
  logger.text("- **Trường hợp 3: Hai giá trị riêng phức liên hợp ($\\lambda_1 = \\overline{\\lambda_2}$)**\n    - Xảy ra khi dãy không hội tụ và không có quy luật đổi dấu.\n    - Dựa vào 3 véc-tơ lặp liên tiếp $x_k, y_{k+1}, y_{k+2}$ để giải phương trình đặc trưng $t^2 - pt + q = 0$ thông qua định thức (với 2 thành phần $i, j$ bất kỳ):");

  // Chọn 2 chỉ số i, j có trị tuyệt đối lớn nhất trong xLast
  const indices = xLast
    .map((_, idx) => idx)
    .sort((a, b) => Math.abs(xLast[b]) - Math.abs(xLast[a]));

  if (indices.length < 2) {
    logger.error("Không đủ chiều (n < 2) để kiểm tra giá trị phức.");
    return {
      converged: false,
      caseType: "TH3",
      lambda: null,
      eigenvector: x,
      k,
    };
  }

  const i = indices[0];
  const j = indices[1];

  logger.text(
    `Chọn 2 thành phần $i = ${i + 1}$, $j = ${j + 1}$ có trị tuyệt đối lớn nhất (giảm sai số số học):`,
  );

  const c1 = xLast[i],
    b1 = y1[i],
    a1 = y2[i];
  const c2 = xLast[j],
    b2 = y1[j],
    a2 = y2[j];

  logger.formula(
    `$$\\begin{vmatrix} \\lambda^2 & \\lambda & 1 \\\\ ${fmt(a1)} & ${fmt(b1)} & ${fmt(c1)} \\\\ ${fmt(a2)} & ${fmt(b2)} & ${fmt(c2)} \\end{vmatrix} = 0$$`,
  );

  const det = b1 * c2 - b2 * c1;
  if (Math.abs(det) < 1e-12) {
    logger.error("Định thức hệ phụ xấp xỉ 0. Không thể giải tiếp TH3.");
    return {
      converged: false,
      caseType: "TH3",
      lambda: null,
      eigenvector: x,
      k,
    };
  }

  const p = (a1 * c2 - a2 * c1) / det;
  const q = (a1 * b2 - a2 * b1) / det;

  logger.formula(`Khai triển: $$t^2 - (${fmt(p)})t + (${fmt(q)}) = 0$$`);

  const [r1, r2] = solveQuadratic(p, q);
  logger.text("- Giải phương trình bậc 2 thu được cặp giá trị riêng phức.");
  const dominant = pickDominantRoot(r1, r2);

  return {
    converged: false,
    caseType: "TH3",
    lambda: dominant,
    eigenvector: x,
    k,
  };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function runPowerEigen(
  params: Record<string, string>,
  logger: Logger,
): void {
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

  const eps = parseFraction(epsilon);
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
  if (infNorm(x0) < 1e-15) {
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

  logger.section("THÔNG TIN ĐẦU VÀO / ĐẦU RA");
  logger.text("- **Đầu vào:** Ma trận vuông $A \\in \\mathbb{R}^{n \\times n}$, véc-tơ khởi tạo $x_0 \\ne 0$, sai số cho phép $\\epsilon$.");
  logger.text("- **Đầu ra:** Giá trị riêng trội $\\lambda$ và véc-tơ riêng $v$.");
  logger.info(`Ma trận $A$ kích thước ${n} \\times ${n}`);
  logger.formula(
    `$$A = \\begin{bmatrix} ${A.map((row) => row.map((v) => fmt(v)).join(" & ")).join(" \\\\ ")} \\end{bmatrix}$$`,
  );
  logger.formula(
    `$$x_0 = \\begin{bmatrix} ${x0.map((v) => fmt(v)).join(" & ")} \\end{bmatrix}^T$$`,
  );
  logger.info(`$$\\epsilon = ${eps}, N_{\\max} = ${maxIter}$$`);

  logger.section("QUÁ TRÌNH LẶP");
  powerIteration(A, x0, eps, maxIter, logger);
}
