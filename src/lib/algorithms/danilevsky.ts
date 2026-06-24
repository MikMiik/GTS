import { matrix, multiply, identity } from "mathjs";
import type { Matrix } from "mathjs";
import type { Logger } from "@/types/solver";
import { parseFraction } from "./math-utils";

const EPS = 1e-10;

/** Ma trận số thực dạng mảng 2 chiều */
type NumMatrix = number[][];

/** Hệ số đa thức [c0, c1, ..., cn] biểu diễn c0·λ^n + c1·λ^{n-1} + ... + cn */
type Polynomial = number[];

/** Ghi nhận trị riêng tách khối ở TH3 */
interface ScalarSplit {
  rowIndex: number;
  eigenvalue: number;
}

// ---------------------------------------------------------------------------
// Số phức — dùng cho tìm nghiệm đa thức (bước sau Danilevsky)
// ---------------------------------------------------------------------------

class Complex {
  constructor(
    public re: number,
    public im: number = 0,
  ) {}

  add(c: Complex) {
    return new Complex(this.re + c.re, this.im + c.im);
  }

  sub(c: Complex) {
    return new Complex(this.re - c.re, this.im - c.im);
  }

  mul(c: Complex) {
    return new Complex(
      this.re * c.re - this.im * c.im,
      this.re * c.im + this.im * c.re,
    );
  }

  div(c: Complex) {
    const den = c.re * c.re + c.im * c.im;
    return new Complex(
      (this.re * c.re + this.im * c.im) / den,
      (this.im * c.re - this.re * c.im) / den,
    );
  }

  abs() {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  pow(n: number): Complex {
    if (n === 0) return new Complex(1);
    if (n < 0) throw new Error("pow with negative exponent");
    let result = new Complex(1);
    let base = new Complex(this.re, this.im);
    let exp = n;
    while (exp > 0) {
      if (exp % 2 === 1) result = result.mul(base);
      base = base.mul(base);
      exp = Math.floor(exp / 2);
    }
    return result;
  }

  toString(decimals = 4) {
    const r = this.re.toFixed(decimals);
    const i = Math.abs(this.im).toFixed(decimals);
    if (Math.abs(this.im) < 1e-10) return r;
    return `${r} ${this.im >= 0 ? "+" : "-"} ${i}i`;
  }
}

function cleanNearZero(value: number, threshold = 1e-5): number {
  return Math.abs(value) < threshold ? 0 : value;
}

// ---------------------------------------------------------------------------
// mathjs — chỉ dùng cho nhân ma trận và I_n
// ---------------------------------------------------------------------------

function multiplyMatrices(a: NumMatrix, b: NumMatrix): NumMatrix {
  return (multiply(matrix(a), matrix(b)) as Matrix).toArray() as NumMatrix;
}

function createIdentity(size: number): NumMatrix {
  return (identity(size) as Matrix).toArray() as NumMatrix;
}

// ---------------------------------------------------------------------------
// Parse / log
// ---------------------------------------------------------------------------

function parseMatrix(text: string): NumMatrix {
  const lines = text.trim().split("\n").filter((l) => l.trim() !== "");
  if (lines.length === 0) throw new Error("Ma trận không được rỗng");
  return lines.map((line, i) => {
    const normalizedLine = line.replace(/\s*\/\s*/g, '/');
    const vals = normalizedLine.trim().split(/[\s,;]+/).map((v) => {
      const n = parseFraction(v);
      if (isNaN(n)) throw new Error(`Giá trị không hợp lệ "${v}" ở hàng ${i + 1}`);
      return n;
    });
    return vals;
  });
}

function formatNum(value: number): string {
  return Math.abs(value) < EPS ? "0.0000" : value.toFixed(4);
}

function formatMatrixForLog(m: NumMatrix): Record<string, string>[] {
  return m.map((row, rowIndex) => {
    const obj: Record<string, string> = { Hàng: `H${rowIndex + 1}` };
    row.forEach((val, colIndex) => {
      obj[`Cột ${colIndex + 1}`] = formatNum(val);
    });
    return obj;
  });
}

/** Mô tả dạng Frobenius mục tiêu của hàng k: [0, ..., 0, 1, 0] */
function describeFrobeniusTargetRow(rowIndex: number, n: number): string {
  const parts = Array.from({ length: n }, (_, j) =>
    j === rowIndex - 1 ? "1" : "0",
  );
  return `[${parts.join(", ")}]`;
}

/** In một hàng ma trận dạng [a₁, a₂, ..., aₙ] */
function formatMatrixRow(row: number[]): string {
  return `[${row.map(formatNum).join(", ")}]`;
}

/** Log ma trận P sau mỗi lần cập nhật tích lũy */
function logTransformMatrixAfterUpdate(
  logger: Logger,
  formula: string,
  p: NumMatrix,
) {
  logger.formula(formula);
  logger.info("Ma trận chuyển cơ sở P (sau cập nhật):");
  logger.table(formatMatrixForLog(p));
}

// ---------------------------------------------------------------------------
// Đa thức
// ---------------------------------------------------------------------------

/** Nhân hai đa thức */
function multiplyPolynomials(p: Polynomial, q: Polynomial): Polynomial {
  const result = new Array(p.length + q.length - 1).fill(0);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) {
      result[i + j] += p[i] * q[j];
    }
  }
  return result;
}

