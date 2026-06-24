import type { Logger } from "@/types/solver";
import { parseFraction } from "./math-utils";
import {
  Complex,
  powerIteration,
  formatMatrixForLog,
  fmt,
} from "./power-eigen";

type NumMatrix = number[][];

function transpose(A: NumMatrix): NumMatrix {
  const n = A.length;
  const AT = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      AT[i][j] = A[j][i];
    }
  }
  return AT;
}

function dotProduct(u: number[], v: number[]): number {
  return u.reduce((sum, val, i) => sum + val * v[i], 0);
}

function outerProduct(u: number[], v: number[]): NumMatrix {
  const n = u.length;
  const M = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      M[i][j] = u[i] * v[j];
    }
  }
  return M;
}

function subtractMatrix(A: NumMatrix, B: NumMatrix): NumMatrix {
  const n = A.length;
  const M = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      M[i][j] = A[i][j] - B[i][j];
    }
  }
  return M;
}

function multiplyMatrix(A: NumMatrix, B: NumMatrix): NumMatrix {
  const n = A.length;
  const M = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) sum += A[i][k] * B[k][j];
      M[i][j] = sum;
    }
  }
  return M;
}

function findNullSpaceVector(M: NumMatrix): number[] {
  const n = M.length;
  const A = M.map((row) => [...row]);

  for (let c = 0; c < n - 1; c++) {
    let pivotRow = c;
    for (let r = c + 1; r < n; r++) {
      if (Math.abs(A[r][c]) > Math.abs(A[pivotRow][c])) {
        pivotRow = r;
      }
    }
    if (pivotRow !== c) {
      const temp = A[c];
      A[c] = A[pivotRow];
      A[pivotRow] = temp;
    }
    if (Math.abs(A[c][c]) < 1e-10) continue;

    for (let r = c + 1; r < n; r++) {
      const factor = A[r][c] / A[c][c];
      for (let j = c; j < n; j++) {
        A[r][j] -= factor * A[c][j];
      }
    }
  }

  const pivotCols: number[] = [];
  let row = 0;
  for (let c = 0; c < n; c++) {
    if (row < n && Math.abs(A[row][c]) > 1e-10) {
      pivotCols.push(c);
      row++;
    }
  }

  let freeCol = n - 1;
  for (let c = n - 1; c >= 0; c--) {
    if (!pivotCols.includes(c)) {
      freeCol = c;
      break;
    }
  }

  const x = new Array(n).fill(0);
  x[freeCol] = 1;

  for (let r = pivotCols.length - 1; r >= 0; r--) {
    const c = pivotCols[r];
    let sum = 0;
    for (let j = c + 1; j < n; j++) {
      sum += A[r][j] * x[j];
    }
    x[c] = -sum / A[r][c];
  }

  return x;
}

function parseMatrix(text: string): NumMatrix {
  const lines = text.trim().split("\n").filter((l) => l.trim() !== "");
  if (lines.length === 0) throw new Error("Ma trận rỗng");
  return lines.map((line, i) => {
    const normalizedLine = line.replace(/\s*\/\s*/g, '/');
    return normalizedLine.trim().split(/[\s,;]+/).map((v) => {
      const n = parseFraction(v);
      if (isNaN(n)) throw new Error(`Giá trị không hợp lệ "${v}" ở hàng ${i + 1}`);
      return n;
    });
  });
}

function parseVector(text: string): number[] {
  const normalizedText = text.replace(/\s*\/\s*/g, '/');
  const trimmed = normalizedText.trim();
  if (!trimmed) throw new Error("Vector rỗng");
  return trimmed.split(/[\s,;]+/).map((v) => {
    const n = parseFraction(v);
    if (isNaN(n)) throw new Error(`Giá trị không hợp lệ "${v}"`);
    return n;
  });
}

