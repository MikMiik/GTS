import type { Logger } from "@/types/solver";

export function runLapDonSystem(params: Record<string, string>, logger: Logger): void {
  const { x0Str, q: qIn, epsilon } = params;
  let x0Arr: number[];
  try {
    x0Arr = x0Str.trim().split(/[\s,;]+/).map(v => {
      const n = parseFloat(v);
      if(isNaN(n)) throw new Error(`Giá trị "${v}" không hợp lệ`);
      return n;
    });
  } catch(e) { logger.error("Lỗi đọc X₀: " + (e as Error).message); return; }
  if(x0Arr.length<3){ logger.error("Cần đúng 3 giá trị cho X₀ = [x₁, x₂, x₃]."); return; }
  const q=parseFloat(qIn), eps=parseFloat(epsilon);
  if(isNaN(q)||isNaN(eps)){ logger.error("q và epsilon phải là số hợp lệ."); return; }
  if(q>=1 || q<=0){ logger.error("Hệ số co q phải nằm trong khoảng (0, 1)."); return; }
  if(eps<=0){ logger.error("Epsilon phải là số dương."); return; }
  fixedPointSystem(x0Arr, q, eps, 100, logger);
}

const phiFuncs = [
  (X: number[]) => (Math.cos(X[1]*X[2]) + 0.5) / 3,
  (X: number[]) => (1/25)*Math.sqrt(X[0]*X[0]+0.3125) - 0.03,
  (X: number[]) => -(1/20)*Math.exp(-X[0]*X[1]) - (10*Math.PI-3)/60,
];

function prec(epsilon: number) {
  return { tableDecimals: Math.max(0,Math.ceil(-Math.log10(epsilon))+1), reliableDigits: Math.max(1,Math.round(-Math.log10(2*epsilon))) };
}

function rnd(v: number, sig: number) {
  if(!Number.isFinite(v)) return v;
  if(Math.abs(v)<1e-15) return 0;
  const e=Math.floor(Math.log10(Math.abs(v)));
  return Math.round(v*Math.pow(10,sig-e-1))/Math.pow(10,sig-e-1);
}

function fmt(v: number, d: number) {
  if(!Number.isFinite(v)) return String(v);
  if(Math.abs(v)<1e-15) return "0";
  return v.toFixed(d);
}

function fixedPointSystem(X0: number[], q: number, epsilon: number, maxIter: number, logger: Logger) {
  const eps0=((1-q)/q)*epsilon;
  const { tableDecimals, reliableDigits } = prec(epsilon);
  const n=X0.length;
  logger.section("THÔNG TIN HỆ PHƯƠNG TRÌNH (CỐ ĐỊNH)");
  logger.formula("φ₁(X) = (cos(x₂·x₃) + 0.5) / 3");
  logger.formula("φ₂(X) = (1/25)·√(x₁² + 0.3125) - 0.03");
  logger.formula("φ₃(X) = -(1/20)·e^(-x₁·x₂) - (10π-3)/60");
  logger.section("THÔNG TIN KHỞI ĐẦU");
  logger.info(`X₀ = [${X0.join(", ")}]`);
  logger.info(`q = ${q}, ε = ${epsilon.toExponential(4)}, ε₀ = ${eps0.toExponential(4)}`);
  logger.formula("Công thức: Xₖ₊₁ = Φ(Xₖ)");
  logger.text("Điều kiện dừng: ||Xₖ - Xₖ₋₁||∞ < ε₀");
  const fmtVec=(v:number[])=>`[${v.map(vi=>fmt(vi,tableDecimals)).join(", ")}]`;
  let X_prev=[...X0], step=0, maxDiff=0; const X_curr=[...X0];
  const tableData: Record<string,unknown>[]=[{ k:0, X_k:fmtVec(X0), "||ΔX||∞":"—" }];
  logger.section("QUÁ TRÌNH LẶP");
  while(step<maxIter){
    step++; maxDiff=0;
    for(let i=0;i<n;i++){ X_curr[i]=phiFuncs[i](X_prev); const d=Math.abs(X_curr[i]-X_prev[i]); if(d>maxDiff) maxDiff=d; }
    tableData.push({ k:step, X_k:fmtVec(X_curr), "||ΔX||∞":fmt(maxDiff,tableDecimals) });
    if(maxDiff<eps0) break;
    X_prev=[...X_curr];
  }
  logger.table(tableData);
  logger.separator();
  logger.text(`Ngưỡng dừng ε₀ = ${eps0.toExponential(4)}`);
  if(maxDiff<eps0){
    logger.success(`✔ Thỏa mãn điều kiện dừng tại bước k = ${step}.`);
    const XR=X_curr.map(v=>rnd(v,reliableDigits));
    logger.result(`Nghiệm gần đúng (${reliableDigits} chữ số đáng tin): X ≈ [${XR.join(", ")}]`);
  } else {
    logger.warn(`⚠ Thuật toán không hội tụ sau ${maxIter} vòng lặp.`);
    logger.text(`Kết quả cuối: X = ${fmtVec(X_curr)}`);
  }
}