/**
 * Trích đa thức đặc trưng khối Frobenius từ hàng 1.
 * Hàng 1 chứa [-p1, -p2, ..., -pm] → P_F(λ) = (-1)^m [λ^m + p1·λ^{m-1} + ... + pm]
 */
function extractFrobeniusPolynomial(
  frobeniusMatrix: NumMatrix,
  blockSize: number,
): Polynomial {
  const poly: Polynomial = [1];
  for (let i = 0; i < blockSize; i++) {
    poly.push(-frobeniusMatrix[0][i]);
  }
  return poly;
}

function evaluatePolynomial(coeffs: Polynomial, x: Complex): Complex {
  let result = new Complex(coeffs[0]);
  for (let i = 1; i < coeffs.length; i++) {
    result = result.mul(x).add(new Complex(coeffs[i]));
  }
  return result;
}

/** Durand-Kerner — giải P(λ)=0 sau khi đã có đa thức đặc trưng */
function findPolynomialRoots(
  coeffs: Polynomial,
  maxIter = 2000,
  tol = 1e-10,
): Complex[] {
  const degree = coeffs.length - 1;
  if (degree === 0) return [];
  if (Math.abs(coeffs[0]) < 1e-14) return [];

  const normalized = coeffs.map((c) => c / coeffs[0]);
  const roots: Complex[] = [];
  const radius = 1 + Math.max(...normalized.map(Math.abs));

  for (let k = 0; k < degree; k++) {
    const angle = (2 * Math.PI * k) / degree + 0.1234;
    roots.push(
      new Complex(Math.cos(angle) * radius, Math.sin(angle) * radius),
    );
  }

  for (let iter = 0; iter < maxIter; iter++) {
    let maxDiff = 0;
    for (let k = 0; k < degree; k++) {
      let denom = new Complex(1);
      for (let j = 0; j < degree; j++) {
        if (j !== k) denom = denom.mul(roots[k].sub(roots[j]));
      }
      const diff = evaluatePolynomial(normalized, roots[k]).div(denom);
      roots[k] = roots[k].sub(diff);
      if (diff.abs() > maxDiff) maxDiff = diff.abs();
    }
    if (maxDiff < tol) break;
  }

  return roots;
}

function formatCharacteristicPolynomial(poly: Polynomial, matrixSize: number): string {
  const degree = poly.length - 1;
  const overallSign = matrixSize % 2 === 0 ? 1 : -1;
  let polyStr = "";

  for (let i = 0; i < poly.length; i++) {
    const coeff = poly[i] * overallSign;
    if (Math.abs(coeff) < EPS) continue;

    const power = degree - i;
    const absCoeff = Math.abs(coeff);
    const signStr = coeff < 0 ? "-" : polyStr === "" ? "" : "+";
    let termStr = "";

    if (absCoeff !== 1 || power === 0) {
      termStr = absCoeff.toFixed(4);
    }
    if (power > 0) {
      termStr += "λ";
      if (power > 1) termStr += `^${power}`;
    }

    if (polyStr === "") {
      polyStr += (coeff < 0 ? "-" : "") + termStr;
    } else {
      polyStr += ` ${signStr} ${termStr}`;
    }
  }

  return polyStr === "" ? "0" : polyStr;
}

