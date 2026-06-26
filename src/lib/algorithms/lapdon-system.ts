import type { Logger } from "@/types/solver";
import { parseFraction } from "./math-utils";
import { create, all } from "mathjs";

const math = create(all);

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

  // 4. Parse q and epsilon
  const q = parseFraction(qIn);
  const eps = parseFraction(epsilon);
  if (isNaN(q) || isNaN(eps)) {
    logger.error("q và epsilon phải là số hợp lệ.");
    return;
  }
  if (q >= 1 || q <= 0) {
    logger.error("Hệ số co q phải nằm trong khoảng (0, 1).");
    return;
  }
  if (eps <= 0) {
    logger.error("Epsilon phải là số dương.");
    return;
  }

  const maxIter = parseInt(maxIterStr, 10) || 100;
  const eps0 = ((1 - q) / q) * eps;
  const { tableDecimals, reliableDigits } = prec(eps);

  const fmtVec = (v: number[]) => `[${v.map((vi) => fmt(vi, tableDecimals)).join(", ")}]`;

  // 5. Log initial info
  logger.section("THÔNG TIN KHỞI ĐẦU");
  logger.info(`$$X^{(0)} = \\begin{bmatrix} ${x0Arr.join(" & ")} \\end{bmatrix}^T$$`);
  logger.info(`$$q = ${q},\\ \\varepsilon = ${eps.toExponential(4)},\\ \\varepsilon_0 = \\frac{1-q}{q}\\varepsilon = ${eps0.toExponential(4)}$$`);
  logger.formula("Công thức: $$X^{(k+1)} = \\Phi(X^{(k)})$$");
  logger.formula("Điều kiện dừng: $$\\left\\| X^{(k)} - X^{(k-1)} \\right\\|_\\infty < \\varepsilon_0$$");

  // 6. Fixed-point iteration
  logger.section("QUÁ TRÌNH LẶP");
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

    tableData.push({ k: step, "X_k": fmtVec([...X_curr]), "||ΔX||∞": fmt(maxDiff, tableDecimals) });

    if (maxDiff < eps0) break;
    X_prev = [...X_curr];
  }

  logger.table(tableData);
  logger.separator();
  logger.text(`Ngưỡng dừng $$\\varepsilon_0 = ${eps0.toExponential(4)}$$`);

  if (maxDiff < eps0) {
    logger.success(`✔ Thỏa mãn điều kiện dừng tại bước k = ${step}.`);
    const XR = X_curr.map((v) => rnd(v, reliableDigits));
    logger.result(
      `Nghiệm gần đúng (${reliableDigits} chữ số đáng tin): $$X \\approx \\begin{bmatrix} ${XR.join(" & ")} \\end{bmatrix}^T$$`
    );
  } else {
    logger.warn(`⚠ Thuật toán không hội tụ sau ${maxIter} vòng lặp.`);
    logger.text(
      `Kết quả cuối: $$X = \\begin{bmatrix} ${X_curr.map((v) => fmt(v, tableDecimals)).join(" & ")} \\end{bmatrix}^T$$`
    );
  }
}
