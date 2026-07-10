import type { Logger } from "@/types/solver";
import {
  fmt,
  formatMatrixForLog,
  forwardSub,
  parseMatrix,
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
  let B: number[][];
  try {
    A = parseMatrix(matA);
    // Parse vecB as a matrix to support multiple columns
    B = parseMatrix(vecB);
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
    logger.error(`Ma trận B phải có ${n} hàng, nhận được ${B.length}.`);
    return;
  }

  const numColsB = B[0].length;

  logger.section("MA TRẬN ĐẦU VÀO");
  logger.info(`Kích thước A: ${n} × ${n} (đối xứng xác định dương)`);
  logger.text("Ma trận A:");
  logger.table(formatMatrixForLog(A));
  logger.text(`Ma trận B (${n} × ${numColsB}):`);
  logger.table(formatMatrixForLog(B));

  const L = logCholeskyDecomposition(
    A,
    logger,
    "BƯỚC 1 (B1): PHÂN TÁCH A = LL^T",
  );
  if (!L) return;

  logger.section("KẾT QUẢ PHÂN TÁCH");
  logger.text("Ma trận L:");
  logger.table(formatMatrixForLog(L));

  const finalX: number[][] = Array.from({ length: n }, () => new Array(numColsB).fill(0));
  const finalY: number[][] = Array.from({ length: n }, () => new Array(numColsB).fill(0));

  for (let col = 0; col < numColsB; col++) {
    if (numColsB > 1) {
      logger.separator();
      logger.step(`*** GIẢI CHO CỘT ${col + 1} ***`);
    }

    const bCol = B.map(row => row[col]);

    logger.section(numColsB > 1 ? `BƯỚC 2 (CỘT ${col + 1}): GIẢI LY = B` : "BƯỚC 2 (B2): GIẢI LY = B");
    logger.formula("$$y_1 = \\frac{b_1}{l_{11}}$$");
    logger.formula("$$y_i = \\frac{b_i - \\sum_{j=1}^{i-1} l_{ij} y_j}{l_{ii}} \\quad (i = 2 \\dots n)$$");

    const Y = forwardSub(L, bCol, (step) => {
      logger.formula(step.detail);
    });

    for (let i = 0; i < n; i++) finalY[i][col] = Y[i];

    logger.result(`$$Y${numColsB > 1 ? `_{cột ${col+1}}` : ""} = \\begin{bmatrix} ${Y.map(v=>fmt(v)).join(" & ")} \\end{bmatrix}^T$$`);

    logger.section(numColsB > 1 ? `BƯỚC 3 (CỘT ${col + 1}): GIẢI L^T X = Y` : "BƯỚC 3 (B3): GIẢI L^T X = Y");
    logger.formula("$$x_n = \\frac{y_n}{l_{nn}}$$");
    logger.formula("$$x_i = \\frac{y_i - \\sum_{j=i+1}^{n} l_{ji} x_j}{l_{ii}} \\quad (i = n-1 \\dots 1)$$");

    const X = backSubTranspose(L, Y, (step) => {
      logger.formula(step.detail);
    });

    for (let i = 0; i < n; i++) finalX[i][col] = X[i];

    logger.result(`$$X${numColsB > 1 ? `_{cột ${col+1}}` : ""} = \\begin{bmatrix} ${X.map(v=>fmt(v)).join(" & ")} \\end{bmatrix}^T$$`);
  }

  if (numColsB > 1) {
    logger.separator();
    logger.section("TỔNG HỢP NGHIỆM");
    logger.text("Ma trận X:");
    logger.table(formatMatrixForLog(finalX));
  }
  logger.success("Giải hệ AX = B hoàn tất.");
}
