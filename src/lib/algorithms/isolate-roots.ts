import { fmtNum } from "./math-utils";
import type { Logger } from "@/types/solver";

// ─── Helpers Đa thức (Polynomial) ────────────────────────────────────────────────

// Cắt bỏ các số 0 vô nghĩa ở hệ số bậc cao
function trimPoly(P: number[]): number[] {
  let start = 0;
  while (start < P.length && Math.abs(P[start]) < 1e-11) {
    start++;
  }
  return start === P.length ? [0] : P.slice(start);
}

// Tính giá trị đa thức tại x bằng lược đồ Horner
function polyEval(P: number[], x: number): number {
  return P.reduce((acc, c) => acc * x + c, 0);
}

// Đạo hàm đa thức
function polyDeriv(P: number[]): number[] {
  if (P.length <= 1) return [0];
  const n = P.length - 1;
  const D = P.slice(0, -1).map((c, i) => c * (n - i));
  return trimPoly(D);
}

// Nhân đa thức với hằng số
function polyScale(P: number[], scale: number): number[] {
  return trimPoly(P.map((c) => c * scale));
}

// Trừ 2 đa thức
function polySub(A: number[], B: number[]): number[] {
  const len = Math.max(A.length, B.length);
  const padA = Array(len - A.length).fill(0).concat(A);
  const padB = Array(len - B.length).fill(0).concat(B);
  return trimPoly(padA.map((a, i) => a - padB[i]));
}

// Chia đa thức trả về [Q, R]
function polyDivRem(A: number[], B: number[]): { Q: number[]; R: number[] } {
  let R = trimPoly(A);
  const D = trimPoly(B);
  
  if (D.length === 1 && D[0] === 0) throw new Error("Chia cho đa thức 0.");
  if (R.length < D.length || (R.length === 1 && R[0] === 0)) return { Q: [0], R };

  const Q: number[] = Array(R.length - D.length + 1).fill(0);

  while (R.length >= D.length && !(R.length === 1 && R[0] === 0)) {
    const degDiff = R.length - D.length;
    const ratio = R[0] / D[0];
    Q[Q.length - 1 - degDiff] = ratio;

    const subTerm = D.map((c) => c * ratio).concat(Array(degDiff).fill(0));
    R = polySub(R, subTerm);
  }

  return { Q: trimPoly(Q), R: trimPoly(R) };
}

// Thuật toán Euclid tìm UCLN của 2 đa thức
function polyGcd(A: number[], B: number[]): number[] {
  let r0 = trimPoly(A);
  let r1 = trimPoly(B);

  let iter = 0;
  while (!(r1.length === 1 && r1[0] === 0) && iter < 100) {
    iter++;
    const { R } = polyDivRem(r0, r1);
    r0 = r1;
    r1 = trimPoly(R);
  }

  if (r0[0] !== 0) {
    return polyScale(r0, 1 / r0[0]); // Normalize
  }
  return r0;
}

// Thay x = -x
function polyEvalNegX(P: number[]): number[] {
  const n = P.length - 1;
  return trimPoly(P.map((c, i) => c * Math.pow(-1, n - i)));
}

// Tính giới hạn Cauchy cơ bản R
function cauchyRadius(P: number[]): number {
  let A = trimPoly(P);
  if (A[0] < 0) A = polyScale(A, -1);
  let maxCoeff = 0;
  for (let i = 1; i < A.length; i++) {
    if (Math.abs(A[i]) > maxCoeff) maxCoeff = Math.abs(A[i]);
  }
  return 1 + maxCoeff / A[0];
}

// Áp dụng tiêu chuẩn Maclaurin tìm cận trên nghiệm dương
function maclaurinBound(P: number[]): number {
  let A = trimPoly(P);
  if (A.length === 1 && A[0] === 0) return 0;
  if (A[0] < 0) A = polyScale(A, -1);

  let k = -1;
  let B = 0;
  for (let i = 1; i < A.length; i++) {
    if (A[i] < -1e-11) {
      if (k === -1) k = i;
      if (Math.abs(A[i]) > B) B = Math.abs(A[i]);
    }
  }

  if (k === -1) return 0; // Không có nghiệm dương
  return 1 + Math.pow(B / A[0], 1 / k);
}

