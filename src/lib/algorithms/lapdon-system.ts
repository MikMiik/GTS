import type { Logger } from "@/types/solver";
import { parseFraction } from "./math-utils";

export function runLapDonSystem(params: Record<string, string>, logger: Logger): void {
  const { x0Str, q: qIn, epsilon } = params;
  let x0Arr: number[];
  try {
    x0Arr = x0Str
      .replace(/\s*\/\s*/g, '/')
      .trim()
      .split(/[\s,;]+/)
      .map((v) => {
        const n = parseFraction(v);
        if (isNaN(n)) throw new Error(`Giá trị không hợp lệ "${v}"`);
        return n;
      });
  } catch(e) { logger.error("Lỗi đọc X₀: " + (e as Error).message); return; }
  if(x0Arr.length<3){ logger.error("Cần đúng 3 giá trị cho X₀ = [x₁, x₂, x₃]."); return; }
  const q=parseFraction(qIn), eps=parseFraction(epsilon);
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
  logger.formula("$$\\varphi_1(X) = \\frac{\\cos(x_2 x_3) + 0.5}{3}$$");
  logger.formula("$$\\varphi_2(X) = \\frac{1}{25}\\sqrt{x_1^2 + 0.3125} - 0.03$$");
  logger.formula("$$\\varphi_3(X) = -\\frac{1}{20} e^{-x_1 x_2} - \\frac{10\\pi - 3}{60}$$");
  logger.section("THÔNG TIN KHỞI ĐẦU");
  logger.info(`$$X^{(0)} = \\begin{bmatrix} ${X0.join(" & ")} \\end{bmatrix}^T$$`);
  logger.info(`$$q = ${q}, \\varepsilon = ${epsilon.toExponential(4)}, \\varepsilon_0 = ${eps0.toExponential(4)}$$`);
  logger.formula("Công thức: $$X^{(k+1)} = \\Phi(X^{(k)})$$");
  logger.formula("Điều kiện dừng: $$\\left\\| X^{(k)} - X^{(k-1)} \\right\\|_\\infty < \\varepsilon_0$$");
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
  logger.text(`Ngưỡng dừng $$\\varepsilon_0 = ${eps0.toExponential(4)}$$`);
  if(maxDiff<eps0){
    logger.success(`✔ Thỏa mãn điều kiện dừng tại bước k = ${step}.`);
    const XR=X_curr.map(v=>rnd(v,reliableDigits));
    logger.result(`Nghiệm gần đúng (${reliableDigits} chữ số đáng tin): $$X \\approx \\begin{bmatrix} ${XR.join(" & ")} \\end{bmatrix}^T$$`);
  } else {
    logger.warn(`⚠ Thuật toán không hội tụ sau ${maxIter} vòng lặp.`);
    logger.text(`Kết quả cuối: $$X = \\begin{bmatrix} ${X_curr.map(v=>fmt(v, tableDecimals)).join(" & ")} \\end{bmatrix}^T$$`);
  }
}
