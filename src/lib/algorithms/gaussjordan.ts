import type { Logger } from "@/types/solver";

export function runGaussJordan(params: Record<string, string>, logger: Logger): void {
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
  const B2D=B.map(row=>Array.isArray(row)?row:[row]);
  logger.section("MA TRẬN ĐẦU VÀO");
  logger.text(`Kích thước A: ${A.length} × ${A[0].length}`);
  logger.text(`Số vế phải (cột B): ${B2D[0].length}`);
  solveGaussJordan(A, B2D, logger);
}

function parseMatrix(text: string): number[][] {
  const lines=text.trim().split("\n").filter(l=>l.trim()!=="");
  return lines.map((line,i)=>{
    const vals=line.trim().split(/[\s,;]+/).map(v=>{
      const n=parseFloat(v);
      if(isNaN(n)) throw new Error(`Giá trị không hợp lệ "${v}" ở hàng ${i+1}`);
      return n;
    });
    return vals;
  });
}

type Expr={const:number;terms:Record<string,number>};

function fmtM(M:number[][],n:number):Record<string,string>[]{
  return M.map(row=>{ const obj:Record<string,string>={};
    row.forEach((val,c)=>{ const name=c<n?`x${c+1}`:`b${c-n+1}`; obj[name]=Math.abs(val)<1e-10?"0.0000":val.toFixed(4); });
    return obj;
  });
}

function fmtExpr({const:c,terms}:Expr):string{
  const entries=Object.entries(terms).filter(([,v])=>Math.abs(v)>1e-10);
  const hasC=Math.abs(c)>1e-10;
  if(!hasC&&entries.length===0) return "0";
  const parts:string[]=[];
  if(hasC) parts.push(c.toFixed(4));
  for(const [t,coeff] of entries){
    if(parts.length===0){ if(Math.abs(coeff-1)<1e-10) parts.push(t); else if(Math.abs(coeff+1)<1e-10) parts.push(`-${t}`); else parts.push(`${coeff.toFixed(4)}*${t}`); }
    else{ const sign=coeff>=0?"+":"-"; const abs=Math.abs(coeff); if(Math.abs(abs-1)<1e-10) parts.push(`${sign} ${t}`); else parts.push(`${sign} ${abs.toFixed(4)}*${t}`); }
  }
  return parts.join(" ");
}

function pivotTier(value:number){ const abs=Math.abs(value); if(Math.abs(abs-1)<1e-9) return 2; if(Math.abs(abs-Math.round(abs))<1e-9&&abs>0) return 1; return 0; }

function findBestPivot(M:number[][],m:number,n:number,usedRows:Set<number>,usedCols:Set<number>){
  let best:{row:number,col:number,abs:number,tier:number}|null=null;
  for(let r=0;r<m;r++){
    if(usedRows.has(r)) continue;
    for(let c=0;c<n;c++){
      if(usedCols.has(c)) continue;
      const abs=Math.abs(M[r][c]);
      if(abs<1e-10) continue;
      const tier=pivotTier(M[r][c]);
      if(!best||tier>best.tier||(tier===best.tier&&abs>best.abs)) best={row:r,col:c,abs,tier};
    }
  }
  return best;
}

function solveGaussJordan(A:number[][],B:number[][],logger:Logger){
  const m=A.length,n=A[0].length,p=B[0].length;
  const M=A.map((row,r)=>[...row,...B[r]]);
  logger.section("QUÁ TRÌNH KHỬ GAUSS-JORDAN");
  logger.table(fmtM(M,n));
  const usedRows=new Set<number>(), usedCols=new Set<number>(), pivotList:{row:number,col:number}[]=[];
  let step=1;
  while(pivotList.length<Math.min(m,n)){
    const best=findBestPivot(M,m,n,usedRows,usedCols);
    if(!best){ logger.text("Toàn bộ phần chưa khử đều bằng 0 — dừng."); break; }
    const {row:pr,col:pc}=best, pivotVal=M[pr][pc];
    const tierLabels=["[số thập phân — lớn nhất]","[số nguyên — lớn nhất]","[±1 — tối ưu]"];
    logger.step(`[Bước ${step}] Chọn pivot: a(${pr+1},${pc+1}) = ${pivotVal.toFixed(4)} ${tierLabels[best.tier]}`);
    const ops:string[]=[]; let changed=false;
    for(let k=0;k<m;k++){
      if(k===pr) continue;
      if(Math.abs(M[k][pc])<1e-10) continue;
      const factor=M[k][pc]/pivotVal;
      ops.push(`L${k+1} = L${k+1} - (${factor.toFixed(4)}) × L${pr+1}`);
      for(let col=0;col<n+p;col++) M[k][col]-=factor*M[pr][col];
      M[k][pc]=0; changed=true;
    }
    if(changed) logger.text(ops.join("\n"));
    logger.table(fmtM(M,n));
    usedRows.add(pr); usedCols.add(pc); pivotList.push({row:pr,col:pc}); step++;
  }
  logger.section("CHUẨN HÓA ĐƯỜNG CHÉO (CHIA PIVOT = 1)");
  for(let r=0;r<m;r++){
    if(usedRows.has(r)) continue;
    for(let k=0;k<p;k++) if(Math.abs(M[r][n+k])>1e-10){ logger.error(`VÔ NGHIỆM: Hàng ${r+1} cho 0 = ${M[r][n+k].toFixed(4)}`); return null; }
  }
  const freeCols:number[]=[];
  for(let c=0;c<n;c++) if(!usedCols.has(c)) freeCols.push(c);
  if(freeCols.length>0){ logger.warn(`Phát hiện ${freeCols.length} biến tự do:`); freeCols.forEach((fc,idx)=>logger.info(`  Đặt x${fc+1} = t${idx+1} (∈ ℝ)`)); }
  const Mnorm=M.map(row=>[...row]);
  for(const {row:r,col:c} of pivotList){ const d=Mnorm[r][c]; for(let col=0;col<n+p;col++) Mnorm[r][col]/=d; }
  logger.table(fmtM(Mnorm,n));
  const X:Expr[][]=Array.from({length:n},()=>Array.from({length:p},()=>({const:0,terms:{}})));
  freeCols.forEach((fc,idx)=>{ const tName=`t${idx+1}`; for(let k=0;k<p;k++) X[fc][k]={const:0,terms:{[tName]:1}}; });
  for(const {row:r,col:c} of pivotList){
    const diagVal=M[r][c];
    for(let k=0;k<p;k++){
      const constPart=M[r][n+k]/diagVal, termsPart:Record<string,number>={};
      for(const fc of freeCols){ const coeff=M[r][fc]/diagVal; if(Math.abs(coeff)>1e-10){ const tName=`t${freeCols.indexOf(fc)+1}`; termsPart[tName]=(termsPart[tName]||0)-coeff; } }
      X[c][k]={const:constPart,terms:termsPart};
    }
  }
  logger.section("MA TRẬN NGHIỆM X");
  const resultTable=X.map((row,xi)=>{ const obj:Record<string,string>={Biến:`x${xi+1}`}; row.forEach((cell,k)=>{obj[`b${k+1}`]=fmtExpr(cell);}); return obj; });
  logger.table(resultTable);
  logger.success("Hoàn thành Gauss-Jordan.");
  return X;
}
