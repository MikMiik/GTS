import type { Logger } from "@/types/solver";
import { parseFraction, getPrecisionByEpsilon, fmtNum } from "./math-utils";
import { create, all } from "mathjs";

const math = create(all);

function gaussElim(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
    }
    if (Math.abs(M[maxRow][i]) < 1e-12) {
      throw new Error("Ma trận suy biến");
    }
    [M[i], M[maxRow]] = [M[maxRow], M[i]];
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) {
        M[k][j] -= factor * M[i][j];
      }
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) sum += M[i][j] * x[j];
    x[i] = (M[i][n] - sum) / M[i][i];
  }
  return x;
}

export function runNewtonSystem(params: Record<string, string>, logger: Logger): void {
  const { vars: varsStr, funcs: funcsStr, x0Str, tol: tolIn, maxIter: maxIterStr } = params;

  // 1. Parse variables
  const vars = varsStr.split(/[\s,;]+/).filter(Boolean);
  if (vars.length === 0) {
    logger.error("Vui lòng nhập các biến số.");
    return;
  }
  const n = vars.length;

  // 2. Parse initial vector x0
  let x0Arr: number[];
  try {
    x0Arr = x0Str
      .replace(/\s*\/\s*/g, "/")
      .trim()
      .split(/[\s,;]+/)
      .map((v) => {
        const num = parseFraction(v);
        if (isNaN(num)) throw new Error(`Giá trị "${v}" không hợp lệ`);
        return num;
      });
  } catch (e) {
    logger.error("Lỗi đọc X₀: " + (e as Error).message);
    return;
  }
  if (x0Arr.length !== n) {
    logger.error(`Số lượng biến (${n}) không khớp với kích thước của X₀ (${x0Arr.length}).`);
    return;
  }

  // 3. Parse and compile functions
  const funcsRaw = funcsStr.split(/\r?\n/).filter((s) => s.trim().length > 0);
  if (funcsRaw.length !== n) {
    logger.error(`Cần đúng ${n} phương trình, nhưng bạn đã nhập ${funcsRaw.length}.`);
    return;
  }

  const compiledFuncs = [];
  const compiledJac = [];

  logger.section("HỆ PHƯƠNG TRÌNH VÀ MA TRẬN JACOBI");
  try {
    for (let i = 0; i < n; i++) {
      const exprStr = funcsRaw[i];
      const node = math.parse(exprStr);
      logger.formula(`$$f_{${i + 1}}(X) = ${node.toTex()} = 0$$`);
      compiledFuncs.push(node.compile());

      const jacRow = [];
      const jacRowTex = [];
      for (let j = 0; j < n; j++) {
        const deriv = math.derivative(node, vars[j]);
        jacRowTex.push(deriv.toTex());
        jacRow.push(deriv.compile());
      }
      compiledJac.push(jacRow);
      // Hiển thị đạo hàm ra log để người dùng tham khảo (Jacobian row)
      logger.info(`$$\\nabla f_{${i + 1}} = \\begin{bmatrix} ${jacRowTex.join(" & ")} \\end{bmatrix}$$`);
    }
  } catch (e) {
    logger.error("Lỗi cú pháp toán học: " + (e as Error).message);
    return;
  }

  const hasTol = tolIn !== undefined && tolIn.trim() !== "";
  let tol = 0;
  if (hasTol) {
    tol = parseFraction(tolIn);
    if (isNaN(tol) || tol <= 0) {
      logger.error("Tolerance phải là số dương.");
      return;
    }
  }
  const maxIter = parseInt(maxIterStr, 10) || 50;

  const prec = getPrecisionByEpsilon(hasTol ? tol : undefined);
  const generalDecimals = prec.generalDecimals;
  const reliableDigits = prec.reliableDigits;

  logger.section("QUÁ TRÌNH LẶP NEWTON");
  logger.text(`$$X^{(0)} = \\begin{bmatrix} ${x0Arr.map((v) => fmtNum(v, 6)).join(" & ")} \\end{bmatrix}^T$$`);
  if (hasTol) {
    logger.text(`Sai số cho phép: $$\\varepsilon = ${tol}$$`);
    logger.formula("Công thức: $$J(X^{(k)}) \\Delta X_k = -F(X^{(k)}), \\quad X^{(k+1)} = X^{(k)} + \\Delta X_k$$");
  } else {
    logger.formula("Công thức: $$J(X^{(k)}) \\Delta X_k = -F(X^{(k)}), \\quad X^{(k+1)} = X^{(k)} + \\Delta X_k$$");
    logger.formula(`Lặp đúng $N_{\\max} = ${maxIter}$ lần`);
  }

  let X = [...x0Arr];
  const tableData: Record<string, unknown>[] = [];

  for (let k = 0; k < maxIter; k++) {
    // Build scope mapping variables to values
    const scope: Record<string, number> = {};
    for (let i = 0; i < n; i++) {
      scope[vars[i]] = X[i];
    }

    // Evaluate F(X)
    const Fk = new Array(n);
    for (let i = 0; i < n; i++) {
      Fk[i] = compiledFuncs[i].evaluate(scope);
    }

    // Evaluate J(X)
    const Jk = Array.from({ length: n }, () => new Array(n));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        Jk[i][j] = compiledJac[i][j].evaluate(scope);
      }
    }

    // Solve Jk * deltaX = -Fk
    const minusFk = Fk.map((v) => -v);
    let deltaX;
    try {
      deltaX = gaussElim(Jk, minusFk);
    } catch (e) {
      logger.error(`Lỗi giải hệ phương trình tuyến tính tại bước ${k}. ${(e as Error).message}.`);
      return;
    }

    // Update X
    const Xnext = X.map((xi, i) => xi + deltaX[i]);
    const error = Math.max(...deltaX.map(Math.abs));

    // Prepare table row
    const rowObj: Record<string, unknown> = { k: k + 1 };
    for (let i = 0; i < n; i++) {
      rowObj[vars[i]] = fmtNum(Xnext[i], generalDecimals);
    }
    rowObj["||ΔX||∞"] = fmtNum(error, generalDecimals);
    tableData.push(rowObj);

    X = Xnext;

    if (hasTol && error < tol) {
      logger.separator();
      logger.table(tableData);
      logger.separator();
      logger.success(`✔ Thỏa mãn điều kiện dừng tại bước k = ${k + 1}.`);
      logger.result(
        `Nghiệm gần đúng (${reliableDigits} chữ số đáng tin): $$X \\approx \\begin{bmatrix} ${X.map((v) => fmtNum(v, reliableDigits)).join(" & ")} \\end{bmatrix}^T$$`,
      );
      return;
    }
  }

  logger.separator();
  logger.table(tableData);
  if (hasTol) {
    logger.warn(`⚠ Dừng lặp sau ${maxIter} vòng do đạt giới hạn, chưa thỏa mãn sai số.`);
    logger.result(
      `Nghiệm xấp xỉ thu được: $$X \\approx \\begin{bmatrix} ${X.map((v) => fmtNum(v, generalDecimals)).join(" & ")} \\end{bmatrix}^T$$`,
    );
  } else {
    logger.success(`✔ Hoàn thành quá trình lặp tại bước k = ${maxIter}.`);
    logger.result(
      `Nghiệm xấp xỉ thu được: $$X \\approx \\begin{bmatrix} ${X.map((v) => fmtNum(v, generalDecimals)).join(" & ")} \\end{bmatrix}^T$$`,
    );
  }
}
