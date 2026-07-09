import type { Logger } from "@/types/solver";
import { parseFraction } from "./math-utils";

type Mat = number[][];



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

  const hasEpsilon = epsilon !== undefined && epsilon.trim() !== "";
  let eps = 0;
  if (hasEpsilon) {
    eps = parseFraction(epsilon);
    if (isNaN(eps) || eps <= 0) {
      logger.error("Sai số epsilon không hợp lệ.");
      return;
    }
  }

  const maxIter = parseInt(maxIterStr, 10) || 100;

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
      if (i !== j) sumCol += Math.abs(A[i][j]) / Math.abs(A[i][i]);
    }
    if (sumCol > q_cot) q_cot = sumCol;
  }

  logger.text(`- Hệ số co theo hàng (chuẩn vô cùng của ma trận lặp): $q_{hang} = \\max_i \\sum_{j \\neq i} \\frac{|a_{ij}|}{|a_{ii}|} = ${fmt(q_hang, 7)}$`);
  logger.text(`- Hệ số co theo cột (chuẩn 1 của ma trận lặp): $q_{cot} = \\max_j \\sum_{i \\neq j} \\frac{|a_{ij}|}{|a_{ii}|} = ${fmt(q_cot, 7)}$`);

  const validCases: { type: string; title: string; q: number; p: number; lambda: number; normName: string }[] = [];
  if (q_hang < 1) {
    validCases.push({
      type: "hang",
      title: "Ma trận $A$ chéo trội hàng",
      q: q_hang,
      p: Infinity,
      lambda: 1,
      normName: "\\infty",
    });
  }
  if (q_cot < 1) {
    validCases.push({
      type: "cot",
      title: "Ma trận $A$ chéo trội cột",
      q: q_cot,
      p: 1,
      lambda: maxAii / minAii,
      normName: "1",
    });
  }

  if (validCases.length === 0) {
    logger.error("Ma trận A không chéo trội hàng và không chéo trội cột. Phương pháp lặp Jacobi có thể không hội tụ.");
    return;
  }
  
  if (validCases.length > 1) {
    logger.text("- **Nhận xét:** Ma trận $A$ thỏa mãn cả chéo trội hàng và chéo trội cột. Thuật toán sẽ trình bày cả 2 trường hợp bên dưới.");
  }

  logger.step("**Bước 2: Thiết lập ma trận lặp**");
  logger.text("- Lập ma trận lặp Jacobi $M_J$: phần tử $m_{ij} = -\\frac{a_{ij}}{a_{ii}}$ với $i \\neq j$, và $m_{ii} = 0$.");
  const M_J: Mat = Array.from({ length: m }, (_, i) =>
    Array.from({ length: m }, (_, j) => (i === j ? 0 : -A[i][j] / A[i][i]))
  );
  logger.formula(`$$M_J = ${fmtMatTex(M_J, 5)}$$`);

  logger.text("- Lập véc-tơ Jacobi $d$: $d_i = \\frac{b_i}{a_{ii}}$.");
  const d_vec = Array.from({ length: m }, (_, i) => B[i] / A[i][i]);
  logger.formula(`$$d = \\begin{bmatrix} ${d_vec.map(x => fmt(x, 7)).join(" \\\\ ")} \\end{bmatrix}$$`);

  for (let idx = 0; idx < validCases.length; idx++) {
    const caseCfg = validCases[idx];
    if (validCases.length > 1) {
      logger.separator();
      logger.step(`**XÉT TRƯỜNG HỢP ${idx + 1}: CHÉO TRỘI ${caseCfg.type === "hang" ? "HÀNG" : "CỘT"}**`);
    } else {
      logger.text(`- **Trường hợp:** ${caseCfg.title}`);
    }

    if (caseCfg.type === "hang") {
      logger.text(`  - Chọn $q = q_{hang} = ${fmt(caseCfg.q, 7)}$, sử dụng chuẩn $p = \\infty$, và $\\lambda = 1$.`);
    } else {
      logger.text(`  - Chọn $q = q_{cot} = ${fmt(caseCfg.q, 7)}$, sử dụng chuẩn $p = 1$.`);
      logger.text(`  - Tính $\\lambda = \\frac{\\max |a_{ii}|}{\\min |a_{ii}|} = \\frac{${fmt(maxAii, 7)}}{${fmt(minAii, 7)}} = ${fmt(caseCfg.lambda, 7)}$.`);
    }

    logger.step("**Bước 3: Khởi tạo và tính dãy lặp**");
    logger.text("- Chọn véc-tơ khởi tạo $X^{(0)} = d$.");
    logger.formula(`Dãy lặp: $$X^{(n+1)} = M_J X^{(n)} + d$$`);

    let eps0 = 0;
    if (hasEpsilon) {
      eps0 = ((1 - caseCfg.q) / (caseCfg.lambda * caseCfg.q)) * eps;
      logger.text(`- Kiểm tra điều kiện dừng: $\\frac{\\lambda q}{1-q} \\|X^{(n+1)} - X^{(n)}\\|_{${caseCfg.normName}} \\le \\varepsilon \\iff \\|X^{(n+1)} - X^{(n)}\\|_{${caseCfg.normName}} \\le ${eps0.toExponential(4)}$`);
    } else {
      logger.text(`- Lặp đúng ${maxIter} lần theo yêu cầu.`);
    }

    const tableData: Record<string, unknown>[] = [{ n: 0, "X^(n)": fmtVec(d_vec, 7), "Δ_n": "—" }];

    let X_curr = [...d_vec];
    let step = 0;
    let maxDiff = 0;

    while (step < maxIter) {
      step++;
      const X_next = Array(m).fill(0);
      for (let i = 0; i < m; i++) {
        let sum = 0;
        for (let j = 0; j < m; j++) {
          sum += M_J[i][j] * X_curr[j];
        }
        X_next[i] = sum + d_vec[i];
      }

      if (caseCfg.p === Infinity) {
        maxDiff = Math.max(...X_next.map((x, i) => Math.abs(x - X_curr[i])));
      } else {
        maxDiff = X_next.reduce((acc, x, i) => acc + Math.abs(x - X_curr[i]), 0);
      }

      tableData.push({ n: step, "X^(n)": fmtVec(X_next, 7), "Δ_n": fmt(maxDiff, 7) });
      X_curr = [...X_next];

      if (hasEpsilon && maxDiff <= eps0) break;
    }

    logger.table(tableData);
    logger.separator();

    const estimatedError = (caseCfg.lambda * caseCfg.q) / (1 - caseCfg.q) * maxDiff;

    logger.step("**Bước 4: Ước lượng sai số**");
    logger.formula(`$$\\|X^{(${step})} - X^*\\|_{${caseCfg.normName}} \\le \\lambda \\frac{q}{1-q} \\|X^{(${step})} - X^{(${step-1})}\\|_{${caseCfg.normName}}$$`);
    logger.formula(`$$= ${fmt(caseCfg.lambda, 5)} \\times \\frac{${fmt(caseCfg.q, 7)}}{1 - ${fmt(caseCfg.q, 7)}} \\times ${fmt(maxDiff, 7)} \\approx ${estimatedError.toExponential(7)}$$`);

    logger.separator();
    logger.text(`**Kết quả cuối cùng nghiệm $X^{(${step})}$ sau ${step} lần lặp:**`);
    logger.formula(`$$X^{(${step})} = \\begin{bmatrix} ${X_curr.map(x => fmt(x, 7)).join(" \\\\ ")} \\end{bmatrix}$$`);
  }
}
