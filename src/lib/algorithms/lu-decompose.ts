import type { Logger } from "@/types/solver";
import {
  fmt,
  formatMatrixForLog,
  logLuDecomposition,
  parseMatrix,
  validateSquareMatrix,
  verifyProduct,
} from "@/lib/algorithms/lu-core";

export function runLuDecompose(params: Record<string, string>, logger: Logger): void {
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

  const n = A.length;
  logger.section("MA TRẬN ĐẦU VÀO");
  logger.info(`Kích thước: ${n} × ${n}`);
  logger.text("Ma trận A:");
  logger.table(formatMatrixForLog(A));

  const result = logLuDecomposition(A, logger);
  if (!result) return;

  const { L, U } = result;

  logger.section("KẾT QUẢ");
  logger.text("Ma trận L (tam giác dưới):");
  logger.table(formatMatrixForLog(L));
  logger.text("Ma trận U (tam giác trên, u_ii = 1):");
  logger.table(formatMatrixForLog(U));

  const maxErr = verifyProduct(L, U, A);
  if (maxErr < 1e-6) {
    logger.success(`Xác minh A = LU: sai số tối đa = ${fmt(maxErr, 6)}`);
    logger.result(`Phân tách thành công: $A = LU$`);
  } else {
    logger.warn(`Xác minh A = LU: sai số tối đa = ${fmt(maxErr, 6)} (có thể do làm tròn)`);
    logger.result(`$L$ và $U$ đã tính (kiểm tra lại nếu sai số lớn)`);
  }
}
