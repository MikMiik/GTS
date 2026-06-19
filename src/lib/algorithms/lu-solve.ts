import type { Logger } from "@/types/solver";
import {
  backSub,
  fmt,
  formatMatrixForLog,
  formatVec,
  forwardSub,
  logLuDecomposition,
  parseMatrix,
  parseVector,
  validateSquareMatrix,
} from "@/lib/algorithms/lu-core";

export function runLuSolve(params: Record<string, string>, logger: Logger): void {
  const { matA, vecB } = params;

  let A: number[][];
  let B: number[];
  try {
    A = parseMatrix(matA);
    B = parseVector(vecB);
  } catch (e) {
    logger.error("Lỗi đọc dữ liệu: " + (e as Error).message);
    return;
  }

  const err = validateSquareMatrix(A);
  if (err) {
    logger.error(err);
    return;
  }

  const n = A.length;
  if (B.length !== n) {
    logger.error(`Vector B phải có ${n} phần tử, nhận được ${B.length}.`);
    return;
  }

  logger.section("MA TRẬN ĐẦU VÀO");
  logger.info(`Kích thước A: ${n} × ${n}`);
  logger.text("Ma trận A:");
  logger.table(formatMatrixForLog(A));
  logger.text(`Vector B = ${formatVec(B)}`);

  const factor = logLuDecomposition(A, logger, "BƯỚC 1 (B1): PHÂN TÁCH A = LU");
  if (!factor) return;

  const { L, U } = factor;

  logger.section("KẾT QUẢ PHÂN TÁCH");
  logger.text("Ma trận L:");
  logger.table(formatMatrixForLog(L));
  logger.text("Ma trận U:");
  logger.table(formatMatrixForLog(U));

  logger.section("BƯỚC 2 (B2): GIẢI LY = B");
  logger.formula("y_1 = b_1 / l_{11}");
  logger.formula("y_i = (b_i − Σ_{j=1}^{i−1} l_ij y_j) / l_ii  (i = 2…n)");

  const Y = forwardSub(L, B, (step) => {
    logger.info(step.detail);
  });

  logger.result(`Y = ${formatVec(Y)}`);

  logger.section("BƯỚC 3 (B3): GIẢI UX = Y");
  logger.formula("x_n = y_n");
  logger.formula("x_i = y_i − Σ_{j=i+1}^n u_ij x_j  (i = n−1…1)");

  const X = backSub(U, Y, (step) => {
    logger.info(step.detail);
  });

  logger.result(`X = ${formatVec(X)}`);
  logger.success("Giải hệ AX = B hoàn tất.");
}
