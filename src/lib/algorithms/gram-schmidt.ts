import type { Logger } from "@/types/solver";
import { parseFraction } from "./math-utils";
import { create, all } from "mathjs";

const math = create(all);

function formatNum(n: number): string {
  if (Math.abs(n) < 1e-10) return (0).toFixed(4);
  return n.toFixed(4);
}

function formatVec(v: number[]): string {
  return `\\begin{bmatrix} ${v.map(formatNum).join(" & ")} \\end{bmatrix}^T`;
}

export function runGramSchmidt(params: Record<string, string>, logger: Logger): void {
  const { vectors: vectorsStr } = params;

  // 1. Parse input
  const lines = vectorsStr.split(/\r?\n/).filter((s) => s.trim().length > 0);
  if (lines.length === 0) {
    logger.error("Vui lòng nhập tập vector.");
    return;
  }

  const vectors: number[][] = [];
  let dimension = -1;

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].trim().split(/[\s,;]+/).filter(Boolean);
    const vec: number[] = [];
    for (let j = 0; j < parts.length; j++) {
      const num = parseFraction(parts[j]);
      if (isNaN(num)) {
        logger.error(`Giá trị "${parts[j]}" ở vector $v_{${i + 1}}$ không hợp lệ.`);
        return;
      }
      vec.push(num);
    }
    
    if (dimension === -1) {
      dimension = vec.length;
    } else if (vec.length !== dimension) {
      logger.error(`Các vector phải có cùng số chiều. Vector $v_1$ có ${dimension} chiều, nhưng vector $v_{${i + 1}}$ có ${vec.length} chiều.`);
      return;
    }
    vectors.push(vec);
  }

  const n = vectors.length;

  logger.section("TẬP VECTOR ĐẦU VÀO");
  for (let i = 0; i < n; i++) {
    logger.info(`$$v_{${i + 1}} = ${formatVec(vectors[i])}$$`);
  }

  logger.section("BƯỚC 1: TRỰC GIAO HÓA (TÌM U)");
  const u: number[][] = [];

  for (let k = 0; k < n; k++) {
    logger.step(`Tính vector $u_{${k + 1}}$`);
    let uk = [...vectors[k]];
    
    if (k === 0) {
      logger.formula(`$$u_1 = v_1 = ${formatVec(uk)}$$`);
    } else {
      let formulaTex = `$$u_{${k + 1}} = v_{${k + 1}}`;
      for (let i = 0; i < k; i++) {
        const ui = u[i];
        const uiNormSq = math.dot(ui, ui) as number;
        
        if (uiNormSq < 1e-12) {
          continue; // Bỏ qua nếu ui là vector 0 (sẽ xử lý phụ thuộc tuyến tính sau)
        }

        const dotProduct = math.dot(vectors[k], ui) as number;
        const scalar = dotProduct / uiNormSq;
        const proj = math.multiply(ui, scalar) as number[];
        
        uk = math.subtract(uk, proj) as number[];
        
        const sign = scalar >= 0 ? "-" : "+";
        const absScalar = Math.abs(scalar);
        formulaTex += ` ${sign} ${formatNum(absScalar)} u_{${i + 1}}`;
      }
      formulaTex += `$$`;
      logger.formula(formulaTex);
      logger.result(`$$u_{${k + 1}} = ${formatVec(uk)}$$`);
    }
    u.push(uk);
  }

  logger.section("BƯỚC 2: TRỰC CHUẨN HÓA (TÌM E)");
  const e: number[][] = [];
  let hasDependent = false;

  for (let i = 0; i < n; i++) {
    const magnitude = math.norm(u[i]) as number;
    logger.step(`Chuẩn hóa vector $u_{${i + 1}}$`);
    
    if (magnitude < 1e-12) {
      logger.warn(`⚠ Vector $u_{${i + 1}}$ có độ dài $\\approx 0$. Tập vector đầu vào bị phụ thuộc tuyến tính.`);
      e.push(u[i]);
      hasDependent = true;
    } else {
      logger.formula(`$$\\|u_{${i + 1}}\\| = ${formatNum(magnitude)}$$`);
      const ei = math.multiply(u[i], 1 / magnitude) as number[];
      e.push(ei);
      logger.result(`$$e_{${i + 1}} = \\frac{u_{${i + 1}}}{\\|u_{${i + 1}}\\|} = ${formatVec(ei)}$$`);
    }
  }

  logger.section("KẾT QUẢ");
  if (hasDependent) {
    logger.warn("Tập vector đầu vào không độc lập tuyến tính, không thể tạo thành hệ trực chuẩn đầy đủ.");
  } else {
    logger.success("Đã tìm được hệ vector trực chuẩn $E = \\{e_1, e_2, \\dots, e_n\\}$");
  }
}
