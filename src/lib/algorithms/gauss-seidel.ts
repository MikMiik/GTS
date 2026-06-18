import type { Logger } from "@/types/solver";

type NumMatrix = number[][];

const TABLE_DECIMALS = 4;

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
  if (!trimmed) throw new Error("Vector b không được rỗng");
  if (trimmed.includes("\n")) {
    return trimmed
      .split("\n")
      .filter((l) => l.trim() !== "")
      .map((line, i) => {
        const parts = line.trim().split(/[\s,;]+/);
        if (parts.length !== 1) {
          throw new Error(`Mỗi dòng của b chỉ chứa 1 giá trị (lỗi ở dòng ${i + 1})`);
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

// ---------------------------------------------------------------------------
// Định dạng số
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
    for (let j = 0; j < cols; j++) {
      obj[`c${j + 1}`] = fmt(row[j]);
    }
    return obj;
  });
}

// ---------------------------------------------------------------------------
// Kiểm tra chéo trội và tính q, s
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
function computeRowCaseQS(A: NumMatrix): { s: number; q: number; qValues: number[] } {
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
// Vòng lặp Gauss-Seidel
// ---------------------------------------------------------------------------

function gaussSeidelIterate(
  A: NumMatrix,
  b: number[],
  x0: number[],
  epsPrime: number,
  maxIter: number,
  invDiag: number[],
  logger: Logger,
): { converged: boolean; k: number; x: number[]; delta: number } {
  const n = A.length;
  const xPrev = [...x0];
  const xCurr = [...x0];
  const tableData: Record<string, unknown>[] = [
    { k: 0, ...Object.fromEntries(x0.map((v, i) => [`x${i + 1}`, fmt(v)])), "‖ΔX‖∞": "—" },
  ];

  let k = 0;
  let delta = Infinity;

  while (k < maxIter) {
    k++;
    for (let i = 0; i < n; i++) {
      let sum = b[i];
      for (let j = 0; j < i; j++) sum -= A[i][j] * xCurr[j];
      for (let j = i + 1; j < n; j++) sum -= A[i][j] * xPrev[j];
      xCurr[i] = sum * invDiag[i];
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

    if (delta <= epsPrime) {
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

export function runGaussSeidel(params: Record<string, string>, logger: Logger): void {
  const { matA, vecB, x0Str, epsilon, maxIter: maxIterStr } = params;

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
  if (b.length !== n) {
    logger.error(`Vector b phải có đúng ${n} phần tử.`);
    return;
  }
  if (x0.length !== n) {
    logger.error(`X₀ phải có đúng ${n} phần tử.`);
    return;
  }
  if (isNaN(eps) || eps <= 0) {
    logger.error("ε phải là số dương.");
    return;
  }
  if (isNaN(maxIter) || maxIter <= 0) {
    logger.error("N (số lặp tối đa) phải là số nguyên dương.");
    return;
  }

  for (let i = 0; i < n; i++) {
    if (Math.abs(A[i][i]) < 1e-15) {
      logger.error(`Phần tử đường chéo a(${i + 1},${i + 1}) = 0 — không thể áp dụng Gauss-Seidel.`);
      return;
    }
  }

  logger.section("MA TRẬN ĐẦU VÀO");
  logger.info(`Kích thước: ${n} × ${n}`);
  logger.text("Ma trận A:");
  logger.table(formatMatrixForLog(A));
  logger.info(`b = ${formatVec(b)}`);
  logger.info(`X⁽⁰⁾ = ${formatVec(x0)}`);
  logger.info(`ε = ${eps}, N = ${maxIter}`);

  // Bước 1: Kiểm tra điều kiện hội tụ
  logger.section("KIỂM TRA ĐIỀU KIỆN HỘI TỤ");

  const rowDominant = isRowStrictDominant(A);
  const colDominant = isColStrictDominant(A);

  if (rowDominant) {
    logger.success("Ma trận A chéo trội hàng ngặt → phương pháp Gauss-Seidel chắc chắn hội tụ.");
    for (let i = 0; i < n; i++) {
      let offDiag = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) offDiag += Math.abs(A[i][j]);
      }
      logger.info(
        `Hàng ${i + 1}: |a${i + 1}${i + 1}| = ${fmt(Math.abs(A[i][i]))} > ${fmt(offDiag)} = Σ|a${i + 1}j| (j≠${i + 1})`,
      );
    }
  } else {
    logger.info("Ma trận A không chéo trội hàng ngặt.");
    for (let i = 0; i < n; i++) {
      let offDiag = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) offDiag += Math.abs(A[i][j]);
      }
      const ok = Math.abs(A[i][i]) > offDiag;
      logger.info(
        `Hàng ${i + 1}: |a${i + 1}${i + 1}| = ${fmt(Math.abs(A[i][i]))} ${ok ? ">" : "≤"} ${fmt(offDiag)} ${ok ? "✓" : "✗"}`,
      );
    }
  }

  let s: number;
  let q: number;
  let dominanceType: "row" | "col";

  if (rowDominant) {
    dominanceType = "row";
    const result = computeRowCaseQS(A);
    s = result.s;
    q = result.q;
    logger.info("Áp dụng công thức chéo trội hàng: s = 0.");
    result.qValues.forEach((qi, i) => {
      logger.info(`q${i + 1} = ${fmt(qi)}`);
    });
  } else if (colDominant) {
    dominanceType = "col";
    logger.success("Ma trận A chéo trội cột ngặt → phương pháp Gauss-Seidel chắc chắn hội tụ.");
    for (let j = 0; j < n; j++) {
      let offDiag = 0;
      for (let i = 0; i < n; i++) {
        if (i !== j) offDiag += Math.abs(A[i][j]);
      }
      logger.info(
        `Cột ${j + 1}: |a${j + 1}${j + 1}| = ${fmt(Math.abs(A[j][j]))} > ${fmt(offDiag)} = Σ|aᵢ${j + 1}| (i≠${j + 1})`,
      );
    }
    const result = computeColCaseQS(A);
    s = result.s;
    q = result.q;
    result.sValues.forEach((sj, j) => {
      logger.info(`s${j + 1} = ${fmt(sj)}`);
    });
    result.qValues.forEach((qj, j) => {
      logger.info(`q${j + 1} = ${fmt(qj)}`);
    });
  } else {
    logger.error(
      "Ma trận A không chéo trội hàng ngặt cũng không chéo trội cột ngặt — không đảm bảo hội tụ theo lý thuyết.",
    );
    return;
  }

  if (q >= 1) {
    logger.error(`Hệ số co q = ${fmt(q)} ≥ 1 — không đảm bảo hội tụ.`);
    return;
  }

  // Bước 2: Chuẩn hóa sai số
  logger.section("HỆ SỐ CO VÀ CHUẨN HÓA SAI SỐ");
  logger.info(`s = ${fmt(s)}, q = ${fmt(q)} (${dominanceType === "row" ? "chéo trội hàng" : "chéo trội cột"})`);

  const epsPrime = (eps * (1 - s) * (1 - q)) / q;
  const errorCoeff = q / ((1 - s) * (1 - q));

  logger.formula("ε' = ε(1 − s)(1 − q) / q");
  logger.info(`ε' = ${fmt(epsPrime)}`);
  logger.formula("Điều kiện dừng: δ = ‖X⁽ᵏ⁾ − X⁽ᵏ⁻¹⁾‖∞ ≤ ε'");
  logger.formula("Sai số hậu nghiệm: ‖X⁽ᵏ⁾ − x*‖ ≤ [q / ((1−s)(1−q))] · δ");

  // Pre-compute 1/a_ii
  const invDiag = A.map((row, i) => 1 / row[i]);

  // Bước 3–4: Vòng lặp
  logger.section("QUÁ TRÌNH LẶP");
  logger.formula(
    "xᵢ⁽ᵏ⁾ = (1/aᵢᵢ) · (bᵢ − Σⱼ<ᵢ aᵢⱼxⱼ⁽ᵏ⁾ − Σⱼ>ᵢ aᵢⱼxⱼ⁽ᵏ⁻¹⁾)",
  );

  const { converged, k, x, delta } = gaussSeidelIterate(
    A,
    b,
    x0,
    epsPrime,
    maxIter,
    invDiag,
    logger,
  );

  logger.separator();
  logger.text(`Ngưỡng dừng ε' = ${fmt(epsPrime)}`);

  if (converged) {
    logger.success(`✔ Thỏa mãn điều kiện dừng tại bước k = ${k}.`);
    logger.result(`Nghiệm xấp xỉ: X⁽${k}⁾ = ${formatVec(x)}`);

    const errorBound = errorCoeff * delta;
    logger.section("ĐÁNH GIÁ SAI SỐ HẬU NGHIỆM");
    logger.info(`δ = ‖X⁽${k}⁾ − X⁽${k - 1}⁾‖∞ = ${fmt(delta)}`);
    logger.formula(`‖X⁽${k}⁾ − x*‖ ≤ [q / ((1−s)(1−q))] · δ = ${fmt(errorCoeff)} × ${fmt(delta)}`);
    logger.result(`Sai số không vượt quá: ${fmt(errorBound)}`);
  } else {
    logger.warn(`⚠ Không đạt hội tụ sau ${maxIter} bước lặp.`);
    logger.text(`Kết quả cuối: X⁽${k}⁾ = ${formatVec(x)}, δ = ${fmt(delta)}`);
  }
}
