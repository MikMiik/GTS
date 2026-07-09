import type { Logger } from "@/types/solver";
import { parseFraction } from "./math-utils";

type Mat = number[][];

function prec(epsilon: number) {
  return {
    tableDecimals: Math.max(0, Math.ceil(-Math.log10(epsilon)) + 1),
    reliableDigits: Math.max(1, Math.round(-Math.log10(2 * epsilon))),
  };
}

function rnd(v: number, sig: number) {
  if (!Number.isFinite(v)) return v;
  if (Math.abs(v) < 1e-15) return 0;
  const e = Math.floor(Math.log10(Math.abs(v)));
  return Math.round(v * Math.pow(10, sig - e - 1)) / Math.pow(10, sig - e - 1);
}

function fmt(v: number, d: number) {
  if (!Number.isFinite(v)) return String(v);
  if (Math.abs(v) < 1e-15) return "0";
  return v.toFixed(d);
}

function fmtVec(v: number[], d: number) {
  return `[${v.map((vi) => fmt(vi, d)).join(", ")}]`;
}

function parseMatrix(text: string): Mat {
  return text.trim().split(/\r?\n/).filter((l) => l.trim()).map((line) =>
    line.replace(/\s*\/\s*/g, '/').split(/[\s,;]+/).filter((v) => v).map((v) => {
      const num = parseFraction(v);
      if (isNaN(num)) throw new Error(`Giá trị không hợp lệ: ${v}`);
      return num;
    })
  );
}

function parseVector(text: string): number[] {
  return text.replace(/\s*\/\s*/g, '/').split(/[\s,;]+/).filter((v) => v).map((v) => {
    const num = parseFraction(v);
    if (isNaN(num)) throw new Error(`Giá trị không hợp lệ: ${v}`);
    return num;
  });
}

function fmtMatTex(M: Mat, d: number = 4): string {
  const rows = M.map((r) => r.map((x) => fmt(x, d)).join(" & "));
  return `\\begin{bmatrix} ${rows.join(" \\\\ ")} \\end{bmatrix}`;
}