// ---------------------------------------------------------------------------
// Ma trận — các phép biến đổi Danilevsky
// ---------------------------------------------------------------------------

/** TH1: hoán vị hàng i ↔ j và cột i ↔ j trên ma trận A */
function swapRowsAndCols(matrixA: NumMatrix, i: number, j: number): void {
  for (let r = 0; r < matrixA.length; r++) {
    [matrixA[r][i], matrixA[r][j]] = [matrixA[r][j], matrixA[r][i]];
  }
  [matrixA[i], matrixA[j]] = [matrixA[j], matrixA[i]];
}

/** Ma trận hoán vị C: đổi chỗ cột (và hàng) i ↔ j */
function buildPermutationMatrix(n: number, i: number, j: number): NumMatrix {
  const perm = createIdentity(n);
  for (let r = 0; r < n; r++) {
    [perm[r][i], perm[r][j]] = [perm[r][j], perm[r][i]];
  }
  return perm;
}

/**
 * TH2: lập M và M⁻¹ cấp n.
 * Thay hàng (rowIndex - 1) của I bằng hàng rowIndex của A.
 */
function buildEliminationMatrices(
  rowK: number[],
  rowIndex: number,
  n: number,
): { eliminationMatrix: NumMatrix; inverseMatrix: NumMatrix } {
  const pivot = rowK[rowIndex - 1];
  const eliminationMatrix = createIdentity(n);
  const inverseMatrix = createIdentity(n);

  for (let col = 0; col < n; col++) {
    eliminationMatrix[rowIndex - 1][col] = rowK[col];
    if (col === rowIndex - 1) {
      inverseMatrix[rowIndex - 1][col] = 1 / pivot;
    } else {
      inverseMatrix[rowIndex - 1][col] = -rowK[col] / pivot;
    }
  }

  return { eliminationMatrix, inverseMatrix };
}

/** Biến đổi đồng dạng: A ← M·A·M⁻¹ (dùng M⁻¹ giải tích từ công thức LT) */
function applySimilarityTransform(
  matrixA: NumMatrix,
  eliminationMatrix: NumMatrix,
  inverseMatrix: NumMatrix,
): NumMatrix {
  const temp = multiplyMatrices(eliminationMatrix, matrixA);
  return multiplyMatrices(temp, inverseMatrix);
}

/**
 * Vector riêng chuẩn trong hệ tọa độ đã biến đổi.
 * - Trị riêng tách khối (TH3): e_row
 * - Khối Frobenius bậc m: [λ^{m-1}, ..., λ, 1, 0, ...]
 */
function buildStandardEigenvector(
  n: number,
  activeSize: number,
  eigenvalue: Complex,
  scalarRow?: number,
): Complex[] {
  const vector = Array.from({ length: n }, () => new Complex(0));

  if (scalarRow !== undefined) {
    vector[scalarRow] = new Complex(1);
    return vector;
  }

  for (let i = 0; i < activeSize; i++) {
    const power = activeSize - 1 - i;
    vector[i] = eigenvalue.pow(power);
  }

  return vector;
}

/** v = P · u — đưa vector riêng chuẩn về hệ gốc */
function applyTransformToVector(
  transformMatrix: NumMatrix,
  standardVector: Complex[],
): Complex[] {
  const n = transformMatrix.length;
  const result = Array.from({ length: n }, () => new Complex(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[i] = result[i].add(
        new Complex(transformMatrix[i][j]).mul(standardVector[j]),
      );
    }
  }

  return result;
}

function formatComplexVector(vector: Complex[]): string {
  return vector
    .map((v) => {
      const re = cleanNearZero(v.re);
      const im = cleanNearZero(v.im);
      return new Complex(re, im).toString(4);
    })
    .join(", ");
}

// ---------------------------------------------------------------------------
// Thuật toán chính
// ---------------------------------------------------------------------------

