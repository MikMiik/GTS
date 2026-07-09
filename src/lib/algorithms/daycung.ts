import type { Logger } from "@/types/solver";
import { getPrecisionByEpsilon, parseFraction } from "./math-utils";
export function runDayCung(params: Record<string, string>, logger: Logger): void {
  const { fStr, a: aIn, b: bIn, epsilon } = params;
  let f: (x: number) => number;
  try {
    f = new Function("x", `"use strict"; return (${fStr});`) as (x: number) => number;
    f(0);
  } catch (e) {
    logger.error("Lỗi cú pháp hàm f(x): " + (e as Error).message);
    return;
  }
  const a = parseFraction(aIn), b = parseFraction(bIn);
  if ([a, b].some(isNaN)) { logger.error("Tham số khoảng [a, b] không hợp lệ."); return; }
  
  const hasEpsilon = epsilon !== undefined && epsilon.trim() !== "";
  let eps = 0;
  if (hasEpsilon) {
    eps = parseFraction(epsilon);
    if (isNaN(eps) || eps <= 0) { logger.error("Epsilon phải là số dương."); return; }
  }

  solveDayCung(f, a, b, eps, 100, logger);
}

function nd1(f: (x: number) => number, x: number, h = 1e-7) { return (f(x+h)-f(x-h))/(2*h); }
function nd2(f: (x: number) => number, x: number, h = 1e-5) { return (f(x+h)-2*f(x)+f(x-h))/(h*h); }

function estimateM(f: (x: number) => number, a: number, b: number) {
  let m1 = Infinity, M1 = 0;
  const h = (b-a)/500;
  for (let i = 0; i <= 500; i++) { const v = Math.abs(nd1(f,a+i*h)); if(v<m1)m1=v; if(v>M1)M1=v; }
  return { m1, M1 };
}



function rnd(v: number, sig: number) {
  if(!Number.isFinite(v)) return v;
  if(Math.abs(v)<1e-15) return 0;
  const e = Math.floor(Math.log10(Math.abs(v)));
  const f2 = Math.pow(10, sig-e-1);
  return Math.round(v*f2)/f2;
}

function fmt(v: number, d: number) {
  if(!Number.isFinite(v)) return String(v);
  if(Math.abs(v)<1e-15) return "0";
  return v.toFixed(d);
}

function solveDayCung(f: (x: number) => number, a: number, b: number, epsilon: number, maxIter: number, logger: Logger) {
  logger.section("KIỂM TRA ĐIỀU KIỆN");
  const fa=f(a), fb=f(b);
  logger.info(`$$f(a) = f(${a}) = ${fa.toFixed(6)}$$`);
  logger.info(`$$f(b) = f(${b}) = ${fb.toFixed(6)}$$`);
  if(fa*fb>=0){ logger.error("$$f(a) \\cdot f(b) \\ge 0$$ — không phải khoảng cách ly nghiệm!"); return; }
  logger.success("✔ $$f(a) \\cdot f(b) < 0$$ — khoảng hợp lệ.");
  let tableDecimals = 5;
  let reliableDigits = 5;
  const hasEpsilon = epsilon > 0;
  if (hasEpsilon) {
    const p = getPrecisionByEpsilon(epsilon);
    tableDecimals = p.tableDecimals;
    reliableDigits = p.reliableDigits;
  }
  const { m1, M1 } = estimateM(f,a,b);
  logger.section("ƯỚC LƯỢNG m₁, M₁");
  logger.info(`$$m_1 \\approx ${m1.toFixed(6)}, M_1 \\approx ${M1.toFixed(6)}, q = ${((M1-m1)/m1).toFixed(6)}$$`);
  if(m1<1e-14){ logger.error("$$m_1 \\approx 0$$, phương pháp không áp dụng được."); return; }
  const fda=nd2(f,a), fdb=nd2(f,b);
  logger.section("XÁC ĐỊNH ĐIỂM FOURIER");
  logger.info(`$$f''(a) \\cdot f(a) = ${(fa*fda).toFixed(6)}, f''(b) \\cdot f(b) = ${(fb*fdb).toFixed(6)}$$`);
  let d: number, x0: number;
  if(fa*fda>0){ d=a; x0=b; logger.success(`$$d = a = ${a}, x_0 = b = ${b}$$`); }
  else if(fb*fdb>0){ d=b; x0=a; logger.success(`$$d = b = ${b}, x_0 = a = ${a}$$`); }
  else{ logger.error("Không tìm được điểm Fourier."); return; }
  const fd=f(d);
  logger.section("QUÁ TRÌNH LẶP");
  logger.formula("Công thức: $$x_{k+1} = x_k - \\frac{f(x_k) \\cdot (x_k - d)}{f(x_k) - f(d)}$$");
  logger.text(`$$d = ${d}$$ (cố định), $$f(d) = ${fd.toFixed(8)}$$`);
  let xk=x0, xPrev: number|null=null;
  const tableData: Record<string,unknown>[] = [];
  for(let k=0;k<maxIter;k++){
    const fxk=f(xk), denom=fxk-fd;
    if(Math.abs(denom)<1e-15){ logger.warn("Dừng: mẫu số ≈ 0."); break; }
    const xNext=xk-(fxk*(xk-d))/denom, fxNext=f(xNext);
    const errT=Math.abs(fxk)/m1;
    const errC=xPrev!==null?((M1-m1)/m1)*Math.abs(xk-xPrev):null;
    tableData.push({ k, xₖ:fmt(xk,tableDecimals), "f(xₖ)":fxk.toExponential(4), "xₖ₊₁":fmt(xNext,tableDecimals), "f(xₖ₊₁)":fxNext.toExponential(4), "CT(1)|f|/m₁":errT.toExponential(4) });
    if(hasEpsilon && (errT<epsilon||( errC!==null && errC<epsilon))){
      logger.table(tableData); logger.separator();
      logger.success(`✔ Hội tụ tại bước k = ${k}`);
      const xR=rnd(xNext,reliableDigits);
      logger.result(`Nghiệm gần đúng (${reliableDigits} chữ số đáng tin): $$x^* \\approx ${xR}$$`);
      logger.info(`$$f(x^*) = ${fxNext.toExponential(6)}$$`); return;
    }
    xPrev=xk; xk=xNext;
  }
  logger.table(tableData);
  if (hasEpsilon) {
    logger.warn(`Dừng lặp sau ${maxIter} vòng do đạt giới hạn, chưa thỏa mãn sai số.`);
  } else {
    logger.success(`✔ Hoàn thành quá trình lặp tại bước k = ${maxIter}.`);
  }
  logger.result(`$$x \\approx ${fmt(xk,tableDecimals)}$$`);
}