export function runXuongThang(params: Record<string, string>, logger: Logger): void {
  const { matA, lambda1Str, vecV1, vecY0, epsilon, maxIter: maxIterStr, method } = params;

  let A: NumMatrix;
  let v1: number[];
  let y0: number[];

  try {
    A = parseMatrix(matA);
    v1 = parseVector(vecV1);
    y0 = vecY0.trim() === "" ? new Array(A.length).fill(1) : parseVector(vecY0);
  } catch (e) {
    logger.error("Lỗi đọc dữ liệu: " + (e as Error).message);
    return;
  }

  const l1 = parseFraction(lambda1Str);
  const eps = parseFraction(epsilon);
  const maxIter = parseInt(maxIterStr, 10);

  if (A.length === 0) { logger.error("Ma trận A rỗng."); return; }
  const n = A.length;
  if (!A.every((row) => row.length === n)) { logger.error("Ma trận A phải vuông."); return; }
  if (v1.length !== n) { logger.error(`v₁ phải có ${n} phần tử.`); return; }
  if (y0.length !== n) { logger.error(`y₀ phải có ${n} phần tử.`); return; }
  if (isNaN(l1)) { logger.error("Giá trị λ₁ không hợp lệ."); return; }
  if (isNaN(eps) || eps <= 0) { logger.error("ε phải là số dương."); return; }
  if (isNaN(maxIter) || maxIter <= 0) { logger.error("N phải là số nguyên dương."); return; }

  logger.section("THÔNG TIN ĐẦU VÀO");
  logger.text("Ma trận A:");
  logger.table(formatMatrixForLog(A));
  logger.info(`$$\\lambda_1 = ${l1}$$`);
  logger.info(`$$v_1 = \\begin{bmatrix} ${v1.map((v) => fmt(v)).join(" & ")} \\end{bmatrix}^T$$`);
  logger.info(`$$y_0 = \\begin{bmatrix} ${y0.map((v) => fmt(v)).join(" & ")} \\end{bmatrix}^T$$`);

  let B: NumMatrix;

  if (method === "C1") {
    logger.section("PHƯƠNG PHÁP XUỐNG THANG - CÁCH 1 (VÉC-TƠ RIÊNG TRÁI)");
    
    // 1. Tìm véc-tơ riêng trái w1
    logger.step("1. Xác định véc-tơ riêng trái w₁");
    const AT = transpose(A);
    const M = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        M[i][j] = AT[i][j] - (i === j ? l1 : 0);
      }
    }
    
    const w1 = findNullSpaceVector(M);
    logger.info(`Giải hệ $$(A^T - \\lambda_1 I)w_1 = 0$$`);
    logger.info(`$$w_1 = \\begin{bmatrix} ${w1.map(v => fmt(v)).join(" & ")} \\end{bmatrix}^T$$`);

    // 2. Tính x
    logger.step("2. Tính véc-tơ chuẩn hóa x");
    const dotW1V1 = dotProduct(w1, v1);
    if (Math.abs(dotW1V1) < 1e-15) {
      logger.error("$$w_1^T v_1 = 0$$, không thể tính véc-tơ x.");
      return;
    }
    const x = w1.map(val => val / dotW1V1);
    logger.formula(`$$x = \\frac{w_1}{w_1^T v_1}$$`);
    logger.info(`$$w_1^T v_1 = ${fmt(dotW1V1)}$$`);
    logger.info(`$$x = \\begin{bmatrix} ${x.map(v => fmt(v)).join(" & ")} \\end{bmatrix}^T$$`);

    // 3. Tính B
    logger.step("3. Xây dựng ma trận xuống thang B");
    const L1_v1_xT = outerProduct(v1.map(v => v * l1), x);
    B = subtractMatrix(A, L1_v1_xT);
    logger.formula("$$B = A - \\lambda_1 v_1 x^T$$");
    logger.text("Ma trận xuống thang B:");
    logger.table(formatMatrixForLog(B));
  } else {
    logger.section("PHƯƠNG PHÁP XUỐNG THANG - CÁCH 2 (MA TRẬN KHỬ)");

    // 1. Tìm phần tử max của v1
    logger.step("1. Chuẩn hóa véc-tơ v₁");
    let maxIndex = 0;
    let maxVal = Math.abs(v1[0]);
    for (let i = 1; i < n; i++) {
      if (Math.abs(v1[i]) > maxVal) {
        maxVal = Math.abs(v1[i]);
        maxIndex = i;
      }
    }
    
    if (maxVal < 1e-15) {
      logger.error("v₁ là véc-tơ không.");
      return;
    }

    const v1_s = v1[maxIndex];
    const v1Norm = v1.map(v => v / v1_s);
    logger.info(`Thành phần có trị tuyệt đối lớn nhất nằm ở vị trí s = ${maxIndex + 1} ($$v_{1,s} = ${fmt(v1_s)}$$)`);
    logger.info(`Chuẩn hóa $$v_1$$ (chia cho $$v_{1,s}$$): $$v_1 = \\begin{bmatrix} ${v1Norm.map(v => fmt(v)).join(" & ")} \\end{bmatrix}^T$$`);

    // 2. Tính Theta
    logger.step("2. Xây dựng ma trận khử Θ");
    const Theta = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        Theta[i][j] = i === j ? 1 : 0;
      }
      Theta[i][maxIndex] -= v1Norm[i];
    }
    logger.text("Ma trận khử Θ:");
    logger.table(formatMatrixForLog(Theta));

    // 3. Tính A^(2)
    logger.step("3. Tính ma trận xuống thang $$A^{(2)} = \\Theta A$$");
    B = multiplyMatrix(Theta, A);
    logger.text("Ma trận $$A^{(2)}$$:");
    logger.table(formatMatrixForLog(B));
  }

  // 4. Áp dụng phương pháp lũy thừa trên B
  logger.section("BƯỚC 4: PHƯƠNG PHÁP LŨY THỪA TRÊN MA TRẬN XUỐNG THANG");
  const { converged, caseType, lambda, eigenvector, k } = powerIteration(
    B,
    y0,
    eps,
    maxIter,
    logger,
  );

  logger.separator();

  if (converged && lambda !== null) {
    logger.success(`✔ Phương pháp lũy thừa hội tụ tại bước k = ${k} (${caseType}).`);
    if (lambda instanceof Complex) {
      logger.result(`Giá trị riêng trội thứ hai: $$\\lambda_2 \\approx ${lambda.toString()}$$`);
    } else {
      logger.result(`Giá trị riêng trội thứ hai: $$\\lambda_2 \\approx ${fmt(lambda)}$$`);
    }
    logger.result(`Vector riêng tương ứng (của ma trận B/A²): $$u_2 \\approx \\begin{bmatrix} ${eigenvector.map(v => fmt(v)).join(" & ")} \\end{bmatrix}^T$$`);
  } else if (lambda !== null) {
    logger.warn(`⚠ Chưa đạt hội tụ sau ${maxIter} vòng lặp.`);
    if (lambda instanceof Complex) {
      logger.result(`$$\\lambda_2 \\approx ${lambda.toString()} \\quad (|\\lambda_2| \\approx ${fmt(lambda.abs())})$$`);
    } else {
      logger.result(`$$\\lambda_2 \\approx ${fmt(lambda)}$$`);
    }
    logger.result(`Vector riêng tương ứng: $$u_2 \\approx \\begin{bmatrix} ${eigenvector.map(v => fmt(v)).join(" & ")} \\end{bmatrix}^T$$`);
  } else {
    logger.warn(`⚠ Lỗi thuật toán phân rã.`);
  }
}