export function runDanilevsky(params: Record<string, string>, logger: Logger) {
  const { matA } = params;

  let matrixA: NumMatrix;
  try {
    matrixA = parseMatrix(matA);
  } catch (e) {
    logger.error("Lỗi đọc ma trận: " + (e as Error).message);
    return;
  }

  const n = matrixA.length;
  if (n === 0) {
    logger.error("Ma trận A không hợp lệ.");
    return;
  }
  for (let i = 0; i < n; i++) {
    if (matrixA[i].length !== n) {
      logger.error(
        `Ma trận không vuông: Hàng ${i + 1} có ${matrixA[i].length} phần tử, khác với số hàng là ${n}.`,
      );
      return;
    }
  }

  logger.section("BƯỚC 1: KHỞI TẠO");
  logger.info(`Input: Ma trận vuông A cấp n = ${n}.`);
  logger.info(`Gán k = n = ${n}. Khởi tạo P_out(λ) = 1.`);
  logger.info(`Khởi tạo ma trận chuyển cơ sở tích lũy P = I_${n}:`);
  logger.info("Ma trận A:");
  logger.table(formatMatrixForLog(matrixA));

  // Bước 2 (BT.md): lặp khi k > 1
  let transformMatrix = createIdentity(n);
  logger.table(formatMatrixForLog(transformMatrix));

  const pFactorHistory: string[] = [`I_${n}`];
  let accumulatedPoly: Polynomial = [1];
  const scalarSplits: ScalarSplit[] = [];
  let activeSize = n;
  let rowIndex = activeSize - 1;
  let loopCount = 0;

  while (activeSize > 1 && rowIndex >= 1) {
    loopCount++;
    const k = activeSize;
    const pivot = matrixA[rowIndex][rowIndex - 1];

    logger.separator();
    logger.step(`Bước 2 — Vòng lặp lần ${loopCount} (k = ${k})`);
    logger.info(
      `Xét hàng ${k}, phần tử sát đường chéo $$a_{${k},${k - 1}} = ${formatNum(pivot)}$$.`,
    );

    if (Math.abs(pivot) < EPS) {
      let swapCol = -1;
      for (let s = 0; s < rowIndex - 1; s++) {
        if (Math.abs(matrixA[rowIndex][s]) > EPS) {
          swapCol = s;
          break;
        }
      }

      if (swapCol !== -1) {
        // TH1
        logger.info(
          `Trường hợp 1: $$a_{${k},${k - 1}} = 0$$ và tồn tại $$a_{${k},${swapCol + 1}} \\neq 0$$.`,
        );
        logger.step(
          `[Hàng ${rowIndex + 1}] a(${rowIndex + 1},${rowIndex}) = 0 nhưng có a(${rowIndex + 1},${swapCol + 1}) ≠ 0. TH1: Hoán vị.`,
        );
        logger.info(
          `1. Lập ma trận hoán vị C_{${swapCol + 1} ↔ ${k - 1}}: đổi chỗ cột/hàng ${swapCol + 1} và ${k - 1}.`,
        );

        const permutation = buildPermutationMatrix(n, swapCol, rowIndex - 1);
        logger.table(formatMatrixForLog(permutation));

        logger.info("2. Biến đổi đồng dạng: A ← C · A · C");
        swapRowsAndCols(matrixA, swapCol, rowIndex - 1);
        transformMatrix = multiplyMatrices(transformMatrix, permutation);
        const factorLabel = `C_{${swapCol + 1} ↔ ${k - 1}}`;
        pFactorHistory.push(factorLabel);

        logger.info("Ma trận A sau hoán vị:");
        logger.table(formatMatrixForLog(matrixA));

        logger.info("3. Cập nhật ma trận chuyển cơ sở tích lũy:");
        logTransformMatrixAfterUpdate(
          logger,
          `P_mới = P_cũ · ${factorLabel}`,
          transformMatrix,
        );
        logger.info("→ Chuyển sang xử lý Trường hợp 2 (không hạ cấp k).");
        continue;
      }

      // TH3
      const eigenvalue = matrixA[rowIndex][rowIndex];
      logger.info(
        `Trường hợp 3: $$a_{${k},j} = 0$$ với mọi $$j \\le ${k - 1}$$ — hàng ${k} đã đạt dạng Frobenius cấp 1.`,
      );
      logger.step(
        `[Hàng ${rowIndex + 1}] Toàn bộ phần tử bên trái đường chéo đều bằng 0. TH3: Giảm bậc khối.`,
      );
      logger.formula(
        `A phân rã: $$A_{${k}} = \\begin{bmatrix} A_{${k - 1}} & \\square \\\\ 0 & a_{${k}${k}} \\end{bmatrix}$$`,
      );
      logger.info(
        `Bóc tách trị riêng độc lập: λ = a_{${k},${k}} = ${formatNum(eigenvalue)}.`,
      );
      logger.formula(
        `Cập nhật đa thức tích lũy: $$P_{out}(\\lambda) \\leftarrow P_{out}(\\lambda) \\cdot (${formatNum(eigenvalue)} - \\lambda)$$`,
      );
      logger.formula(
        `Đa thức tích lũy có thêm nhân tử: $$(${eigenvalue.toFixed(4)} - \\lambda)$$`,
      );

      accumulatedPoly = multiplyPolynomials(accumulatedPoly, [-1, eigenvalue]);
      scalarSplits.push({ rowIndex, eigenvalue });

      logger.info(
        `Thu gọn ma trận con cấp ${k - 1} (bỏ hàng/cột ${k}), gán k ← ${k - 1}.`,
      );
      activeSize = rowIndex;
      rowIndex = activeSize - 1;
      continue;
    }

    // TH2
    logger.info(`Trường hợp 2: a_{${k},${k - 1}} = ${formatNum(pivot)} ≠ 0.`);
    logger.step(
      `[Hàng ${rowIndex + 1}] Chọn phần tử kề chéo a(${rowIndex + 1},${rowIndex}) = ${pivot.toFixed(4)}. TH2: Khử Frobenius.`,
    );
    logger.info(
      `Hàng ${k} hiện tại: ${formatMatrixRow(matrixA[rowIndex])}, phần tử chia a_{${k},${k - 1}} = ${formatNum(pivot)}.`,
    );
    logger.info(
      `1. Lập ma trận khử M: thay hàng ${k - 1} của I_${n} bằng hàng ${k} của A.`,
    );

    const { eliminationMatrix, inverseMatrix } = buildEliminationMatrices(
      matrixA[rowIndex],
      rowIndex,
      n,
    );
    logger.table(formatMatrixForLog(eliminationMatrix));

    logger.info(
      `2. Lập ma trận nghịch đảo M⁻¹ (chia hàng ${k - 1} cho a_{${k},${k - 1}}):`,
    );
    logger.table(formatMatrixForLog(inverseMatrix));

    logger.info("3. Biến đổi đồng dạng: A ← M · A · M⁻¹");
    matrixA = applySimilarityTransform(
      matrixA,
      eliminationMatrix,
      inverseMatrix,
    );

    transformMatrix = multiplyMatrices(transformMatrix, inverseMatrix);
    const factorLabel = `M⁻¹_k=${k}`;
    pFactorHistory.push(factorLabel);

    logger.info(
      `   Hàng ${k} đạt dạng Frobenius ${describeFrobeniusTargetRow(rowIndex, n)}.`,
    );
    logger.info("Ma trận A sau biến đổi:");
    logger.table(formatMatrixForLog(matrixA));

    logger.info("4. Cập nhật ma trận chuyển cơ sở tích lũy:");
    logTransformMatrixAfterUpdate(logger, "P_mới = P_cũ · M⁻¹", transformMatrix);

    const newK = k - 1;
    logger.info(`5. Hạ cấp: k ← ${newK}.`);
    rowIndex--;
  }

  logger.separator();
  logger.section("BƯỚC 3: TRÍCH XUẤT KẾT QUẢ");
  const frobeniusView = matrixA
    .slice(0, activeSize)
    .map((row) => row.slice(0, activeSize));

  logger.info(
    `Vòng lặp dừng (k = 1). Ma trận đạt dạng chuẩn Frobenius F cấp m = ${activeSize}:`,
  );
  logger.table(formatMatrixForLog(frobeniusView));

  const frobeniusPoly =
    activeSize >= 1
      ? extractFrobeniusPolynomial(matrixA, activeSize)
      : [1];
  const characteristicPoly = multiplyPolynomials(accumulatedPoly, frobeniusPoly);

  if (activeSize >= 1) {
    const negCoeffs = frobeniusView[0].map(formatNum).join(", ");
    logger.info(
      `Trích hệ số hàng 1 của F: [-p₁, -p₂, ..., -p_${activeSize}] = [${negCoeffs}]`,
    );
    const pList = frobeniusPoly
      .slice(1)
      .map((p, i) => `p_${i + 1} = ${formatNum(p)}`)
      .join(", ");
    logger.formula(`Suy ra: $$${pList}$$`);
    logger.formula(
      `$$P_F(\\lambda) = ${formatCharacteristicPolynomial(frobeniusPoly, activeSize)}$$`,
    );
  }

  if (scalarSplits.length > 0) {
    const factors = scalarSplits
      .map((s) => `(${formatNum(s.eigenvalue)} - λ)`)
      .join(" · ");
    logger.info(`P_out(λ) = ${factors}`);
    logger.formula(`$$P(\\lambda) = P_{out}(\\lambda) \\cdot P_F(\\lambda)$$`);
  }

  const polyStr = formatCharacteristicPolynomial(characteristicPoly, n);
  const polyWrapper = n % 2 === 0 ? "" : "-(";
  const polySuffix = n % 2 === 0 ? "" : ")";

  logger.result(
    `Đa thức đặc trưng: $$P(\\lambda) = ${polyWrapper}${polyStr.replace(/^-/, "")}${polySuffix} = 0$$`,
  );

  logger.separator();
  logger.section("MA TRẬN CHUYỂN CƠ SỞ P");
  logger.info(
    "P là ma trận tích lũy các phép biến đổi đồng dạng (hoán vị C, khử M⁻¹) trong quá trình Danilevsky.",
  );
  logger.formula(`$$P = ${pFactorHistory.join(" \\cdot ")}$$`);
  logger.info(
    "Quan hệ: A ∼ F (đồng dạng). Vector riêng chuẩn u trong hệ Frobenius được đưa về hệ gốc bằng v = P · u.",
  );
  logger.info("Ma trận P cuối cùng:");
  logger.table(formatMatrixForLog(transformMatrix));

  const frobeniusRoots = findPolynomialRoots(frobeniusPoly);
  const allRoots: { value: Complex; scalarRow?: number }[] = [
    ...scalarSplits.map((s) => ({
      value: new Complex(s.eigenvalue),
      scalarRow: s.rowIndex,
    })),
    ...frobeniusRoots.map((value) => ({ value })),
  ];

  logger.separator();
  logger.section("GIÁ TRỊ RIÊNG");
  logger.info("Giải phương trình P(λ) = 0 (phương pháp Durand-Kerner):");
  logger.success(`✔ Tìm được ${allRoots.length} giá trị riêng (nghiệm):`);
  allRoots.forEach((root, idx) => {
    logger.info(`  λ${idx + 1} = ${root.value.toString(4)}`);
  });

  logger.separator();
  logger.section("VECTOR RIÊNG");
  logger.info(
    "Vector riêng chuẩn trong hệ tọa độ Frobenius: u = [λ^{m-1}, ..., λ, 1]ᵀ (TH3: e_k).",
  );
  logger.formula("Áp dụng ma trận $P$ ở trên: $$v = P \\cdot u$$");
  allRoots.forEach((root, idx) => {
    const standardVector = buildStandardEigenvector(
      n,
      activeSize,
      root.value,
      root.scalarRow,
    );
    const eigenvector = applyTransformToVector(transformMatrix, standardVector);

    if (root.scalarRow !== undefined) {
      logger.info(
        `  λ${idx + 1} = ${root.value.toString(4)} (tách khối TH3): u = e_${root.scalarRow + 1}`,
      );
    } else {
      const uParts = standardVector
        .slice(0, activeSize)
        .map((c) => c.toString(4))
        .join(", ");
      logger.info(
        `  λ${idx + 1} = ${root.value.toString(4)}: u = [${uParts}${activeSize < n ? ", 0, ..." : ""}]`,
      );
    }
    logger.info(
      `  v${idx + 1} = P · u = [${formatComplexVector(eigenvector)}]`,
    );
  });
}
