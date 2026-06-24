import type { Logger } from "@/types/solver";
import {
  fmt,
  formatMatrixForLog,
  formatVec,
  forwardSub,
  parseMatrix,
  parseVector,
  validateSquareMatrix,
} from "@/lib/algorithms/lu-core";
import {
  backSubTranspose,
  logCholeskyDecomposition,
  validateSymmetricMatrix,
} from "@/lib/algorithms/cholesky-core";

export function runCholeskySolve(
  params: Record<string, string>,
  logger: Logger,
): void {
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

  const symErr = validateSymmetricMatrix(A);
  if (symErr) {
    logger.error(symErr);
    return;
  }

  const n = A.length;
  if (B.length !== n) {
    logger.error(`Vector B phải có ${n} phần tử, nhận được ${B.length}.`);
    return;
  }

  logger.section("MA TRẬN ĐẦU VÀO");
  logger.info(`Kích thước A: ${n} × ${n} (đối xứng xác định dương)`);
  logger.text("Ma trận A:");
  logger.table(formatMatrixForLog(A));
  logger.text(`Vector B = ${formatVec(B)}`);

  const L = logCholeskyDecomposition(
    A,
    logger,
    "BƯỚC 1 (B1): PHÂN TÁCH A = LL^T",
  );
  if (!L) return;

  logger.section("KẾT QUẢ PHÂN TÁCH");
  logger.text("Ma trận L:");
  logger.table(formatMatrixForLog(L));

  logger.section("BƯỚC 2 (B2): GIẢI LY = B");
  logger.formula("$$y_1 = \\frac{b_1}{l_{11}}$$");
  logger.formula("$$y_i = \\frac{b_i - \\sum_{j=1}^{i-1} l_{ij} y_j}{l_{ii}} \\quad (i = 2 \\dots n)$$");

  const Y = forwardSub(L, B, (step) => {
    logger.formula(step.detail);
  });

  logger.result(`$$Y = \\begin{bmatrix} ${Y.map(v=>fmt(v)).join(" & ")} \\end{bmatrix}^T$$`);

  logger.section("BƯỚC 3 (B3): GIẢI L^T X = Y");
  logger.formula("$$x_n = \\frac{y_n}{l_{nn}}$$");
  logger.formula("$$x_i = \\frac{y_i - \\sum_{j=i+1}^{n} l_{ji} x_j}{l_{ii}} \\quad (i = n-1 \\dots 1)$$");

  const X = backSubTranspose(L, Y, (step) => {
    logger.formula(step.detail);
  });

  logger.result(`$$X = \\begin{bmatrix} ${X.map(v=>fmt(v)).join(" & ")} \\end{bmatrix}^T$$`);
  logger.success("Giải hệ AX = B hoàn tất.");
}
