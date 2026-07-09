import type { Logger } from "@/types/solver";
import { getPrecisionByEpsilon, parseFraction } from "./math-utils";
export function runTiepTuyen(
  params: Record<string, string>,
  logger: Logger,
): void {
  const { fStr, dfStr, ddfStr, a: aIn, b: bIn, m1: m1In, epsilon } = params;

  let f: (x: number) => number,
    df: (x: number) => number,
    ddf: (x: number) => number;
  try {
    const parsedF = normalizeMathExpr(fStr);
    const parsedDf = normalizeMathExpr(dfStr);
    const parsedDdf = normalizeMathExpr(ddfStr);
    f = new Function("x", `"use strict"; return (${parsedF});`) as (
      x: number,
    ) => number;
    df = new Function("x", `"use strict"; return (${parsedDf});`) as (
      x: number,
    ) => number;
    ddf = new Function("x", `"use strict"; return (${parsedDdf});`) as (
      x: number,
    ) => number;
    f(1);
    df(1);
    ddf(1);
  } catch (e) {
    logger.error("Lỗi cú pháp hàm: " + (e as Error).message);
    return;
  }

  const a = parseFraction(aIn);
  const b = parseFraction(bIn);
  const m1 = parseFraction(m1In);

  const hasEpsilon = epsilon !== undefined && epsilon.trim() !== "";
  let eps = 0;
  if (hasEpsilon) {
    eps = parseFraction(epsilon);
    if (isNaN(eps) || eps <= 0) {
      logger.error("Epsilon phải là số dương.");
      return;
    }
  }

  if ([a, b, m1].some(isNaN)) {
    logger.error("Tham số khoảng hoặc m₁ không hợp lệ.");
    return;
  }
  if (m1 <= 0) {
    logger.error("m₁ phải là số dương (min|f'(x)| trên [a,b]).");
    return;
  }

  newtonMethod(f, df, ddf, a, b, m1, eps, 100, logger);
}

function normalizeMathExpr(expr: string): string {
  return expr
    .replace(/(\d|\))\s*x\b/g, "$1*x")
    .replace(/(\d|x|\))\s*(?=\()/g, "$1*")
    .replace(/(\))\s*(?=\d)/g, "$1*");
}



function roundBySignificantDigits(value: number, significantDigits: number) {
  if (!Number.isFinite(value)) return value;
  if (Math.abs(value) < 1e-15) return 0;
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const decimalPlaces = significantDigits - exponent - 1;
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(value * factor) / factor;
}

function formatNumber(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return String(value);
  if (Math.abs(value) < 1e-15) return "0";
  return value.toFixed(decimals);
}

function newtonMethod(
  f: (x: number) => number,
  df: (x: number) => number,
  ddf: (x: number) => number,
  a: number,
  b: number,
  m1: number,
  epsilon: number,
  maxIter: number,
  logger: Logger,
) {
  logger.section("CHỌN ĐIỂM BẮT ĐẦU (ĐIỂM FOURIER)");
  logger.text("Chọn $x_0$ sao cho $f(x_0) \\cdot f''(x_0) > 0$");

  let x_curr: number;
  const fa = f(a),
    fb = f(b);
  const ddfa = ddf(a),
    ddfb = ddf(b);

  logger.info(
    `$$f(a)=${fa.toFixed(6)}, f''(a)=${ddfa.toFixed(6)}, f(a) \\cdot f''(a) = ${(fa * ddfa).toFixed(6)}$$`,
  );
  logger.info(
    `$$f(b)=${fb.toFixed(6)}, f''(b)=${ddfb.toFixed(6)}, f(b) \\cdot f''(b) = ${(fb * ddfb).toFixed(6)}$$`,
  );

  if (f(a) * ddf(a) > 0) {
    x_curr = a;
    logger.success(`Chọn $$x_0 = a = ${a}$$ vì $$f(a) \\cdot f''(a) > 0$$`);
  } else if (f(b) * ddf(b) > 0) {
    x_curr = b;
    logger.success(`Chọn $$x_0 = b = ${b}$$ vì $$f(b) \\cdot f''(b) > 0$$`);
  } else {
    logger.warn("Không tìm thấy điểm Fourier lý tưởng, mặc định $x_0 = b$.");
    x_curr = b;
  }

  let tableDecimals = 5;
  let reliableDigits = 5;
  const hasEpsilon = epsilon > 0;
  
  if (hasEpsilon) {
    const prec = getPrecisionByEpsilon(epsilon);
    tableDecimals = prec.tableDecimals;
    reliableDigits = prec.reliableDigits;
  }

  let n = 0;
  let fx = f(x_curr);
  let errorEstimate = Math.abs(fx) / m1;
  const tableData: Record<string, unknown>[] = [];

  tableData.push({
    n: 0,
    xₙ: formatNumber(x_curr, tableDecimals),
    "f(xₙ)": fx.toExponential(4),
    "sai số |f|/m₁": errorEstimate.toExponential(4),
  });

  logger.section("QUÁ TRÌNH LẶP");
  logger.formula(`Công thức: $$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$$`);
  if (hasEpsilon) {
    logger.formula(
      `Điều kiện dừng: $$\\frac{|f(x_n)|}{m_1} \\le \\varepsilon = ${epsilon.toExponential(4)}$$`,
    );
  } else {
    logger.formula(`Lặp đúng $N_{\\max} = ${maxIter}$ lần`);
  }

  while (n < maxIter) {
    if (hasEpsilon && errorEstimate <= epsilon) break;
    n++;
    const deriv = df(x_curr);
    if (Math.abs(deriv) < 1e-15) {
      logger.error("Đạo hàm $$f'(x_n) = 0$$, không thể tiếp tục.");
      return;
    }
    x_curr = x_curr - fx / deriv;
    fx = f(x_curr);
    errorEstimate = Math.abs(fx) / m1;

    tableData.push({
      n,
      xₙ: formatNumber(x_curr, tableDecimals),
      "f(xₙ)": fx.toExponential(4),
      "sai số |f|/m₁": errorEstimate.toExponential(4),
    });
  }

  logger.table(tableData);
  logger.separator();

  if (hasEpsilon) {
    logger.text(
      `$$m_1 = ${m1}$$, ngưỡng dừng $$|f(x)| \\le m_1 \\cdot \\varepsilon = ${(m1 * epsilon).toExponential(4)}$$`,
    );
    if (errorEstimate <= epsilon) {
      logger.success(`✔ Thỏa mãn điều kiện dừng tại bước $n = ${n}$.`);
      const xReliable = roundBySignificantDigits(x_curr, reliableDigits);
      logger.result(
        `Nghiệm gần đúng (${reliableDigits} chữ số đáng tin): $$x \\approx ${xReliable}$$`,
      );
    } else {
      logger.warn(`⚠ Dừng lặp sau ${maxIter} vòng do đạt giới hạn, chưa thỏa mãn sai số.`);
      logger.result(
        `Nghiệm xấp xỉ thu được: $$x \\approx ${formatNumber(x_curr, tableDecimals)}$$`,
      );
    }
  } else {
    logger.success(`✔ Hoàn thành quá trình lặp tại bước n = ${n}.`);
    logger.result(
      `Nghiệm xấp xỉ thu được: $$x \\approx ${formatNumber(x_curr, tableDecimals)}$$`,
    );
  }
}
