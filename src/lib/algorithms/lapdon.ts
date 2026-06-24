import type { Logger } from "@/types/solver";
import { parseFraction } from "./math-utils";

export function runLapDon(params: Record<string, string>, logger: Logger): void {
  const { phiStr, x0: x0In, q: qIn, epsilon } = params;
  let phi: (x: number) => number;
  try {
    phi = new Function("x", `"use strict"; return (${phiStr});`) as (x: number) => number;
    phi(0);
  } catch (e) {
    logger.error("Lỗi cú pháp hàm φ(x): " + (e as Error).message);
    return;
  }
  const x0=parseFraction(x0In), q=parseFraction(qIn), eps=parseFraction(epsilon);
  if([x0,q,eps].some(isNaN)){ logger.error("Tham số không hợp lệ."); return; }
  if(q>=1 || q<=0){ logger.error("Hệ số co q phải nằm trong khoảng (0, 1)."); return; }
  if(eps<=0){ logger.error("Epsilon phải là số dương."); return; }
  fixedPoint1D(phi, x0, q, eps, 100, logger);
}

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

function fixedPoint1D(phi: (x: number) => number, x0: number, q: number, epsilon: number, maxIter: number, logger: Logger) {
  const eps0 = ((1-q)/q)*epsilon;
  const { tableDecimals, reliableDigits } = prec(epsilon);

  logger.section("THÔNG TIN KHỞI ĐẦU");
  logger.info(`$$x_0 = ${x0}$$`);
  logger.info(`$$q = ${q}$$ (hệ số co)`);
  logger.info(`$$\\varepsilon = ${epsilon.toExponential(4)}$$`);
  logger.info(`$$\\varepsilon_0 = \\frac{1-q}{q}\\varepsilon = ${eps0.toExponential(4)}$$ (ngưỡng dừng)`);
  logger.formula("Công thức: $$x_{n+1} = \\varphi(x_n)$$");
  logger.formula("Điều kiện dừng: $$|x_n - x_{n-1}| < \\varepsilon_0$$");

  let x_prev=x0, x_curr=x0, n=0, diff=0;
  const tableData: Record<string,unknown>[] = [];
  tableData.push({ n:0, xₙ:fmt(x0,tableDecimals), "|xₙ - xₙ₋₁|":"—" });

  logger.section("QUÁ TRÌNH LẶP");

  while(n<maxIter){
    n++;
    x_curr=phi(x_prev);
    diff=Math.abs(x_curr-x_prev);
    tableData.push({ n, xₙ:fmt(x_curr,tableDecimals), "|xₙ - xₙ₋₁|":fmt(diff,tableDecimals) });
    if(diff<eps0) break;
    x_prev=x_curr;
  }

  logger.table(tableData);
  logger.separator();
  logger.text(`Ngưỡng dừng $$\\varepsilon_0 = ${eps0.toExponential(4)}$$`);

  if(diff<eps0){
    logger.success(`✔ Thỏa mãn điều kiện dừng tại bước n = ${n}.`);
    logger.result(`Nghiệm gần đúng (${reliableDigits} chữ số đáng tin): $$x \\approx ${rnd(x_curr,reliableDigits)}$$`);
  } else {
    logger.warn(`⚠ Thuật toán không hội tụ sau ${maxIter} vòng lặp.`);
  }
}