export function runJacobiMatrix(params: Record<string, string>, logger: Logger): void {
  const { matA, vecB, epsilon, maxIterStr } = params;

  let A: Mat;
  let B: number[];
  try {
    A = parseMatrix(matA);
    B = parseVector(vecB);
  } catch (e) {
    logger.error("Lỗi đọc ma trận/vector: " + (e as Error).message);
    return;
  }

  const m = A.length;
  if (m === 0) return;
  for (let i = 0; i < m; i++) {
    if (A[i].length !== m) {
      logger.error(`Ma trận A không vuông: hàng ${i + 1} có ${A[i].length} phần tử.`);
      return;
    }
  }
  if (B.length !== m) {
    logger.error(`Kích thước véc-tơ B (${B.length}) không khớp ma trận A (${m}).`);
    return;
  }

  const eps = parseFraction(epsilon);
  if (isNaN(eps) || eps <= 0) {
    logger.error("Epsilon không hợp lệ.");
    return;
  }

  const maxIter = parseInt(maxIterStr, 10) || 100;
  const { tableDecimals, reliableDigits } = prec(eps);

  logger.section("Phương pháp Lặp Jacobi ma trận");
  logger.step("**Bước 1: Kiểm tra tính chéo trội và thiết lập tham số**");
  
  let q_hang = 0;
  for (let i = 0; i < m; i++) {
    let sumRow = 0;
    for (let j = 0; j < m; j++) {
      if (j !== i) sumRow += Math.abs(A[i][j]);
    }
    const aii = Math.abs(A[i][i]);
    if (aii === 0) {
      logger.error(`Phần tử đường chéo A[${i + 1}][${i + 1}] bằng 0, không thể chia.`);
      return;
    }
    const ratio = sumRow / aii;
    if (ratio > q_hang) q_hang = ratio;
  }

  let q_cot = 0;
  let minAii = Infinity;
  let maxAii = 0;
  for (let j = 0; j < m; j++) {
    const ajj = Math.abs(A[j][j]);
    if (ajj < minAii) minAii = ajj;
    if (ajj > maxAii) maxAii = ajj;
    let sumCol = 0;
    for (let i = 0; i < m; i++) {
      if (i !== j) sumCol += Math.abs(A[i][j]);
    }
    const ratio = sumCol / ajj;
    if (ratio > q_cot) q_cot = ratio;
  }

  logger.text(`- Hệ số co theo hàng: $q_{hang} = \\max_i \\frac{\\sum_{j \\neq i} |a_{ij}|}{|a_{ii}|} = ${fmt(q_hang, 4)}$`);
  logger.text(`- Hệ số co theo cột: $q_{cot} = \\max_j \\frac{\\sum_{i \\neq j} |a_{ij}|}{|a_{jj}|} = ${fmt(q_cot, 4)}$`);

  let q = 0;
  let p = 1; // 1 hoặc Infinity
  let lambda = 1;
  let normName = "";

  if (q_hang < 1) {
    logger.text("- **Trường hợp 1:** Ma trận $A$ chéo trội hàng ($q_{hang} < 1$).");
    q = q_hang;
    p = Infinity;
    lambda = 1;
    normName = "\\infty";
    logger.text(`  - Chọn $q = q_{hang} = ${fmt(q, 4)}$, sử dụng chuẩn $p = \\infty$, và $\\lambda = 1$.`);
  } else if (q_cot < 1) {
    logger.text("- **Trường hợp 2:** Ma trận $A$ chéo trội cột ($q_{cot} < 1$).");
    q = q_cot;
    p = 1;
    lambda = maxAii / minAii;
    normName = "1";
    logger.text(`  - Chọn $q = q_{cot} = ${fmt(q, 4)}$, sử dụng chuẩn $p = 1$.`);
    logger.text(`  - Tính $\\lambda = \\frac{\\max |a_{ii}|}{\\min |a_{ii}|} = \\frac{${fmt(maxAii, 4)}}{${fmt(minAii, 4)}} = ${fmt(lambda, 4)}$.`);
  } else {
    logger.error("Ma trận A không chéo trội hàng và không chéo trội cột. Phương pháp lặp Jacobi có thể không hội tụ.");
    return;
  }

  logger.step("**Bước 2: Thiết lập ma trận lặp**");
  logger.text("- Lập ma trận $C$: $c_{ij} = -\\frac{a_{ij}}{a_{ii}}$ với $i \\neq j$, và $c_{ii} = 0$.");
  const C: Mat = Array.from({ length: m }, (_, i) =>
    Array.from({ length: m }, (_, j) => (i === j ? 0 : -A[i][j] / A[i][i]))
  );
  logger.formula(`$$C = ${fmtMatTex(C)}$$`);

  logger.text("- Lập véc-tơ $D$: $d_i = \\frac{b_i}{a_{ii}}$.");
  const D = Array.from({ length: m }, (_, i) => B[i] / A[i][i]);
  logger.formula(`$$D = \\begin{bmatrix} ${D.map(x => fmt(x, 4)).join(" \\\\ ")} \\end{bmatrix}$$`);

  logger.step("**Bước 3: Khởi tạo và tính dãy lặp**");
  logger.text("- Chọn véc-tơ khởi tạo $X^{(0)} = D$.");
  logger.formula(`Dãy lặp: $$X^{(n+1)} = C X^{(n)} + D$$`);
  
  const eps0 = (lambda * q) / (1 - q);
  logger.text(`- Kiểm tra điều kiện dừng: $\\frac{\\lambda q}{1-q} \\Delta_n \\le \\varepsilon$`);
  logger.formula(`$$\\iff \\Delta_n = \\|X^{(n+1)} - X^{(n)}\\|_{${normName}} \\le \\frac{1-q}{\\lambda q}\\varepsilon = ${eps0.toExponential(4)}$$`);

  const tableData: Record<string, unknown>[] = [{ n: 0, "X^(n)": fmtVec(D, tableDecimals), "Δ_n": "—" }];
  
  let X_curr = [...D];
  let step = 0;
  let maxDiff = 0;

  while (step < maxIter) {
    step++;
    const X_next = Array(m).fill(0);
    for (let i = 0; i < m; i++) {
      let sum = 0;
      for (let j = 0; j < m; j++) {
        sum += C[i][j] * X_curr[j];
      }
      X_next[i] = sum + D[i];
    }

    if (p === Infinity) {
      maxDiff = Math.max(...X_next.map((x, i) => Math.abs(x - X_curr[i])));
    } else {
      maxDiff = X_next.reduce((acc, x, i) => acc + Math.abs(x - X_curr[i]), 0);
    }

    tableData.push({ n: step, "X^(n)": fmtVec(X_next, tableDecimals), "Δ_n": fmt(maxDiff, tableDecimals) });
    X_curr = [...X_next];

    if (maxDiff <= eps0) break;
  }

  logger.table(tableData);
  logger.separator();
  logger.text(`Ngưỡng dừng: $\\Delta_n \\le ${eps0.toExponential(4)}$`);

  if (maxDiff <= eps0) {
    logger.success(`Thỏa mãn điều kiện dừng tại bước $n = ${step}$.`);
    const XR = X_curr.map((v) => rnd(v, reliableDigits));
    logger.result(
      `Nghiệm gần đúng (${reliableDigits} chữ số đáng tin): $$X^* \\approx \\begin{bmatrix} ${XR.join(" & ")} \\end{bmatrix}^T$$`
    );
  } else {
    logger.warn(`Thuật toán không hội tụ sau ${maxIter} vòng lặp.`);
    logger.text(
      `- Kết quả cuối: $$X^* = \\begin{bmatrix} ${X_curr.map((v) => fmt(v, tableDecimals)).join(" & ")} \\end{bmatrix}^T$$`
    );
  }
}
