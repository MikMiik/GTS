import { parseFraction, fmtNum, fmtVec, fmtMat } from "./math-utils";
import type { Logger } from "@/types/solver";

type Mat = number[][];

// ─── Matrix helpers ──────────────────────────────────────────────────────────

function parseMatrix(raw: string): Mat {
  return raw
    .trim()
    .split("\n")
    .map((row) =>
      row
        .trim()
        .split(/[\s,]+/)
        .map((v) => {
          const n = parseFraction(v);
          if (isNaN(n)) throw new Error(`Giá trị không hợp lệ: "${v}"`);
          return n;
        })
    );
}

function parseVector(raw: string): number[] {
  return raw
    .trim()
    .split(/[\s,]+/)
    .map((v) => {
      const n = parseFraction(v);
      if (isNaN(n)) throw new Error(`Giá trị véc-tơ không hợp lệ: "${v}"`);
      return n;
    });
}

function transpose(A: Mat): Mat {
  const m = A.length, n = A[0].length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) => A[j][i])
  );
}

function matMul(A: Mat, B: Mat): Mat {
  const m = A.length, k = A[0].length, n = B[0].length;
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      Array.from({ length: k }, (_, p) => A[i][p] * B[p][j]).reduce((a, b) => a + b, 0)
    )
  );
}

function matVecMul(A: Mat, x: number[]): number[] {
  const m = A.length, n = A[0].length;
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) => A[i][j] * x[j]).reduce((a, b) => a + b, 0)
  );
}

function outerProduct(u: number[], v: number[]): Mat {
  return u.map((ui) => v.map((vj) => ui * vj));
}

function matSub(A: Mat, B: Mat): Mat {
  return A.map((row, i) => row.map((val, j) => val - B[i][j]));
}

function matScale(A: Mat, s: number): Mat {
  return A.map((row) => row.map((val) => val * s));
}

function normInf(v: number[]): number {
  return Math.max(...v.map(Math.abs));
}

function norm2(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}

// ─── Run function ─────────────────────────────────────────────────────────────

