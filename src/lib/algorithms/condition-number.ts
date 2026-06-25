import { create, all } from "mathjs";
import { parseFraction } from "./math-utils";
import type { Logger } from "@/types/solver";

const math = create(all);

type Mat = number[][];

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

function fmtNum(v: number): string {
  if (Math.abs(v) < 1e-10) return "0";
  return String(parseFloat(v.toFixed(6)));
}

function fmtMat(M: Mat): string {
  const rows = M.map((r) => r.map((x) => fmtNum(x)).join(" & "));
  return `\\begin{bmatrix} ${rows.join(" \\\\ ")} \\end{bmatrix}`;
}

export function runConditionNumber(params: Record<string, string>, logger: Logger): void {
  let A: Mat;
  try {
    A = parseMatrix(params.matA);
  } catch (e) {
    logger.error("Lỗi đọc ma trận: " + (e as Error).message);
    return;
  }

  const m = A.length, n = A[0].length;
  if (m !== n) {
    logger.warn("Số điều kiện thường tính cho ma trận vuông. Ma trận của bạn không vuông — sẽ tính dựa trên giá trị kỳ dị.");
  }

  logger.section(`Số Điều Kiện của Ma Trận $${m} \\times ${n}$`);
  logger.formula(`$$A = ${fmtMat(A)}$$`);
  logger.separator();

  // Bước 1
  logger.step("**Bước 1:** Tính $A^T A$");
  const At = transpose(A);
  const AtA = matMul(At, A);
  logger.formula(`$$A^T A = ${fmtMat(AtA)}$$`);

  // Bước 2
  logger.step("**Bước 2:** Tìm các giá trị riêng $\\lambda_i$ của $A^T A$");
  let eigenResult;
  try {
    eigenResult = math.eigs(AtA as number[][]);
  } catch {
    logger.error("Không thể tính trị riêng của $A^T A$.");
    return;
  }

  const rawVals = (eigenResult.values as number[]).slice().sort((a, b) => b - a);
  logger.info(`Các giá trị riêng (giảm dần): $[${rawVals.map(fmtNum).join(", ")}]$`);

  // Bước 3
  logger.step("**Bước 3:** Tính các giá trị kỳ dị $\\sigma_i = \\sqrt{\\lambda_i}$");
  const EPS = 1e-9;
  const sigmas = rawVals
    .filter((v) => v > EPS)
    .map((v) => Math.sqrt(v));
  logger.formula(`$$\\sigma = [${sigmas.map(fmtNum).join(", ")}]$$`);

  if (sigmas.length === 0) {
    logger.error("Ma trận có tất cả giá trị kỳ dị bằng 0. Ma trận không xác định.");
    return;
  }

  // Bước 4 & 5
  logger.step("**Bước 4 & 5:** Xác định $\\sigma_{\\max}$, $\\sigma_{\\min}$ và tính $cond(A)$");
  const sigmaMax = Math.max(...sigmas);
  const sigmaMin = Math.min(...sigmas);
  logger.info(`$\\sigma_{\\max} = ${fmtNum(sigmaMax)}$,  $\\sigma_{\\min} = ${fmtNum(sigmaMin)}$`);

  if (sigmaMin < EPS) {
    logger.warn(`$\\sigma_{\\min} \\approx 0$ — Ma trận suy biến (singular), không khả nghịch.`);
    logger.result(`$$cond(A) = \\frac{\\sigma_{\\max}}{\\sigma_{\\min}} \\to \\infty$$`);
    logger.warn("Ma trận cực kỳ mất ổn định số.");
    return;
  }

  const cond = sigmaMax / sigmaMin;
  logger.separator();
  logger.result(`$$cond(A) = \\frac{\\sigma_{\\max}}{\\sigma_{\\min}} = \\frac{${fmtNum(sigmaMax)}}{${fmtNum(sigmaMin)}} = ${fmtNum(cond)}$$`);

  if (cond < 10) {
    logger.success(`Số điều kiện nhỏ (${fmtNum(cond)}) — Ma trận ổn định, bài toán có điều kiện tốt.`);
  } else if (cond < 1e6) {
    logger.info(`Số điều kiện trung bình (${fmtNum(cond)}) — Cần lưu ý sai số tích lũy khi giải hệ.`);
  } else {
    logger.warn(`Số điều kiện rất lớn (${fmtNum(cond)}) — Ma trận gần suy biến, bài toán mất điều kiện nghiêm trọng.`);
  }
}
