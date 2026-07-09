import type { Logger } from "@/types/solver";
import { getPrecisionByEpsilon, parseFraction } from "./math-utils";
import { create, all } from "mathjs";

const math = create(all);


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

export function runLapDonSystem(params: Record<string, string>, logger: Logger): void {
  const { vars: varsStr, phis: phisStr, x0Str, q: qIn, epsilon, maxIter: maxIterStr } = params;

  // 1. Parse variables
  const vars = varsStr.split(/[\s,;]+/).filter(Boolean);
  if (vars.length === 0) {
    logger.error("Vui lòng nhập các biến số.");
    return;
  }
  const n = vars.length;

  // 2. Parse initial vector x0
  let x0Arr: number[];
  try {
    x0Arr = x0Str
      .replace(/\s*\/\s*/g, "/")
      .trim()
      .split(/[\s,;]+/)
      .map((v) => {
        const num = parseFraction(v);
        if (isNaN(num)) throw new Error(`Giá trị "${v}" không hợp lệ`);
        return num;
      });
  } catch (e) {
    logger.error("Lỗi đọc X₀: " + (e as Error).message);
    return;
  }
  if (x0Arr.length !== n) {
    logger.error(`Số biến (${n}) không khớp với kích thước X₀ (${x0Arr.length}).`);
    return;
  }

  // 3. Parse and compile phi functions
  const phisRaw = phisStr.split(/\r?\n/).filter((s) => s.trim().length > 0);
  if (phisRaw.length !== n) {
    logger.error(`Cần đúng ${n} hàm φ_i, nhưng bạn đã nhập ${phisRaw.length}.`);
    return;
  }

  const compiledPhis: { evaluate: (scope: Record<string, number>) => number }[] = [];

  logger.section("HỆ HÀM LẶP Φ(X)");
  try {
    for (let i = 0; i < n; i++) {
      const exprStr = phisRaw[i];
      const node = math.parse(exprStr);
      logger.formula(`$$\\varphi_{${i + 1}}(X) = ${node.toTex()}$$`);
      compiledPhis.push(node.compile());
    }
  } catch (e) {
    logger.error("Lỗi cú pháp toán học: " + (e as Error).message);
    return;
  }

  const q = parseFraction(qIn);
  if (isNaN(q)) {
    logger.error("q phải là số hợp lệ.");
    return;
  }
  if (q >= 1 || q <= 0) {
    logger.error("Hệ số co q phải nằm trong khoảng (0, 1).");
    return;
  }

  const hasEpsilon = epsilon !== undefined && epsilon.trim() !== "";
  let eps = 0;
  if (hasEpsilon) {
    eps = parseFraction(epsilon);
    if (isNaN(eps) || eps <= 0) { logger.error("Epsilon phải là số dương."); return; }
  }

  const maxIter = parseInt(maxIterStr, 10) || 100;
  const eps0 = hasEpsilon ? ((1 - q) / q) * eps : 0;
  
  let tableDecimals = 5;
  let reliableDigits = 5;
  
  if (hasEpsilon) {
    const p = getPrecisionByEpsilon(eps);
    tableDecimals = p.tableDecimals;
    reliableDigits = p.reliableDigits;
  }

  const fmtVec = (v: number[]) => `[${v.map((vi) => fmt(vi, tableDecimals)).join(", ")}]`;

  // 5. Log initial info
  logger.section("Phương pháp Lặp đơn giải hệ phi tuyến");
  logger.step("**Bước 1 & 2: Thiết lập hệ lặp và hệ số co**");
  logger.text(`- Véc-tơ khởi tạo: $X^{(0)} = \\begin{bmatrix} ${x0Arr.join(" & ")} \\end{bmatrix}^T$`);
  logger.text(`- Hệ số co (người dùng cung cấp): $q = ${q}$`);
  if (hasEpsilon) {
    logger.text(`- Sai số yêu cầu: $\\varepsilon = ${eps.toExponential(4)}$`);
    logger.text(`- Sai số ngưỡng: $\\varepsilon_0 = \\frac{1-q}{q}\\varepsilon = ${eps0.toExponential(4)}$`);
  }
  
  logger.step("**Bước 3: Công thức lặp**");
  logger.formula("Dãy lặp xấp xỉ nghiệm: $$X^{(k+1)} = \\Phi(X^{(k)})$$");
  
  if (hasEpsilon) {
    logger.step("**Bước 4: Điều kiện dừng**");
    logger.formula("Kiểm tra theo chuẩn vô cùng: $$\\frac{q}{1-q}\\left\\| X^{(k)} - X^{(k-1)} \\right\\|_\\infty < \\varepsilon \\iff \\left\\| X^{(k)} - X^{(k-1)} \\right\\|_\\infty < \\varepsilon_0$$");
  } else {
    logger.step("**Bước 4: Điều kiện dừng**");
    logger.formula(`Lặp đúng $N_{\\max} = ${maxIter}$ lần`);
  }

  // 6. Fixed-point iteration
  logger.separator();
  const tableData: Record<string, unknown>[] = [{ k: 0, "X_k": fmtVec(x0Arr), "||ΔX||∞": "—" }];

  let X_prev = [...x0Arr];
  const X_curr = [...x0Arr];
  let step = 0;
  let maxDiff = 0;

  while (step < maxIter) {
    step++;
    maxDiff = 0;

    const scope: Record<string, number> = {};
    for (let i = 0; i < n; i++) {
      scope[vars[i]] = X_prev[i];
    }

    for (let i = 0; i < n; i++) {
      X_curr[i] = compiledPhis[i].evaluate(scope);
      const d = Math.abs(X_curr[i] - X_prev[i]);
      if (d > maxDiff) maxDiff = d;
    }

    tableData.push({ k: step, "X_k": fmtVec(X_curr), "||ΔX||∞": fmt(maxDiff, tableDecimals) });

    if (hasEpsilon && maxDiff < eps0) {
      break;
    }
    X_prev = [...X_curr];
  }

  logger.table(tableData);
  logger.separator();
  
  if (hasEpsilon) {
    logger.text(`Ngưỡng dừng: $\\varepsilon_0 = ${eps0.toExponential(4)}$`);
    if (maxDiff < eps0) {
      logger.success(`✔ Thỏa mãn điều kiện dừng tại bước $k = ${step}$.`);
      logger.result(
        `Nghiệm gần đúng (${reliableDigits} chữ số đáng tin): $$X \\approx \\begin{bmatrix} ${X_curr.map((v) => rnd(v, reliableDigits)).join(" & ")} \\end{bmatrix}^T$$`,
      );
    } else {
      logger.warn(`⚠ Dừng lặp sau ${maxIter} vòng do đạt giới hạn, chưa thỏa mãn sai số.`);
      logger.result(
        `Nghiệm xấp xỉ thu được: $$X \\approx \\begin{bmatrix} ${X_curr.map((v) => fmt(v, tableDecimals)).join(" & ")} \\end{bmatrix}^T$$`,
      );
    }
  } else {
    logger.success(`✔ Hoàn thành quá trình lặp tại bước k = ${step}.`);
    logger.result(
      `Nghiệm xấp xỉ thu được: $$X \\approx \\begin{bmatrix} ${X_curr.map((v) => fmt(v, tableDecimals)).join(" & ")} \\end{bmatrix}^T$$`,
    );
  }
}