// In đa thức ra chuỗi Latex
function formatPoly(P: number[]): string {
  if (P.length === 0 || (P.length === 1 && P[0] === 0)) return "0";
  const n = P.length - 1;
  let s = "";
  for (let i = 0; i <= n; i++) {
    const c = P[i];
    if (Math.abs(c) < 1e-10) continue;
    
    const deg = n - i;
    const sign = c < 0 ? " - " : (s ? " + " : "");
    const absC = Math.abs(c);
    
    let term = "";
    if (absC !== 1 || deg === 0) {
      term = parseFloat(absC.toFixed(4)).toString();
    }
    
    if (deg > 0) {
      term += deg === 1 ? "x" : `x^{${deg}}`;
    }
    
    if (term === "") term = "1";
    s += sign + term;
  }
  
  if (s.startsWith(" + ")) s = s.substring(3);
  if (s.startsWith(" - ")) s = "-" + s.substring(3);
  return s === "" ? "0" : s;
}

// Đếm số lần đổi dấu dãy Sturm
function countSignChanges(seq: number[][], x: number): number {
  let changes = 0;
  let lastSign = 0;
  for (const P of seq) {
    const val = polyEval(P, x);
    if (Math.abs(val) < 1e-10) continue;
    const sign = val > 0 ? 1 : -1;
    if (lastSign !== 0 && sign !== lastSign) {
      changes++;
    }
    lastSign = sign;
  }
  return changes;
}

// ─── Main Algorithm ──────────────────────────────────────────────────────────

