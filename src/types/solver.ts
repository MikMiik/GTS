export type LogEntryType =
  | "text"
  | "info"
  | "success"
  | "warn"
  | "error"
  | "step"
  | "formula"
  | "result"
  | "section"
  | "separator"
  | "table";

export interface LogEntry {
  type: LogEntryType;
  content: unknown;
}

export type AlgorithmKey =
  | "bisection"
  | "tieptuyen"
  | "daycung"
  | "lapdon"
  | "gauss"
  | "gaussjordan"
  | "gauss-seidel"
  | "jacobi-matrix"
  | "newton-system"
  | "lapdon-system"
  | "danilevsky"
  | "power-eigen"
  | "lu-decompose"
  | "lu-solve"
  | "cholesky-decompose"
  | "cholesky-solve"
  | "xuong-thang"
  | "svd"
  | "svd-power"
  | "pseudoinverse"
  | "condition-number"
  | "condition-number-power"
  | "gram-schmidt"
  | "vien-quanh";

export interface AlgoConfig {
  title: string;
  subtitle: string;
  icon: string;
  defaultValues: Record<string, string>;
  run: (params: Record<string, string>, logger: Logger) => void;
}

export interface Logger {
  entries: LogEntry[];
  text: (msg: string) => void;
  info: (msg: string) => void;
  success: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
  step: (msg: string) => void;
  formula: (msg: string) => void;
  result: (msg: string) => void;
  section: (msg: string) => void;
  separator: () => void;
  table: (data: Record<string, unknown>[]) => void;
}

export const NONLINEAR_1D_METHODS = [
  "bisection",
  "tieptuyen",
  "daycung",
  "lapdon",
] as const;

export const LINEAR_SYSTEM_METHODS = [
  "gauss",
  "gaussjordan",
  "gauss-seidel",
  "jacobi-matrix",
  "lu-decompose",
  "lu-solve",
  "cholesky-decompose",
  "cholesky-solve",
] as const;

export const NONLINEAR_SYSTEM_METHODS = [
  "newton-system",
  "lapdon-system",
] as const;

export const EIGENVALUE_METHODS = ["danilevsky", "power-eigen", "xuong-thang"] as const;

export const SVD_METHODS = ["svd", "svd-power", "pseudoinverse", "condition-number", "condition-number-power", "gram-schmidt"] as const;
