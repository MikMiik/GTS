import type { Logger } from "@/types/solver";
import {
  fmt,
  formatMatrixForLog,
  parseMatrix,
  validateSquareMatrix,
} from "@/lib/algorithms/lu-core";
import {
  logCholeskyDecomposition,
  validateSymmetricMatrix,
  verifyCholeskyProduct,
} from "@/lib/algorithms/cholesky-core";

export function runCholeskyDecompose(
  params: Record<string, string>,
  logger: Logger,
): void {
  const { matA } = params;

  let A: number[][];
  try {
    A = parseMatrix(matA);
  } catch (e) {
    logger.error("Lỗi đọc ma trận: " + (e as Error).message);
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
  logger.section("MA TRẬN ĐẦU VÀO");
  logger.info(`Kích thước: ${n} × ${n} (đối xứng xác định dương)`);
  logger.text("Ma trận A:");
  logger.table(formatMatrixForLog(A));

  const L = logCholeskyDecomposition(A, logger);
  if (!L) return;

  logger.section("KẾT QUẢ");
  logger.text("Ma trận L (tam giác dưới, l_ii > 0):");
  logger.table(formatMatrixForLog(L));
  logger.text("L^T là ma trận tam giác trên (A = L · L^T).");

  const maxErr = verifyCholeskyProduct(L, A);
  if (maxErr < 1e-6) {
    logger.success(`Xác minh A = LL^T: sai số tối đa = ${fmt(maxErr, 6)}`);
    logger.result("Phân tách thành công: $$A = LL^T$$");
  } else {
    logger.warn(
      `Xác minh A = LL^T: sai số tối đa = ${fmt(maxErr, 6)} (có thể do làm tròn)`,
    );
    logger.result("$$L$$ đã tính (kiểm tra lại nếu sai số lớn)");
  }
}