export function runConditionNumberPower(params: Record<string, string>, logger: Logger): void {
  const epsStr = params.epsilon || "1e-4";
  const epsilon = parseFloat(epsStr);
  if (isNaN(epsilon) || epsilon <= 0) {
    logger.error("Sai số epsilon không hợp lệ.");
    return;
  }

  let A: Mat;
  let x0: number[];
  try {
    A = parseMatrix(params.matA);
    x0 = parseVector(params.x0);
  } catch (e) {
    logger.error("Lỗi đọc đầu vào: " + (e as Error).message);
    return;
  }

  const m = A.length;
  const n = A[0].length;

  if (m !== n) {
    logger.error("Phương pháp này yêu cầu ma trận vuông khả nghịch.");
    return;
  }
  if (x0.length !== n) {
    logger.error(`Kích thước véc-tơ x₀ (${x0.length}) phải bằng số cột của A (${n}).`);
    return;
  }

  logger.section("1. THIẾT LẬP BÀI TOÁN");
  logger.formula(`$$A = ${fmtMat(A)}$$`);
  logger.text(`Véc-tơ khởi tạo: $$x^{(0)} = \\begin{bmatrix} ${fmtVec(x0)} \\end{bmatrix}^T$$`);
  logger.text(`Sai số cho phép: $$\\varepsilon = ${epsilon}$$`);

  const At = transpose(A);
  const AtA = matMul(At, A);

  logger.formula(`$$M = A^T A = ${fmtMat(AtA)}$$`);
  logger.text("Ta cần tìm tất cả các trị riêng của $M$ từ lớn nhất đến nhỏ nhất để suy ra $\\lambda_{\\max}, \\lambda_{\\min}$.");

  const lambdas: number[] = [];
  const V: number[][] = [];
  let Mk = AtA;

  logger.section("2. QUÁ TRÌNH TÌM TRỊ RIÊNG");

  for (let k = 1; k <= n; k++) {
    logger.step(`Bước ${k}: Tìm $\\lambda_${k}$ của ma trận $M_${k}$`);
    
    if (k > 1) {
      const vk_1 = V[k - 2];
      const lam_k_1 = lambdas[k - 2];
      const outer = outerProduct(vk_1, vk_1);
      const subMat = matScale(outer, lam_k_1);
      Mk = matSub(Mk, subMat);
      
      logger.text("Xuống thang:");
      logger.formula(`$$M_${k} = M_{${k-1}} - \\lambda_{${k-1}} v_{${k-1}} v_{${k-1}}^T = ${fmtMat(Mk)}$$`);
    }

    let x = [...x0];
    let lam_k = 0;
    let iteration = 0;
    const maxIter = 1000;
    let converged = false;

    const tableData: Record<string, unknown>[] = [];
    tableData.push({
      m: 0,
      "x^(m)": `[${fmtVec(x)}]`,
      "y^(m)": "-",
      "λ^(m)": "-",
      "Sai số": "-"
    });

    while (iteration < maxIter) {
      iteration++;
      const y = matVecMul(Mk, x);
      
      let p = 0;
      let maxAbs = -1;
      for (let i = 0; i < n; i++) {
        if (Math.abs(y[i]) > maxAbs) {
          maxAbs = Math.abs(y[i]);
          p = i;
        }
      }

      const lam_next = y[p];

      if (Math.abs(lam_next) < 1e-15) {
        lam_k = 0;
        tableData.push({
          m: iteration,
          "x^(m)": `[${fmtVec(Array(n).fill(0))}]`,
          "y^(m)": `[${fmtVec(y)}]`,
          "λ^(m)": "0",
          "Sai số": "-"
        });
        converged = true;
        break;
      }

      const x_next = y.map(v => v / lam_next);
      const error = normInf(matSub([x_next], [x])[0]);

      tableData.push({
        m: iteration,
        "x^(m)": `[${fmtVec(x_next)}]`,
        "y^(m)": `[${fmtVec(y)}]`,
        "λ^(m)": fmtNum(lam_next),
        "Sai số": error.toExponential(4)
      });

      if (error < epsilon) {
        lam_k = lam_next;
        x = x_next;
        converged = true;
        break;
      }

      x = x_next;
    }

    logger.table(tableData);

    if (!converged) {
      logger.warn(`⚠ Không hội tụ sau ${maxIter} vòng lặp. Kết quả xấp xỉ lấy ở vòng cuối.`);
      lam_k = tableData[tableData.length - 1]["λ^(m)"] as number;
    } else {
      logger.success(`✔ Lặp hội tụ tại $m = ${iteration}$.`);
    }

    lambdas.push(lam_k);
    
    const v_k = x.map(v => v / norm2(x));
    V.push(v_k);

    logger.text(`$\\Rightarrow \\lambda_${k} \\approx ${fmtNum(lam_k)}$`);
    logger.text(`Chuẩn hóa véc-tơ riêng (chuẩn 2) để dùng cho bước sau: $v_${k} = \\begin{bmatrix} ${fmtVec(v_k)} \\end{bmatrix}^T$`);
    logger.separator();

    if (lam_k < 1e-12) {
      logger.warn(`$\\lambda_${k} \\approx 0$. Quá trình dừng sớm do ma trận (gần như) suy biến.`);
      // Bổ sung các lambda còn lại là 0
      while (lambdas.length < n) {
        lambdas.push(0);
      }
      break;
    }
  }

  logger.section("3. KẾT QUẢ");
  const lam_max = lambdas[0];
  const lam_min = lambdas[n - 1];

  logger.text(`Các trị riêng của $A^T A$: $\\lambda = [${lambdas.map(l => fmtNum(l)).join(", ")}]$`);
  logger.formula(`$$\\lambda_{\\max} = ${fmtNum(lam_max)}$$`);
  logger.formula(`$$\\lambda_{\\min} = ${fmtNum(lam_min)}$$`);

  const sigma_max = Math.sqrt(Math.max(lam_max, 0));
  const sigma_min = Math.sqrt(Math.max(lam_min, 0));

  if (sigma_min < 1e-10) {
    logger.warn("$\\lambda_{\\min} \\approx 0 \\Rightarrow \\sigma_{\\min} \\approx 0$");
    logger.result("Ma trận (gần như) suy biến $\\Rightarrow cond(A) \\to \\infty$");
  } else {
    const condA = sigma_max / sigma_min;
    logger.result(`$$cond(A) = \\frac{\\sigma_{\\max}}{\\sigma_{\\min}} = \\sqrt{\\frac{${fmtNum(lam_max)}}{${fmtNum(lam_min)}}} \\approx ${fmtNum(condA)}$$`);
  }
}