export function runIsolateRoots(params: Record<string, string>, logger: Logger): void {
  logger.section("1. THIẾT LẬP BÀI TOÁN");

  let f: number[];
  try {
    f = params.coeffs
      .trim()
      .split(/[\s,]+/)
      .map((v) => {
        const n = parseFloat(v);
        if (isNaN(n)) throw new Error(`Hệ số không hợp lệ: "${v}"`);
        return n;
      });
  } catch (e) {
    logger.error("Lỗi đọc hệ số: " + (e as Error).message);
    return;
  }

  f = trimPoly(f);
  if (f.length <= 1) {
    logger.error("Đa thức phải có bậc >= 1.");
    return;
  }

  logger.formula(`$$f(x) = ${formatPoly(f)}$$`);

  // Bước 1: Tính bán kính nghiệm cơ bản
  const R = cauchyRadius(f);
  logger.info(`Bán kính Cauchy cơ bản: $R = 1 + \\frac{\\max |a_k|}{|a_n|} = ${fmtNum(R)}$`);

  // Bước 2: Thu hẹp miền tìm kiếm (Tiêu chuẩn Maclaurin)
  logger.section("2. THU HẸP MIỀN TÌM KIẾM (MACLAURIN)");
  
  const R_plus = maclaurinBound(f);
  logger.text(`- Cận trên nghiệm dương ($R_+$):`);
  logger.formula(`$$R_+ = ${fmtNum(R_plus)}$$`);

  const g = polyEvalNegX(f);
  logger.text(`- Đa thức phụ trợ $g(x) = f(-x) = ${formatPoly(g)}$`);
  const R_minus = maclaurinBound(g);
  logger.text(`- Cận dưới nghiệm âm ($-R_-$), là $-R_+$ của $g(x)$:` );
  logger.formula(`$$R_- = ${fmtNum(R_minus)}$$`);

  const A = Math.max(-R, -R_minus);
  const B = Math.min(R, R_plus);
  logger.result(`Miền tìm kiếm thu gọn: $\\Delta = [${fmtNum(A)}, ${fmtNum(B)}]$`);

  if (A > B || (A === 0 && B === 0)) {
    logger.warn("Miền tìm kiếm rỗng. Đa thức không có nghiệm thực.");
    return;
  }

  // Bước 3: Triệt tiêu nghiệm bội và lập dãy Sturm
  logger.section("3. KHỬ NGHIỆM BỘI VÀ LẬP DÃY STURM");
  
  const df = polyDeriv(f);
  const gcd = polyGcd(f, df);
  let P = f;

  if (gcd.length > 1) { // Có nghiệm bội
    logger.text(`Phát hiện nghiệm bội, $\\gcd(f, f') = ${formatPoly(gcd)}$`);
    const { Q, R: rem } = polyDivRem(f, gcd);
    if (rem.length === 1 && Math.abs(rem[0]) < 1e-8) {
      P = Q;
      logger.text(`Đa thức rút gọn (chỉ còn nghiệm đơn):`);
      logger.formula(`$$P(x) = \\frac{f(x)}{\\gcd} = ${formatPoly(P)}$$`);
    } else {
      logger.warn("Sai số số học khi khử nghiệm bội. Sẽ tiếp tục với đa thức gốc.");
    }
  } else {
    logger.text("Đa thức không có nghiệm bội.");
  }

  const sturmSeq: number[][] = [P, polyDeriv(P)];
  logger.text(`$P_0(x) = ${formatPoly(sturmSeq[0])}$`);
  logger.text(`$P_1(x) = ${formatPoly(sturmSeq[1])}$`);

  let i = 2;
  while (true) {
    const { R: rem } = polyDivRem(sturmSeq[i - 2], sturmSeq[i - 1]);
    if (rem.length === 1 && Math.abs(rem[0]) < 1e-8) {
      break;
    }
    const P_i = polyScale(rem, -1);
    sturmSeq.push(P_i);
    logger.text(`$P_${i}(x) = ${formatPoly(P_i)}$`);
    i++;
    if (i > 20) { // Safety break
      logger.warn("Dãy Sturm quá dài, có thể do sai số số thực. Dừng tạo dãy.");
      break;
    }
  }

  // Bước 4: Tách khoảng
  logger.section("4. PHÂN TÁCH KHOẢNG CÁCH LY (CHIA ĐỂ TRỊ)");

  const V_A = countSignChanges(sturmSeq, A);
  const V_B = countSignChanges(sturmSeq, B);
  const totalRoots = V_A - V_B;

  logger.info(`Số lần đổi dấu tại cận dưới $V(${fmtNum(A)}) = ${V_A}$`);
  logger.info(`Số lần đổi dấu tại cận trên $V(${fmtNum(B)}) = ${V_B}$`);
  
  if (totalRoots <= 0) {
    logger.warn(`Tổng số nghiệm thực trong $[${fmtNum(A)}, ${fmtNum(B)}]$ là 0.`);
    return;
  }
  
  logger.success(`Có tổng cộng **${totalRoots} nghiệm thực** phân biệt trong miền.`);

  const queue: [number, number][] = [[A, B]];
  const isolated: [number, number][] = [];
  const exactRoots: number[] = [];
  let steps = 0;

  const maxSteps = 200;

  while (queue.length > 0 && steps < maxSteps) {
    steps++;
    const [a, b] = queue.shift()!;
    if (b - a < 1e-6) {
      // Khoảng quá nhỏ, coi như cô lập được
      isolated.push([a, b]);
      continue;
    }

    const va = countSignChanges(sturmSeq, a);
    const vb = countSignChanges(sturmSeq, b);
    const k = va - vb;

    if (k === 1) {
      isolated.push([a, b]);
    } else if (k > 1) {
      const m = (a + b) / 2;
      const valM = polyEval(P, m);
      
      if (Math.abs(valM) < 1e-12) {
        exactRoots.push(m);
      }
      
      queue.push([a, m]);
      queue.push([m, b]);
    }
  }

  if (steps >= maxSteps) {
    logger.warn("Đạt giới hạn vòng lặp khi chia khoảng. Kết quả có thể chưa hoàn chỉnh.");
  }

  logger.separator();
  logger.text("**KẾT QUẢ KHOẢNG CÁCH LY:**");

  if (exactRoots.length > 0) {
    exactRoots.forEach(r => logger.result(`Nghiệm đúng: $$x = ${fmtNum(r)}$$`));
  }

  isolated.forEach((interval, idx) => {
    logger.result(`Khoảng ${idx + 1}: $$\\Delta_{${idx + 1}} = [${fmtNum(interval[0], 6)}, ${fmtNum(interval[1], 6)}]$$`);
  });

  if (isolated.length === 0 && exactRoots.length === 0) {
    logger.warn("Không tìm thấy khoảng cách ly nào hợp lệ.");
  }
}
