import type { Logger } from "@/types/solver";
import { getPrecisionByEpsilon, parseFraction } from "./math-utils";

type NumMatrix = number[][];

let currentDecimals = 5;

// ---------------------------------------------------------------------------
// Parse đầu vào
// ---------------------------------------------------------------------------

function parseMatrix(text: string): NumMatrix {
  const lines = text
    .trim()
    .split("\n")
    .filter((l) => l.trim() !== "");
  return lines.map((line, i) => {
    const normalizedLine = line.replace(/\s*\/\s*/g, '/');
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
  const normalizedText = text.replace(/\s*\/\s*/g, '/');
  const trimmed = normalizedText.trim();
  if (trimmed.includes("\n")) {
    return trimmed
      .split("\n")
      .filter((l) => l.trim() !== "")
      .map((line, i) => {
        const parts = line.trim().split(/[\s,;]+/);
        if (parts.length !== 1) {
          throw new Error(
            `Mỗi dòng của b chỉ chứa 1 giá trị (lỗi ở dòng ${i + 1})`,
          );
        }
        const n = parseFraction(parts[0]);
        if (isNaN(n))
          throw new Error(`Giá trị không hợp lệ "${parts[0]}" ở dòng ${i + 1}`);
        return n;
      });
  }
  return trimmed.split(/[\s,;]+/).map((v) => {
    const n = parseFraction(v);
    if (isNaN(n)) throw new Error(`Giá trị "${v}" không hợp lệ`);
    return n;
  });
}

// ---------------------------------------------------------------------------
// Định dạng số
// ---------------------------------------------------------------------------

function fmt(v: number, d = currentDecimals): string {
  if (!Number.isFinite(v)) return String(v);
  if (Math.abs(v) < 1e-15) return "0";
  return v.toFixed(d);
}

function formatMatrixForLog(m: NumMatrix): Record<string, string>[] {
  const cols = m[0]?.length ?? 0;
  return m.map((row, i) => {
    const obj: Record<string, string> = { hàng: String(i + 1) };
    for (let j = 0; j < cols; j++) {
      obj[`c${j + 1}`] = fmt(row[j]);
    }
    return obj;
  });
}

// ---------------------------------------------------------------------------
// Kiểm tra chéo trội và tính q, s (Ax = b)
// ---------------------------------------------------------------------------

/** Kiểm tra chéo trội hàng ngặt: |a_ii| > Σ_{j≠i} |a_ij| */
function isRowStrictDominant(A: NumMatrix): boolean {
  const n = A.length;
  for (let i = 0; i < n; i++) {
    let offDiag = 0;
    for (let j = 0; j < n; j++) {
      if (j !== i) offDiag += Math.abs(A[i][j]);
    }
    if (Math.abs(A[i][i]) <= offDiag) return false;
  }
  return true;
}

/** Kiểm tra chéo trội cột ngặt: |a_jj| > Σ_{i≠j} |a_ij| */
function isColStrictDominant(A: NumMatrix): boolean {
  const n = A.length;
  for (let j = 0; j < n; j++) {
    let offDiag = 0;
    for (let i = 0; i < n; i++) {
      if (i !== j) offDiag += Math.abs(A[i][j]);
    }
    if (Math.abs(A[j][j]) <= offDiag) return false;
  }
  return true;
}

/** Trường hợp chéo trội hàng: s = 0, tính q_i theo từng hàng */
function computeRowCaseQS(A: NumMatrix): {
  s: number;
  q: number;
  qValues: number[];
} {
  const n = A.length;
  const qValues: number[] = [];
  for (let i = 0; i < n; i++) {
    let sumBefore = 0;
    let sumAfter = 0;
    for (let j = 0; j < i; j++) sumBefore += Math.abs(A[i][j]);
    for (let j = i + 1; j < n; j++) sumAfter += Math.abs(A[i][j]);
    const denom = Math.abs(A[i][i]) - sumBefore;
    qValues.push(denom > 0 ? sumAfter / denom : Infinity);
  }
  return { s: 0, q: Math.max(...qValues), qValues };
}

/** Trường hợp chéo trội cột: tính s_j và q_j theo từng cột */
function computeColCaseQS(A: NumMatrix): {
  s: number;
  q: number;
  sValues: number[];
  qValues: number[];
} {
  const n = A.length;
  const sValues: number[] = [];
  const qValues: number[] = [];
  for (let j = 0; j < n; j++) {
    let sumAbove = 0;
    let sumBelow = 0;
    for (let i = 0; i < j; i++) sumAbove += Math.abs(A[i][j]);
    for (let i = j + 1; i < n; i++) sumBelow += Math.abs(A[i][j]);
    sValues.push((1 / Math.abs(A[j][j])) * sumBelow);
    const denom = Math.abs(A[j][j]) - sumBelow;
    qValues.push(denom > 0 ? sumAbove / denom : Infinity);
  }
  return {
    s: Math.max(...sValues),
    q: Math.max(...qValues),
    sValues,
    qValues,
  };
}

// ---------------------------------------------------------------------------
// Tính s, q cho dạng lặp x = Bx + d
// ---------------------------------------------------------------------------

function computeIterativeRowCaseQS(B: NumMatrix): {
  s: number;
  q: number;
  sValues: number[];
  qValues: number[];
} {
  const n = B.length;
  const sValues: number[] = [];
  const qValues: number[] = [];
  for (let i = 0; i < n; i++) {
    let sumL = 0;
    let sumR = 0;
    for (let j = 0; j < i; j++) sumL += Math.abs(B[i][j]);
    for (let j = i; j < n; j++) sumR += Math.abs(B[i][j]);
    sValues.push(sumL);
    qValues.push(sumR);
  }
  return {
    s: Math.max(...sValues),
    q: Math.max(...qValues),
    sValues,
    qValues,
  };
}

function computeIterativeColCaseQS(B: NumMatrix): {
  s: number;
  q: number;
  sValues: number[];
  qValues: number[];
} {
  const n = B.length;
  const sValues: number[] = [];
  const qValues: number[] = [];
  for (let j = 0; j < n; j++) {
    let sumAbove = 0;
    let sumBelow = 0;
    for (let i = 0; i < j; i++) sumAbove += Math.abs(B[i][j]);
    for (let i = j; i < n; i++) sumBelow += Math.abs(B[i][j]);
    sValues.push(sumBelow);
    qValues.push(sumAbove);
  }
  return {
    s: Math.max(...sValues),
    q: Math.max(...qValues),
    sValues,
    qValues,
  };
}

// ---------------------------------------------------------------------------
// Vòng lặp Gauss-Seidel
// ---------------------------------------------------------------------------

function gaussSeidelIterate(
  A: NumMatrix,
  b: number[],
  x0: number[],
  epsPrime: number,
  maxIter: number,
  invDiag: number[],
  isIterativeForm: boolean,
  hasEpsilon: boolean,
  logger: Logger,
): { converged: boolean; k: number; x: number[]; delta: number } {
  const n = A.length;
  const xPrev = [...x0];
  const xCurr = [...x0];
  const tableData: Record<string, unknown>[] = [
    {
      k: 0,
      ...Object.fromEntries(x0.map((v, i) => [`x${i + 1}`, fmt(v)])),
      "‖ΔX‖∞": "—",
    },
  ];

  let k = 0;
  let delta = Infinity;

  while (k < maxIter) {
    k++;
    for (let i = 0; i < n; i++) {
      let sum = b[i];
      if (isIterativeForm) {
        for (let j = 0; j < i; j++) sum += A[i][j] * xCurr[j];
        for (let j = i; j < n; j++) sum += A[i][j] * xPrev[j];
        xCurr[i] = sum;
      } else {
        for (let j = 0; j < i; j++) sum -= A[i][j] * xCurr[j];
        for (let j = i + 1; j < n; j++) sum -= A[i][j] * xPrev[j];
        xCurr[i] = sum * invDiag[i];
      }
    }

    delta = 0;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(xCurr[i] - xPrev[i]);
      if (d > delta) delta = d;
    }

    tableData.push({
      k,
      ...Object.fromEntries(xCurr.map((v, i) => [`x${i + 1}`, fmt(v)])),
      "‖ΔX‖∞": fmt(delta),
    });

    if (hasEpsilon && delta <= epsPrime) {
      logger.table(tableData);
      return { converged: true, k, x: [...xCurr], delta };
    }

    for (let i = 0; i < n; i++) xPrev[i] = xCurr[i];
  }

  logger.table(tableData);
  return { converged: false, k, x: [...xCurr], delta };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function runGaussSeidel(
  params: Record<string, string>,
  logger: Logger,
): void {
  const { matA, vecB, x0Str, epsilon, maxIter: maxIterStr, equationFormat } = params;
  const isIterativeForm = equationFormat === "x=Bx+d";

  let A: NumMatrix;
  let b: number[];
  let x0: number[];

  try {
    A = parseMatrix(matA);
    b = parseVector(vecB);
    x0 = x0Str
      .trim()
      .split(/[\s,;]+/)
      .map((v) => {
        const n = parseFloat(v);
        if (isNaN(n)) throw new Error(`Giá trị "${v}" không hợp lệ trong X₀`);
        return n;
      });
  } catch (e) {
    logger.error("Lỗi đọc dữ liệu: " + (e as Error).message);
    return;
  }

  const maxIter = parseInt(maxIterStr, 10);
  
  const hasEpsilon = epsilon !== undefined && epsilon.trim() !== "";
  let eps = 0;
  if (hasEpsilon) {
    eps = parseFloat(epsilon);
    if (isNaN(eps) || eps <= 0) {
      logger.error("ε phải là số dương.");
      return;
    }
    const prec = getPrecisionByEpsilon(eps);
    currentDecimals = prec.tableDecimals;
  } else {
    currentDecimals = 5;
  }

  if (A.length === 0) {
    logger.error("Ma trận không hợp lệ.");
    return;
  }
  const n = A.length;
  if (!A.every((row) => row.length === n)) {
    logger.error("Ma trận phải vuông (n × n).");
    return;
  }
  if (b.length !== n) {
    logger.error(`Vector vế phải phải có đúng ${n} phần tử.`);
    return;
  }
  if (x0.length !== n) {
    logger.error(`X₀ phải có đúng ${n} phần tử.`);
    return;
  }
  if (isNaN(maxIter) || maxIter <= 0) {
    logger.error("N (số lặp tối đa) phải là số nguyên dương.");
    return;
  }

  if (!isIterativeForm) {
    for (let i = 0; i < n; i++) {
      if (Math.abs(A[i][i]) < 1e-15) {
        logger.error(
          `Phần tử đường chéo $$a_{${i + 1},${i + 1}} = 0$$ — không thể áp dụng Gauss-Seidel.`,
        );
        return;
      }
    }
  }

  logger.section("THÔNG TIN ĐẦU VÀO");
  logger.info(`Dạng giải: ${isIterativeForm ? "Hệ lặp $x = Bx + d$" : "Hệ tuyến tính $Ax = b$"}`);
  logger.info(`Kích thước: ${n} × ${n}`);
  logger.text(`Ma trận ${isIterativeForm ? "B" : "A"}:`);
  logger.table(formatMatrixForLog(A));
  logger.info(
    `$$${isIterativeForm ? "d" : "b"} = \\begin{bmatrix} ${b.map((v) => fmt(v)).join(" & ")} \\end{bmatrix}^T$$`,
  );
  logger.info(
    `$$X^{(0)} = \\begin{bmatrix} ${x0.map((v) => fmt(v)).join(" & ")} \\end{bmatrix}^T$$`,
  );
  if (hasEpsilon) {
    logger.info(`$$\\varepsilon = ${eps}, N = ${maxIter}$$`);
  } else {
    logger.info(`$$N = ${maxIter}$$`);
  }

  // Bước 1: Kiểm tra điều kiện hội tụ
  logger.section("KIỂM TRA ĐIỀU KIỆN HỘI TỤ");

  let s: number;
  let q: number;
  let dominanceType: "row" | "col" = "row";

  if (isIterativeForm) {
    const rowNorm = A.map((row) => row.reduce((sum, val) => sum + Math.abs(val), 0));
    const maxRowNorm = Math.max(...rowNorm);
    const colNorm = [];
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += Math.abs(A[i][j]);
      colNorm.push(sum);
    }
    const maxColNorm = Math.max(...colNorm);

    if (maxRowNorm < 1) {
      dominanceType = "row";
      logger.success(
        `Ma trận B có chuẩn hàng $||B||_\\infty = ${fmt(maxRowNorm)} < 1$ → Gauss-Seidel chắc chắn hội tụ.`,
      );
      const result = computeIterativeRowCaseQS(A);
      s = result.s;
      q = result.q;
      result.sValues.forEach((si, i) =>
        logger.info(`$$s_{${i + 1}} = \\sum_{j < ${i+1}} |B_{${i+1}j}| = ${fmt(si)}$$`),
      );
      result.qValues.forEach((qi, i) =>
        logger.info(`$$q_{${i + 1}} = \\sum_{j \\ge ${i+1}} |B_{${i+1}j}| = ${fmt(qi)}$$`),
      );
    } else if (maxColNorm < 1) {
      dominanceType = "col";
      logger.success(
        `Ma trận B có chuẩn cột $||B||_1 = ${fmt(maxColNorm)} < 1$ → Gauss-Seidel chắc chắn hội tụ.`,
      );
      const result = computeIterativeColCaseQS(A);
      s = result.s;
      q = result.q;
      result.sValues.forEach((sj, j) =>
        logger.info(`$$s_{${j + 1}} = \\sum_{i > ${j+1}} |B_{i${j+1}}| = ${fmt(sj)}$$`),
      );
      result.qValues.forEach((qj, j) =>
        logger.info(`$$q_{${j + 1}} = \\sum_{i \\le ${j+1}} |B_{i${j+1}}| = ${fmt(qj)}$$`),
      );
    } else {
      logger.error(
        `Ma trận B không thỏa mãn chuẩn hàng ($||B||_\\infty = ${fmt(maxRowNorm)}$) hay chuẩn cột ($||B||_1 = ${fmt(maxColNorm)}$) < 1 — không đảm bảo hội tụ.`,
      );
      return;
    }
  } else {
    const rowDominant = isRowStrictDominant(A);
    const colDominant = isColStrictDominant(A);

    if (rowDominant) {
      dominanceType = "row";
      logger.success(
        "Ma trận A chéo trội hàng ngặt → phương pháp Gauss-Seidel chắc chắn hội tụ.",
      );
      for (let i = 0; i < n; i++) {
        let offDiag = 0;
        for (let j = 0; j < n; j++) {
          if (j !== i) offDiag += Math.abs(A[i][j]);
        }
        logger.info(
          `Hàng ${i + 1}: $$|a_{${i + 1}${i + 1}}| = ${fmt(Math.abs(A[i][i]))} > ${fmt(offDiag)} = \\sum_{j \\neq ${i + 1}} |a_{${i + 1}j}|$$`,
        );
      }
      const result = computeRowCaseQS(A);
      s = result.s;
      q = result.q;
      logger.info("Áp dụng công thức chéo trội hàng: s = 0.");
      result.qValues.forEach((qi, i) => {
        logger.info(`$$q_{${i + 1}} = ${fmt(qi)}$$`);
      });
    } else if (colDominant) {
      dominanceType = "col";
      logger.success(
        "Ma trận A chéo trội cột ngặt → phương pháp Gauss-Seidel chắc chắn hội tụ.",
      );
      for (let j = 0; j < n; j++) {
        let offDiag = 0;
        for (let i = 0; i < n; i++) {
          if (i !== j) offDiag += Math.abs(A[i][j]);
        }
        logger.info(
          `Cột ${j + 1}: $$|a_{${j + 1}${j + 1}}| = ${fmt(Math.abs(A[j][j]))} > ${fmt(offDiag)} = \\sum_{i \\neq ${j + 1}} |a_{i${j + 1}}|$$`,
        );
      }
      const result = computeColCaseQS(A);
      s = result.s;
      q = result.q;
      result.sValues.forEach((sj, j) => {
        logger.info(`$$s_{${j + 1}} = ${fmt(sj)}$$`);
      });
      result.qValues.forEach((qj, j) => {
        logger.info(`$$q_{${j + 1}} = ${fmt(qj)}$$`);
      });
    } else {
      logger.info("Kiểm tra chéo trội hàng:");
      for (let i = 0; i < n; i++) {
        let offDiag = 0;
        for (let j = 0; j < n; j++) {
          if (j !== i) offDiag += Math.abs(A[i][j]);
        }
        const ok = Math.abs(A[i][i]) > offDiag;
        logger.info(
          `Hàng ${i + 1}: $$|a_{${i + 1}${i + 1}}| = ${fmt(Math.abs(A[i][i]))} ${ok ? ">" : "\\le"} ${fmt(offDiag)}$$ ${ok ? "✓" : "✗"}`,
        );
      }
      logger.error(
        "Ma trận A không chéo trội hàng ngặt cũng không chéo trội cột ngặt — không đảm bảo hội tụ theo lý thuyết.",
      );
      return;
    }
  }

  if (q >= 1) {
    logger.error(`Hệ số co $$q = ${fmt(q)} \\ge 1$$ — không đảm bảo hội tụ.`);
    return;
  }

  // Bước 2: Chuẩn hóa sai số
  logger.section("HỆ SỐ CO VÀ CHUẨN HÓA SAI SỐ");
  logger.info(
    `$$s = ${fmt(s)}, q = ${fmt(q)}$$ (${dominanceType === "row" ? (isIterativeForm ? "chuẩn hàng" : "chéo trội hàng") : (isIterativeForm ? "chuẩn cột" : "chéo trội cột")})`,
  );

  const epsPrime = (eps * (1 - s) * (1 - q)) / q;
  const errorCoeff = q / ((1 - s) * (1 - q));

  logger.formula("$$\\varepsilon' = \\frac{\\varepsilon(1 - s)(1 - q)}{q}$$");
  if (hasEpsilon) {
    logger.info(`$$\\varepsilon' = ${fmt(epsPrime)}$$`);
    logger.formula(
      "Điều kiện dừng: $$\\delta = \\|X^{(k)} - X^{(k-1)}\\|_\\infty \\le \\varepsilon'$$",
    );
  } else {
    logger.formula(`Lặp đúng $N_{\\max} = ${maxIter}$ lần`);
  }
  logger.formula(
    "Sai số hậu nghiệm: $$\\left\\| X^{(k)} - x^* \\right\\| \\le \\frac{q}{(1-s)(1-q)} \\delta$$",
  );

  // Pre-compute 1/a_ii if Ax=b
  const invDiag = isIterativeForm ? [] : A.map((row, i) => 1 / row[i]);

  // Bước 3–4: Vòng lặp
  logger.section("QUÁ TRÌNH LẶP");
  if (isIterativeForm) {
    logger.formula(
      "$$x_i^{(k)} = \\sum_{j < i} B_{ij} x_j^{(k)} + \\sum_{j \\ge i} B_{ij} x_j^{(k-1)} + d_i$$",
    );
  } else {
    logger.formula(
      "$$x_i^{(k)} = \\frac{1}{a_{ii}} \\left( b_i - \\sum_{j<i} a_{ij}x_j^{(k)} - \\sum_{j>i} a_{ij}x_j^{(k-1)} \\right)$$",
    );
  }

  const { converged, k, x, delta } = gaussSeidelIterate(
    A,
    b,
    x0,
    epsPrime,
    maxIter,
    invDiag,
    isIterativeForm,
    hasEpsilon,
    logger,
  );

  logger.separator();
  
  if (hasEpsilon) {
    logger.text(`Ngưỡng dừng $$\\varepsilon' = ${fmt(epsPrime)}$$`);
    if (converged) {
      logger.success(`✔ Thỏa mãn điều kiện dừng tại bước k = ${k}.`);
      logger.result(
        `Nghiệm xấp xỉ: $$X^{(${k})} = \\begin{bmatrix} ${x.map((v) => fmt(v)).join(" & ")} \\end{bmatrix}^T$$`,
      );

      const errorBound = errorCoeff * delta;
      logger.section("ĐÁNH GIÁ SAI SỐ HẬU NGHIỆM");
      logger.info(
        `$$\\delta = \\left\\| X^{(${k})} - X^{(${k - 1})} \\right\\|_\\infty = ${fmt(delta)}$$`,
      );
      logger.formula(
        `$$\\left\\| X^{(${k})} - x^* \\right\\| \\le \\frac{q}{(1-s)(1-q)} \\delta = ${fmt(errorCoeff)} \\times ${fmt(delta)}$$`,
      );
      logger.result(`Sai số không vượt quá: $$${fmt(errorBound)}$$`);
    } else {
      logger.warn(`⚠ Dừng lặp sau ${maxIter} vòng do đạt giới hạn, chưa thỏa mãn sai số.`);
      logger.text(
        `Kết quả cuối: $$X^{(${k})} = \\begin{bmatrix} ${x.map((v) => fmt(v)).join(" & ")} \\end{bmatrix}^T$$, $$\\delta = ${fmt(delta)}$$`,
      );
    }
  } else {
    logger.success(`✔ Hoàn thành quá trình lặp tại bước k = ${k}.`);
    logger.result(
      `Nghiệm xấp xỉ thu được: $$X^{(${k})} = \\begin{bmatrix} ${x.map((v) => fmt(v)).join(" & ")} \\end{bmatrix}^T$$`,
    );
    const errorBound = errorCoeff * delta;
    logger.section("ĐÁNH GIÁ SAI SỐ HẬU NGHIỆM TẠI BƯỚC CUỐI");
    logger.info(
      `$$\\delta = \\left\\| X^{(${k})} - X^{(${k - 1})} \\right\\|_\\infty = ${fmt(delta)}$$`,
    );
    logger.result(`Sai số không vượt quá: $$${fmt(errorBound)}$$`);
  }
}
