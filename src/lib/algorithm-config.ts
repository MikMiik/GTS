import { runBisection } from "@/lib/algorithms/bisection";
import { runTiepTuyen } from "@/lib/algorithms/tieptuyen";
import { runDayCung } from "@/lib/algorithms/daycung";
import { runLapDon } from "@/lib/algorithms/lapdon";
import { runGauss } from "@/lib/algorithms/gauss";
import { runGaussJordan } from "@/lib/algorithms/gaussjordan";
import { runNewtonSystem } from "@/lib/algorithms/newton-system";
import { runLapDonSystem } from "@/lib/algorithms/lapdon-system";
import type { AlgoConfig, AlgorithmKey, Logger } from "@/types/solver";

export const ALGORITHM_CONFIG: Record<AlgorithmKey, AlgoConfig> = {
  bisection: {
    title: "Phương Pháp Chia Đôi",
    subtitle: "Bisection Method — f(x) = 0",
    group: "nonlinear-1d",
    icon: "⚡",
    defaultValues: {
      fStr: "Math.exp(x) - Math.cos(2*x)",
      a: "-1",
      b: "-0.1",
      epsilon: "0.5e-5",
    },
    run: runBisection,
  },
  tieptuyen: {
    title: "Phương Pháp Tiếp Tuyến",
    subtitle: "Newton-Raphson 1D — f(x) = 0",
    group: "nonlinear-1d",
    icon: "∂",
    defaultValues: {
      fStr: "Math.pow(x,5) - 17",
      dfStr: "5 * Math.pow(x,4)",
      ddfStr: "20 * Math.pow(x,3)",
      a: "1",
      b: "2",
      m1: "5",
      epsilon: "0.5e-6",
    },
    run: runTiepTuyen,
  },
  daycung: {
    title: "Phương Pháp Dây Cung",
    subtitle: "Secant/Chord Method — f(x) = 0",
    group: "nonlinear-1d",
    icon: "⌒",
    defaultValues: {
      fStr: "x**3 - x - 2",
      a: "1",
      b: "2",
      epsilon: "1e-6",
    },
    run: runDayCung,
  },
  lapdon: {
    title: "Lặp Đơn 1 Biến",
    subtitle: "Fixed-Point Iteration 1D — x = φ(x)",
    group: "nonlinear-1d",
    icon: "↺",
    defaultValues: {
      phiStr: "1 / Math.sqrt(x + 3)",
      x0: "0.5",
      q: "0.0963",
      epsilon: "5e-9",
    },
    run: runLapDon,
  },
  gauss: {
    title: "Phương Pháp Gauss",
    subtitle: "Forward Elimination + Back Substitution — Ax = B",
    group: "linear-system",
    icon: "▦",
    defaultValues: {
      matA: "1 2 1\n2 3 2\n1 1 3",
      matB: "8 1\n14 2\n10 3",
    },
    run: runGauss,
  },
  gaussjordan: {
    title: "Phương Pháp Gauss-Jordan",
    subtitle: "Row Reduction to RREF — Ax = B",
    group: "linear-system",
    icon: "▣",
    defaultValues: {
      matA: "2 4 5 -6\n0 -1 0 8\n0 0 0 0\n0 0 -1.5 -4",
      matB: "7 3\n-6 1\n0 0\n2.8 -1.5",
    },
    run: runGaussJordan,
  },
  "newton-system": {
    title: "Newton Hệ Phi Tuyến",
    subtitle: "Newton Method for Nonlinear Systems",
    group: "nonlinear-system",
    icon: "∇",
    defaultValues: {
      x0Str: "0.1 0.1 -0.1",
      tol: "1e-6",
    },
    run: (params: Record<string, string>, logger: Logger) =>
      runNewtonSystem(params, logger),
  },
  "lapdon-system": {
    title: "Lặp Đơn Hệ Phi Tuyến",
    subtitle: "Fixed-Point Iteration for Nonlinear Systems",
    group: "nonlinear-system",
    icon: "⟳",
    defaultValues: {
      x0Str: "0 0 0",
      q: "0.34",
      epsilon: "1e-6",
    },
    run: (params: Record<string, string>, logger: Logger) =>
      runLapDonSystem(params, logger),
  },
};

export const SIDEBAR_SECTIONS = [
  {
    label: "Phương trình phi tuyến 1 biến",
    methods: ["bisection", "tieptuyen", "daycung", "lapdon"] as AlgorithmKey[],
    group: "nonlinear-1d",
  },
  {
    label: "Hệ phương trình tuyến tính",
    methods: ["gauss", "gaussjordan"] as AlgorithmKey[],
    group: "linear-system",
  },
  {
    label: "Hệ phương trình phi tuyến",
    methods: ["newton-system", "lapdon-system"] as AlgorithmKey[],
    group: "nonlinear-system",
  },
] as const;
