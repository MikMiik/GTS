import type { Logger } from "@/types/solver";
import { parseFraction } from "./math-utils";

export function runGauss(params: Record<string, string>, logger: Logger): void {
  const { matA, matB } = params;
  let A: number[][], B: number[][];
  try {
    A = parseMatrix(matA);
    B = parseMatrix(matB);
  } catch (e) {
    logger.error("Lỗi đọc ma trận: " + (e as Error).message);
    return;
  }
  if(A.length===0){ logger.error("Ma trận A không hợp lệ."); return; }
  if(A.length!==B.length){ logger.error("Số hàng của A và B phải bằng nhau."); return; }
  const B2D = B.map(row => Array.isArray(row) ? row : [row]);
  logger.section("MA TRẬN ĐẦU VÀO");
  logger.text(`Kích thước A: ${A.length} × ${A[0].length}`);
  logger.text(`Số vế phải (cột B): ${B2D[0].length}`);
  solveGauss(A, B2D, logger);
}

function parseMatrix(text: string): number[][] {
  const lines = text.trim().split("\n").filter((l) => l.trim() !== "");
  if (lines.length === 0) throw new Error("Ma trận rỗng");
  return lines.map((line, i) => {
    const normalizedLine = line.replace(/\s*\/\s*/g, '/');
    const vals = normalizedLine.trim().split(/[\s,;]+/).map((v) => {
      const n = parseFraction(v);
      if (isNaN(n)) throw new Error(`Giá trị không hợp lệ "${v}" ở hàng ${i + 1}`);
      return n;
    });
    return vals;
  });
}

type Expr = { const: number; terms: Record<string,number> };

function fmtMatrix(M: number[][], n: number): Record<string,string>[] {
  return M.map(row => {
    const obj: Record<string,string> = {};
    row.forEach((val,c) => {
      const name = c<n ? `x${c+1}` : `b${c-n+1}`;
      obj[name] = Math.abs(val)<1e-10 ? "0.0000" : val.toFixed(4);
    });
    return obj;
  });
}

function fmtExpr(expr: Expr): string {
  const { const: c, terms } = expr;
  const entries = Object.entries(terms).filter(([,v]) => Math.abs(v)>1e-10);
  const hasC = Math.abs(c)>1e-10;
  if(!hasC && entries.length===0) return "0";
  const parts: string[] = [];
  if(hasC) parts.push(c.toFixed(4));
  for(const [t,coeff] of entries){
    if(parts.length===0){
      if(Math.abs(coeff-1)<1e-10) parts.push(t);
      else if(Math.abs(coeff+1)<1e-10) parts.push(`-${t}`);
      else parts.push(`${coeff.toFixed(4)}*${t}`);
    } else {
      const sign = coeff>=0?"+":"-";
      const abs = Math.abs(coeff);
      if(Math.abs(abs-1)<1e-10) parts.push(`${sign} ${t}`);
      else parts.push(`${sign} ${abs.toFixed(4)}*${t}`);
    }
  }
  return parts.join(" ");
}

