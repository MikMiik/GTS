import type { Logger } from "@/types/solver";

export function runNewtonSystem(params: Record<string, string>, logger: Logger): void {
  const { x0Str, tol: tolIn } = params;
  let x0Arr: number[];
  try {
    x0Arr = x0Str.trim().split(/[\s,;]+/).map(v => {
      const n = parseFloat(v);
      if(isNaN(n)) throw new Error(`Giá trị "${v}" không hợp lệ`);
      return n;
    });
  } catch(e) { logger.error("Lỗi đọc x₀: " + (e as Error).message); return; }
  if(x0Arr.length < 3) { logger.error("Cần đúng 3 giá trị cho x₀ = [x₁, x₂, x₃]."); return; }
  const tol = parseFloat(tolIn);
  if(isNaN(tol)||tol<=0) { logger.error("Tolerance phải là số dương."); return; }
  newtonSystemSolve(x0Arr, tol, 50, logger);
}

function F(X: number[]): number[] {
  const [x1,x2,x3]=X;
  return [
    3*x1 - Math.cos(x2*x3) - 0.5,
    x1*x1 - 81*Math.pow(x2+0.1,2) + Math.sin(x3) + 1.06,
    Math.exp(-x1*x2) + 20*x3 + 9.1389,
  ];
}

function J(X: number[]): number[][] {
  const [x1,x2,x3]=X;
  return [
    [3, x3*Math.sin(x2*x3), x2*Math.sin(x2*x3)],
    [2*x1, -162*(x2+0.1), Math.cos(x3)],
    [-x2*Math.exp(-x1*x2), -x1*Math.exp(-x1*x2), 20],
  ];
}

function gaussElim(A: number[][], b: number[]): number[] {
  const n=A.length;
  const M=A.map((row,i)=>[...row,b[i]]);
  for(let i=0;i<n;i++){
    let maxRow=i;
    for(let k=i+1;k<n;k++) if(Math.abs(M[k][i])>Math.abs(M[maxRow][i])) maxRow=k;
    [M[i],M[maxRow]]=[M[maxRow],M[i]];
    for(let k=i+1;k<n;k++){
      const factor=M[k][i]/M[i][i];
      for(let j=i;j<=n;j++) M[k][j]-=factor*M[i][j];
    }
  }
  const x=new Array(n).fill(0);
  for(let i=n-1;i>=0;i--){ let sum=0; for(let j=i+1;j<n;j++) sum+=M[i][j]*x[j]; x[i]=(M[i][n]-sum)/M[i][i]; }
  return x;
}

function newtonSystemSolve(x0: number[], tol: number, maxIter: number, logger: Logger) {
  logger.section("THÔNG TIN HỆ PHƯƠNG TRÌNH (CỐ ĐỊNH)");
  logger.formula("F₁(X) = 3x₁ - cos(x₂x₃) - 0.5 = 0");
  logger.formula("F₂(X) = x₁² - 81(x₂+0.1)² + sin(x₃) + 1.06 = 0");
  logger.formula("F₃(X) = e^(-x₁x₂) + 20x₃ + 9.1389 = 0");
  logger.text(`X₀ ban đầu = [${x0.map(v=>v.toFixed(6)).join(", ")}]`);
  logger.text(`Tolerance = ${tol}`);
  logger.formula("Công thức: J(Xₖ)·ΔX = -F(Xₖ), Xₖ₊₁ = Xₖ + ΔX");
  let X=[...x0];
  const tableData: Record<string,unknown>[] = [];
  logger.section("QUÁ TRÌNH LẶP NEWTON");
  for(let k=0;k<maxIter;k++){
    const Fk=F(X), Jk=J(X);
    const deltaX=gaussElim(Jk,Fk.map(v=>-v));
    const Xnext=X.map((xi,i)=>xi+deltaX[i]);
    const error=Math.max(...deltaX.map(Math.abs));
    tableData.push({ k:k+1, "x1":Xnext[0].toFixed(8), "x2":Xnext[1].toFixed(8), "x3":Xnext[2].toFixed(8), "||ΔX||∞":error.toExponential(4) });
    logger.step(`Bước k = ${k+1}`);
    logger.info(`  F(Xₖ) = [${Fk.map(v=>v.toFixed(6)).join(", ")}]`);
    logger.info(`  ΔX    = [${deltaX.map(v=>v.toFixed(6)).join(", ")}]`);
    logger.info(`  Xₖ₊₁  = [${Xnext.map(v=>v.toFixed(6)).join(", ")}]`);
    logger.info(`  Sai số = ${error.toExponential(4)}`);
    X=Xnext;
    if(error<tol){
      logger.separator(); logger.table(tableData); logger.separator();
      logger.success(`✔ Hội tụ sau ${k+1} bước lặp.`);
      logger.result(`Nghiệm: X* = [${X.map(v=>v.toFixed(8)).join(", ")}]`);
      return;
    }
  }
  logger.table(tableData);
  logger.warn(`Không hội tụ sau ${maxIter} bước.`);
  logger.result(`Kết quả cuối: X = [${X.map(v=>v.toFixed(8)).join(", ")}]`);
}