function solveGauss(A: number[][], B: number[][], logger: Logger) {
  const m=A.length, n=A[0].length, p=B[0].length;
  const M=A.map((row,r) => [...row,...B[r]]);
  logger.section("QUY TRÌNH THUẬN (FORWARD ELIMINATION)");
  logger.table(fmtMatrix(M,n));
  let i=0,j=0,step=1;
  const pivotCols: {row:number,col:number}[] = [];
  while(i<m && j<n){
    let maxRow=i, maxVal=Math.abs(M[i][j]);
    for(let t=i+1;t<m;t++) if(Math.abs(M[t][j])>maxVal){ maxVal=Math.abs(M[t][j]); maxRow=t; }
    if(maxVal<1e-10){ logger.text(`Cột x${j+1} toàn 0, bỏ qua.`); j++; continue; }
    if(maxRow!==i){ [M[i],M[maxRow]]=[M[maxRow],M[i]]; logger.info(`Hoán vị hàng ${i+1} ↔ hàng ${maxRow+1}`); logger.table(fmtMatrix(M,n)); }
    logger.step(`[Bước ${step}] Chọn phần tử khử:`);
    logger.formula(`$$a_{${i+1},${j+1}} = ${M[i][j].toFixed(4)}$$`);
    const ops: string[] = []; let changed=false;
    for(let k=i+1;k<m;k++){
      if(Math.abs(M[k][j])>1e-10){
        const factor=M[k][j]/M[i][j];
        ops.push(`L_{${k+1}} = L_{${k+1}} - (${factor.toFixed(4)}) L_{${i+1}}`);
        for(let col=j;col<n+p;col++) M[k][col]-=factor*M[i][col];
        M[k][j]=0; changed=true;
      }
    }
    if(changed){ logger.formula(`$$\\begin{cases} ${ops.join(" \\\\ ")} \\end{cases}$$`); logger.table(fmtMatrix(M,n)); }
    step++; pivotCols.push({row:i,col:j}); i++; j++;
  }
  logger.success("Kết thúc quy trình thuận.");
  logger.section("QUY TRÌNH NGHỊCH (BACK SUBSTITUTION)");
  const pivotRowSet=new Set(pivotCols.map(pc=>pc.row));
  for(let r=0;r<m;r++){
    if(!pivotRowSet.has(r)){
      for(let k=0;k<p;k++){
        if(Math.abs(M[r][n+k])>1e-10){ logger.error(`VÔ NGHIỆM: Hàng ${r+1} cho $$0 = ${M[r][n+k].toFixed(4)}$$`); return null; }
      }
    }
  }
  const pivotColSet=new Set(pivotCols.map(pc=>pc.col));
  const freeCols: number[] = [];
  for(let c=0;c<n;c++) if(!pivotColSet.has(c)) freeCols.push(c);
  if(freeCols.length>0){ logger.warn(`Phát hiện ${freeCols.length} biến tự do:`); freeCols.forEach((fc,idx)=>logger.formula(`$$x_{${fc+1}} = t_{${idx+1}} \\in \\mathbb{R}$$`)); }
  const X: Expr[][] = Array.from({length:n},()=>Array.from({length:p},()=>({const:0,terms:{}})));
  freeCols.forEach((fc,idx)=>{ const tName=`t${idx+1}`; for(let k=0;k<p;k++) X[fc][k]={const:0,terms:{[tName]:1}}; });
  for(let idx=pivotCols.length-1;idx>=0;idx--){
    const {row,col:pc}=pivotCols[idx], heSo=M[row][pc];
    logger.info(`Giải từ hàng ${row+1} → x${pc+1}`);
    for(let k=0;k<p;k++){
      let sumC = 0;
      const sumT: Record<string,number>={};
      for(let c=pc+1;c<n;c++){
        const coeff=M[row][c];
        if(Math.abs(coeff)<1e-10) continue;
        sumC += coeff*X[c][k].const;
        for(const [t,tv] of Object.entries(X[c][k].terms)) sumT[t]=(sumT[t]||0)+coeff*tv;
      }
      const vePhai=M[row][n+k];
      const resConst=(vePhai-sumC)/heSo;
      const resTerms: Record<string,number>={};
      for(const [t,tv] of Object.entries(sumT)){ const v=-tv/heSo; if(Math.abs(v)>1e-10) resTerms[t]=v; }
      X[pc][k]={const:resConst,terms:resTerms};
      logger.formula(`Cột $b_{${k+1}}$: $$x_{${pc+1}} = ${fmtExpr(X[pc][k]).replace(/t(\d+)/g, "t_{$1}").replace(/\*/g, " ")}$$`);
    }
  }
  logger.section("MA TRẬN NGHIỆM X");
  const resultTable=X.map((row,xi)=>{ const obj: Record<string,string>={Biến:`x${xi+1}`}; row.forEach((cell,k)=>{obj[`b${k+1}`]=fmtExpr(cell);}); return obj; });
  logger.table(resultTable);
  logger.success("Hoàn thành giải hệ phương trình.");
  return X;
}
